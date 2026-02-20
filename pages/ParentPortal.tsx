
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { Student, Mark, User, Parent } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ParentPortal: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [parent, setParent] = useState<Parent | null>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [childMarks, setChildMarks] = useState<Mark[]>([]);
  const [admissionNoSearch, setAdmissionNoSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const p = await mockApi.getParentByUsername(currentUser.username);
      if (p) {
        setParent(p);
        const kids = await mockApi.getChildrenOfParent(p.id);
        setChildren(kids);
        if (kids.length > 0) setSelectedChild(kids[0]);
      }
    };
    load();
  }, [currentUser]);

  useEffect(() => {
    if (selectedChild) {
      mockApi.getMarksByStudent(selectedChild.id).then(setChildMarks);
    }
  }, [selectedChild]);
  
  const handleAdmissionSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNoSearch.trim()) return;
    
    const student = await mockApi.getStudentByAdmissionNumber(admissionNoSearch.trim());
    
    if (student) {
      navigate(`/finance?studentId=${student.id}&view=statement`);
    } else {
      alert('No student found with that Admission Number.');
    }
  };

  const chartData = childMarks.map(m => ({
    subject: m.subject_id,
    score: m.marks
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl">🏠</div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Parent Portal</h2>
          <p className="text-slate-500">Welcome back, {parent?.name}. Monitoring your children's progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">My Children</h3>
            <div className="space-y-2">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedChild?.id === child.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    {child.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{child.name}</p>
                    <p className={`text-xs ${selectedChild?.id === child.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {child.class_id} • {child.admission_number}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/reports" className="block w-full text-left p-3 hover:bg-white/10 rounded-xl text-sm transition-colors">📄 Download Report Cards</Link>
              {selectedChild && (
                <Link
                  to={`/finance?studentId=${selectedChild.id}&view=statement`}
                  className="block w-full text-left p-3 hover:bg-white/10 rounded-xl text-sm transition-colors"
                >
                  💳 Fee Statement for {selectedChild.name.split(' ')[0]}
                </Link>
              )}
              
              {/* New Search by Admission Number Feature */}
              <div className="pt-3 border-t border-slate-700/50">
                <form onSubmit={handleAdmissionSearch}>
                  <label className="block text-xs font-bold text-slate-400 mb-2">Find by Admission No.</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. HSS-2024-001"
                      className="flex-1 px-3 py-2 text-xs bg-slate-800 rounded-lg text-white border border-slate-700 outline-none focus:border-blue-500"
                      value={admissionNoSearch}
                      onChange={e => setAdmissionNoSearch(e.target.value)}
                    />
                    <button type="submit" className="px-3 bg-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500">
                      Find
                    </button>
                  </div>
                </form>
              </div>

              <a href="#" className="block w-full text-left p-3 hover:bg-white/10 rounded-xl text-sm transition-colors opacity-50 cursor-not-allowed">📧 Message Teacher (Coming Soon)</a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {selectedChild ? (
            <>
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Latest Performance: {selectedChild.name}</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Recent Exam Scores</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Term</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {childMarks.map(m => (
                      <tr key={m.id}>
                        <td className="px-6 py-4 font-semibold">{m.subject_id}</td>
                        <td className="px-6 py-4 text-slate-500">{m.term}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">{m.marks}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-64 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 italic">
              Select a child to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;
