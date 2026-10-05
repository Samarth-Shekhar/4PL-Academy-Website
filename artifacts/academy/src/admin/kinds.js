const T = (name, label, extra = {}) => ({ name, label, type: 'text', ...extra });
export const SEO_FIELDS = [
  T('seoTitle', 'SEO title', { hint: 'Up to about 60 characters.' }), T('seoDescription', 'Meta description', { type: 'textarea', hint: 'Up to about 160 characters.' }),
  T('canonical', 'Canonical URL', { type: 'url' }), T('ogTitle', 'Open Graph title'), T('ogDescription', 'Open Graph description', { type: 'textarea' }), T('ogImage', 'Open Graph image URL', { type: 'url' }),
  T('robots', 'Robots', { type: 'robots' }),
];
export const KINDS = {
  universities: {
    label: 'University', plural: 'Universities',
    groups: [
      ['Location and identity', [T('city', 'City'), T('state', 'State'), T('country', 'Country'), T('location', 'Location label'), T('type', 'Institution type'), T('establishedYear', 'Established year'), T('accreditation', 'Accreditation', { hint: 'Only enter verified accreditation.' })]],
      ['Links and contact', [T('websiteUrl', 'Website URL', { type: 'url' }), T('applicationUrl', 'Application URL', { type: 'url' }), T('email', 'Email', { type: 'email' }), T('phone', 'Phone', { type: 'tel' })]],
      ['Brand media (approved URLs)', [T('logo', 'Logo URL', { type: 'url', hint: 'Shown publicly only when partnership is verified.' }), T('image', 'Cover image URL', { type: 'url' })]],
    ],
    arrays: [['highlights', 'Highlights'], ['facilities', 'Facilities'], ['studentSupport', 'Student support'], ['industryExposure', 'Industry exposure'], ['internships', 'Internships'], ['outcomes', 'Career outcomes (verified only)'], ['placementInformation', 'Verified placement information'], ['admissionProcess', 'Admission process'], ['documentsRequired', 'Documents required'], ['careerPaths', 'Career paths'], ['media', 'Media URLs (images and videos)']],
    faqs: true, partnership: true,
  },
  programs: {
    label: 'Program', plural: 'Programs', universityPicker: true,
    groups: [
      ['Program details', [T('degree', 'Degree'), T('degreeLevel', 'Degree level'), T('specialization', 'Specialization'), T('duration', 'Duration'), T('mode', 'Mode'), T('location', 'Location'), T('eligibility', 'Eligibility'), T('minimumPercentage', 'Minimum percentage'), T('batch', 'Batch')]],
      ['Fees', [T('fee', 'Fee', { hint: 'Leave empty if not verified.' }), T('feeNote', 'Fee note')]],
      ['Links and media', [T('applicationUrl', 'Application URL', { type: 'url' }), T('brochureUrl', 'Brochure URL', { type: 'url' }), T('image', 'Image URL', { type: 'url' })]],
    ],
    arrays: [['highlights', 'Why choose this program'], ['curriculum', 'Curriculum'], ['outcomes', 'Learning outcomes'], ['industryExposure', 'Industry exposure'], ['projects', 'Projects'], ['internships', 'Internships'], ['admissionProcess', 'Admission process'], ['documentsRequired', 'Documents required'], ['careerPaths', 'Career paths'], ['facilities', 'Facilities'], ['media', 'Media URLs']],
    faqs: true,
  },
  courses: {
    label: 'Course', plural: 'Courses',
    groups: [
      ['Course details', [T('category', 'Category', { hint: 'For example Short-Term or Long-Term.' }), T('duration', 'Duration'), T('hours', 'Hours'), T('mode', 'Mode'), T('eligibility', 'Eligibility'), T('certification', 'Certification'), T('targetAudience', 'Target audience', { type: 'textarea' })]],
      ['Fees', [T('fee', 'Fee'), T('feeNote', 'Fee note')]],
      ['Links and media', [T('applicationUrl', 'Call to action URL', { type: 'url' }), T('image', 'Course image URL', { type: 'url' })]],
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
    groups: [['Media', [T('image', 'Hero image URL', { type: 'url' })]]],
    arrays: [['highlights', 'Highlights'], ['curriculum', 'Pathway steps'], ['outcomes', 'Outcomes'], ['careerPaths', 'Career pathways'], ['facilities', 'Facilities'], ['media', 'Media URLs']], faqs: true,
  },
  media: {
    label: 'Media record', plural: 'Media',
    groups: [['Approved media', [T('category', 'Type', { hint: 'Image or Video.' }), T('image', 'Image URL', { type: 'url' }), T('source', 'Source or credit'), T('websiteUrl', 'Related page URL', { type: 'url' })]]],
    arrays: [['media', 'Video and additional media URLs']], faqs: false, note: 'Records reference approved image or video URLs. Files are not uploaded here.',
  },
  seo: {
    label: 'SEO record', plural: 'SEO', slugHint: 'Route identifier: home, about, programs, or programs-program-slug. Replace route slashes with hyphens.', groups: [], arrays: [], faqs: false, seoFirst: true,
  },
  settings: {
    label: 'Setting', plural: 'Site settings', descLabel: 'Value', slugHint: 'Setting key, for example contact-details or footer-note.',
    groups: [['Contact values', [T('email', 'Email', { type: 'email' }), T('phone', 'Phone', { type: 'tel' }), T('location', 'Address'), T('websiteUrl', 'Website URL', { type: 'url' })]]],
    arrays: [['highlights', 'List values']], faqs: false,
  },
};
export const STATUSES = ['published', 'draft', 'archived'];
