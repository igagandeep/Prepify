(function () {
  if (window.__prepifyScraper) return;
  window.__prepifyScraper = true;

  window.addEventListener('message', function (e) {
    if (e.source !== window) return;
    if (!e.data || e.data.type !== 'PREPIFY_SCRAPE_REQUEST') return;

    window.postMessage({
      type: 'PREPIFY_SCRAPE_RESULT',
      id: e.data.id,
      data: scrapeThisPage()
    }, '*');
  });

  function scrapeLinkedIn() {
    var titleEl =
      document.querySelector('.job-details-jobs-unified-top-card__job-title h1 a') ||
      document.querySelector('.job-details-jobs-unified-top-card__job-title h1') ||
      document.querySelector('.jobs-unified-top-card__job-title h1');

    if (!titleEl) return null;

    var role = (titleEl.innerText || '').trim();
    if (!role) return null;

    var companyEl =
      document.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
      document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
      document.querySelector('.jobs-unified-top-card__company-name a') ||
      document.querySelector('.jobs-unified-top-card__company-name');
    var company = companyEl ? (companyEl.innerText || '').trim() : '';

    var loc = '';
    var container =
      document.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container') ||
      document.querySelector('.job-details-jobs-unified-top-card__primary-description-container');
    if (container) {
      var tvmEl = container.querySelector('.tvm__text');
      if (tvmEl) loc = (tvmEl.innerText || '').trim();
    }

    var descEl = document.querySelector('#job-details') ||
           document.querySelector('.jobs-description__content');
    // Capture the full job description text (trimmed), but guard against extremely large pages
    var notes = descEl ? ((descEl.innerText || '').trim().slice(0, 10000)) : '';

    return { role: role, company: company, location: loc, notes: notes };
  }

  function scrapeIndeed() {
    var panel =
      document.querySelector('[data-testid="jobsearch-ViewJobsPanel-expandedJobPanel"]') ||
      document.querySelector('.jobsearch-RightPane') ||
      document;

    var titleEl = panel.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
                  panel.querySelector('h1.jobsearch-JobInfoHeader-title') ||
                  panel.querySelector('h2.jobTitle');
    var role = titleEl ? (titleEl.innerText || '').trim() : '';

    var companyEl = panel.querySelector('[data-testid="inlineHeader-companyName"]') ||
                    panel.querySelector('[data-company-name]');
    var company = companyEl ? (companyEl.innerText || '').trim() : '';

    var locEl = panel.querySelector('[data-testid="job-location"]') ||
                panel.querySelector('[data-testid="inlineHeader-companyLocation"]');
    var loc = locEl ? (locEl.innerText || '').trim() : '';

    var descEl = panel.querySelector('#jobDescriptionText');
    
    var notes = descEl ? ((descEl.innerText || '').trim().slice(0, 10000)) : '';

    return { role: role, company: company, location: loc, notes: notes };
  }

  function scrapeThisPage() {
    var url = window.location.href;
    if (url.includes('linkedin.com')) return scrapeLinkedIn();
    if (url.includes('indeed.com')) return scrapeIndeed();
    return null;
  }
})();
