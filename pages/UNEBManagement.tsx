
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Student, UNEBCandidate, UserRole, Subject } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const UNEBManagement: React.FC<{ role: UserRole }> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'candidates' | 'fees'>('candidates');
  const [students, setStudents] = useState<Student[]>([]);
  const [candidates, setCandidates] = useState<UNEBCandidate[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    indexNumber: '',
    centerNumber: 'U0001',
    level: 'UCE' as 'UCE' | 'UACE',
    year: 2024,
    registrationFee: 250000,
    subjects: [] as string[]
  });

  const loadData = async () => {
    const s = await mockApi.getStudents();
    const c = await mockApi.getUNEBCandidates();
    const sub = await mockApi.getSubjects();
    setStudents(s);
    setCandidates(c);
    setSubjects(sub);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert('Select a student');
    setIsProcessing(true);
    try {
      await mockApi.registerUNEBCandidate({
        studentId: parseInt(formData.studentId),
        indexNumber: formData.indexNumber,
        centerNumber: formData.centerNumber,
        level: formData.level,
        year: formData.year,
        registrationFee: formData.registrationFee,
        amountPaid: 0,
        subjects: formData.subjects,
        status: 'Pending'
      });
      setSuccessMsg('Successfully registered or saved your information to the database.');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
      setActiveTab('candidates');
    } catch (err) {
      alert('Registration failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this candidate registration?')) {
      await mockApi.deleteUNEBCandidate(id);
      loadData();
    }
  };

  const handleSubjectToggle = (subjName: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjName) 
        ? prev.subjects.filter(s => s !== subjName)
        : [...prev.subjects, subjName]
    }));
  };

  const handlePayment = async (candidateId: number) => {
    const amount = prompt('Enter amount to pay:');
    if (amount) {
      await mockApi.updateUNEBPayment(candidateId, parseInt(amount));
      setSuccessMsg('Successfully registered or saved your information to the database.');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">UNEB National Exams</h2>
          <p className="text-slate-500">UCE & UACE Candidate Registration and Fee Management</p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          {(['candidates', 'register', 'fees'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'register' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-4">New UNEB Registration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Student</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  required
                >
                  <option value="">Select Student</option>
                  {students.filter(s => !candidates.some(c => c.studentId === s.id)).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Index Number</label>
                <input 
                  placeholder="U0001/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.indexNumber}
                  onChange={e => setFormData({ ...formData, indexNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Level</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: e.target.value as 'UCE' | 'UACE' })}
                >
                  <option value="UCE">UCE (O-Level)</option>
                  <option value="UACE">UACE (A-Level)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Registration Fee (UGX)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.registrationFee}
                  onChange={e => setFormData({ ...formData, registrationFee: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Subjects</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {subjects.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => handleSubjectToggle(s.name)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                      formData.subjects.includes(s.name) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing Registration...' : 'Complete UNEB Registration'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">UNEB Candidates List</h3>
            <span className="text-xs font-bold text-slate-400 uppercase">Year: 2024</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Index Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Level</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subjects</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map(c => {
                  const student = students.find(s => s.id === c.studentId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{c.indexNumber}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{student?.name}</p>
                        <p className="text-xs text-slate-400">{student?.admission_number}</p>
                      </td>
                      <td className="px-6 py-4 font-bold">{c.level}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {c.subjects.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">{s}</span>
                          ))}
                          {c.subjects.length > 3 && <span className="text-[10px] text-slate-400 font-bold">+{c.subjects.length - 3} more</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          c.status === 'Registered' ? 'bg-emerald-100 text-emerald-700' : 
                          c.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                           onClick={() => handleDelete(c.id)}
                           className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                           Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
              <p className="text-blue-100 text-xs font-bold uppercase mb-1">Total Fee Collection</p>
              <h4 className="text-2xl font-black">
                UGX {candidates.reduce((a, b) => a + b.amountPaid, 0).toLocaleString()}
              </h4>
            </div>
            <div className="bg-emerald-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-200">
              <p className="text-emerald-100 text-xs font-bold uppercase mb-1">Fully Paid</p>
              <h4 className="text-2xl font-black">
                {candidates.filter(c => c.amountPaid >= c.registrationFee).length} Candidates
              </h4>
            </div>
          </div>

          <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Payment Tracking</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fee (UGX)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Paid (UGX)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Balance</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map(c => {
                  const student = students.find(s => s.id === c.studentId);
                  const balance = c.registrationFee - c.amountPaid;
                  return (
                    <tr key={c.id}>
                      <td className="px-6 py-4 font-bold text-slate-800">{student?.name}</td>
                      <td className="px-6 py-4 font-mono text-sm">{c.registrationFee.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-sm text-emerald-600 font-bold">{c.amountPaid.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-sm text-red-600 font-bold">{balance.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handlePayment(c.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          Add Payment
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UNEBManagement;
