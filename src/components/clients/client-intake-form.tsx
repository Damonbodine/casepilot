// @ts-nocheck
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEPS = ["Demographics", "Contact Info", "Emergency Contact", "Needs Assessment", "Case Details", "Review & Submit"];
const GENDERS = ["Male", "Female", "NonBinary", "Other", "PreferNotToSay"];
const RACES = ["White", "Black", "Hispanic", "Asian", "NativeAmerican", "PacificIslander", "MultiRacial", "Other", "PreferNotToSay"];
const LANGUAGES = ["English", "Spanish", "French", "Mandarin", "Arabic", "Vietnamese", "Tagalog", "Other"];
const PRIMARY_NEEDS = ["Housing", "Employment", "MentalHealth", "SubstanceAbuse", "DomesticViolence", "LegalAid", "FoodInsecurity", "Healthcare", "Education", "Other"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];
const CASE_TYPES = ["Housing", "Employment", "MentalHealth", "SubstanceAbuse", "DomesticViolence", "LegalAid", "FoodInsecurity", "Healthcare", "Education", "General"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export function ClientIntakeForm() {
  const createClient = useMutation(api.clients.create);
  const createCase = useMutation(api.cases.create);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", gender: "", race: "", preferredLanguage: "English",
    email: "", phone: "", alternatePhone: "", address: "", city: "", state: "", zipCode: "",
    emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelation: "",
    primaryNeed: "", riskLevel: "Medium", notes: "",
    caseType: "General", casePriority: "Medium", caseDescription: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setSelect = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const clientId = await createClient({
        firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dateOfBirth,
        gender: form.gender, race: form.race || undefined, preferredLanguage: form.preferredLanguage,
        email: form.email || undefined, phone: form.phone || undefined, alternatePhone: form.alternatePhone || undefined,
        address: form.address || undefined, city: form.city || undefined, state: form.state || undefined, zipCode: form.zipCode || undefined,
        emergencyContactName: form.emergencyContactName, emergencyContactPhone: form.emergencyContactPhone,
        emergencyContactRelation: form.emergencyContactRelation,
        primaryNeed: form.primaryNeed, riskLevel: form.riskLevel, notes: form.notes || undefined,
      });
      await createCase({
        clientId, type: form.caseType, priority: form.casePriority,
        description: form.caseDescription, riskAtIntake: form.riskLevel,
      });
      router.push("/clients");
    } catch (err: any) {
      setError(err.message || "Failed to submit intake.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Client Intake</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}:</span>
          <span className="font-medium text-foreground">{STEPS[step]}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>Fill in all required fields before proceeding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="firstName">First Name *</Label><Input id="firstName" value={form.firstName} onChange={set("firstName")} required /></div>
                <div className="space-y-2"><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" value={form.lastName} onChange={set("lastName")} required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="dateOfBirth">Date of Birth *</Label><Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Gender *</Label><Select value={form.gender} onValueChange={setSelect("gender")}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Race</Label><Select value={form.race} onValueChange={setSelect("race")}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{RACES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Preferred Language *</Label><Select value={form.preferredLanguage} onValueChange={setSelect("preferredLanguage")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={set("email")} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={form.phone} onChange={set("phone")} /></div>
                <div className="space-y-2"><Label htmlFor="alternatePhone">Alternate Phone</Label><Input id="alternatePhone" value={form.alternatePhone} onChange={set("alternatePhone")} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" value={form.address} onChange={set("address")} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={set("city")} /></div>
                <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" value={form.state} onChange={set("state")} /></div>
                <div className="space-y-2"><Label htmlFor="zipCode">Zip Code</Label><Input id="zipCode" value={form.zipCode} onChange={set("zipCode")} /></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="space-y-2"><Label htmlFor="emergencyContactName">Emergency Contact Name *</Label><Input id="emergencyContactName" value={form.emergencyContactName} onChange={set("emergencyContactName")} required /></div>
              <div className="space-y-2"><Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label><Input id="emergencyContactPhone" value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} required /></div>
              <div className="space-y-2"><Label htmlFor="emergencyContactRelation">Relationship to Client *</Label><Input id="emergencyContactRelation" value={form.emergencyContactRelation} onChange={set("emergencyContactRelation")} required /></div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Primary Need *</Label><Select value={form.primaryNeed} onValueChange={setSelect("primaryNeed")}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{PRIMARY_NEEDS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Risk Level *</Label><Select value={form.riskLevel} onValueChange={setSelect("riskLevel")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RISK_LEVELS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" value={form.notes} onChange={set("notes")} rows={4} placeholder="Additional information about the client..." /></div>
            </>
          )}
          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Case Type *</Label><Select value={form.caseType} onValueChange={setSelect("caseType")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CASE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Priority *</Label><Select value={form.casePriority} onValueChange={setSelect("casePriority")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="caseDescription">Case Description *</Label><Textarea id="caseDescription" value={form.caseDescription} onChange={set("caseDescription")} rows={4} placeholder="Describe the reason for opening this case..." required /></div>
            </>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {form.firstName} {form.lastName}</div>
                <div><span className="text-muted-foreground">DOB:</span> {form.dateOfBirth}</div>
                <div><span className="text-muted-foreground">Gender:</span> {form.gender}</div>
                <div><span className="text-muted-foreground">Language:</span> {form.preferredLanguage}</div>
                <div><span className="text-muted-foreground">Email:</span> {form.email || "N/A"}</div>
                <div><span className="text-muted-foreground">Phone:</span> {form.phone || "N/A"}</div>
                <div><span className="text-muted-foreground">Emergency:</span> {form.emergencyContactName} ({form.emergencyContactRelation})</div>
                <div><span className="text-muted-foreground">Primary Need:</span> {form.primaryNeed}</div>
                <div><span className="text-muted-foreground">Risk Level:</span> {form.riskLevel}</div>
                <div><span className="text-muted-foreground">Case Type:</span> {form.caseType}</div>
                <div><span className="text-muted-foreground">Priority:</span> {form.casePriority}</div>
              </div>
              {form.caseDescription && <div className="text-sm"><span className="text-muted-foreground">Case Description:</span><p className="mt-1">{form.caseDescription}</p></div>}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : (<><Check className="h-4 w-4 mr-2" /> Submit Intake</>)}
          </Button>
        )}
      </div>
    </div>
  );
}