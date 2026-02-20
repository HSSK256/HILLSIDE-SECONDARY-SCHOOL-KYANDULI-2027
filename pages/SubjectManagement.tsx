
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Subject, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const SubjectManagement: React.FC<{ role: UserRole }> = ({ role }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState<Subject>({
    id: '',
    name: '',
    code: '',
    department: 'Science'
  });

  const load = async () => setSubjects(await mockApi.getSubjects());
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockApi.addSubject({...formData, id: formData.code.toLowerCase()});
    setFormData({ id: '', name: '', code: '', department: 'Science' });
    setIsAdding(false);
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this subject?')) {
      await mockApi.deleteSubject(id);
      load();
    }
  };

  if (role !== UserRole.ADMIN && role !== UserRole.TEACHER) return <div className="p-8 text-center">Access Denied</div>;

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Curriculum Management</h2>
        {role === UserRole.ADMIN && (
          <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-xl">
            {isAdding ? 'Cancel' : 'Register New Subject'}
          </button>
        )}
      </div>

      {isAdding && role === UserRole.ADMIN && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Subject Name</label>
            <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Subject Code</label>
            <input required className="w-full p-2 border rounded-lg" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Department</label>
            <select className="w-full p-2 border rounded-lg" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
              <option>Science</option>
              <option>Languages</option>
              <option>Humanities</option>
              <option>Mathematics</option>
              <option>Creative Arts</option>
            </select>
          </div>
          <button className="md:col-span-3 bg-slate-900 text-white py-2 rounded-xl font-bold">Register Subject</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 bg-slate-50 text-xs font-mono group-hover:bg-blue-50 transition-colors">
              {s.code}
            </div>
            <h4 className="text-lg font-bold text-slate-900">{s.name}</h4>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{s.department}</p>
            {role === UserRole.ADMIN && (
              <button 
                onClick={() => handleDelete(s.id)}
                className="mt-4 text-xs font-bold text-red-500 hover:text-red-700"
              >
                Delete Subject
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectManagement;
