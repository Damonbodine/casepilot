"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Upload, Download } from "lucide-react";

const DOC_TYPES = ["IntakeForm", "Assessment", "CourtOrder", "MedicalRecord", "IdentificationDoc", "FinancialRecord", "ConsentForm", "ServicePlan", "ProgressReport", "Correspondence", "Other"];

interface DocumentListProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
}

export function DocumentList({ caseId, clientId }: DocumentListProps) {
  const documents = useAuthedQuery(api.documents.listByCase, { caseId });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Other");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile || !docName.trim()) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      const { storageId } = await result.json();
      await createDocument({
        caseId,
        clientId,
        name: docName,
        type: docType,
        storageId,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
      });
      setDocName("");
      setDocType("Other");
      setSelectedFile(null);
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!documents) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents ({documents.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Upload Document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Document Name *</Label>
                <Input id="doc-name" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g., Court order 2026-03" />
              </div>
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-file">File *</Label>
                <Input id="doc-file" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile || !docName.trim()} className="w-full">
                {isUploading ? "Uploading..." : (<><Upload className="h-4 w-4 mr-1" /> Upload</>)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />No documents uploaded.</CardContent></Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc: any) => (
              <TableRow key={doc._id}>
                <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{doc.name}</TableCell>
                <TableCell><Badge variant="secondary">{doc.type}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "N/A"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {doc.url && (
                    <Button variant="ghost" size="sm">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}