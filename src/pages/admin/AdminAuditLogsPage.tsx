import React, { useState, useEffect } from 'react';
import { FileText, Shield, Search } from 'lucide-react';
import { adminRepository } from '../../repositories/adminRepository';
import { AuditLog } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const items = await adminRepository.listAuditLogs(100);
        setLogs(items);
      } catch (err) {
        console.warn('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      l.actorEmail.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      l.targetEntity.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#FF3D88]" />
          <span className="text-[11px] font-decorative uppercase tracking-wider text-[#FF3D88] font-bold">
            Super Admin Exclusive
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0F1B3D] tracking-tight">
          System Audit Logs
        </h2>
        <p className="mt-1 text-sm text-slate-500 font-sans">
          Immutable event trails for project approvals, suspensions, role reassignments, and system configurations.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter audit events by action, email, or entity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#FF3D88]/30"
        />
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No Audit Records Found"
          description="Actions will automatically generate tamper-evident logs."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(l.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0F1B3D]">
                      {l.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.actorEmail}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {l.targetEntity} / {l.targetId}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {JSON.stringify(l.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

