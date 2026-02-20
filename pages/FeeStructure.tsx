
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { FeeStructure, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const FeeStructurePage: React.FC<{ role: UserRole }> = ({ role }) => {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState<Omit<FeeStructure, 'id'>>({
    year: new Date().getFullYear(),
    term: 'Term 1',
    class_level: 'S.1A',
    tuition: 0,
    uniform: 0,
    boarding: 0,
    development: 0,
    other: 0
  });

  const loadStructures = async () => {
    setStructures(await mockApi.getFeeStructures());
  };

  useEffect(() => {
    loadStructures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockApi.addFeeStructure(formData);
    setIsAdding(false);
    loadStructures();
    setFormData({
      year: new Date().getFullYear(),
      term: 'Term 1',
      class_level: 'S.1A',
      tuition: 0,
      uniform: 0,
      boarding: 0,
      development: 0,
      other: 0
    });
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this fee structure?')) {
      await mockApi.deleteFeeStructure(id);
      loadStructures();
    }
  };

  const classOptions = [
    "S.1A", "S.1B",
    "S.2A", "S.2B",
    "S.3A", "S.3B",
    "S.4A", "S.4B",
    "S.5 ARTS", "S.5 SCI",
    "S.6 ARTS", "S.6 SCI"
  ];

  if (role !== UserRole.ADMIN) return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Fee Structure Management</h2>
          <p className="text-slate-500">Define tuition and operational fees per class level</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
        >
          {isAdding ? 'Cancel' : '+ New Fee Structure'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-xl animate-in slide-in-from-top duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6 border-b pb-2">Configure New Fee</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Year</label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Term</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50"
                value={formData.term}
                onChange={e => setFormData({ ...formData, term: e.target.value })}
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Class Level</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-slate-50"
                value={formData.class_level}
                onChange={e => setFormData({ ...formData, class_level: e.target.value })}
              >
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tuition (UGX)</label>
              <input type="number" className="w-full p-3 rounded-xl border font-mono" value={formData.tuition} onChange={e => setFormData({...formData, tuition: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Uniform (UGX)</label>
              <input type="number" className="w-full p-3 rounded-xl border font-mono" value={formData.uniform} onChange={e => setFormData({...formData, uniform: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Boarding (UGX)</label>
              <input type="number" className="w-full p-3 rounded-xl border font-mono" value={formData.boarding} onChange={e => setFormData({...formData, boarding: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Development (UGX)</label>
              <input type="number" className="w-full p-3 rounded-xl border font-mono" value={formData.development} onChange={e => setFormData({...formData, development: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Other (UGX)</label>
              <input type="number" className="w-full p-3 rounded-xl border font-mono" value={formData.other} onChange={e => setFormData({...formData, other: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl">
            Save Fee Configuration
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {structures.map(s => {
          const total = s.tuition + s.uniform + s.boarding + s.development + s.other;
          return (
            <div key={s.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{s.class_level}</h3>
                  <p className="text-sm font-bold text-slate-500">{s.year} • {s.term}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-lg font-black text-blue-600">UGX {(total/1000).toFixed(0)}k</p>
                </div>
              </div>
              
              <div className="p-6 flex-1 space-y-3">
                <FeeRow label="Tuition" amount={s.tuition} />
                <FeeRow label="Uniform" amount={s.uniform} />
                <FeeRow label="Boarding" amount={s.boarding} />
                <FeeRow label="Development" amount={s.development} />
                <FeeRow label="Other Fees" amount={s.other} />
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="w-full text-xs font-black text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg uppercase tracking-widest transition-colors"
                >
                  Remove Configuration
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FeeRow: React.FC<{ label: string; amount: number }> = ({ label, amount }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={`font-mono font-bold ${amount > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
      {amount > 0 ? amount.toLocaleString() : '-'}
    </span>
  </div>
);

export default FeeStructurePage;
