
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface WeeklyReport {
  id: number;
  title: string;
  date: string;
  weekNumber: number;
  term: string;
  summary: string;
  status: 'Published' | 'Draft';
}

const mockReports: WeeklyReport[] = [
  { id: 1, title: 'Week 1 Report - Term 1 2024', date: '2024-02-09', weekNumber: 1, term: 'Term 1', summary: 'School opened successfully. Orientation for S.1 students completed.', status: 'Published' },
  { id: 2, title: 'Week 2 Report - Term 1 2024', date: '2024-02-16', weekNumber: 2, term: 'Term 1', summary: 'Classes in full swing. Sports day preparations underway.', status: 'Published' },
  { id: 3, title: 'Week 3 Report - Term 1 2024', date: '2024-02-23', weekNumber: 3, term: 'Term 1', summary: 'Mid-term exams scheduled. Parent meeting announced.', status: 'Published' },
];

const WeeklyReports: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [reports, setReports] = useState<WeeklyReport[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReport, setEditingReport] = useState<WeeklyReport | null>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (report: WeeklyReport) => {
    setEditingReport(report);
  };

  const handleSave = () => {
    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? editingReport : r));
      setEditingReport(null);
    }
  };

  const handlePrint = (report: WeeklyReport) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
              h1 { color: #1e3a8a; border-bottom: 2px solid #F59E0B; padding-bottom: 10px; }
              .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
              .content { margin-top: 30px; font-size: 1.1em; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <div class="meta">
              <strong>Date:</strong> ${report.date} | <strong>Term:</strong> ${report.term} | <strong>Week:</strong> ${report.weekNumber}
            </div>
            <div class="content">
              ${report.summary}
            </div>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Weekly Reports Portal</h2>
          <p className="text-slate-500">Access weekly academic and administrative updates</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {report.term} • Week {report.weekNumber}
              </span>
              <span className="text-xs text-slate-400 font-mono">{report.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {report.title}
            </h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow">
              {report.summary}
            </p>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                report.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {report.status}
              </span>
              <div className="flex gap-2">
                {isAdmin && (
                  <button 
                    onClick={() => handleEdit(report)}
                    className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button 
                  onClick={() => handlePrint(report)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  🖨️ Print / Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No reports found matching your search.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Weekly Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={editingReport.title}
                  onChange={(e) => setEditingReport({...editingReport, title: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
                <textarea 
                  value={editingReport.summary}
                  onChange={(e) => setEditingReport({...editingReport, summary: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={editingReport.status}
                    onChange={(e) => setEditingReport({...editingReport, status: e.target.value as 'Published' | 'Draft'})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReports;
