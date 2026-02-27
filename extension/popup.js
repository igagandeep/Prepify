const API_URL = 'http://localhost:5000/api/jobs';
const STATUS_OPTIONS = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

let capturedJobUrl = '';

document.addEventListener('DOMContentLoaded', async () => {
  const statusBadge = document.getElementById('status-badge');
  const form = document.getElementById('job-form');

  // Populate status dropdown
  const statusSelect = document.getElementById('status');
  STATUS_OPTIONS.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    statusSelect.appendChild(option);
  });

  // Get the active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const tabUrl = tab?.url || '';
  const platform = detectJobPlatform(tabUrl);

  if (platform) {
    capturedJobUrl = tabUrl;
    statusBadge.textContent = `${platform} job detected`;
    statusBadge.className = 'badge badge--success';
    await scrapeWithRetry(tab.id);
  } else {
    statusBadge.textContent = 'Manual entry';
    statusBadge.className = 'badge badge--warning';
  }

  form.addEventListener('submit', handleSubmit);
});

function detectJobPlatform(url) {
  if (url.includes('linkedin.com/jobs/view/') || (url.includes('linkedin.com/jobs/') && url.includes('currentJobId='))) return 'LinkedIn';
  if (url.includes('indeed.com') && (url.includes('/viewjob') || url.includes('/rc/clk') || url.includes('vjk='))) return 'Indeed';
  return null;
}

async function scrapeWithRetry(tabId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }

    const data = await scrapeFromTab(tabId);

    if (data && (isValidRole(data.role) || data.company)) {
      if (!isValidRole(data.role)) data.role = '';
      populateForm(data);
      return;
    }
  }
}

async function scrapeFromTab(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: scrapeInline,
    });
    return results?.[0]?.result ?? null;
  } catch (err) {
    console.warn('Scrape failed:', err);
    return null;
  }
}

function isValidRole(role) {
  if (!role || role.length < 3) return false;
  if (/^\d/.test(role)) return false;
  if (/^\(\d+\)/.test(role)) return false;
  if (/^(home|feed|jobs|search|login|messaging|notifications)$/i.test(role)) return false;
  if (/^(top job|my jobs|suggested|recommended|people|who viewed|premium)/i.test(role)) return false;
  return true;
}

function populateForm(data) {
  if (!data) return;
  if (data.role)     document.getElementById('role').value     = data.role;
  if (data.company)  document.getElementById('company').value  = data.company;
  if (data.location) document.getElementById('location').value = data.location;
  if (data.notes)    document.getElementById('notes').value    = data.notes;
  if (data.jobUrl)   capturedJobUrl = data.jobUrl;
}

async function handleSubmit(e) {
  e.preventDefault();
  hideMessage();

  const role     = document.getElementById('role').value.trim();
  const company  = document.getElementById('company').value.trim();
  const location = document.getElementById('location').value.trim();
  const status   = document.getElementById('status').value;
  const notes    = document.getElementById('notes').value.trim();
  const submitBtn = document.getElementById('submit-btn');

  if (!role) {
    showMessage('Role is required.', 'error');
    document.getElementById('role').focus();
    return;
  }
  if (!company) {
    showMessage('Company is required.', 'error');
    document.getElementById('company').focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, company, status, location, notes, jobUrl: capturedJobUrl }),
    });

    if (response.status === 409) {
      showMessage('Already saved \u2014 this job is in your tracker.', 'warning');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add to Prepify';
      return;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Server returned ${response.status}`);
    }

    showMessage('Job added! Opening Prepify...', 'success');
    submitBtn.textContent = 'Added';

    setTimeout(() => {
      chrome.tabs.create({ url: 'http://localhost:3000/jobs' });
      window.close();
    }, 900);
  } catch (err) {
    const isNetworkError = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
    showMessage(
      isNetworkError
        ? 'Cannot reach Prepify. Make sure the app is running (npm run dev).'
        : err.message,
      'error'
    );
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add to Prepify';
  }
}

function showMessage(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = `message message--${type}`;
  el.hidden = false;
}

function hideMessage() {
  document.getElementById('message').hidden = true;
}

// ── Inline scraper (self-contained, injected into the tab) ───────────────────

function scrapeInline() {
  function _getText(selectors, root) {
    var scope = root || document;
    for (var i = 0; i < selectors.length; i++) {
      var el = scope.querySelector(selectors[i]);
      if (el) {
        var text = (el.innerText || el.textContent || '').trim();
        if (text) return text;
      }
    }
    return '';
  }

  function _isValidRole(role) {
    if (!role || role.length < 3) return false;
    if (/^\d/.test(role)) return false;
    if (/^\(\d+\)/.test(role)) return false;
    if (/^(home|feed|jobs|search|login|messaging|notifications)$/i.test(role)) return false;
    if (/^(top job|my jobs|suggested|recommended|people|who viewed|premium)/i.test(role)) return false;
    return true;
  }

  var url = window.location.href;
  var role = '', company = '', location = '', notes = '';

  // ── LinkedIn ──
  if (url.includes('linkedin.com')) {
    var panel =
      document.querySelector('.jobs-search__job-details--two-pane') ||
      document.querySelector('.scaffold-layout__detail') ||
      document.querySelector('.job-details-jobs-unified-top-card__container');

    if (panel) {
      role = _getText([
        '.job-details-jobs-unified-top-card__job-title h1',
        '.job-details-jobs-unified-top-card__job-title h2',
        'h1[class*="job-title"]', 'h2[class*="job-title"]',
        '.jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title h2',
      ], panel);

      if (!role) {
        var headings = panel.querySelectorAll('h1, h2');
        for (var i = 0; i < headings.length; i++) {
          var t = (headings[i].innerText || headings[i].textContent || '').trim();
          if (t && _isValidRole(t)) { role = t; break; }
        }
      }

      var companyLinks = panel.querySelectorAll('a[href*="/company/"]');
      for (var j = 0; j < companyLinks.length; j++) {
        var ct = (companyLinks[j].innerText || companyLinks[j].textContent || '').trim();
        if (ct && ct.length > 1 && ct.length < 120) { company = ct; break; }
      }

      var tvmSpans = panel.querySelectorAll('.tvm__text');
      for (var k = 0; k < tvmSpans.length; k++) {
        var lt = (tvmSpans[k].textContent || '').trim();
        if (lt.length > 2 && !/^\d+/.test(lt)) { location = lt; break; }
      }

      var desc = _getText(['#job-details', '.jobs-description__content',
        '.jobs-description-content__text', '.jobs-box__html-content'], panel);
      notes = desc ? desc.substring(0, 400) : '';
    }
  }

  // ── Indeed ──
  else if (url.includes('indeed.com')) {
    var indeedPanel =
      document.querySelector('[data-testid="jobsearch-ViewJobsPanel-expandedJobPanel"]') ||
      document.querySelector('.jobsearch-RightPane') ||
      document;

    role = _getText([
      '[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1.jobsearch-JobInfoHeader-title',
      'h2.jobTitle', 'h2[class*="jobTitle"]',
    ], indeedPanel);

    company = _getText([
      '[data-testid="inlineHeader-companyName"] a',
      '[data-testid="inlineHeader-companyName"]',
      '[data-company-name]',
    ], indeedPanel);

    location = _getText([
      '[data-testid="job-location"]',
      '[data-testid="inlineHeader-companyLocation"]',
    ], indeedPanel);

    notes = _getText(['#jobDescriptionText'], indeedPanel).substring(0, 400);
  }

  // ── JSON-LD fallback ──
  if (!role || !company) {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var s = 0; s < scripts.length; s++) {
      try {
        var raw = JSON.parse(scripts[s].textContent);
        var items = raw['@graph'] ? raw['@graph'] : Array.isArray(raw) ? raw : [raw];
        for (var x = 0; x < items.length; x++) {
          if (items[x]['@type'] === 'JobPosting') {
            if (!role) role = items[x].title || '';
            if (!company && items[x].hiringOrganization) company = items[x].hiringOrganization.name || '';
            if (!location && items[x].jobLocation) {
              var addr = (Array.isArray(items[x].jobLocation) ? items[x].jobLocation[0] : items[x].jobLocation);
              var a = addr && addr.address || {};
              location = [a.addressLocality, a.addressRegion, a.addressCountry].filter(Boolean).join(', ');
            }
            break;
          }
        }
      } catch (e) { /* skip */ }
    }
  }

  if (!_isValidRole(role)) role = '';

  return { role: role, company: company, location: location, notes: notes, jobUrl: url };
}
