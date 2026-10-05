// ../api-zod/src/generated/api.ts
import * as zod from "zod";
var HealthCheckResponse = zod.object({
  "status": zod.string()
});
var ListContentParams = zod.object({
  "kind": zod.coerce.string()
});
var ListContentQueryParams = zod.object({
  "search": zod.coerce.string().optional(),
  "location": zod.coerce.string().optional(),
  "degree": zod.coerce.string().optional(),
  "category": zod.coerce.string().optional(),
  "featured": zod.coerce.string().optional(),
  "sort": zod.coerce.string().optional(),
  "universityId": zod.coerce.number().int().optional()
});
var listContentResponseOneNameMax = 250;
var listContentResponseOneSlugMax = 250;
var ListContentResponseItem = zod.object({
  "name": zod.string().min(1).max(listContentResponseOneNameMax),
  "slug": zod.string().min(1).max(listContentResponseOneSlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]),
  "featured": zod.boolean(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "kind": zod.string(),
  "createdAt": zod.string(),
  "updatedAt": zod.string()
}));
var ListContentResponse = zod.array(ListContentResponseItem);
var GetContentParams = zod.object({
  "kind": zod.coerce.string(),
  "slug": zod.coerce.string()
});
var getContentResponseOneNameMax = 250;
var getContentResponseOneSlugMax = 250;
var GetContentResponse = zod.object({
  "name": zod.string().min(1).max(getContentResponseOneNameMax),
  "slug": zod.string().min(1).max(getContentResponseOneSlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]),
  "featured": zod.boolean(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "kind": zod.string(),
  "createdAt": zod.string(),
  "updatedAt": zod.string()
}));
var GetDiscoveryResponse = zod.object({
  "universities": zod.number().int(),
  "programs": zod.number().int(),
  "courses": zod.number().int(),
  "locations": zod.array(zod.string()),
  "degrees": zod.array(zod.string()),
  "categories": zod.array(zod.string())
});
var submitLeadBodyNameMin = 2;
var submitLeadBodyNameMax = 150;
var submitLeadBodyEmailMax = 250;
var submitLeadBodyPhoneMin = 7;
var submitLeadBodyPhoneMax = 25;
var submitLeadBodyMessageMax = 3e3;
var SubmitLeadBody = zod.object({
  "name": zod.string().min(submitLeadBodyNameMin).max(submitLeadBodyNameMax),
  "email": zod.string().email().max(submitLeadBodyEmailMax),
  "phone": zod.string().min(submitLeadBodyPhoneMin).max(submitLeadBodyPhoneMax),
  "consent": zod.boolean(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot"]).optional(),
  "university": zod.string().optional(),
  "program": zod.string().optional(),
  "course": zod.string().optional(),
  "source": zod.string().optional(),
  "utm": zod.string().optional(),
  "message": zod.string().max(submitLeadBodyMessageMax).optional()
});
var SubmitLeadResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
var askAcadBotBodyMessageMax = 1e3;
var AskAcadBotBody = zod.object({
  "message": zod.string().min(1).max(askAcadBotBodyMessageMax)
});
var AskAcadBotResponse = zod.object({
  "answer": zod.string(),
  "sources": zod.array(zod.object({
    "name": zod.string(),
    "url": zod.string()
  }))
});
var GetAdminSessionResponse = zod.object({
  "authenticated": zod.boolean(),
  "setupRequired": zod.boolean(),
  "email": zod.string().optional()
});
var adminLoginBodyPasswordMax = 200;
var AdminLoginBody = zod.object({
  "email": zod.string().email(),
  "password": zod.string().min(1).max(adminLoginBodyPasswordMax)
});
var AdminLoginResponse = zod.object({
  "authenticated": zod.boolean(),
  "setupRequired": zod.boolean(),
  "email": zod.string().optional()
});
var AdminLogoutResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
var changeAdminPasswordBodyNewPasswordMin = 12;
var changeAdminPasswordBodyNewPasswordMax = 200;
var ChangeAdminPasswordBody = zod.object({
  "currentPassword": zod.string(),
  "newPassword": zod.string().min(changeAdminPasswordBodyNewPasswordMin).max(changeAdminPasswordBodyNewPasswordMax)
});
var ChangeAdminPasswordResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
var getAdminDashboardResponseRecentLeadsItemOneNameMin = 2;
var getAdminDashboardResponseRecentLeadsItemOneNameMax = 150;
var getAdminDashboardResponseRecentLeadsItemOneEmailMax = 250;
var getAdminDashboardResponseRecentLeadsItemOnePhoneMin = 7;
var getAdminDashboardResponseRecentLeadsItemOnePhoneMax = 25;
var getAdminDashboardResponseRecentLeadsItemOneMessageMax = 3e3;
var GetAdminDashboardResponse = zod.object({
  "universities": zod.number().int(),
  "programs": zod.number().int(),
  "courses": zod.number().int(),
  "blogs": zod.number().int(),
  "leads": zod.number().int(),
  "applications": zod.number().int(),
  "needsVerification": zod.number().int(),
  "leadStages": zod.array(zod.object({
    "status": zod.string(),
    "count": zod.number().int()
  })),
  "recentLeads": zod.array(zod.object({
    "name": zod.string().min(getAdminDashboardResponseRecentLeadsItemOneNameMin).max(getAdminDashboardResponseRecentLeadsItemOneNameMax),
    "email": zod.string().email().max(getAdminDashboardResponseRecentLeadsItemOneEmailMax),
    "phone": zod.string().min(getAdminDashboardResponseRecentLeadsItemOnePhoneMin).max(getAdminDashboardResponseRecentLeadsItemOnePhoneMax),
    "consent": zod.boolean(),
    "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot"]).optional(),
    "university": zod.string().optional(),
    "program": zod.string().optional(),
    "course": zod.string().optional(),
    "source": zod.string().optional(),
    "utm": zod.string().optional(),
    "message": zod.string().max(getAdminDashboardResponseRecentLeadsItemOneMessageMax).optional()
  }).and(zod.object({
    "id": zod.number().int(),
    "status": zod.string(),
    "notes": zod.string(),
    "createdAt": zod.string()
  })))
});
var ListAdminContentParams = zod.object({
  "kind": zod.coerce.string()
});
var listAdminContentResponseOneNameMax = 250;
var listAdminContentResponseOneSlugMax = 250;
var ListAdminContentResponseItem = zod.object({
  "name": zod.string().min(1).max(listAdminContentResponseOneNameMax),
  "slug": zod.string().min(1).max(listAdminContentResponseOneSlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]),
  "featured": zod.boolean(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "kind": zod.string(),
  "createdAt": zod.string(),
  "updatedAt": zod.string()
}));
var ListAdminContentResponse = zod.array(ListAdminContentResponseItem);
var CreateContentParams = zod.object({
  "kind": zod.coerce.string()
});
var createContentBodyNameMax = 250;
var createContentBodySlugMax = 250;
var CreateContentBody = zod.object({
  "name": zod.string().min(1).max(createContentBodyNameMax),
  "slug": zod.string().min(1).max(createContentBodySlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]).optional(),
  "featured": zod.boolean().optional(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
});
var createContentResponseOneNameMax = 250;
var createContentResponseOneSlugMax = 250;
var CreateContentResponse = zod.object({
  "name": zod.string().min(1).max(createContentResponseOneNameMax),
  "slug": zod.string().min(1).max(createContentResponseOneSlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]),
  "featured": zod.boolean(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "kind": zod.string(),
  "createdAt": zod.string(),
  "updatedAt": zod.string()
}));
var UpdateContentParams = zod.object({
  "kind": zod.coerce.string(),
  "id": zod.coerce.number().int()
});
var updateContentBodyNameMax = 250;
var updateContentBodySlugMax = 250;
var UpdateContentBody = zod.object({
  "name": zod.string().min(1).max(updateContentBodyNameMax),
  "slug": zod.string().min(1).max(updateContentBodySlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]).optional(),
  "featured": zod.boolean().optional(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
});
var updateContentResponseOneNameMax = 250;
var updateContentResponseOneSlugMax = 250;
var UpdateContentResponse = zod.object({
  "name": zod.string().min(1).max(updateContentResponseOneNameMax),
  "slug": zod.string().min(1).max(updateContentResponseOneSlugMax),
  "description": zod.string().optional(),
  "shortDescription": zod.string().optional(),
  "status": zod.enum(["published", "draft", "archived"]),
  "featured": zod.boolean(),
  "sortOrder": zod.number().int().optional(),
  "universityId": zod.number().int().nullish(),
  "universityName": zod.string().optional(),
  "city": zod.string().optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "email": zod.string().optional(),
  "phone": zod.string().optional(),
  "author": zod.string().optional(),
  "publishedAt": zod.string().optional(),
  "source": zod.string().optional(),
  "verified": zod.boolean().optional(),
  "verificationNotes": zod.string().optional(),
  "partnershipVerified": zod.boolean().optional(),
  "seoTitle": zod.string().optional(),
  "seoDescription": zod.string().optional(),
  "canonical": zod.string().optional(),
  "ogTitle": zod.string().optional(),
  "ogDescription": zod.string().optional(),
  "ogImage": zod.string().optional(),
  "robots": zod.string().optional(),
  "highlights": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "outcomes": zod.array(zod.string()).optional(),
  "careerPaths": zod.array(zod.string()).optional(),
  "admissionProcess": zod.array(zod.string()).optional(),
  "documentsRequired": zod.array(zod.string()).optional(),
  "studentSupport": zod.array(zod.string()).optional(),
  "industryExposure": zod.array(zod.string()).optional(),
  "projects": zod.array(zod.string()).optional(),
  "internships": zod.array(zod.string()).optional(),
  "placementInformation": zod.array(zod.string()).optional(),
  "media": zod.array(zod.string()).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "kind": zod.string(),
  "createdAt": zod.string(),
  "updatedAt": zod.string()
}));
var ArchiveContentParams = zod.object({
  "kind": zod.coerce.string(),
  "id": zod.coerce.number().int()
});
var ArchiveContentResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
var listAdminLeadsResponseOneNameMin = 2;
var listAdminLeadsResponseOneNameMax = 150;
var listAdminLeadsResponseOneEmailMax = 250;
var listAdminLeadsResponseOnePhoneMin = 7;
var listAdminLeadsResponseOnePhoneMax = 25;
var listAdminLeadsResponseOneMessageMax = 3e3;
var ListAdminLeadsResponseItem = zod.object({
  "name": zod.string().min(listAdminLeadsResponseOneNameMin).max(listAdminLeadsResponseOneNameMax),
  "email": zod.string().email().max(listAdminLeadsResponseOneEmailMax),
  "phone": zod.string().min(listAdminLeadsResponseOnePhoneMin).max(listAdminLeadsResponseOnePhoneMax),
  "consent": zod.boolean(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot"]).optional(),
  "university": zod.string().optional(),
  "program": zod.string().optional(),
  "course": zod.string().optional(),
  "source": zod.string().optional(),
  "utm": zod.string().optional(),
  "message": zod.string().max(listAdminLeadsResponseOneMessageMax).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "status": zod.string(),
  "notes": zod.string(),
  "createdAt": zod.string()
}));
var ListAdminLeadsResponse = zod.array(ListAdminLeadsResponseItem);
var UpdateLeadParams = zod.object({
  "id": zod.coerce.number().int()
});
var updateLeadBodyNotesMax = 5e3;
var UpdateLeadBody = zod.object({
  "status": zod.enum(["New", "Contacted", "Interested", "Application Started", "Applied", "Admission Confirmed", "Closed"]).optional(),
  "notes": zod.string().max(updateLeadBodyNotesMax).optional()
});
var updateLeadResponseOneNameMin = 2;
var updateLeadResponseOneNameMax = 150;
var updateLeadResponseOneEmailMax = 250;
var updateLeadResponseOnePhoneMin = 7;
var updateLeadResponseOnePhoneMax = 25;
var updateLeadResponseOneMessageMax = 3e3;
var UpdateLeadResponse = zod.object({
  "name": zod.string().min(updateLeadResponseOneNameMin).max(updateLeadResponseOneNameMax),
  "email": zod.string().email().max(updateLeadResponseOneEmailMax),
  "phone": zod.string().min(updateLeadResponseOnePhoneMin).max(updateLeadResponseOnePhoneMax),
  "consent": zod.boolean(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot"]).optional(),
  "university": zod.string().optional(),
  "program": zod.string().optional(),
  "course": zod.string().optional(),
  "source": zod.string().optional(),
  "utm": zod.string().optional(),
  "message": zod.string().max(updateLeadResponseOneMessageMax).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "status": zod.string(),
  "notes": zod.string(),
  "createdAt": zod.string()
}));
export {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  ArchiveContentParams,
  ArchiveContentResponse,
  AskAcadBotBody,
  AskAcadBotResponse,
  ChangeAdminPasswordBody,
  ChangeAdminPasswordResponse,
  CreateContentBody,
  CreateContentParams,
  CreateContentResponse,
  GetAdminDashboardResponse,
  GetAdminSessionResponse,
  GetContentParams,
  GetContentResponse,
  GetDiscoveryResponse,
  HealthCheckResponse,
  ListAdminContentParams,
  ListAdminContentResponse,
  ListAdminContentResponseItem,
  ListAdminLeadsResponse,
  ListAdminLeadsResponseItem,
  ListContentParams,
  ListContentQueryParams,
  ListContentResponse,
  ListContentResponseItem,
  SubmitLeadBody,
  SubmitLeadResponse,
  UpdateContentBody,
  UpdateContentParams,
  UpdateContentResponse,
  UpdateLeadBody,
  UpdateLeadParams,
  UpdateLeadResponse,
  adminLoginBodyPasswordMax,
  askAcadBotBodyMessageMax,
  changeAdminPasswordBodyNewPasswordMax,
  changeAdminPasswordBodyNewPasswordMin,
  createContentBodyNameMax,
  createContentBodySlugMax,
  createContentResponseOneNameMax,
  createContentResponseOneSlugMax,
  getAdminDashboardResponseRecentLeadsItemOneEmailMax,
  getAdminDashboardResponseRecentLeadsItemOneMessageMax,
  getAdminDashboardResponseRecentLeadsItemOneNameMax,
  getAdminDashboardResponseRecentLeadsItemOneNameMin,
  getAdminDashboardResponseRecentLeadsItemOnePhoneMax,
  getAdminDashboardResponseRecentLeadsItemOnePhoneMin,
  getContentResponseOneNameMax,
  getContentResponseOneSlugMax,
  listAdminContentResponseOneNameMax,
  listAdminContentResponseOneSlugMax,
  listAdminLeadsResponseOneEmailMax,
  listAdminLeadsResponseOneMessageMax,
  listAdminLeadsResponseOneNameMax,
  listAdminLeadsResponseOneNameMin,
  listAdminLeadsResponseOnePhoneMax,
  listAdminLeadsResponseOnePhoneMin,
  listContentResponseOneNameMax,
  listContentResponseOneSlugMax,
  submitLeadBodyEmailMax,
  submitLeadBodyMessageMax,
  submitLeadBodyNameMax,
  submitLeadBodyNameMin,
  submitLeadBodyPhoneMax,
  submitLeadBodyPhoneMin,
  updateContentBodyNameMax,
  updateContentBodySlugMax,
  updateContentResponseOneNameMax,
  updateContentResponseOneSlugMax,
  updateLeadBodyNotesMax,
  updateLeadResponseOneEmailMax,
  updateLeadResponseOneMessageMax,
  updateLeadResponseOneNameMax,
  updateLeadResponseOneNameMin,
  updateLeadResponseOnePhoneMax,
  updateLeadResponseOnePhoneMin
};
