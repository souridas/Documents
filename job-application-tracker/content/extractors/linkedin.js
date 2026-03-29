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
    'h1.t-24.t-bold.inline',
    '.job-details-jobs-unified-top-card__job-title h1',
    'h2.t-24.t-bold',
    'h1.topcard__title',
    'h3.base-search-card__title'
  ];

  const companySelectors = [
    '.job-details-jobs-unified-top-card__company-name a',
    '.job-details-jobs-unified-top-card__company-name',
    'a.topcard__org-name-link',
    'h4.base-search-card__subtitle'
  ];

  const locationSelectors = [
    '.job-details-jobs-unified-top-card__primary-description-container span > span.tvm__text--low-emphasis:first-child',
    '.job-details-jobs-unified-top-card__bullet',
    'span.topcard__flavor--bullet',
    'span.job-search-card__location'
  ];

  const salarySelectors = [
    '.job-details-fit-level-preferences > button:first-child',
    '.salary-main-rail__data-body',
    '.compensation__salary'
  ];

  const descriptionSelectors = [
    '.jobs-description__content .jobs-box__html-content',
    '#job-details',
    '.description__text'
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
