// @ts-nocheck
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Plus, Pin, Lock, MessageSquare } from "lucide-react";

const CATEGORIES = ["General", "Clinical", "Legal", "Administrative", "FollowUp", "CrisisIntervention"];
const CONTACT_METHODS = ["InPerson", "Phone", "Email", "VideoCall", "None"];

interface CaseNotesListProps {
  caseId: Id<"cases">;
}

export function CaseNotesList({ caseId }: CaseNotesListProps) {
  const notes = useQuery(api.caseNotes.listByCase, { caseId });
  const createNote = useMutation(api.caseNotes.create);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [contactMethod, setContactMethod] = useState("None");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createNote({ caseId, content, category, isPrivate, isPinned: false, contactMethod });
      setContent("");
      setCategory("General");
      setContactMethod("None");
      setIsPrivate(false);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!notes) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  const pinned = notes.filter((n: any) => n.isPinned);
  const unpinned = notes.filter((n: any) => !n.isPinned);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Case Notes ({notes.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Note</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Case Note</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Write your note..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact Method</Label>
                  <Select value={contactMethod} onValueChange={setContactMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONTACT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                <Label>Private note (visible to author and managers only)</Label>
              </div>
              <Button onClick={handleCreate} disabled={isSubmitting || !content.trim()} className="w-full">
                {isSubmitting ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />No notes yet. Add the first note.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {[...pinned, ...unpinned].map((note: any) => (
            <Card key={note._id} className={note.isPinned ? "border-primary/30" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{note.category}</Badge>
                    {note.isPinned && <Pin className="h-3 w-3 text-primary" />}
                    {note.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
                    {note.contactMethod && note.contactMethod !== "None" && <Badge variant="outline" className="text-xs">{note.contactMethod}</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                {note.authorName && <p className="text-xs text-muted-foreground mt-2">— {note.authorName}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}