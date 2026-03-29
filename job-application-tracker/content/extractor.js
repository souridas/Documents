(function () {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJobData') {
      const data = extractJobData();
      sendResponse({ success: true, data });
    }
    return true;
  });

  function extractJobData() {
    if (typeof window.__jobExtractor === 'function') {
      return window.__jobExtractor();
    }
    return {
      jobUrl: window.location.href,
      company: '',
      jobRole: '',
      location: '',
      salaryRange: '',
      description: ''
    };
  }
})();
