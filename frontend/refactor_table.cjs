const fs = require('fs');

const prFile = 'src/components/purchase-requests/PurchaseRequests.jsx';
let lines = fs.readFileSync(prFile, 'utf8').split('\n');

const tableStart = lines.findIndex(l => l.includes('<Card>'));
const tableEnd = lines.findIndex((l, i) => i > tableStart && l.includes('</Card>'));

console.log('Table:', tableStart, tableEnd);

const tableCode = lines.slice(tableStart, tableEnd + 1).join('\n');

fs.writeFileSync('src/components/purchase-requests/PRTable.jsx', `import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Eye, CheckCircle, XCircle, Edit, Trash2, Shield, X, AlertTriangle, AlertCircle } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const PRTable = ({
  purchaseRequests, user, expandedId, setExpandedId,
  expandedPRDetails, setLoadingExpanded, loadingExpanded,
  openProcurementApproval, openProcurementReject,
  openEditModal, handleDelete, handleCancelPR,
  openReviewModal, openProcessModal, confirmSuperAdminAction
}) => {
  return (
${tableCode.replace(/user\?\.role/g, 'userRole').replace(/userRole/g, 'user?.role')}
  );
};
`);

const tableReplacement = `      <PRTable
        purchaseRequests={purchaseRequests}
        user={user}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        expandedPRDetails={expandedPRDetails}
        setLoadingExpanded={setLoadingExpanded}
        loadingExpanded={loadingExpanded}
        openProcurementApproval={openProcurementApproval}
        openProcurementReject={openProcurementReject}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        handleCancelPR={handleCancelPR}
        openReviewModal={openReviewModal}
        openProcessModal={openProcessModal}
        confirmSuperAdminAction={confirmSuperAdminAction}
      />`;

lines.splice(tableStart, tableEnd - tableStart + 1, tableReplacement);

fs.writeFileSync(prFile, lines.join('\n'));
