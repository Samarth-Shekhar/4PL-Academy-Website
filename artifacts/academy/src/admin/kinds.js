const T = (name, label, extra = {}) => ({ name, label, type: 'text', ...extra });
const N = (name, label, extra = {}) => T(name, label, { type: 'number', ...extra });
const B = (name, label, extra = {}) => T(name, label, { type: 'bool', ...extra });
const U = (name, label, extra = {}) => T(name, label, { type: 'upload', accept: 'image', ...extra });
const R = (name, label, rel, extra = {}) => T(name, label, { type: 'rel', rel, ...extra });
export const REL_TYPES = ['Partner', 'Hiring Partner', 'Training Partner', 'Corporate Client', 'Industry Association', 'Technology Partner', 'Featured Company', 'Other'];
export const HOME_SECTIONS = ['hero', 'ecosystem', 'universities', 'programs', 'industry', 'practical', 'certifications', 'journey', 'careers', 'student-life', 'gallery', 'testimonials', 'admissions', 'final-cta'];
export const MEDIA_SECTIONS = ['hero', 'practical', 'student-life', 'gallery', 'journey', 'careers', 'industry', 'certifications', 'admissions'];
export const MEDIA_CATEGORIES = ['Campus', 'Classroom', 'Industry', 'Events', 'Workshops', 'Students', 'Faculty', 'Projects', 'Career'];
export const SEO_FIELDS = [
  T('seoTitle', 'SEO title', { hint: 'Up to about 60 characters.' }), T('seoDescription', 'Meta description', { type: 'textarea', hint: 'Up to about 160 characters.' }),
  T('canonical', 'Canonical URL', { type: 'url' }), T('ogTitle', 'Open Graph title'), T('ogDescription', 'Open Graph description', { type: 'textarea' }), T('ogImage', 'Open Graph image URL', { type: 'url' }),
  T('robots', 'Robots', { type: 'robots' }),
];
export const KINDS = {
  universities: {
    label: 'University', plural: 'Universities',
    groups: [
      ['Map location', [T('region', 'Region', { hint: 'Used to group map markers, for example Delhi NCR.' }), N('latitude', 'Latitude', { nullable: true, hint: 'Between -90 and 90. Leave empty to keep off the map.', min: -90, max: 90 }), N('longitude', 'Longitude', { nullable: true, hint: 'Between -180 and 180.', min: -180, max: 180 }), T('coordinateAccuracy', 'Location accuracy', { type:'select', options:['city-centre','campus','unlocated'], hint:'Campus coordinates must be independently verified. Imported coordinates are approximate city centres.' })]],
      ['Location and identity', [T('city', 'City'), T('state', 'State'), T('country', 'Country'), T('location', 'Location label'), T('type', 'Institution type'), T('establishedYear', 'Established year'), T('accreditation', 'Accreditation', { hint: 'Only enter verified accreditation.' })]],
      ['Links and contact', [T('websiteUrl', 'Website URL', { type: 'url' }), T('applicationUrl', 'Application URL', { type: 'url' }), T('email', 'Email', { type: 'email' }), T('phone', 'Phone', { type: 'tel' })]],
      ['Brand media (approved URLs)', [U('logo', 'Logo', { hint: 'Use the original institution logo. A logo does not imply a verified 4PL partnership.' }), U('image', 'Cover image')]],
    ],
    arrays: [['highlights', 'Highlights'], ['facilities', 'Facilities'], ['studentSupport', 'Student support'], ['industryExposure', 'Industry exposure'], ['internships', 'Internships'], ['outcomes', 'Career outcomes (verified only)'], ['placementInformation', 'Verified placement information'], ['admissionProcess', 'Admission process'], ['documentsRequired', 'Documents required'], ['careerPaths', 'Career paths'], ['media', 'Media URLs (images and videos)']],
    faqs: true, partnership: true,
  },
  programs: {
    label: 'Program', plural: 'Programs', universityPicker: true,
    groups: [
      ['Program details', [T('degree', 'Degree'), T('degreeLevel', 'Degree level'), T('specialization', 'Specialization'), T('duration', 'Duration'), T('mode', 'Mode'), T('location', 'Location'), T('eligibility', 'Eligibility'), T('minimumPercentage', 'Minimum percentage'), T('batch', 'Batch'), T('intake', 'Intake', { hint: 'For example July and January. Leave empty if not verified.' })]],
      ['Fees', [T('fee', 'Fee', { hint: 'Leave empty if not verified.' }), T('feeNote', 'Fee note')]],
      ['Links and media', [T('applicationUrl', 'Application URL', { type: 'url' }), T('brochureUrl', 'Brochure URL', { type: 'url' }), U('image', 'Image')]],
    ],
    arrays: [['highlights', 'Why choose this program'], ['curriculum', 'Curriculum'], ['outcomes', 'Learning outcomes'], ['industryExposure', 'Industry exposure'], ['projects', 'Projects'], ['internships', 'Internships'], ['admissionProcess', 'Admission process'], ['documentsRequired', 'Documents required'], ['careerPaths', 'Career paths'], ['facilities', 'Facilities'], ['media', 'Media URLs']],
    faqs: true, semesters: true,
  },
  courses: {
    label: 'Course', plural: 'Courses',
    groups: [
      ['Course details', [T('category', 'Category', { hint: 'For example Short-Term or Long-Term.' }), T('duration', 'Duration'), T('hours', 'Hours'), T('mode', 'Mode'), T('eligibility', 'Eligibility'), T('certification', 'Certification'), T('targetAudience', 'Target audience', { type: 'textarea' })]],
      ['Fees', [T('fee', 'Fee'), T('feeNote', 'Fee note')]],
      ['Links and media', [T('applicationUrl', 'Call to action URL', { type: 'url' }), U('image', 'Course image')]],
    ],
    arrays: [['curriculum', 'Modules'], ['highlights', 'Highlights'], ['outcomes', 'Outcomes'], ['media', 'Media URLs']], faqs: true,
  },
  blogs: {
    label: 'Blog post', plural: 'Blogs', descLabel: 'Content', descRows: 14,
    groups: [['Publishing', [T('category', 'Category'), T('author', 'Author'), T('publishedAt', 'Publish date', { type: 'date' }), T('image', 'Featured image URL', { type: 'url' }), T('source', 'Source')]]],
    arrays: [['media', 'Media URLs']], faqs: true,
  },
  faqs: {
    label: 'FAQ group', plural: 'FAQs', groups: [['Group', [T('category', 'Category')]]], arrays: [], faqs: true, faqsLabel: 'Questions and answers',
  },
  pages: {
    label: 'Page', plural: 'Pages', descLabel: 'Page body', descRows: 14, slugHint: 'Must match the route: home, about, career-industry, student-life, for-universities, contact.',
    items: true, itemsLabel: 'Page images',
    groups: [['Media', [U('image', 'Hero image')]]],
    arrays: [['highlights', 'Highlights'], ['curriculum', 'Pathway steps'], ['outcomes', 'Outcomes'], ['careerPaths', 'Career pathways'], ['facilities', 'Facilities'], ['media', 'Media URLs']], faqs: true,
  },
  media: {
    label: 'Media record', plural: 'Media', nameLabel: 'Title', note: 'Upload a file or paste an approved URL. Only verified, published records appear on the public site. Generic licensed imagery should be marked in the caption as illustrative.',
    groups: [
      ['File', [T('type', 'Type', { type: 'select', options: ['image', 'video'] }), U('url', 'Image or video file', { accept: 'media' }), U('posterUrl', 'Poster image (required for video)'), U('thumbnailUrl', 'Thumbnail'), T('altText', 'Alt text'), T('caption', 'Caption', { type: 'textarea' }), T('duration', 'Duration', { hint: 'For example 8s.' })]],
      ['Placement', [T('section', 'Homepage section', { type: 'select', options: MEDIA_SECTIONS }), T('category', 'Category', { type: 'select', options: MEDIA_CATEGORIES }), R('universityId', 'University', 'universities'), R('programId', 'Program', 'programs'), R('courseId', 'Course', 'courses'), T('source', 'Source or credit')]],
    ],
    arrays: [], faqs: false, mirrorUniversity: false,
  },
  homepage: {
    label: 'Homepage section', plural: 'Homepage sections', nameLabel: 'Headline', items: true, slugHint: 'Section key: hero, ecosystem, universities, programs, industry, practical, certifications, journey, careers, student-life, gallery, testimonials, admissions, final-cta.',
    note: 'Each record is one homepage section. Disable it to hide it, and change the sort order to move it. CTA links accept a local route (such as /programs), a full URL, or the word bot to open ACAD BOT.',
    groups: [
      ['Display', [B('enabled', 'Show this section on the homepage', { default: true }), T('category', 'Section group', { hint: 'Normally the same as the section key.' }), U('image', 'Section image or background')]],
      ['Calls to action', [T('ctaLabel', 'Primary button label'), T('ctaUrl', 'Primary button link', { hint: '/programs, https://..., or bot' }), T('secondaryCtaLabel', 'Secondary button label'), T('secondaryCtaUrl', 'Secondary button link')]],
    ],
    arrays: [], faqs: false, itemsLabel: 'Items, stages and steps',
  },
  industry_companies: {
    label: 'Industry company', plural: 'Industry companies', note: 'A company logo is shown on the public site only when the record is verified and published. The relationship label is displayed exactly as chosen here.',
    groups: [['Company', [T('relationshipType', 'Relationship type', { type: 'select', options: REL_TYPES }), U('logo', 'Logo'), U('image', 'Image'), T('websiteUrl', 'Website URL', { type: 'url' })]]],
    arrays: [], faqs: false,
  },
  certifications: {
    label: 'Certification', plural: 'Certifications', note: 'Do not enter accreditation or credential status that has not been confirmed with the issuer.',
    groups: [['Credential', [T('issuer', 'Issuing organization'), T('credentialType', 'Credential type'), T('duration', 'Duration'), R('courseId', 'Linked course', 'courses'), R('programId', 'Linked program', 'programs'), T('websiteUrl', 'Website URL', { type: 'url' }), U('logo', 'Logo'), U('image', 'Image')]]],
    arrays: [], faqs: false,
  },
  testimonials: {
    label: 'Testimonial', plural: 'Testimonials', nameLabel: 'Student name', universityPicker: true, mirrorName: 'studentName', descLabel: 'Longer story (optional)', descRows: 4,
    note: 'Publish only testimonials the student has approved in writing.',
    groups: [['Story', [T('quote', 'Quote', { type: 'textarea' }), T('degree', 'Program or degree'), T('year', 'Year'), U('image', 'Student photo')]]],
    arrays: [], faqs: false,
  },
  seo: {
    label: 'SEO record', plural: 'SEO', slugHint: 'Route identifier: home, about, programs, or programs-program-slug. Replace route slashes with hyphens.', groups: [], arrays: [], faqs: false, seoFirst: true,
  },
  settings: {
    label: 'Setting', plural: 'Site settings', descLabel: 'Value', slugHint: 'Setting key, for example contact-details or footer-note.',
    groups: [['Contact values', [T('email', 'Email', { type: 'email' }), T('phone', 'Phone', { type: 'tel' }), T('location', 'Address'), T('websiteUrl', 'Website URL', { type: 'url' })]], ['Map location', [T('city', 'City'), T('state', 'State'), T('latitude', 'Approximate map latitude', { type: 'number', step: 'any' }), T('longitude', 'Approximate map longitude', { type: 'number', step: 'any' })]]],
    arrays: [['highlights', 'List values']], faqs: false,
  },
};
export const STATUSES = ['published', 'draft', 'archived'];
