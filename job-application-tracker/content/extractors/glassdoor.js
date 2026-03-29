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
    '[data-test="job-title"]',
    '.jobLink span',
    'h2.heading_Heading__BqX5J'
  ];

  const companySelectors = [
    '[data-test="employer-short-name"]',
    '.companyOverviewLink',
    '.EmployerProfile_compactEmployerName__LE242'
  ];

  const locationSelectors = [
    '[data-test="employer-location"]',
    '.jobLocation',
    '.location_Location__H4sGV'
  ];

  const salarySelectors = [
    '.salarySnippet',
    '.salary-estimate',
    '.SalaryEstimate_salaryRange__brHFy'
  ];

  const descriptionSelectors = [
    '.jobDescriptionContent',
    '.desc',
    '#JobDescriptionContainer'
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
