const fs = require('fs');

const prFile = 'src/components/purchase-requests/PurchaseRequests.jsx';
let lines = fs.readFileSync(prFile, 'utf8').split('\n');

const filtersStart = lines.findIndex(l => l.includes('<Card className="p-4">'));
const filtersEnd = lines.findIndex((l, i) => i > filtersStart && l.includes('</Card>'));

console.log('Filters:', filtersStart, filtersEnd);

const filtersCode = lines.slice(filtersStart, filtersEnd + 1).join('\n');
fs.writeFileSync('src/components/purchase-requests/PRFilters.jsx', `import React from 'react';
import { Search, X } from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

export const PRFilters = ({
  searchQuery, setSearchQuery, commitSearchToUrl,
  statusFilter, handleStatusFilterChange,
  pageSize, handlePageSizeChange, clearFilters,
  userRole, urlView, handleViewAllChange, STATUS_FILTER_OPTIONS
}) => {
  return (
${filtersCode.replace(/user\?\.role/g, 'userRole')}
  );
};
`);

const filtersReplacement = `      <PRFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        commitSearchToUrl={commitSearchToUrl}
        statusFilter={statusFilter}
        handleStatusFilterChange={handleStatusFilterChange}
        pageSize={pageSize}
        handlePageSizeChange={handlePageSizeChange}
        clearFilters={clearFilters}
        userRole={user?.role}
        urlView={urlView}
        handleViewAllChange={handleViewAllChange}
        STATUS_FILTER_OPTIONS={STATUS_FILTER_OPTIONS}
      />`;

lines.splice(filtersStart, filtersEnd - filtersStart + 1, filtersReplacement);

fs.writeFileSync(prFile, lines.join('\n'));
