
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Teacher, UserRole, Subject, TeacherAssignment } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const StaffManagement: React.FC<{ role: UserRole }> = ({ role }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    staff_id: '',
    department: 'Science',
    email: '',
  });

  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);

  const loadData = async () => {
    setTeachers(await mockApi.getTeachers());
    setSubjectsList(await mockApi.getSubjects());
  };

  useEffect(() => { loadData(); }, []);

  const handleAddAssignment = () => {
    setAssignments([
      ...assignments,
      { 
        id: Date.now(), 
        subject: subjectsList[0]?.name || '', 
        classId: 'S.1A', 
        day: 'Monday', 
        time: '08:00 - 09:00',
        room: 'Room 1' 
      }
    ]);
  };

  const handleRemoveAssignment = (id: number) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const updateAssignment = (id: number, field: keyof TeacherAssignment, value: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Derive simple lists for compatibility
    const uniqueSubjects = Array.from(new Set(assignments.map(a => a.subject)));
    const uniqueClasses = Array.from(new Set(assignments.map(a => a.classId)));

    await mockApi.addTeacher({
      ...formData,
      subjects: uniqueSubjects,
      classes: uniqueClasses,
      assignments: assignments
    });

    setFormData({ name: '', staff_id: '', department: 'Science', email: '' });
    setAssignments([]);
    setIsAdding(false);
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      await mockApi.deleteTeacher(id);
      loadData();
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.staff_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const classOptions = [
    "S.1A", "S.1B",
    "S.2A", "S.2B",
    "S.3A", "S.3B",
    "S.4A", "S.4B",
    "S.5 ARTS", "S.5 SCI",
    "S.6 ARTS", "S.6 SCI"
  ];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["08:00 - 09:20", "09:20 - 10:40", "11:00 - 12:20", "14:00 - 15:20", "15:20 - 16:40"];

  if (role !== UserRole.ADMIN) return <div className="p-8 text-center text-red-500 font-bold">Access Denied: Administrative Privileges Required</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Staff Management</h2>
          <p className="text-slate-500 font-medium">Manage teachers, assign classes and schedules</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Filter by Staff ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isAdding ? '✕ Cancel' : '+ Add Teacher'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-xl animate-in slide-in-from-top duration-300 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Official Name</label>
                <input 
                  required 
                  className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none bg-slate-50 font-bold text-slate-900" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. David Mutua"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Staff ID (TSC)</label>
                  <input 
                    required 
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none bg-slate-50 font-bold text-slate-900" 
                    value={formData.staff_id} 
                    onChange={e => setFormData({...formData, staff_id: e.target.value})} 
                    placeholder="TSC-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none bg-slate-50 font-bold text-slate-900" 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    <option>Science</option>
                    <option>Languages</option>
                    <option>Humanities</option>
                    <option>Mathematics</option>
                    <option>Creative Arts</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Official Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-5 py-3 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none bg-slate-50 font-bold text-slate-900" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="d.mutua@hillside.ac.ke"
                />
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Start adding assignment slots below to automatically populate the teacher's subject and class list.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-black text-slate-900 uppercase tracking-widest">Teaching Assignments & Schedule</h3>
               <button 
                  type="button"
                  onClick={handleAddAssignment}
                  className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
               >
                 + Add Assignment
               </button>
            </div>
            
            {assignments.length > 0 ? (
               <div className="space-y-3">
                 <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                    <div className="col-span-3">Subject</div>
                    <div className="col-span-2">Class</div>
                    <div className="col-span-2">Day</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">Room</div>
                    <div className="col-span-1"></div>
                 </div>
                 {assignments.map((assignment, index) => (
                   <div key={assignment.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 items-center animate-in slide-in-from-left duration-300">
                      <div className="md:col-span-3">
                         <select 
                           className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                           value={assignment.subject}
                           onChange={e => updateAssignment(assignment.id, 'subject', e.target.value)}
                         >
                           {subjectsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                         </select>
                      </div>
                      <div className="md:col-span-2">
                         <select 
                           className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                           value={assignment.classId}
                           onChange={e => updateAssignment(assignment.id, 'classId', e.target.value)}
                         >
                           {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <div className="md:col-span-2">
                         <select 
                           className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                           value={assignment.day}
                           onChange={e => updateAssignment(assignment.id, 'day', e.target.value)}
                         >
                           {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>
                      <div className="md:col-span-2">
                         <select 
                           className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold bg-white"
                           value={assignment.time}
                           onChange={e => updateAssignment(assignment.id, 'time', e.target.value)}
                         >
                           {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                      </div>
                      <div className="md:col-span-2">
                         <input 
                           className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"
                           placeholder="e.g. Lab 1"
                           value={assignment.room}
                           onChange={e => updateAssignment(assignment.id, 'room', e.target.value)}
                         />
                      </div>
                      <div className="md:col-span-1 text-right">
                        <button 
                           type="button"
                           onClick={() => handleRemoveAssignment(assignment.id)}
                           className="text-red-500 hover:text-red-700 text-lg font-bold"
                        >
                          ×
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                 <p className="text-slate-400 font-medium text-sm">No teaching assignments added yet.</p>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl mt-4 font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            Save Teacher Profile
          </button>
        </form>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Staff Directory</h3>
           {searchQuery && (
             <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
               Found {filteredTeachers.length} staff members
             </span>
           )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name & Email</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Staff ID (TSC)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Teaching Load</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</p>
                    <p className="text-xs text-slate-400 font-bold">{t.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      {t.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-black text-blue-600">
                    {t.staff_id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {t.assignments && t.assignments.length > 0 ? (
                        <div className="space-y-1">
                           <p className="text-xs font-bold text-slate-900">{t.assignments.length} Active Assignments</p>
                           <div className="flex flex-wrap gap-1">
                            {Array.from(new Set(t.assignments.map(a => a.classId))).slice(0, 3).map((cls, i) => (
                               <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">{cls}</span>
                            ))}
                            {new Set(t.assignments.map(a => a.classId)).size > 3 && <span className="text-[10px] text-slate-400">...</span>}
                           </div>
                        </div>
                      ) : (
                         <span className="text-xs text-slate-400 italic">No classes assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <span className="text-4xl">🔎</span>
                      <p className="font-black text-slate-900 uppercase tracking-widest text-sm">No matching staff found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
