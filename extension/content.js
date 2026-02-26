var PANEL_ID = 'prepify-panel';
var API_URL = 'http://localhost:5000/api/jobs';

var lastUrl = '';
var closedForUrl = '';
var scrapeTimer = null;

function isJobPage() {
  var url = location.href;

  if (location.hostname.includes('linkedin.com')) {
    return url.includes('/jobs/view/') ||
           (url.includes('/jobs/') && url.includes('currentJobId='));
  }

  if (location.hostname.includes('indeed.com')) {
    return url.includes('/viewjob') ||
           url.includes('/rc/clk') ||
           url.includes('vjk=');
  }

  return false;
}

function askForJobData() {
  return new Promise(function (resolve) {
    var requestId = Math.random().toString(36).substring(2);
    var done = false;

    function onMessage(e) {
      if (e.source !== window) return;
      if (!e.data || e.data.type !== 'PREPIFY_SCRAPE_RESULT') return;
      if (e.data.id !== requestId) return;

      done = true;
      window.removeEventListener('message', onMessage);
      resolve(e.data.data);
    }

    window.addEventListener('message', onMessage);
    window.postMessage({ type: 'PREPIFY_SCRAPE_REQUEST', id: requestId }, '*');

    setTimeout(function () {
      if (!done) {
        window.removeEventListener('message', onMessage);
        resolve(null);
      }
    }, 3000);
  });
}

async function scrapeWithRetry(attempt) {
  attempt = attempt || 1;
  var maxAttempts = 8;

  var data = await askForJobData();

  if (data && data.role && data.company) {
    showPanel(data);
    return;
  }

  if (attempt < maxAttempts) {
    var delay = attempt <= 3 ? 1000 : 1500;
    scrapeTimer = setTimeout(function () {
      scrapeWithRetry(attempt + 1);
    }, delay);
    return;
  }

  showPanel(data || { role: '', company: '', location: '', notes: '' });
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
  host.style.cssText = 'position:fixed; top:72px; right:16px; z-index:2147483647; width:310px;';

  var shadow = host.attachShadow({ mode: 'open' });

  var statusOptions = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected']
    .map(function (s) { return '<option value="' + s + '">' + s + '</option>'; })
    .join('');

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

  shadow.querySelector('#close-btn').addEventListener('click', function () {
    closedForUrl = location.href;
    host.remove();
  });

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

  if (!role) { showMessage(msgEl, 'Role is required.', 'error'); return; }
  if (!company) { showMessage(msgEl, 'Company is required.', 'error'); return; }

  btn.disabled = true;
  btn.textContent = 'Adding...';

  try {
    var res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: role, company: company, location: loc,
        status: status, notes: notes, jobUrl: jobUrl
      })
    });

    if (res.status === 409) {
      showMessage(msgEl, 'Already saved — this job is in your tracker.', 'warning');
      btn.disabled = false;
      btn.textContent = 'Add to Prepify';
      return;
    }
    if (!res.ok) throw new Error('Server error ' + res.status);

    showMessage(msgEl, 'Saved! Opening Prepify...', 'success');
    btn.textContent = 'Added';
    setTimeout(function () { window.open('http://localhost:3000/jobs', '_blank'); }, 900);
  } catch (err) {
    var isNetwork = err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
    showMessage(msgEl, isNetwork ? 'Cannot reach Prepify. Is the app running?' : err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Add to Prepify';
  }
}

function showMessage(el, text, type) {
  el.textContent = text;
  el.className = 'msg msg--' + type;
  el.hidden = false;
}

setInterval(function () {
  var url = location.href;
  if (url === lastUrl) return;

  lastUrl = url;

  if (scrapeTimer) { clearTimeout(scrapeTimer); scrapeTimer = null; }
  removePanel();

  if (url !== closedForUrl) closedForUrl = '';

  if (isJobPage()) {
    if (closedForUrl === url) return;
    scrapeTimer = setTimeout(function () { scrapeWithRetry(1); }, 1500);
  }
}, 500);

lastUrl = location.href;
if (isJobPage()) {
  scrapeTimer = setTimeout(function () { scrapeWithRetry(1); }, 1500);
}

// Listen for messages from the extension popup/action
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'togglePanel') {
    if (isJobPage()) {
      var existingPanel = document.getElementById(PANEL_ID);
      if (existingPanel) {
        // Panel is open, close it
        closedForUrl = location.href;
        existingPanel.remove();
      } else {
        // Panel is closed, open it (reset the closedForUrl flag)
        closedForUrl = '';
        scrapeWithRetry(1);
      }
    }
    sendResponse({success: true});
  }
});

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
