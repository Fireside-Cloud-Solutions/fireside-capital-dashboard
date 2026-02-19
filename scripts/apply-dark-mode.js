const fs = require('fs');
const path = require('path');

const APP = path.join(__dirname, '../app');

// ─── FC-104: FOUC prevention script (inline after viewport meta) ─────────────

const FOUC_SCRIPT = `\n  <!-- FC-104: FOUC prevention — set theme before CSS renders -->\n  <script>(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-bs-theme',t);document.documentElement.setAttribute('data-theme',t);}());</script>`;

const FOUC_SCRIPT_4 = `\n    <!-- FC-104: FOUC prevention — set theme before CSS renders -->\n    <script>(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-bs-theme',t);document.documentElement.setAttribute('data-theme',t);}());</script>`;

// 10 files with 2-space indent
const files2 = ['index.html','assets.html','bills.html','debts.html','friends.html',
                 'income.html','investments.html','operations.html','reports.html','transactions.html'];

// 2 files with 4-space indent
const files4 = ['budget.html','settings.html'];

const VIEWPORT_2 = '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />';
const VIEWPORT_4 = '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />';

// ─── FC-101: Theme toggle sidebar insertion ───────────────────────────────────

const SIDEBAR_OLD = `        <a href="settings.html"><i class="bi bi-gear me-2"></i> Settings</a>
      </div>
    </div>`;

const SIDEBAR_NEW = `        <a href="settings.html"><i class="bi bi-gear me-2"></i> Settings</a>
      </div>
      <div class="theme-toggle">
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="themeSwitch" />
          <label class="form-check-label" for="themeSwitch">Dark Mode</label>
        </div>
      </div>
    </div>`;

let changed = [];

// Process 2-space files (FC-104 + FC-101)
for (const f of files2) {
  const fp = path.join(APP, f);
  let content = fs.readFileSync(fp, 'utf8');
  let modified = false;

  // FC-104
  if (!content.includes('FC-104')) {
    content = content.replace(VIEWPORT_2, VIEWPORT_2 + FOUC_SCRIPT);
    console.log(`FC-104 applied: ${f}`);
    modified = true;
  } else {
    console.log(`FC-104 already present, skipping: ${f}`);
  }

  // FC-101
  if (!content.includes('themeSwitch')) {
    content = content.replace(SIDEBAR_OLD, SIDEBAR_NEW);
    console.log(`FC-101 applied: ${f}`);
    modified = true;
  } else {
    console.log(`FC-101 already present, skipping: ${f}`);
  }

  if (modified) {
    fs.writeFileSync(fp, content, 'utf8');
    changed.push(f);
  }
}

// Process 4-space files (FC-104 only — budget.html and settings.html already have themeSwitch)
for (const f of files4) {
  const fp = path.join(APP, f);
  let content = fs.readFileSync(fp, 'utf8');
  let modified = false;

  if (!content.includes('FC-104')) {
    content = content.replace(VIEWPORT_4, VIEWPORT_4 + FOUC_SCRIPT_4);
    console.log(`FC-104 applied: ${f}`);
    modified = true;
  } else {
    console.log(`FC-104 already present, skipping: ${f}`);
  }

  if (modified) {
    fs.writeFileSync(fp, content, 'utf8');
    changed.push(f);
  }
}

console.log('\nChanged files:', changed);
console.log('All HTML changes done.');
