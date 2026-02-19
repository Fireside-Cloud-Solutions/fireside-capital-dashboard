const fs = require('fs');
const path = require('path');
const APP = path.join(__dirname, '../app');

const SIDEBAR_OLD = '        <a href="settings.html"><i class="bi bi-gear me-2"></i> Settings</a>\r\n      </div>\r\n    </div>';

const SIDEBAR_NEW = '        <a href="settings.html"><i class="bi bi-gear me-2"></i> Settings</a>\r\n      </div>\r\n      <div class="theme-toggle">\r\n        <div class="form-check form-switch">\r\n          <input class="form-check-input" type="checkbox" id="themeSwitch" />\r\n          <label class="form-check-label" for="themeSwitch">Dark Mode</label>\r\n        </div>\r\n      </div>\r\n    </div>';

const files = [
  'index.html','assets.html','bills.html','debts.html','friends.html',
  'income.html','investments.html','operations.html','reports.html','transactions.html'
];

for (const f of files) {
  const fp = path.join(APP, f);
  let content = fs.readFileSync(fp, 'utf8');
  if (!content.includes('themeSwitch')) {
    const newContent = content.replace(SIDEBAR_OLD, SIDEBAR_NEW);
    if (newContent === content) {
      console.log('NO MATCH (check line endings): ' + f);
      // Debug: show what we found around "Settings"
      const idx = content.indexOf('Settings</a>');
      if (idx >= 0) {
        console.log('  Found at idx', idx, ':', JSON.stringify(content.substring(idx, idx + 50)));
      }
    } else {
      fs.writeFileSync(fp, newContent, 'utf8');
      console.log('FC-101 applied: ' + f);
    }
  } else {
    console.log('Already has themeSwitch: ' + f);
  }
}

console.log('Done.');
