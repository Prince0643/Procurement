const fs = require('fs');

let lines = fs.readFileSync('old_pr.jsx', 'utf16le');
if (!lines.includes('import React')) {
    lines = fs.readFileSync('old_pr.jsx', 'utf8');
}
lines = lines.split(/\r?\n/);

const tableStart = lines.findIndex(l => l.includes('<Card>'));
const tableEnd = lines.findIndex((l, i) => i > tableStart && l.includes('</Card>'));

const tableCode = lines.slice(tableStart, tableEnd + 1).join('\n');

const newContent = `import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Eye, CheckCircle, XCircle, Edit, Trash2, Shield, X, AlertTriangle, AlertCircle, ChevronUp, ChevronDown, Settings, FileSpreadsheet } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency, formatDate, formatPaymentTerms } from '../../utils/formatters';

export const PRTable = ({
  purchaseRequests, user, expandedId, setExpandedId,
  expandedPRDetails, setLoadingExpanded, loadingExpanded,
  openProcurementApproval, openProcurementReject,
  openEditModal, handleDelete, handleCancelPR,
  openReviewModal, openProcessModal, confirmSuperAdminAction
}) => {
  const urlTab = new URLSearchParams(window.location.search).get('tab') || 'my-prs';

  // Wrapper function for deletion to match props
  const handleDeleteRequest = (pr) => handleDelete(pr);
  const handleExport = async (id, prNumber) => {
    // Implement export logic here if needed or pass it as prop
  };
  const openPreview = () => {};
  const handleMarkAsReceived = () => {};
  const openSuperAdminModal = () => {};

  return (
${tableCode.replace(/user\?\.role/g, 'userRole').replace(/userRole/g, 'user?.role')}
  );
};
`;

fs.writeFileSync('frontend/src/components/purchase-requests/PRTable.jsx', newContent);
console.log('Saved to PRTable.jsx');
