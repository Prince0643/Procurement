const fs = require('fs');
const lines = fs.readFileSync('src/components/purchase-requests/PurchaseRequests.jsx', 'utf8').split('\n');

const search = (str) => {
  lines.forEach((l, i) => {
    if (l.includes(str)) console.log(`Found "${str}" at line ${i + 1}`);
  });
};

search('return (');
search('<table');
search('placeholder="Search PR..."');
search('STATUS_FILTER_OPTIONS');
