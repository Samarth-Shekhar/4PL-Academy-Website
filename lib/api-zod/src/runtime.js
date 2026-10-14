// ../api-zod/src/generated/api.ts
import * as zod from "zod";
var requestMediaUploadBodyNameMax = 250;
var requestMediaUploadBodySizeMax = 26214400;
var RequestMediaUploadBody = zod.object({
  "name": zod.string().min(1).max(requestMediaUploadBodyNameMax),
  "size": zod.number().int().min(1).max(requestMediaUploadBodySizeMax),
  "contentType": zod.enum(["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm"])
});
var RequestMediaUploadResponse = zod.object({
  "uploadURL": zod.string(),
  "objectPath": zod.string()
});
var GetMediaObjectParams = zod.object({
  "id": zod.coerce.string()
});
var GetMediaObjectResponse = zod.unknown();
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
var listContentResponseOneLatitudeMin = -90;
var listContentResponseOneLatitudeMax = 90;
var listContentResponseOneLongitudeMin = -180;
var listContentResponseOneLongitudeMax = 180;
var listContentResponseOneSemestersItemNameMax = 150;
var listContentResponseOneSemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(listContentResponseOneLatitudeMin).max(listContentResponseOneLatitudeMax).nullish(),
  "longitude": zod.number().min(listContentResponseOneLongitudeMin).max(listContentResponseOneLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(listContentResponseOneSemestersItemNameMax),
    "modules": zod.array(zod.string().max(listContentResponseOneSemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
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
var getContentResponseOneLatitudeMin = -90;
var getContentResponseOneLatitudeMax = 90;
var getContentResponseOneLongitudeMin = -180;
var getContentResponseOneLongitudeMax = 180;
var getContentResponseOneSemestersItemNameMax = 150;
var getContentResponseOneSemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(getContentResponseOneLatitudeMin).max(getContentResponseOneLatitudeMax).nullish(),
  "longitude": zod.number().min(getContentResponseOneLongitudeMin).max(getContentResponseOneLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(getContentResponseOneSemestersItemNameMax),
    "modules": zod.array(zod.string().max(getContentResponseOneSemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
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
var submitLeadBodyPhoneCountryMax = 2;
var submitLeadBodyInterestedInMax = 150;
var submitLeadBodyQualificationMax = 250;
var submitLeadBodyCityMax = 150;
var submitLeadBodyPreferredDateMax = 10;
var submitLeadBodyPreferredTimeMax = 5;
var submitLeadBodyTimeZoneMax = 100;
var submitLeadBodyMessageMax = 3e3;
var SubmitLeadBody = zod.object({
  "name": zod.string().min(submitLeadBodyNameMin).max(submitLeadBodyNameMax),
  "email": zod.string().email().max(submitLeadBodyEmailMax),
  "phone": zod.string().min(submitLeadBodyPhoneMin).max(submitLeadBodyPhoneMax),
  "phoneCountry": zod.string().max(submitLeadBodyPhoneCountryMax).describe("Selected ISO country code; empty only on legacy records"),
  "consent": zod.boolean(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot", "careers"]).optional(),
  "university": zod.string().optional(),
  "program": zod.string().optional(),
  "course": zod.string().optional(),
  "interestedIn": zod.string().max(submitLeadBodyInterestedInMax).optional(),
  "qualification": zod.string().max(submitLeadBodyQualificationMax).optional(),
  "city": zod.string().max(submitLeadBodyCityMax).optional(),
  "preferredDate": zod.string().max(submitLeadBodyPreferredDateMax).optional().describe("Preferred counselling date in YYYY-MM-DD; empty on unscheduled enquiries"),
  "preferredTime": zod.string().max(submitLeadBodyPreferredTimeMax).optional().describe("Preferred counselling time in HH:mm; empty on unscheduled enquiries"),
  "timeZone": zod.string().max(submitLeadBodyTimeZoneMax).optional().describe("IANA time zone for the preferred date and time"),
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
  "email": zod.string().optional(),
  "canManageAdmins": zod.boolean()
});
var adminLoginBodyPasswordMax = 200;
var AdminLoginBody = zod.object({
  "email": zod.string().email(),
  "password": zod.string().min(1).max(adminLoginBodyPasswordMax)
});
var AdminLoginResponse = zod.object({
  "authenticated": zod.boolean(),
  "setupRequired": zod.boolean(),
  "email": zod.string().optional(),
  "canManageAdmins": zod.boolean()
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
var ListAdminProfilesResponseItem = zod.object({
  "id": zod.number().int(),
  "email": zod.string().email(),
  "role": zod.string(),
  "createdAt": zod.string(),
  "isOwner": zod.boolean(),
  "canManageAdmins": zod.boolean()
});
var ListAdminProfilesResponse = zod.array(ListAdminProfilesResponseItem);
var createAdminProfileBodyEmailMax = 250;
var createAdminProfileBodyInitialPasswordMin = 12;
var createAdminProfileBodyInitialPasswordMax = 200;
var CreateAdminProfileBody = zod.object({
  "email": zod.string().email().max(createAdminProfileBodyEmailMax),
  "initialPassword": zod.string().min(createAdminProfileBodyInitialPasswordMin).max(createAdminProfileBodyInitialPasswordMax)
});
var CreateAdminProfileResponse = zod.object({
  "id": zod.number().int(),
  "email": zod.string().email(),
  "role": zod.string(),
  "createdAt": zod.string(),
  "isOwner": zod.boolean(),
  "canManageAdmins": zod.boolean()
});
var ResetAdminProfilePasswordParams = zod.object({
  "id": zod.coerce.number().int()
});
var resetAdminProfilePasswordBodyNewPasswordMin = 12;
var resetAdminProfilePasswordBodyNewPasswordMax = 200;
var ResetAdminProfilePasswordBody = zod.object({
  "newPassword": zod.string().min(resetAdminProfilePasswordBodyNewPasswordMin).max(resetAdminProfilePasswordBodyNewPasswordMax)
});
var ResetAdminProfilePasswordResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
var getAdminDashboardResponseRecentLeadsItemOneNameMin = 2;
var getAdminDashboardResponseRecentLeadsItemOneNameMax = 150;
var getAdminDashboardResponseRecentLeadsItemOneEmailMax = 250;
var getAdminDashboardResponseRecentLeadsItemOnePhoneMin = 7;
var getAdminDashboardResponseRecentLeadsItemOnePhoneMax = 25;
var getAdminDashboardResponseRecentLeadsItemOnePhoneCountryMax = 2;
var getAdminDashboardResponseRecentLeadsItemOneInterestedInMax = 150;
var getAdminDashboardResponseRecentLeadsItemOneQualificationMax = 250;
var getAdminDashboardResponseRecentLeadsItemOneCityMax = 150;
var getAdminDashboardResponseRecentLeadsItemOnePreferredDateMax = 10;
var getAdminDashboardResponseRecentLeadsItemOnePreferredTimeMax = 5;
var getAdminDashboardResponseRecentLeadsItemOneTimeZoneMax = 100;
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
    "phoneCountry": zod.string().max(getAdminDashboardResponseRecentLeadsItemOnePhoneCountryMax).describe("Selected ISO country code; empty only on legacy records"),
    "consent": zod.boolean(),
    "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot", "careers"]).optional(),
    "university": zod.string().optional(),
    "program": zod.string().optional(),
    "course": zod.string().optional(),
    "interestedIn": zod.string().max(getAdminDashboardResponseRecentLeadsItemOneInterestedInMax).optional(),
    "qualification": zod.string().max(getAdminDashboardResponseRecentLeadsItemOneQualificationMax).optional(),
    "city": zod.string().max(getAdminDashboardResponseRecentLeadsItemOneCityMax).optional(),
    "preferredDate": zod.string().max(getAdminDashboardResponseRecentLeadsItemOnePreferredDateMax).optional().describe("Preferred counselling date in YYYY-MM-DD; empty on unscheduled enquiries"),
    "preferredTime": zod.string().max(getAdminDashboardResponseRecentLeadsItemOnePreferredTimeMax).optional().describe("Preferred counselling time in HH:mm; empty on unscheduled enquiries"),
    "timeZone": zod.string().max(getAdminDashboardResponseRecentLeadsItemOneTimeZoneMax).optional().describe("IANA time zone for the preferred date and time"),
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
var listAdminContentResponseOneLatitudeMin = -90;
var listAdminContentResponseOneLatitudeMax = 90;
var listAdminContentResponseOneLongitudeMin = -180;
var listAdminContentResponseOneLongitudeMax = 180;
var listAdminContentResponseOneSemestersItemNameMax = 150;
var listAdminContentResponseOneSemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(listAdminContentResponseOneLatitudeMin).max(listAdminContentResponseOneLatitudeMax).nullish(),
  "longitude": zod.number().min(listAdminContentResponseOneLongitudeMin).max(listAdminContentResponseOneLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(listAdminContentResponseOneSemestersItemNameMax),
    "modules": zod.array(zod.string().max(listAdminContentResponseOneSemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
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
var createContentBodyLatitudeMin = -90;
var createContentBodyLatitudeMax = 90;
var createContentBodyLongitudeMin = -180;
var createContentBodyLongitudeMax = 180;
var createContentBodySemestersItemNameMax = 150;
var createContentBodySemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(createContentBodyLatitudeMin).max(createContentBodyLatitudeMax).nullish(),
  "longitude": zod.number().min(createContentBodyLongitudeMin).max(createContentBodyLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(createContentBodySemestersItemNameMax),
    "modules": zod.array(zod.string().max(createContentBodySemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
});
var createContentResponseOneNameMax = 250;
var createContentResponseOneSlugMax = 250;
var createContentResponseOneLatitudeMin = -90;
var createContentResponseOneLatitudeMax = 90;
var createContentResponseOneLongitudeMin = -180;
var createContentResponseOneLongitudeMax = 180;
var createContentResponseOneSemestersItemNameMax = 150;
var createContentResponseOneSemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(createContentResponseOneLatitudeMin).max(createContentResponseOneLatitudeMax).nullish(),
  "longitude": zod.number().min(createContentResponseOneLongitudeMin).max(createContentResponseOneLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(createContentResponseOneSemestersItemNameMax),
    "modules": zod.array(zod.string().max(createContentResponseOneSemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
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
var updateContentBodyLatitudeMin = -90;
var updateContentBodyLatitudeMax = 90;
var updateContentBodyLongitudeMin = -180;
var updateContentBodyLongitudeMax = 180;
var updateContentBodySemestersItemNameMax = 150;
var updateContentBodySemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(updateContentBodyLatitudeMin).max(updateContentBodyLatitudeMax).nullish(),
  "longitude": zod.number().min(updateContentBodyLongitudeMin).max(updateContentBodyLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(updateContentBodySemestersItemNameMax),
    "modules": zod.array(zod.string().max(updateContentBodySemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
  "faqs": zod.array(zod.object({
    "question": zod.string(),
    "answer": zod.string()
  })).optional()
});
var updateContentResponseOneNameMax = 250;
var updateContentResponseOneSlugMax = 250;
var updateContentResponseOneLatitudeMin = -90;
var updateContentResponseOneLatitudeMax = 90;
var updateContentResponseOneLongitudeMin = -180;
var updateContentResponseOneLongitudeMax = 180;
var updateContentResponseOneSemestersItemNameMax = 150;
var updateContentResponseOneSemestersItemModulesItemMax = 500;
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
  "region": zod.string().optional(),
  "latitude": zod.number().min(updateContentResponseOneLatitudeMin).max(updateContentResponseOneLatitudeMax).nullish(),
  "longitude": zod.number().min(updateContentResponseOneLongitudeMin).max(updateContentResponseOneLongitudeMax).nullish(),
  "coordinateAccuracy": zod.enum(["city-centre", "campus", "unlocated"]).optional(),
  "state": zod.string().optional(),
  "location": zod.string().optional(),
  "degree": zod.string().optional(),
  "degreeLevel": zod.string().optional(),
  "school": zod.string().optional(),
  "catalogueYear": zod.string().optional(),
  "catalogueUrl": zod.string().optional(),
  "curriculumNote": zod.string().optional(),
  "professionalPassport": zod.string().optional(),
  "specialization": zod.string().optional(),
  "category": zod.string().optional(),
  "duration": zod.string().optional(),
  "mode": zod.string().optional(),
  "eligibility": zod.string().optional(),
  "minimumPercentage": zod.string().optional(),
  "fee": zod.string().optional(),
  "feeNote": zod.string().optional(),
  "batch": zod.string().optional(),
  "intake": zod.string().optional(),
  "hours": zod.string().optional(),
  "certification": zod.string().optional(),
  "targetAudience": zod.string().optional(),
  "accreditation": zod.string().optional(),
  "establishedYear": zod.string().optional(),
  "type": zod.string().optional(),
  "country": zod.string().optional(),
  "image": zod.string().optional(),
  "heroImage": zod.string().optional(),
  "imageAlt": zod.string().optional(),
  "imageSourceType": zod.string().optional(),
  "logo": zod.string().optional(),
  "websiteUrl": zod.string().optional(),
  "applicationUrl": zod.string().optional(),
  "brochureUrl": zod.string().optional(),
  "supplementaryBrochureUrl": zod.string().optional(),
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
  "learningMethods": zod.array(zod.string()).optional(),
  "technologyKit": zod.array(zod.string()).optional(),
  "certificationPathways": zod.array(zod.string()).optional(),
  "globalExposure": zod.array(zod.string()).optional(),
  "programmeNotes": zod.array(zod.string()).optional(),
  "facilities": zod.array(zod.string()).optional(),
  "curriculum": zod.array(zod.string()).optional(),
  "semesters": zod.array(zod.object({
    "name": zod.string().min(1).max(updateContentResponseOneSemestersItemNameMax),
    "modules": zod.array(zod.string().max(updateContentResponseOneSemestersItemModulesItemMax))
  })).optional(),
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
  "url": zod.string().optional(),
  "posterUrl": zod.string().optional(),
  "thumbnailUrl": zod.string().optional(),
  "altText": zod.string().optional(),
  "caption": zod.string().optional(),
  "section": zod.string().optional(),
  "programId": zod.number().int().nullish(),
  "courseId": zod.number().int().nullish(),
  "enabled": zod.boolean().optional(),
  "ctaLabel": zod.string().optional(),
  "ctaUrl": zod.string().optional(),
  "secondaryCtaLabel": zod.string().optional(),
  "secondaryCtaUrl": zod.string().optional(),
  "issuer": zod.string().optional(),
  "credentialType": zod.string().optional(),
  "relationshipType": zod.enum(["Partner", "Hiring Partner", "Training Partner", "Corporate Client", "Industry Association", "Technology Partner", "Featured Company", "Other"]).optional(),
  "quote": zod.string().optional(),
  "studentName": zod.string().optional(),
  "year": zod.string().optional(),
  "items": zod.array(zod.object({
    "name": zod.string(),
    "description": zod.string().optional(),
    "image": zod.string().optional(),
    "url": zod.string().optional(),
    "altText": zod.string().optional()
  })).optional(),
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
var PermanentlyDeleteContentParams = zod.object({
  "kind": zod.coerce.string(),
  "id": zod.coerce.number().int()
});
var PermanentlyDeleteContentResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
var listAdminLeadsResponseOneNameMin = 2;
var listAdminLeadsResponseOneNameMax = 150;
var listAdminLeadsResponseOneEmailMax = 250;
var listAdminLeadsResponseOnePhoneMin = 7;
var listAdminLeadsResponseOnePhoneMax = 25;
var listAdminLeadsResponseOnePhoneCountryMax = 2;
var listAdminLeadsResponseOneInterestedInMax = 150;
var listAdminLeadsResponseOneQualificationMax = 250;
var listAdminLeadsResponseOneCityMax = 150;
var listAdminLeadsResponseOnePreferredDateMax = 10;
var listAdminLeadsResponseOnePreferredTimeMax = 5;
var listAdminLeadsResponseOneTimeZoneMax = 100;
var listAdminLeadsResponseOneMessageMax = 3e3;
var ListAdminLeadsResponseItem = zod.object({
  "name": zod.string().min(listAdminLeadsResponseOneNameMin).max(listAdminLeadsResponseOneNameMax),
  "email": zod.string().email().max(listAdminLeadsResponseOneEmailMax),
  "phone": zod.string().min(listAdminLeadsResponseOnePhoneMin).max(listAdminLeadsResponseOnePhoneMax),
  "phoneCountry": zod.string().max(listAdminLeadsResponseOnePhoneCountryMax).describe("Selected ISO country code; empty only on legacy records"),
  "consent": zod.boolean(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot", "careers"]).optional(),
  "university": zod.string().optional(),
  "program": zod.string().optional(),
  "course": zod.string().optional(),
  "interestedIn": zod.string().max(listAdminLeadsResponseOneInterestedInMax).optional(),
  "qualification": zod.string().max(listAdminLeadsResponseOneQualificationMax).optional(),
  "city": zod.string().max(listAdminLeadsResponseOneCityMax).optional(),
  "preferredDate": zod.string().max(listAdminLeadsResponseOnePreferredDateMax).optional().describe("Preferred counselling date in YYYY-MM-DD; empty on unscheduled enquiries"),
  "preferredTime": zod.string().max(listAdminLeadsResponseOnePreferredTimeMax).optional().describe("Preferred counselling time in HH:mm; empty on unscheduled enquiries"),
  "timeZone": zod.string().max(listAdminLeadsResponseOneTimeZoneMax).optional().describe("IANA time zone for the preferred date and time"),
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
var updateLeadBodyNameMin = 2;
var updateLeadBodyNameMax = 150;
var updateLeadBodyEmailMax = 250;
var updateLeadBodyPhoneMin = 7;
var updateLeadBodyPhoneMax = 25;
var updateLeadBodyPhoneCountryMax = 2;
var updateLeadBodyUniversityMax = 250;
var updateLeadBodyProgramMax = 250;
var updateLeadBodyCourseMax = 250;
var updateLeadBodyInterestedInMax = 150;
var updateLeadBodyQualificationMax = 250;
var updateLeadBodyCityMax = 150;
var updateLeadBodyPreferredDateMax = 10;
var updateLeadBodyPreferredTimeMax = 5;
var updateLeadBodyTimeZoneMax = 100;
var updateLeadBodyMessageMax = 3e3;
var updateLeadBodySourceMax = 1e3;
var updateLeadBodyUtmMax = 2e3;
var updateLeadBodyNotesMax = 5e3;
var UpdateLeadBody = zod.object({
  "name": zod.string().min(updateLeadBodyNameMin).max(updateLeadBodyNameMax).optional(),
  "email": zod.string().email().max(updateLeadBodyEmailMax).optional(),
  "phone": zod.string().min(updateLeadBodyPhoneMin).max(updateLeadBodyPhoneMax).optional(),
  "phoneCountry": zod.string().max(updateLeadBodyPhoneCountryMax).optional(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot", "careers"]).optional(),
  "university": zod.string().max(updateLeadBodyUniversityMax).optional(),
  "program": zod.string().max(updateLeadBodyProgramMax).optional(),
  "course": zod.string().max(updateLeadBodyCourseMax).optional(),
  "interestedIn": zod.string().max(updateLeadBodyInterestedInMax).optional(),
  "qualification": zod.string().max(updateLeadBodyQualificationMax).optional(),
  "city": zod.string().max(updateLeadBodyCityMax).optional(),
  "preferredDate": zod.string().max(updateLeadBodyPreferredDateMax).optional(),
  "preferredTime": zod.string().max(updateLeadBodyPreferredTimeMax).optional(),
  "timeZone": zod.string().max(updateLeadBodyTimeZoneMax).optional(),
  "message": zod.string().max(updateLeadBodyMessageMax).optional(),
  "source": zod.string().max(updateLeadBodySourceMax).optional(),
  "utm": zod.string().max(updateLeadBodyUtmMax).optional(),
  "status": zod.enum(["New", "Contacted", "Interested", "Application Started", "Applied", "Admission Confirmed", "Closed"]).optional(),
  "notes": zod.string().max(updateLeadBodyNotesMax).optional()
});
var updateLeadResponseOneNameMin = 2;
var updateLeadResponseOneNameMax = 150;
var updateLeadResponseOneEmailMax = 250;
var updateLeadResponseOnePhoneMin = 7;
var updateLeadResponseOnePhoneMax = 25;
var updateLeadResponseOnePhoneCountryMax = 2;
var updateLeadResponseOneInterestedInMax = 150;
var updateLeadResponseOneQualificationMax = 250;
var updateLeadResponseOneCityMax = 150;
var updateLeadResponseOnePreferredDateMax = 10;
var updateLeadResponseOnePreferredTimeMax = 5;
var updateLeadResponseOneTimeZoneMax = 100;
var updateLeadResponseOneMessageMax = 3e3;
var UpdateLeadResponse = zod.object({
  "name": zod.string().min(updateLeadResponseOneNameMin).max(updateLeadResponseOneNameMax),
  "email": zod.string().email().max(updateLeadResponseOneEmailMax),
  "phone": zod.string().min(updateLeadResponseOnePhoneMin).max(updateLeadResponseOnePhoneMax),
  "phoneCountry": zod.string().max(updateLeadResponseOnePhoneCountryMax).describe("Selected ISO country code; empty only on legacy records"),
  "consent": zod.boolean(),
  "category": zod.enum(["contact", "counselling", "application", "partnership", "chatbot", "careers"]).optional(),
  "university": zod.string().optional(),
  "program": zod.string().optional(),
  "course": zod.string().optional(),
  "interestedIn": zod.string().max(updateLeadResponseOneInterestedInMax).optional(),
  "qualification": zod.string().max(updateLeadResponseOneQualificationMax).optional(),
  "city": zod.string().max(updateLeadResponseOneCityMax).optional(),
  "preferredDate": zod.string().max(updateLeadResponseOnePreferredDateMax).optional().describe("Preferred counselling date in YYYY-MM-DD; empty on unscheduled enquiries"),
  "preferredTime": zod.string().max(updateLeadResponseOnePreferredTimeMax).optional().describe("Preferred counselling time in HH:mm; empty on unscheduled enquiries"),
  "timeZone": zod.string().max(updateLeadResponseOneTimeZoneMax).optional().describe("IANA time zone for the preferred date and time"),
  "source": zod.string().optional(),
  "utm": zod.string().optional(),
  "message": zod.string().max(updateLeadResponseOneMessageMax).optional()
}).and(zod.object({
  "id": zod.number().int(),
  "status": zod.string(),
  "notes": zod.string(),
  "createdAt": zod.string()
}));
var DeleteLeadParams = zod.object({
  "id": zod.coerce.number().int()
});
var DeleteLeadResponse = zod.object({
  "success": zod.boolean(),
  "message": zod.string()
});
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
  CreateAdminProfileBody,
  CreateAdminProfileResponse,
  CreateContentBody,
  CreateContentParams,
  CreateContentResponse,
  DeleteLeadParams,
  DeleteLeadResponse,
  GetAdminDashboardResponse,
  GetAdminSessionResponse,
  GetContentParams,
  GetContentResponse,
  GetDiscoveryResponse,
  GetMediaObjectParams,
  GetMediaObjectResponse,
  HealthCheckResponse,
  ListAdminContentParams,
  ListAdminContentResponse,
  ListAdminContentResponseItem,
  ListAdminLeadsResponse,
  ListAdminLeadsResponseItem,
  ListAdminProfilesResponse,
  ListAdminProfilesResponseItem,
  ListContentParams,
  ListContentQueryParams,
  ListContentResponse,
  ListContentResponseItem,
  PermanentlyDeleteContentParams,
  PermanentlyDeleteContentResponse,
  RequestMediaUploadBody,
  RequestMediaUploadResponse,
  ResetAdminProfilePasswordBody,
  ResetAdminProfilePasswordParams,
  ResetAdminProfilePasswordResponse,
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
  createAdminProfileBodyEmailMax,
  createAdminProfileBodyInitialPasswordMax,
  createAdminProfileBodyInitialPasswordMin,
  createContentBodyLatitudeMax,
  createContentBodyLatitudeMin,
  createContentBodyLongitudeMax,
  createContentBodyLongitudeMin,
  createContentBodyNameMax,
  createContentBodySemestersItemModulesItemMax,
  createContentBodySemestersItemNameMax,
  createContentBodySlugMax,
  createContentResponseOneLatitudeMax,
  createContentResponseOneLatitudeMin,
  createContentResponseOneLongitudeMax,
  createContentResponseOneLongitudeMin,
  createContentResponseOneNameMax,
  createContentResponseOneSemestersItemModulesItemMax,
  createContentResponseOneSemestersItemNameMax,
  createContentResponseOneSlugMax,
  getAdminDashboardResponseRecentLeadsItemOneCityMax,
  getAdminDashboardResponseRecentLeadsItemOneEmailMax,
  getAdminDashboardResponseRecentLeadsItemOneInterestedInMax,
  getAdminDashboardResponseRecentLeadsItemOneMessageMax,
  getAdminDashboardResponseRecentLeadsItemOneNameMax,
  getAdminDashboardResponseRecentLeadsItemOneNameMin,
  getAdminDashboardResponseRecentLeadsItemOnePhoneCountryMax,
  getAdminDashboardResponseRecentLeadsItemOnePhoneMax,
  getAdminDashboardResponseRecentLeadsItemOnePhoneMin,
  getAdminDashboardResponseRecentLeadsItemOnePreferredDateMax,
  getAdminDashboardResponseRecentLeadsItemOnePreferredTimeMax,
  getAdminDashboardResponseRecentLeadsItemOneQualificationMax,
  getAdminDashboardResponseRecentLeadsItemOneTimeZoneMax,
  getContentResponseOneLatitudeMax,
  getContentResponseOneLatitudeMin,
  getContentResponseOneLongitudeMax,
  getContentResponseOneLongitudeMin,
  getContentResponseOneNameMax,
  getContentResponseOneSemestersItemModulesItemMax,
  getContentResponseOneSemestersItemNameMax,
  getContentResponseOneSlugMax,
  listAdminContentResponseOneLatitudeMax,
  listAdminContentResponseOneLatitudeMin,
  listAdminContentResponseOneLongitudeMax,
  listAdminContentResponseOneLongitudeMin,
  listAdminContentResponseOneNameMax,
  listAdminContentResponseOneSemestersItemModulesItemMax,
  listAdminContentResponseOneSemestersItemNameMax,
  listAdminContentResponseOneSlugMax,
  listAdminLeadsResponseOneCityMax,
  listAdminLeadsResponseOneEmailMax,
  listAdminLeadsResponseOneInterestedInMax,
  listAdminLeadsResponseOneMessageMax,
  listAdminLeadsResponseOneNameMax,
  listAdminLeadsResponseOneNameMin,
  listAdminLeadsResponseOnePhoneCountryMax,
  listAdminLeadsResponseOnePhoneMax,
  listAdminLeadsResponseOnePhoneMin,
  listAdminLeadsResponseOnePreferredDateMax,
  listAdminLeadsResponseOnePreferredTimeMax,
  listAdminLeadsResponseOneQualificationMax,
  listAdminLeadsResponseOneTimeZoneMax,
  listContentResponseOneLatitudeMax,
  listContentResponseOneLatitudeMin,
  listContentResponseOneLongitudeMax,
  listContentResponseOneLongitudeMin,
  listContentResponseOneNameMax,
  listContentResponseOneSemestersItemModulesItemMax,
  listContentResponseOneSemestersItemNameMax,
  listContentResponseOneSlugMax,
  requestMediaUploadBodyNameMax,
  requestMediaUploadBodySizeMax,
  resetAdminProfilePasswordBodyNewPasswordMax,
  resetAdminProfilePasswordBodyNewPasswordMin,
  submitLeadBodyCityMax,
  submitLeadBodyEmailMax,
  submitLeadBodyInterestedInMax,
  submitLeadBodyMessageMax,
  submitLeadBodyNameMax,
  submitLeadBodyNameMin,
  submitLeadBodyPhoneCountryMax,
  submitLeadBodyPhoneMax,
  submitLeadBodyPhoneMin,
  submitLeadBodyPreferredDateMax,
  submitLeadBodyPreferredTimeMax,
  submitLeadBodyQualificationMax,
  submitLeadBodyTimeZoneMax,
  updateContentBodyLatitudeMax,
  updateContentBodyLatitudeMin,
  updateContentBodyLongitudeMax,
  updateContentBodyLongitudeMin,
  updateContentBodyNameMax,
  updateContentBodySemestersItemModulesItemMax,
  updateContentBodySemestersItemNameMax,
  updateContentBodySlugMax,
  updateContentResponseOneLatitudeMax,
  updateContentResponseOneLatitudeMin,
  updateContentResponseOneLongitudeMax,
  updateContentResponseOneLongitudeMin,
  updateContentResponseOneNameMax,
  updateContentResponseOneSemestersItemModulesItemMax,
  updateContentResponseOneSemestersItemNameMax,
  updateContentResponseOneSlugMax,
  updateLeadBodyCityMax,
  updateLeadBodyCourseMax,
  updateLeadBodyEmailMax,
  updateLeadBodyInterestedInMax,
  updateLeadBodyMessageMax,
  updateLeadBodyNameMax,
  updateLeadBodyNameMin,
  updateLeadBodyNotesMax,
  updateLeadBodyPhoneCountryMax,
  updateLeadBodyPhoneMax,
  updateLeadBodyPhoneMin,
  updateLeadBodyPreferredDateMax,
  updateLeadBodyPreferredTimeMax,
  updateLeadBodyProgramMax,
  updateLeadBodyQualificationMax,
  updateLeadBodySourceMax,
  updateLeadBodyTimeZoneMax,
  updateLeadBodyUniversityMax,
  updateLeadBodyUtmMax,
  updateLeadResponseOneCityMax,
  updateLeadResponseOneEmailMax,
  updateLeadResponseOneInterestedInMax,
  updateLeadResponseOneMessageMax,
  updateLeadResponseOneNameMax,
  updateLeadResponseOneNameMin,
  updateLeadResponseOnePhoneCountryMax,
  updateLeadResponseOnePhoneMax,
  updateLeadResponseOnePhoneMin,
  updateLeadResponseOnePreferredDateMax,
  updateLeadResponseOnePreferredTimeMax,
  updateLeadResponseOneQualificationMax,
  updateLeadResponseOneTimeZoneMax
};
