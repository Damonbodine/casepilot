import { internalMutation } from "./_generated/server";

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingOrgs = await ctx.db.query("organizations").first();
    if (existingOrgs) {
      console.log("Database already seeded, skipping.");
      return;
    }

    const now = Date.now();

    // === 1. Organization ===
    const orgId = await ctx.db.insert("organizations", {
      name: "Hope Community Services",
      description: "A nonprofit providing comprehensive case management and social services to underserved communities in Central Texas.",
      address: "1200 E 6th St",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      phone: "(512) 555-0100",
      email: "info@hopecommunityservices.org",
      website: "https://hopecommunityservices.org",
      timezone: "America/Chicago",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // === 2. Users (one per role + extra CaseWorker) ===
    const adminId = await ctx.db.insert("users", {
      clerkId: "clerk_seed_admin_001",
      name: "Sarah Chen",
      email: "sarah.chen@hopecommunityservices.org",
      role: "Admin",
      organizationId: orgId,
      isActive: true,
      title: "System Administrator",
      createdAt: now,
      updatedAt: now,
    });

    const managerId = await ctx.db.insert("users", {
      clerkId: "clerk_seed_manager_001",
      name: "James Wilson",
      email: "james.wilson@hopecommunityservices.org",
      role: "CaseManager",
      organizationId: orgId,
      isActive: true,
      title: "Senior Case Manager",
      caseloadLimit: 25,
      createdAt: now,
      updatedAt: now,
    });

    const worker1Id = await ctx.db.insert("users", {
      clerkId: "clerk_seed_worker_001",
      name: "Maria Garcia",
      email: "maria.garcia@hopecommunityservices.org",
      role: "CaseWorker",
      organizationId: orgId,
      isActive: true,
      title: "Case Worker",
      caseloadLimit: 15,
      createdAt: now,
      updatedAt: now,
    });

    const worker2Id = await ctx.db.insert("users", {
      clerkId: "clerk_seed_worker_002",
      name: "David Kim",
      email: "david.kim@hopecommunityservices.org",
      role: "CaseWorker",
      organizationId: orgId,
      isActive: true,
      title: "Case Worker",
      caseloadLimit: 15,
      createdAt: now,
      updatedAt: now,
    });

    const intakeId = await ctx.db.insert("users", {
      clerkId: "clerk_seed_intake_001",
      name: "Lisa Thompson",
      email: "lisa.thompson@hopecommunityservices.org",
      role: "IntakeSpecialist",
      organizationId: orgId,
      isActive: true,
      title: "Intake Coordinator",
      createdAt: now,
      updatedAt: now,
    });

    const viewerId = await ctx.db.insert("users", {
      clerkId: "clerk_seed_viewer_001",
      name: "Robert Brown",
      email: "robert.brown@hopecommunityservices.org",
      role: "ReadOnlyViewer",
      organizationId: orgId,
      isActive: true,
      title: "Board Member",
      createdAt: now,
      updatedAt: now,
    });

    // === 3. Clients ===
    const client1Id = await ctx.db.insert("clients", {
      firstName: "Marcus",
      lastName: "Thompson",
      dateOfBirth: 631152000000,
      gender: "Male",
      preferredLanguage: "English",
      email: "marcus.t@email.com",
      phone: "(512) 555-0201",
      address: "450 Congress Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      emergencyContactName: "Angela Thompson",
      emergencyContactPhone: "(512) 555-0211",
      emergencyContactRelation: "Sister",
      status: "Active",
      riskLevel: "High",
      primaryNeed: "Housing",
      intakeDate: now - 14 * 86400000,
      organizationId: orgId,
      createdAt: now - 14 * 86400000,
      updatedAt: now,
    });

    const client2Id = await ctx.db.insert("clients", {
      firstName: "Elena",
      lastName: "Rodriguez",
      dateOfBirth: 757382400000,
      gender: "Female",
      preferredLanguage: "Spanish",
      email: "elena.r@email.com",
      phone: "(512) 555-0202",
      address: "800 W 5th St",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      emergencyContactName: "Carlos Rodriguez",
      emergencyContactPhone: "(512) 555-0212",
      emergencyContactRelation: "Brother",
      status: "Active",
      riskLevel: "Medium",
      primaryNeed: "MentalHealth",
      intakeDate: now - 12 * 86400000,
      organizationId: orgId,
      createdAt: now - 12 * 86400000,
      updatedAt: now,
    });

    const client3Id = await ctx.db.insert("clients", {
      firstName: "Dwayne",
      lastName: "Mitchell",
      dateOfBirth: 536457600000,
      gender: "Male",
      preferredLanguage: "English",
      email: "dwayne.m@email.com",
      phone: "(512) 555-0203",
      address: "2100 E Riverside Dr",
      city: "Austin",
      state: "TX",
      zipCode: "78741",
      emergencyContactName: "Sharon Mitchell",
      emergencyContactPhone: "(512) 555-0213",
      emergencyContactRelation: "Mother",
      status: "Active",
      riskLevel: "Low",
      primaryNeed: "Employment",
      intakeDate: now - 10 * 86400000,
      organizationId: orgId,
      createdAt: now - 10 * 86400000,
      updatedAt: now,
    });

    const client4Id = await ctx.db.insert("clients", {
      firstName: "Thanh",
      lastName: "Nguyen",
      dateOfBirth: 883612800000,
      gender: "Female",
      preferredLanguage: "Vietnamese",
      email: "thanh.n@email.com",
      phone: "(512) 555-0204",
      address: "1500 S Lamar Blvd",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      emergencyContactName: "Minh Nguyen",
      emergencyContactPhone: "(512) 555-0214",
      emergencyContactRelation: "Spouse",
      status: "Active",
      riskLevel: "High",
      primaryNeed: "Housing",
      intakeDate: now - 7 * 86400000,
      organizationId: orgId,
      createdAt: now - 7 * 86400000,
      updatedAt: now,
    });

    // === 4. Cases (5 cases across different statuses) ===
    const case1Id = await ctx.db.insert("cases", {
      caseNumber: "HCS-2026-0001",
      clientId: client1Id,
      type: "Housing",
      priority: "Urgent",
      status: "InProgress",
      assignedWorkerId: worker1Id,
      assignedManagerId: managerId,
      description: "Client facing imminent eviction and needs emergency housing assistance and employment support to stabilize situation.",
      openDate: now - 14 * 86400000,
      targetCloseDate: now + 16 * 86400000,
      riskAtIntake: "High",
      intakeAssessment: "High-priority housing case. Client has two dependents and faces 30-day eviction notice.",
      organizationId: orgId,
      createdAt: now - 14 * 86400000,
      updatedAt: now - 2 * 86400000,
    });

    const case2Id = await ctx.db.insert("cases", {
      caseNumber: "HCS-2026-0002",
      clientId: client2Id,
      type: "MentalHealth",
      priority: "High",
      status: "InProgress",
      assignedWorkerId: worker1Id,
      assignedManagerId: managerId,
      description: "Client seeking counseling services and legal aid for custody proceedings. Medium risk with stable housing.",
      openDate: now - 12 * 86400000,
      targetCloseDate: now + 48 * 86400000,
      riskAtIntake: "Medium",
      organizationId: orgId,
      createdAt: now - 12 * 86400000,
      updatedAt: now - 3 * 86400000,
    });

    const case3Id = await ctx.db.insert("cases", {
      caseNumber: "HCS-2026-0003",
      clientId: client3Id,
      type: "Employment",
      priority: "Medium",
      status: "Open",
      assignedWorkerId: worker2Id,
      description: "Client enrolled in employment readiness program. Making steady progress with resume building and interview prep.",
      openDate: now - 10 * 86400000,
      targetCloseDate: now + 50 * 86400000,
      riskAtIntake: "Low",
      organizationId: orgId,
      createdAt: now - 10 * 86400000,
      updatedAt: now - 1 * 86400000,
    });

    const case4Id = await ctx.db.insert("cases", {
      caseNumber: "HCS-2026-0004",
      clientId: client4Id,
      type: "Housing",
      priority: "Urgent",
      status: "Open",
      assignedWorkerId: worker2Id,
      assignedManagerId: managerId,
      description: "High-risk client needing multi-service support including housing, counseling, and legal aid. Requires coordinated care approach.",
      openDate: now - 7 * 86400000,
      targetCloseDate: now + 23 * 86400000,
      riskAtIntake: "Critical",
      intakeAssessment: "Critical needs across housing, mental health, and legal domains. Coordinated multi-service plan required.",
      organizationId: orgId,
      createdAt: now - 7 * 86400000,
      updatedAt: now - 1 * 86400000,
    });

    const case5Id = await ctx.db.insert("cases", {
      caseNumber: "HCS-2026-0005",
      clientId: client1Id,
      type: "Employment",
      priority: "Low",
      status: "Closed",
      assignedWorkerId: worker1Id,
      description: "Previous case resolved for housing. Now focused on long-term employment stability and career development.",
      openDate: now - 60 * 86400000,
      closeDate: now - 14 * 86400000,
      resolution: "Successful",
      resolutionNotes: "Client successfully completed job readiness program and secured part-time employment.",
      riskAtIntake: "Medium",
      organizationId: orgId,
      createdAt: now - 60 * 86400000,
      updatedAt: now - 14 * 86400000,
    });

    // === 5. Case Notes (4 notes) ===
    await ctx.db.insert("caseNotes", {
      caseId: case1Id,
      authorId: worker1Id,
      content: "Initial assessment completed. Client reports being served with a 30-day eviction notice. Current income is insufficient to cover rent. Exploring emergency housing voucher programs and connecting with local shelters as a backup plan.",
      category: "Assessment",
      isPrivate: false,
      isPinned: false,
      contactMethod: "InPerson",
      contactDuration: 60,
      createdAt: now - 13 * 86400000,
    });

    await ctx.db.insert("caseNotes", {
      caseId: case1Id,
      authorId: managerId,
      content: "Supervisor review: Escalating to priority status. Client has children in the household which increases urgency. Approved fast-track for housing voucher application.",
      category: "Progress",
      isPrivate: true,
      isPinned: true,
      createdAt: now - 11 * 86400000,
    });

    await ctx.db.insert("caseNotes", {
      caseId: case2Id,
      authorId: worker1Id,
      content: "Client attended first counseling session with partner organization SafeHaven Mental Health. Therapist recommends weekly sessions. Legal consultation scheduled for next week regarding custody case.",
      category: "Progress",
      isPrivate: false,
      isPinned: false,
      contactMethod: "Phone",
      contactDuration: 30,
      createdAt: now - 8 * 86400000,
    });

    await ctx.db.insert("caseNotes", {
      caseId: case3Id,
      authorId: worker2Id,
      content: "Client completed resume workshop and mock interview session. Shows strong motivation and communication skills. Submitted applications to three employers this week. Follow-up scheduled in 5 business days.",
      category: "Progress",
      isPrivate: false,
      isPinned: false,
      contactMethod: "InPerson",
      contactDuration: 45,
      createdAt: now - 5 * 86400000,
    });

    // === 6. Case Activities (4 activities) ===
    await ctx.db.insert("caseActivities", {
      caseId: case1Id,
      userId: intakeId,
      type: "Created",
      description: "Case opened during intake for emergency housing need",
      createdAt: now - 14 * 86400000,
    });

    await ctx.db.insert("caseActivities", {
      caseId: case1Id,
      userId: managerId,
      type: "StatusChange",
      description: "Case status changed from Open to InProgress",
      previousValue: "Open",
      newValue: "InProgress",
      createdAt: now - 12 * 86400000,
    });

    await ctx.db.insert("caseActivities", {
      caseId: case2Id,
      userId: worker1Id,
      type: "NoteAdded",
      description: "Progress note added after first counseling session",
      createdAt: now - 8 * 86400000,
    });

    await ctx.db.insert("caseActivities", {
      caseId: case5Id,
      userId: worker1Id,
      type: "Closed",
      description: "Case closed successfully. Client secured stable employment through readiness program.",
      createdAt: now - 14 * 86400000,
    });

    // === 7. Services (4 services) ===
    const service1Id = await ctx.db.insert("services", {
      name: "Individual Counseling",
      description: "One-on-one counseling sessions with a licensed therapist for individuals dealing with trauma, anxiety, depression, or life transitions.",
      category: "MentalHealth",
      deliveryMethod: "InPerson",
      defaultDuration: 60,
      maxCapacity: 20,
      isActive: true,
      requiresApproval: false,
      organizationId: orgId,
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    const service2Id = await ctx.db.insert("services", {
      name: "Emergency Housing Assistance",
      description: "Short-term housing placement and voucher assistance for individuals and families facing homelessness or imminent eviction.",
      category: "Housing",
      deliveryMethod: "Referral",
      isActive: true,
      requiresApproval: true,
      organizationId: orgId,
      fundingSource: "HUD Community Development Block Grant",
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    const service3Id = await ctx.db.insert("services", {
      name: "Legal Aid Consultation",
      description: "Pro bono legal consultations for civil matters including custody, immigration, tenant rights, and benefits appeals.",
      category: "Legal",
      deliveryMethod: "Hybrid",
      defaultDuration: 45,
      isActive: true,
      requiresApproval: false,
      organizationId: orgId,
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    const service4Id = await ctx.db.insert("services", {
      name: "Employment Readiness Program",
      description: "Comprehensive job readiness training including resume writing, interview skills, professional development, and employer connections.",
      category: "Employment",
      deliveryMethod: "InPerson",
      defaultDuration: 120,
      maxCapacity: 12,
      isActive: true,
      requiresApproval: false,
      organizationId: orgId,
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    // === 8. Service Deliveries (3 deliveries) ===
    await ctx.db.insert("serviceDeliveries", {
      caseId: case1Id,
      clientId: client1Id,
      serviceId: service2Id,
      providerId: worker1Id,
      deliveryDate: now - 10 * 86400000,
      duration: 90,
      outcome: "Completed",
      notes: "Housing voucher application submitted. Awaiting approval from Austin Housing Authority. Client placed on priority list.",
      location: "Hope Community Services Office",
      followUpNeeded: true,
      followUpDate: now + 4 * 86400000,
      createdAt: now - 10 * 86400000,
      updatedAt: now - 10 * 86400000,
    });

    await ctx.db.insert("serviceDeliveries", {
      caseId: case2Id,
      clientId: client2Id,
      serviceId: service1Id,
      providerId: worker1Id,
      deliveryDate: now - 6 * 86400000,
      duration: 60,
      outcome: "Completed",
      notes: "First counseling session completed with SafeHaven partner. Client engaged well. Weekly sessions scheduled for 8 weeks.",
      location: "SafeHaven Mental Health Clinic",
      followUpNeeded: true,
      followUpDate: now + 1 * 86400000,
      createdAt: now - 6 * 86400000,
      updatedAt: now - 6 * 86400000,
    });

    await ctx.db.insert("serviceDeliveries", {
      caseId: case3Id,
      clientId: client3Id,
      serviceId: service4Id,
      providerId: worker2Id,
      deliveryDate: now - 3 * 86400000,
      duration: 120,
      outcome: "Completed",
      notes: "Client completed the two-week employment readiness workshop. Resume updated, LinkedIn profile created, three job applications submitted.",
      location: "Hope Community Services Training Room",
      followUpNeeded: false,
      createdAt: now - 3 * 86400000,
      updatedAt: now - 3 * 86400000,
    });

    // === 9. Goals (3 goals) ===
    await ctx.db.insert("goals", {
      caseId: case1Id,
      clientId: client1Id,
      title: "Secure Stable Housing",
      description: "Obtain permanent housing through voucher program or affordable housing placement within 30 days.",
      category: "Housing",
      status: "InProgress",
      priority: "High",
      targetDate: now + 16 * 86400000,
      progressPercent: 40,
      milestones: "1. Submit voucher application (done) 2. Housing authority approval (pending) 3. Unit inspection 4. Lease signing",
      createdAt: now - 13 * 86400000,
      updatedAt: now - 2 * 86400000,
    });

    await ctx.db.insert("goals", {
      caseId: case3Id,
      clientId: client3Id,
      title: "Obtain Full-Time Employment",
      description: "Secure full-time employment with a livable wage within 60 days of completing the readiness program.",
      category: "Employment",
      status: "InProgress",
      priority: "Medium",
      targetDate: now + 50 * 86400000,
      progressPercent: 25,
      milestones: "1. Complete readiness program (done) 2. Submit 10+ applications 3. Interview scheduling 4. Job offer acceptance",
      createdAt: now - 10 * 86400000,
      updatedAt: now - 3 * 86400000,
    });

    await ctx.db.insert("goals", {
      caseId: case5Id,
      clientId: client1Id,
      title: "Complete Housing Voucher Process",
      description: "Successfully complete all housing voucher requirements and move into approved unit.",
      category: "Housing",
      status: "Completed",
      priority: "High",
      targetDate: now - 14 * 86400000,
      completedDate: now - 15 * 86400000,
      progressPercent: 100,
      notes: "Client successfully secured housing through voucher program ahead of schedule.",
      createdAt: now - 60 * 86400000,
      updatedAt: now - 15 * 86400000,
    });

    // === 10. Documents (2 documents) ===
    await ctx.db.insert("documents", {
      caseId: case1Id,
      clientId: client1Id,
      name: "eviction_notice_thompson.pdf",
      type: "CourtOrder",
      description: "30-day eviction notice served to client on March 10, 2026",
      storageId: "seed_placeholder_storage_1",
      fileUrl: "/placeholder/eviction_notice_thompson.pdf",
      fileSize: 245760,
      mimeType: "application/pdf",
      uploadedById: worker1Id,
      createdAt: now - 14 * 86400000,
      updatedAt: now - 14 * 86400000,
    });

    await ctx.db.insert("documents", {
      caseId: case2Id,
      clientId: client2Id,
      name: "counseling_intake_form_rodriguez.pdf",
      type: "IntakeForm",
      description: "Initial counseling intake form completed during first session with SafeHaven therapist",
      storageId: "seed_placeholder_storage_2",
      fileUrl: "/placeholder/counseling_intake_form_rodriguez.pdf",
      fileSize: 184320,
      mimeType: "application/pdf",
      uploadedById: worker1Id,
      createdAt: now - 8 * 86400000,
      updatedAt: now - 8 * 86400000,
    });

    // === 11. Partners (3 partners) ===
    const partner1Id = await ctx.db.insert("partners", {
      name: "Austin Housing Authority",
      description: "Government agency managing housing voucher programs and affordable housing placements in Austin.",
      category: "Housing",
      address: "1124 S IH-35",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      phone: "(512) 555-0301",
      email: "p.morales@austinhousing.gov",
      website: "https://austinhousing.gov",
      primaryContactName: "Patricia Morales",
      isActive: true,
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    const partner2Id = await ctx.db.insert("partners", {
      name: "SafeHaven Mental Health",
      description: "Community mental health center providing counseling, therapy, and psychiatric services.",
      category: "MentalHealth",
      address: "2400 Guadalupe St",
      city: "Austin",
      state: "TX",
      zipCode: "78705",
      phone: "(512) 555-0302",
      email: "k.liu@safehavenmh.org",
      website: "https://safehavenmh.org",
      primaryContactName: "Dr. Karen Liu",
      isActive: true,
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    const partner3Id = await ctx.db.insert("partners", {
      name: "Central Texas Legal Aid",
      description: "Nonprofit providing free legal assistance for civil matters to low-income residents.",
      category: "Legal",
      address: "816 Congress Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      phone: "(512) 555-0303",
      email: "a.reeves@ctxlegalaid.org",
      website: "https://ctxlegalaid.org",
      primaryContactName: "Anthony Reeves",
      isActive: true,
      createdAt: now - 30 * 86400000,
      updatedAt: now - 30 * 86400000,
    });

    // === 12. Referrals (2 referrals) ===
    await ctx.db.insert("referrals", {
      caseId: case1Id,
      clientId: client1Id,
      partnerId: partner1Id,
      direction: "Outgoing",
      referredById: worker1Id,
      reason: "Client facing imminent eviction with two dependents. Needs emergency housing voucher.",
      serviceNeeded: "Emergency Housing Voucher",
      status: "Pending",
      urgency: "Emergency",
      contactName: "Patricia Morales",
      contactPhone: "(512) 555-0301",
      notes: "Urgent housing voucher referral. Client has 30-day eviction timeline. Household includes two children under 12.",
      createdAt: now - 10 * 86400000,
      updatedAt: now - 10 * 86400000,
    });

    await ctx.db.insert("referrals", {
      caseId: case2Id,
      clientId: client2Id,
      partnerId: partner3Id,
      direction: "Outgoing",
      referredById: worker1Id,
      reason: "Client needs legal representation for custody proceedings.",
      serviceNeeded: "Family Law Consultation",
      status: "Accepted",
      urgency: "Medium",
      contactName: "Anthony Reeves",
      contactPhone: "(512) 555-0303",
      notes: "Legal consultation for custody proceedings. Partner confirmed availability for initial consult next week.",
      outcomeNotes: "Partner accepted referral. Initial consultation scheduled.",
      createdAt: now - 8 * 86400000,
      updatedAt: now - 6 * 86400000,
    });

    // === 13. Notifications (3 notifications) ===
    await ctx.db.insert("notifications", {
      userId: worker1Id,
      type: "CaseAssigned",
      title: "New Case Assigned",
      message: "You have been assigned case HCS-2026-0001: Emergency Housing Placement for Marcus Thompson.",
      link: "/cases/" + case1Id,
      priority: "High",
      isRead: true,
      createdAt: now - 14 * 86400000,
    });

    await ctx.db.insert("notifications", {
      userId: managerId,
      type: "ApprovalNeeded",
      title: "Urgent Case Requires Review",
      message: "Case HCS-2026-0004 for Thanh Nguyen has been flagged as urgent and requires supervisor review.",
      link: "/cases/" + case4Id,
      priority: "Urgent",
      isRead: false,
      createdAt: now - 7 * 86400000,
    });

    await ctx.db.insert("notifications", {
      userId: worker2Id,
      type: "GoalDue",
      title: "Goal Target Date Approaching",
      message: "The goal 'Obtain Full-Time Employment' for client Dwayne Mitchell has a target date in 50 days.",
      link: "/cases/" + case3Id,
      priority: "Medium",
      isRead: false,
      createdAt: now - 5 * 86400000,
    });

    // === 14. Audit Logs (3 logs) ===
    await ctx.db.insert("auditLogs", {
      userId: intakeId,
      action: "Create",
      entityType: "case",
      entityId: case1Id,
      details: "Created case HCS-2026-0001 for client Marcus Thompson",
      ipAddress: "192.168.1.100",
      organizationId: orgId,
      createdAt: now - 14 * 86400000,
    });

    await ctx.db.insert("auditLogs", {
      userId: managerId,
      action: "Update",
      entityType: "case",
      entityId: case1Id,
      details: "Updated case priority from High to Urgent",
      ipAddress: "192.168.1.101",
      organizationId: orgId,
      createdAt: now - 12 * 86400000,
    });

    await ctx.db.insert("auditLogs", {
      userId: worker1Id,
      action: "Create",
      entityType: "referral",
      entityId: "referral_placeholder",
      details: "Created housing referral to Austin Housing Authority for client Marcus Thompson",
      ipAddress: "192.168.1.102",
      organizationId: orgId,
      createdAt: now - 10 * 86400000,
    });

    console.log("Seed complete: 1 org, 6 users, 4 clients, 5 cases, 4 notes, 4 activities, 4 services, 3 deliveries, 3 goals, 2 documents, 3 partners, 2 referrals, 3 notifications, 3 audit logs.");
  },
});
