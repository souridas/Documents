window.__jobExtractor = function () {
  const data = {
    jobUrl: window.location.href,
    company: '',
    jobRole: '',
    location: '',
    salaryRange: '',
    description: ''
  };

  const titleSelectors = [
    'h2.jobTitle > span',
    '.jobsearch-JobInfoHeader-title',
    'h1.jobsearch-JobInfoHeader-title'
  ];

  const companySelectors = [
    'span.companyName',
    '[data-testid="inlineHeader-companyName"]',
    'div.jobsearch-InlineCompanyRating a'
  ];

  const locationSelectors = [
    'div.companyLocation',
    '[data-testid="inlineHeader-companyLocation"]',
    'div.jobsearch-JobInfoHeader-subtitle > div:last-child'
  ];

  const salarySelectors = [
    'div.salary-snippet',
    '#salaryInfoAndJobType span',
    '.jobsearch-JobMetadataHeader-item'
  ];

  const descriptionSelectors = [
    '#jobDescriptionText',
    '.jobsearch-jobDescriptionText'
  ];

  data.jobRole = queryFirst(titleSelectors);
  data.company = queryFirst(companySelectors);
  data.location = queryFirst(locationSelectors);
  data.salaryRange = queryFirst(salarySelectors);
  data.description = queryFirst(descriptionSelectors, true);

  return data;
};

function queryFirst(selectors, truncateText = false) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = (el.textContent || '').trim();
      if (text) {
        return truncateText ? text.substring(0, 500) : text;
      }
    }
  }
  return '';
}
