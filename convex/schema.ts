import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.union(
      v.literal("Admin"),
      v.literal("CaseManager"),
      v.literal("CaseWorker"),
      v.literal("IntakeSpecialist"),
      v.literal("ReadOnlyViewer")
    ),
    title: v.optional(v.string()),
    organizationId: v.id("organizations"),
    isActive: v.boolean(),
    caseloadLimit: v.optional(v.number()),
    lastLoginAt: v.optional(v.number()),
    hireDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_organization", ["organizationId"])
    .index("by_role", ["role"])
    .index("by_isActive", ["isActive"])
    .index("by_organization_role", ["organizationId", "role"])
    .index("by_organization_isActive", ["organizationId", "isActive"]),

  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    zipCode: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    taxId: v.optional(v.string()),
    fiscalYearStart: v.optional(v.string()),
    timezone: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_isActive", ["isActive"]),

  clients: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.number(),
    gender: v.union(
      v.literal("Male"),
      v.literal("Female"),
      v.literal("NonBinary"),
      v.literal("TransMale"),
      v.literal("TransFemale"),
      v.literal("Other"),
      v.literal("PreferNotToSay")
    ),
    race: v.optional(
      v.union(
        v.literal("White"),
        v.literal("Black"),
        v.literal("Hispanic"),
        v.literal("Asian"),
        v.literal("NativeAmerican"),
        v.literal("PacificIslander"),
        v.literal("MultiRacial"),
        v.literal("Other"),
        v.literal("PreferNotToSay")
      )
    ),
    preferredLanguage: v.union(
      v.literal("English"),
      v.literal("Spanish"),
      v.literal("French"),
      v.literal("Mandarin"),
      v.literal("Vietnamese"),
      v.literal("Arabic"),
      v.literal("Other")
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    alternatePhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    emergencyContactName: v.string(),
    emergencyContactPhone: v.string(),
    emergencyContactRelation: v.string(),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Waitlisted"),
      v.literal("Discharged"),
      v.literal("Referred")
    ),
    riskLevel: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Critical")
    ),
    intakeDate: v.number(),
    dischargeDate: v.optional(v.number()),
    primaryNeed: v.union(
      v.literal("Housing"),
      v.literal("Employment"),
      v.literal("MentalHealth"),
      v.literal("SubstanceAbuse"),
      v.literal("DomesticViolence"),
      v.literal("ChildWelfare"),
      v.literal("ElderCare"),
      v.literal("Disability"),
      v.literal("Financial"),
      v.literal("Legal"),
      v.literal("Medical"),
      v.literal("Other")
    ),
    notes: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    organizationId: v.id("organizations"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_riskLevel", ["riskLevel"])
    .index("by_lastName", ["lastName"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_organization_riskLevel", ["organizationId", "riskLevel"])
    .index("by_primaryNeed", ["primaryNeed"]),

  cases: defineTable({
    caseNumber: v.string(),
    clientId: v.id("clients"),
    type: v.union(
      v.literal("Housing"),
      v.literal("Employment"),
      v.literal("MentalHealth"),
      v.literal("SubstanceAbuse"),
      v.literal("DomesticViolence"),
      v.literal("ChildWelfare"),
      v.literal("ElderCare"),
      v.literal("Disability"),
      v.literal("Financial"),
      v.literal("Legal"),
      v.literal("Medical"),
      v.literal("General")
    ),
    priority: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Urgent")
    ),
    status: v.union(
      v.literal("Open"),
      v.literal("InProgress"),
      v.literal("PendingReview"),
      v.literal("OnHold"),
      v.literal("Closed"),
      v.literal("Reopened")
    ),
    assignedWorkerId: v.id("users"),
    assignedManagerId: v.optional(v.id("users")),
    description: v.string(),
    openDate: v.number(),
    targetCloseDate: v.optional(v.number()),
    closeDate: v.optional(v.number()),
    resolution: v.optional(
      v.union(
        v.literal("Successful"),
        v.literal("Partial"),
        v.literal("Unsuccessful"),
        v.literal("ClientWithdrew"),
        v.literal("Transferred"),
        v.literal("Other")
      )
    ),
    resolutionNotes: v.optional(v.string()),
    organizationId: v.id("organizations"),
    intakeAssessment: v.optional(v.string()),
    riskAtIntake: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Critical")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_caseNumber", ["caseNumber"])
    .index("by_client", ["clientId"])
    .index("by_assignedWorker", ["assignedWorkerId"])
    .index("by_assignedManager", ["assignedManagerId"])
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_type", ["type"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_assignedWorker_status", ["assignedWorkerId", "status"])
    .index("by_organization_type", ["organizationId", "type"]),

  caseNotes: defineTable({
    caseId: v.id("cases"),
    authorId: v.id("users"),
    content: v.string(),
    category: v.union(
      v.literal("General"),
      v.literal("Assessment"),
      v.literal("Progress"),
      v.literal("Incident"),
      v.literal("ContactLog"),
      v.literal("CourtUpdate"),
      v.literal("ServicePlan"),
      v.literal("Closure")
    ),
    isPrivate: v.boolean(),
    isPinned: v.boolean(),
    contactMethod: v.optional(
      v.union(
        v.literal("InPerson"),
        v.literal("Phone"),
        v.literal("Email"),
        v.literal("VideoCall"),
        v.literal("TextMessage"),
        v.literal("Mail")
      )
    ),
    contactDuration: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_author", ["authorId"])
    .index("by_case_category", ["caseId", "category"])
    .index("by_case_isPinned", ["caseId", "isPinned"]),

  caseActivities: defineTable({
    caseId: v.id("cases"),
    userId: v.id("users"),
    type: v.union(
      v.literal("StatusChange"),
      v.literal("Assignment"),
      v.literal("NoteAdded"),
      v.literal("ServiceDelivered"),
      v.literal("GoalUpdated"),
      v.literal("DocumentUploaded"),
      v.literal("ReferralMade"),
      v.literal("PriorityChange"),
      v.literal("Created"),
      v.literal("Closed"),
      v.literal("Reopened")
    ),
    description: v.string(),
    previousValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_user", ["userId"])
    .index("by_case_type", ["caseId", "type"]),

  services: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Housing"),
      v.literal("Employment"),
      v.literal("MentalHealth"),
      v.literal("SubstanceAbuse"),
      v.literal("Legal"),
      v.literal("Medical"),
      v.literal("Education"),
      v.literal("Financial"),
      v.literal("Transportation"),
      v.literal("FoodAssistance"),
      v.literal("ChildCare"),
      v.literal("Other")
    ),
    deliveryMethod: v.union(
      v.literal("InPerson"),
      v.literal("Remote"),
      v.literal("Hybrid"),
      v.literal("Referral")
    ),
    defaultDuration: v.optional(v.number()),
    maxCapacity: v.optional(v.number()),
    isActive: v.boolean(),
    requiresApproval: v.boolean(),
    organizationId: v.id("organizations"),
    fundingSource: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"])
    .index("by_organization_category", ["organizationId", "category"])
    .index("by_organization_isActive", ["organizationId", "isActive"]),

  serviceDeliveries: defineTable({
    caseId: v.id("cases"),
    clientId: v.id("clients"),
    serviceId: v.id("services"),
    providerId: v.id("users"),
    deliveryDate: v.number(),
    duration: v.number(),
    outcome: v.union(
      v.literal("Completed"),
      v.literal("PartiallyCompleted"),
      v.literal("ClientNoShow"),
      v.literal("ProviderCancelled"),
      v.literal("Rescheduled")
    ),
    notes: v.optional(v.string()),
    location: v.optional(v.string()),
    followUpNeeded: v.boolean(),
    followUpDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_client", ["clientId"])
    .index("by_service", ["serviceId"])
    .index("by_provider", ["providerId"])
    .index("by_case_service", ["caseId", "serviceId"])
    .index("by_deliveryDate", ["deliveryDate"])
    .index("by_followUpNeeded", ["followUpNeeded"]),

  goals: defineTable({
    caseId: v.id("cases"),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Housing"),
      v.literal("Employment"),
      v.literal("Education"),
      v.literal("Health"),
      v.literal("Financial"),
      v.literal("Legal"),
      v.literal("Social"),
      v.literal("LifeSkills"),
      v.literal("Other")
    ),
    status: v.union(
      v.literal("NotStarted"),
      v.literal("InProgress"),
      v.literal("OnHold"),
      v.literal("Completed"),
      v.literal("Abandoned")
    ),
    priority: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High")
    ),
    targetDate: v.number(),
    completedDate: v.optional(v.number()),
    progressPercent: v.number(),
    milestones: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_case_status", ["caseId", "status"])
    .index("by_case_priority", ["caseId", "priority"]),

  documents: defineTable({
    caseId: v.optional(v.id("cases")),
    clientId: v.id("clients"),
    name: v.string(),
    type: v.union(
      v.literal("IntakeForm"),
      v.literal("Assessment"),
      v.literal("CourtOrder"),
      v.literal("MedicalRecord"),
      v.literal("IdentificationDoc"),
      v.literal("FinancialRecord"),
      v.literal("ConsentForm"),
      v.literal("ServicePlan"),
      v.literal("ProgressReport"),
      v.literal("Correspondence"),
      v.literal("Other")
    ),
    description: v.optional(v.string()),
    storageId: v.string(),
    fileUrl: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    uploadedById: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_client", ["clientId"])
    .index("by_uploadedBy", ["uploadedById"])
    .index("by_type", ["type"])
    .index("by_client_type", ["clientId", "type"]),

  referrals: defineTable({
    caseId: v.id("cases"),
    clientId: v.id("clients"),
    partnerId: v.id("partners"),
    direction: v.union(
      v.literal("Outgoing"),
      v.literal("Incoming")
    ),
    referredById: v.id("users"),
    reason: v.string(),
    serviceNeeded: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("Accepted"),
      v.literal("Declined"),
      v.literal("Completed"),
      v.literal("Cancelled")
    ),
    urgency: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Emergency")
    ),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    outcomeNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_case", ["caseId"])
    .index("by_client", ["clientId"])
    .index("by_partner", ["partnerId"])
    .index("by_referredBy", ["referredById"])
    .index("by_status", ["status"])
    .index("by_case_status", ["caseId", "status"])
    .index("by_urgency", ["urgency"]),

  partners: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("Government"),
      v.literal("Nonprofit"),
      v.literal("Healthcare"),
      v.literal("Legal"),
      v.literal("Education"),
      v.literal("Housing"),
      v.literal("Employment"),
      v.literal("MentalHealth"),
      v.literal("SubstanceAbuse"),
      v.literal("Other")
    ),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    primaryContactName: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_isActive", ["isActive"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("CaseAssigned"),
      v.literal("CaseUpdated"),
      v.literal("NoteAdded"),
      v.literal("GoalDue"),
      v.literal("ReferralReceived"),
      v.literal("ApprovalNeeded"),
      v.literal("SystemAlert"),
      v.literal("Reminder")
    ),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    priority: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Urgent")
    ),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_isRead", ["userId", "isRead"])
    .index("by_user_type", ["userId", "type"]),

  auditLogs: defineTable({
    userId: v.id("users"),
    action: v.union(
      v.literal("Create"),
      v.literal("Read"),
      v.literal("Update"),
      v.literal("Delete"),
      v.literal("Login"),
      v.literal("Logout"),
      v.literal("Export"),
      v.literal("Import")
    ),
    entityType: v.string(),
    entityId: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    organizationId: v.id("organizations"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_entityType", ["entityType"])
    .index("by_action", ["action"])
    .index("by_organization_entityType", ["organizationId", "entityType"])
    .index("by_organization_action", ["organizationId", "action"]),
});
