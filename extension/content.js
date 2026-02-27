var PANEL_ID = 'prepify-panel';
var BUTTON_ID = 'prepify-save-btn';
var API_URL = 'http://localhost:5000/api/jobs';
var lastUrl = '';

function isJobPage() {
  var url = location.href;
  if (location.hostname.includes('linkedin.com')) {
    return url.includes('/jobs/') && url.includes('currentJobId=');
  }
  if (location.hostname.includes('indeed.com')) {
    return url.includes('/viewjob') || url.includes('/rc/clk') || url.includes('vjk=');
  }
  return false;
}

function scrapeLinkedIn() {
  var role = '', company = '', loc = '', notes = '';

  var detail = document.querySelector('.scaffold-layout__detail');
  var jobContainer = detail ? detail.querySelector('.jobs-search__job-details--container') : null;
  if (!jobContainer) jobContainer = document.querySelector('.jobs-search__job-details--container');
  var scope = jobContainer || detail || document;

  var titleDiv = scope.querySelector('.job-details-jobs-unified-top-card__job-title');
  if (!titleDiv) titleDiv = document.querySelector('[class*="unified-top-card__job-title"]');
  if (!titleDiv) titleDiv = document.querySelector('[class*="top-card__job-title"]');

  if (titleDiv) {
    var h1 = titleDiv.querySelector('h1');
    if (h1) {
      var anchor = h1.querySelector('a');
      role = anchor ? (anchor.innerText || '').trim() : (h1.innerText || '').trim();
    }
  }

  if (!role) {
    var allH1 = document.querySelectorAll('h1');
    for (var i = 0; i < allH1.length; i++) {
      var t = (allH1[i].innerText || '').trim();
      if (t && t.length > 3 && t.length < 200 && !/^\d/.test(t) &&
          !/^(home|feed|jobs|search|login|messaging|notifications|linkedin|my jobs|top job|about the job|people|how your|use ai)/i.test(t)) {
        role = t; break;
      }
    }
  }

  var compEl = scope.querySelector('.job-details-jobs-unified-top-card__company-name a') ||
               scope.querySelector('.job-details-jobs-unified-top-card__company-name') ||
               document.querySelector('[class*="unified-top-card__company-name"] a') ||
               document.querySelector('[class*="unified-top-card__company-name"]');
  if (compEl) company = (compEl.innerText || '').trim();
  if (!company) {
    var compLinks = document.querySelectorAll('a[href*="/company/"]');
    for (var j = 0; j < compLinks.length; j++) {
      var ct = (compLinks[j].innerText || '').trim();
      if (ct && ct.length > 1 && ct.length < 120) { company = ct; break; }
    }
  }

  var primaryDesc = scope.querySelector('[class*="primary-description-container"]') ||
                    scope.querySelector('[class*="tertiary-description-container"]') ||
                    document.querySelector('[class*="primary-description-container"]') ||
                    document.querySelector('[class*="tertiary-description-container"]');
  if (primaryDesc) {
    var tvmEls = primaryDesc.querySelectorAll('.tvm__text');
    for (var k = 0; k < tvmEls.length; k++) {
      var lt = (tvmEls[k].textContent || '').trim();
      if (lt.length > 2 && !/^\d+/.test(lt)) { loc = lt; break; }
    }
  }

  var descEl = document.querySelector('#job-details') || document.querySelector('.jobs-description__content');
  if (descEl) notes = (descEl.innerText || '').trim().slice(0, 10000);

  return { role: role, company: company, location: loc, notes: notes };
}

function scrapeIndeed() {
  var panel = document.querySelector('[data-testid="jobsearch-ViewJobsPanel-expandedJobPanel"]') ||
              document.querySelector('.jobsearch-RightPane') || document;
  var role = '', company = '', loc = '', notes = '';

  var titleEl = panel.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ||
                panel.querySelector('h1.jobsearch-JobInfoHeader-title') ||
                panel.querySelector('h2.jobTitle');
  if (titleEl) role = (titleEl.innerText || '').trim();

  var companyEl = panel.querySelector('[data-testid="inlineHeader-companyName"]') ||
                  panel.querySelector('[data-company-name]');
  if (companyEl) company = (companyEl.innerText || '').trim();

  var locEl = panel.querySelector('[data-testid="job-location"]') ||
              panel.querySelector('[data-testid="inlineHeader-companyLocation"]');
  if (locEl) loc = (locEl.innerText || '').trim();

  var descEl = panel.querySelector('#jobDescriptionText');
  if (descEl) notes = (descEl.innerText || '').trim().slice(0, 10000);

  return { role: role, company: company, location: loc, notes: notes };
}

function scrapeJobData() {
  if (location.hostname.includes('linkedin.com')) return scrapeLinkedIn();
  if (location.hostname.includes('indeed.com')) return scrapeIndeed();
  return { role: '', company: '', location: '', notes: '' };
}

function scrapeWithRetry(callback) {
  var maxAttempts = 6;
  var attempt = 0;
  function tryNow() {
    attempt++;
    var data = scrapeJobData();
    if ((data.role && data.company) || attempt >= maxAttempts) { callback(data); return; }
    setTimeout(tryNow, 500 * attempt);
  }
  tryNow();
}

function fillPanel(data) {
  var host = document.getElementById(PANEL_ID);
  if (!host || !host.shadowRoot) return;
  var shadow = host.shadowRoot;
  if (data.role) shadow.querySelector('#role').value = data.role;
  if (data.company) shadow.querySelector('#company').value = data.company;
  if (data.location) shadow.querySelector('#location').value = data.location;
  if (data.notes) shadow.querySelector('#notes').value = data.notes;
}

function injectButton() {
  if (document.getElementById(BUTTON_ID)) return;

  var saveBtn = document.querySelector('button.jobs-save-button');
  if (!saveBtn) {
    var scope = document.querySelector('.jobs-search__job-details--container') ||
                document.querySelector('.scaffold-layout__detail') || document;
    var allBtns = scope.querySelectorAll('button');
    for (var i = 0; i < allBtns.length; i++) {
      var txt = (allBtns[i].innerText || '').trim();
      if (txt === 'Save' || txt === 'Saved') { saveBtn = allBtns[i]; break; }
    }
  }

  var btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg><span>Prepify</span>';
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:7px 16px;' +
    'background:#3948CF;color:#fff;border:none;border-radius:24px;' +
    'font-size:14px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
    'cursor:pointer;transition:background 0.15s;vertical-align:middle;line-height:1;margin-left:8px;';
  btn.addEventListener('mouseenter', function () { btn.style.background = '#2d3ab0'; });
  btn.addEventListener('mouseleave', function () { btn.style.background = '#3948CF'; });
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    showPanel({ role: '', company: '', location: '', notes: '' });
    scrapeWithRetry(fillPanel);
  });

  if (saveBtn && saveBtn.parentElement) {
    saveBtn.parentElement.insertBefore(btn, saveBtn.nextSibling);
  } else {
    btn.style.cssText += 'position:fixed;top:80px;right:24px;z-index:2147483646;box-shadow:0 4px 12px rgba(57,72,207,0.35);';
    document.body.appendChild(btn);
  }
}

function removeButton() {
  var btn = document.getElementById(BUTTON_ID);
  if (btn) btn.remove();
}

function removePanel() {
  var el = document.getElementById(PANEL_ID);
  if (el) el.remove();
}

function showPanel(data) {
  removePanel();
  var platform = location.hostname.includes('linkedin.com') ? 'LinkedIn' :
                 location.hostname.includes('indeed.com') ? 'Indeed' : 'Job';

  var jobUrl = location.href;
  if (jobUrl.includes('/jobs/collections/') && jobUrl.includes('currentJobId=')) {
    try {
      var jobId = new URL(jobUrl).searchParams.get('currentJobId');
      if (jobId) jobUrl = 'https://www.linkedin.com/jobs/view/' + jobId;
    } catch (e) {}
  }

  var host = document.createElement('div');
  host.id = PANEL_ID;
  host.style.cssText = 'position:fixed;top:72px;right:16px;z-index:2147483647;width:310px;';
  var shadow = host.attachShadow({ mode: 'open' });

  var statusOptions = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']
    .map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');

  shadow.innerHTML =
    '<style>' + panelStyles() + '</style>' +
    '<div class="panel">' +
      '<div class="header">' +
        '<div class="logo"><div class="logo-mark">P</div><span class="logo-text">Prepify</span></div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span class="badge">' + platform + ' detected</span>' +
          '<button class="close-btn" id="close-btn" title="Close">&#x2715;</button>' +
        '</div>' +
      '</div>' +
      '<form id="form" class="form" novalidate>' +
        '<div class="field"><label>Role <span class="req">*</span></label>' +
          '<input id="role" type="text" placeholder="e.g. Software Engineer" autocomplete="off"></div>' +
        '<div class="field"><label>Company <span class="req">*</span></label>' +
          '<input id="company" type="text" placeholder="e.g. Google" autocomplete="off"></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Location</label>' +
            '<input id="location" type="text" placeholder="City, Country" autocomplete="off"></div>' +
          '<div class="field field--status"><label>Status</label>' +
            '<select id="status">' + statusOptions + '</select></div>' +
        '</div>' +
        '<div class="field"><label>Notes</label>' +
          '<textarea id="notes" rows="2" placeholder="Optional notes..."></textarea></div>' +
        '<div id="msg" class="msg" hidden></div>' +
        '<button type="submit" id="submit-btn" class="submit-btn">Add to Prepify</button>' +
      '</form>' +
    '</div>';

  document.body.appendChild(host);
  if (data.role) shadow.querySelector('#role').value = data.role;
  if (data.company) shadow.querySelector('#company').value = data.company;
  if (data.location) shadow.querySelector('#location').value = data.location;
  if (data.notes) shadow.querySelector('#notes').value = data.notes;

  shadow.querySelector('#close-btn').addEventListener('click', function () { host.remove(); });
  shadow.querySelector('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    submitJob(shadow, jobUrl);
  });
}

async function submitJob(shadow, jobUrl) {
  var role = shadow.querySelector('#role').value.trim();
  var company = shadow.querySelector('#company').value.trim();
  var loc = shadow.querySelector('#location').value.trim();
  var status = shadow.querySelector('#status').value;
  var notes = shadow.querySelector('#notes').value.trim();
  var btn = shadow.querySelector('#submit-btn');
  var msgEl = shadow.querySelector('#msg');
  msgEl.hidden = true;

  if (!role) { showMsg(msgEl, 'Role is required.', 'error'); return; }
  if (!company) { showMsg(msgEl, 'Company is required.', 'error'); return; }

  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    var res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: role, company: company, location: loc, status: status, notes: notes, jobUrl: jobUrl })
    });
    if (res.status === 409) {
      showMsg(msgEl, 'Already saved \u2014 this job is in your tracker.', 'warning');
      btn.disabled = false;
      btn.textContent = 'Add to Prepify';
      return;
    }
    if (!res.ok) throw new Error('Server error ' + res.status);
    showMsg(msgEl, 'Saved! Opening Prepify...', 'success');
    btn.textContent = 'Added';
    setTimeout(function () { window.open('http://localhost:3000/jobs', '_blank'); }, 900);
  } catch (err) {
    var isNetwork = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
    showMsg(msgEl, isNetwork ? 'Cannot reach Prepify. Is the app running?' : err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Add to Prepify';
  }
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className = 'msg msg--' + type;
  el.hidden = false;
}

setInterval(function () {
  var url = location.href;
  if (url !== lastUrl) { lastUrl = url; removePanel(); removeButton(); }
  if (isJobPage() && !document.getElementById(BUTTON_ID)) injectButton();
  if (!isJobPage()) removeButton();
}, 500);

lastUrl = location.href;

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
    if (request.action === 'togglePanel') {
      var existing = document.getElementById(PANEL_ID);
      if (existing) {
        existing.remove();
      } else if (isJobPage()) {
        showPanel({ role: '', company: '', location: '', notes: '' });
        scrapeWithRetry(fillPanel);
      }
      sendResponse({ success: true });
    }
  });
}

function panelStyles() {
  return [
    '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
    ':host { all: initial; }',
    '.panel { width:310px; background:#fff; border-radius:12px; box-shadow:0 12px 40px rgba(0,0,0,0.22),0 2px 8px rgba(0,0,0,0.1); overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; font-size:13px; color:#0f172a; animation:fadeIn 0.2s ease; }',
    '@keyframes fadeIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }',
    '.header { display:flex; align-items:center; justify-content:space-between; padding:10px 13px; background:#3948CF; }',
    '.logo { display:flex; align-items:center; gap:7px; }',
    '.logo-mark { width:22px; height:22px; background:rgba(255,255,255,0.2); border-radius:5px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; color:#fff; }',
    '.logo-text { font-weight:600; font-size:13px; color:#fff; }',
    '.badge { font-size:10.5px; font-weight:500; padding:2px 7px; border-radius:999px; background:#dcfce7; color:#15803d; }',
    '.close-btn { background:none; border:none; color:rgba(255,255,255,0.65); cursor:pointer; font-size:15px; line-height:1; padding:3px 5px; border-radius:4px; }',
    '.close-btn:hover { color:#fff; background:rgba(255,255,255,0.15); }',
    '.form { display:flex; flex-direction:column; gap:8px; padding:12px 13px 13px; }',
    '.field { display:flex; flex-direction:column; gap:3px; flex:1; }',
    '.field-row { display:flex; gap:8px; }',
    '.field--status { flex:0 0 98px; }',
    'label { font-size:11px; font-weight:500; color:#64748b; }',
    '.req { color:#ef4444; }',
    'input,select,textarea { width:100%; border:1px solid #e2e8f0; border-radius:6px; padding:5px 8px; font-size:12.5px; font-family:inherit; color:#0f172a; background:#fff; outline:none; line-height:1.4; }',
    'input::placeholder,textarea::placeholder { color:#94a3b8; }',
    'input:focus,select:focus,textarea:focus { border-color:#3948CF; box-shadow:0 0 0 3px rgba(57,72,207,0.1); }',
    'select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 7px center; padding-right:24px; cursor:pointer; }',
    'textarea { resize:vertical; min-height:50px; }',
    '.msg { font-size:11.5px; font-weight:500; padding:7px 9px; border-radius:6px; line-height:1.4; }',
    '.msg--success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }',
    '.msg--error { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }',
    '.msg--warning { background:#fffbeb; color:#b45309; border:1px solid #fde68a; }',
    '.submit-btn { width:100%; padding:8px 14px; background:#3948CF; color:#fff; border:none; border-radius:7px; font-size:12.5px; font-weight:600; font-family:inherit; cursor:pointer; margin-top:2px; }',
    '.submit-btn:hover:not(:disabled) { background:#2d3ab0; }',
    '.submit-btn:disabled { background:#94a3b8; cursor:default; }',
  ].join('\n');
}
