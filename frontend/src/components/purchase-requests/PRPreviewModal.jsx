import React, { useState, useEffect } from 'react';
import { CheckCircle, X, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { purchaseRequestService } from '../../services/purchaseRequests';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  }).format(Number(amount) || 0);
};

const formatUnitCost = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
    useGrouping: false
  }).format(value);
};

const formatLineAmount = (amount) => {
  const value = Number(amount) || 0;
  return value === 0 ? '-' : formatAmount(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 disabled:bg-yellow-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Field = ({ label, children, className = '' }) => (
  <div className={`flex min-h-[16px] border-b border-black text-[10px] leading-tight ${className}`}>
    <div className={`w-[106px] shrink-0 border-r border-black px-1 font-bold ${label.includes('SUPPLIER') ? 'text-red-600' : ''}`}>
      {label}
    </div>
    <div className="min-w-0 flex-1 px-1 font-semibold">{children || '-'}</div>
  </div>
);

const CompanyMark = () => (
  <div className="flex h-full items-center justify-center border-r border-black">
    <div className="flex h-12 w-12 rotate-45 items-center justify-center border-2 border-yellow-400 bg-black">
      <div className="-rotate-45 text-center text-[8px] font-bold leading-none text-yellow-300">
        JAJR
        <div className="text-[5px] font-normal text-white">CONSTRUCTION</div>
      </div>
    </div>
  </div>
);

const getRequesterName = (pr) => {
  const name = `${pr.requester_first_name || ''} ${pr.requester_last_name || ''}`.trim();
  return name || pr.requested_by_name || pr.prepared_by || '-';
};

const getApproverName = (pr) => {
  const name = `${pr.approver_first_name || ''} ${pr.approver_last_name || ''}`.trim();
  return name || 'MARC JUSTIN E. ARZADON';
};

const PRPreviewModal = ({
  pr,
  loading,
  onClose,
  onApprove,
  onReject,
  processingId,
  readOnly
}) => {
  if (!pr) return null;

  const { user } = useAuth();
  const [reviewers, setReviewers] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchReviewers = async () => {
      if (!pr.requester_role) return;

      let roleToFetch = null;
      if (pr.requester_role === 'engineer') {
        roleToFetch = 'engineer';
      } else if (pr.requester_role === 'admin') {
        roleToFetch = 'admin';
      }

      if (roleToFetch) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/employees/by-role/${roleToFetch}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.employees) {
            setReviewers(data.employees);
          }
        } catch (error) {
          console.error('Error fetching reviewers:', error);
        }
      }
    };

    fetchReviewers();
  }, [pr.requester_role]);

  // Determine if current user is assigned a pending review for this PR
  const userPendingReview = (() => {
    if (!user || !pr?.reviews) return false;
    try {
      return pr.reviews.some(r => r.reviewer_id === user.id && r.review_status === 'pending');
    } catch (e) {
      return false;
    }
  })();

  const handleLocalApprove = async () => {
    if (!pr?.id) return;
    try {
      setSubmittingReview(true);
      await purchaseRequestService.review(pr.id, 'approved', null);
      alert('PR approved');
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve PR');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLocalReject = async () => {
    if (!pr?.id) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      setSubmittingReview(true);
      await purchaseRequestService.review(pr.id, 'rejected', reason);
      alert('PR rejected');
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject PR');
    } finally {
      setSubmittingReview(false);
    }
  };

  const items = Array.isArray(pr.items) ? pr.items : [];
  const total = pr.total_amount || pr.amount || items.reduce((sum, item) => {
    const unitCost = Number(item.unit_price || item.unit_cost || 0);
    return sum + (Number(item.quantity || 0) * unitCost);
  }, 0);
  const blankRows = Array.from({ length: Math.max(13 - items.length, 4) });
  const actionableStatuses = new Set([
    'Pending',
    'For Approval',
    'For Procurement Review',
    'For Super Admin Final Approval',
    'On Hold'
  ]);
  const canAct = !readOnly && actionableStatuses.has(pr.status);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleApprove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove?.(pr.id, pr);
  };

  const handleReject = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onReject?.(pr);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">Purchase Request Preview</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-auto bg-gray-100 p-3">
          <div className="mx-auto w-[480px] min-w-[480px] bg-white text-black shadow-sm">
            <div className="border-2 border-blue-700 bg-white font-serif">
              <div className="grid h-[68px] grid-cols-[108px_1fr_165px] border-b border-black overflow-hidden">
                <CompanyMark />
                <div className="overflow-hidden px-1 text-center leading-[1.05]">
                  <div className="whitespace-nowrap text-[17px] font-bold">JAJr CONSTRUCTION</div>
                  <div className="whitespace-nowrap text-[7.5px]">P.P. Zamora St. Barangay II, San Fernando City, La Union</div>
                  <div className="whitespace-nowrap text-[8px]">Telephone #(072) 607-1150</div>
                  <div className="whitespace-nowrap text-[8px]">E-mail Address: jajrconstruction@yahoo.com</div>
                </div>
                <div className="grid grid-cols-[70px_1fr] border-l border-black text-[9px]">
                  <div className="flex items-center justify-center border-b border-r border-black text-center font-bold leading-tight">
                    PR#: Year-Month-Sequence No.
                  </div>
                  <div className="flex items-center justify-center break-all border-b border-black px-1 text-[12px] font-bold">
                    {pr.pr_number || '-'}
                  </div>
                  <div className="border-r border-black" />
                  <div />
                </div>
              </div>

              <div className="border-b border-black py-1.5 text-center text-[19px] font-bold leading-none tracking-wide">
                PURCHASE REQUEST
              </div>

              <div className="grid grid-cols-[1fr_165px] border-b border-black">
                <div>
                  <Field label="SUPPLIER :">{pr.supplier_name || pr.payee_name || '-'}</Field>
                  <Field label="Address :">{pr.supplier_address || pr.payee_address || '-'}</Field>
                  <Field label="Project :">{pr.project || '-'}</Field>
                </div>
                <div className="border-l border-black">
                  <Field label="Date Prepared">{formatDate(pr.created_at)}</Field>
                  <Field label="Date Needed">{formatDate(pr.date_needed)}</Field>
                  <Field label="Order No.">{pr.order_number || '-'}</Field>
                </div>
              </div>

              <Field label="Project Address :" className="border-b-2 border-green-700">
                {pr.project_address || '-'}
              </Field>

              <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-28 z-0 text-center text-[70px] text-gray-400/70">
                  Page 1
                </div>
                <table className="relative z-10 w-full table-fixed border-collapse text-[12px] leading-tight">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="w-[10%] border-r border-black py-1">QTY.</th>
                      <th className="w-[11%] border-r border-black py-1">UNIT</th>
                      <th className="border-r border-black py-1">DESCRIPTION</th>
                      <th className="w-[16%] border-r border-black py-1">UNIT COST</th>
                      <th className="w-[18%] py-1">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr className="border-b border-black">
                        <td colSpan="5" className="h-28 text-center text-sm text-gray-500">Loading...</td>
                      </tr>
                    ) : (
                      items.map((item, index) => {
                        const unitCost = Number(item.unit_price || item.unit_cost || 0);
                        const amount = item.total_price || (Number(item.quantity || 0) * unitCost) || item.amount || 0;
                        return (
                          <tr key={item.id || index} className="h-[15px] border-b border-black">
                            <td className="border-r border-black px-1 text-center">{item.quantity || '-'}</td>
                            <td className="border-r border-black px-1 text-center">{item.unit || '-'}</td>
                            <td className="border-r border-black px-1">{item.item_name || item.description || item.item_code || '-'}</td>
                            <td className="border-r border-black px-1 text-right">{formatUnitCost(unitCost)}</td>
                            <td className="px-1 text-right">{formatLineAmount(amount)}</td>
                          </tr>
                        );
                      })
                    )}
                    <tr className="h-[15px] border-b border-black text-center text-[11px] text-red-600">
                      <td className="border-r border-black">&nbsp;</td>
                      <td className="border-r border-black">&nbsp;</td>
                      <td className="border-r border-black font-bold">*** NOTHING FOLLOWS ***</td>
                      <td className="border-r border-black">&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    {blankRows.map((_, index) => (
                      <tr key={`blank-${index}`} className="h-[15px] border-b border-black">
                        <td className="border-r border-black">&nbsp;</td>
                        <td className="border-r border-black">&nbsp;</td>
                        <td className="border-r border-black">&nbsp;</td>
                        <td className="border-r border-black">&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="h-[28px] border-b border-black text-[12px] font-bold">
                      <td colSpan="3" />
                      <td className="border-r border-black text-right">TOTAL&nbsp;</td>
                      <td className="px-1 text-center">{formatAmount(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="grid grid-cols-3 text-[11px]">
                <div className="border-r border-black">
                  <div className="border-b border-black px-1">Prepared by:</div>
                  <div className="flex h-8 items-end justify-center px-2 text-center font-semibold">
                    {getRequesterName(pr)}
                  </div>
                  <div className="border-t border-black text-center italic">Name and Signature</div>
                </div>
                <div className="border-r border-black">
                  <div className="border-b border-black px-1">Reviewed by:</div>
                  <div className="flex min-h-8 flex-col justify-center px-2 py-1 text-center font-semibold text-[10px] leading-tight">
                    {reviewers.length > 0
                      ? reviewers.map(r => `${r.first_name} ${r.last_name}`).join(', ')
                      : (pr.reviewed_by_name || 'JUNELL B. TADINA')
                    }
                  </div>
                  <div className="border-t border-black text-center italic text-[10px]">
                    {reviewers.length > 0
                      ? (pr.requester_role === 'engineer' ? 'Engineers' : 'Admins')
                      : 'Procurement Officer'
                    }
                  </div>
                </div>
                <div>
                  <div className="border-b border-black px-1">Received by:</div>
                  <div className="flex h-8 items-end justify-center px-2 text-center font-semibold">
                    {getApproverName(pr)}
                  </div>
                  <div className="border-t border-black text-center italic">General Manager</div>
                </div>
              </div>

              <div
                className="h-[122px] border-t border-black"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '53px 25px'
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50 p-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" className="w-full sm:w-auto" onClick={handleClose}>
            Close
          </Button>

          {/* Render reject button if parent provided handler and action allowed, or if current user is a pending reviewer */}
          {( (onReject && canAct) || userPendingReview ) && (
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={onReject && canAct ? handleReject : handleLocalReject}
              disabled={processingId === pr.id || submittingReview}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          )}

          {/* Render approve button similarly */}
          {( (onApprove && canAct) || userPendingReview ) && (
            <Button
              variant="success"
              className="w-full sm:w-auto"
              onClick={onApprove && canAct ? handleApprove : handleLocalApprove}
              disabled={processingId === pr.id || submittingReview}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PRPreviewModal;
