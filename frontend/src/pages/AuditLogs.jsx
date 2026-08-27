import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from "../contexts/AuthContext";
import { format } from 'date-fns';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/audit-logs');
        setLogs(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'super_admin' || user?.role === 'Super Admin') {
      fetchLogs();
    } else {
      setLoading(false);
      setError('Access denied. Super Admin only.');
    }
  }, [user]);

  if (loading) return <div className="p-4 text-gray-500">Loading audit logs...</div>;
  if (error) return <div className="p-4 text-red-500 font-medium">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">System Audit Logs</h1>
          <p className="mt-2 text-sm text-gray-700">
            A chronological timeline of all activities across the system. This view is restricted to Super Admins.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date & Time</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Entity</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {log.first_name ? `${log.first_name} ${log.last_name}` : 'System'}
                        {log.employee_no && <span className="text-gray-400 text-xs block">{log.employee_no}</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.action.includes('Delete') ? 'bg-red-100 text-red-800' :
                          log.action.includes('Logged') ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 truncate max-w-xs" title={log.details}>
                        {log.details ? log.details : '-'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500 text-sm">
                        No audit logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
