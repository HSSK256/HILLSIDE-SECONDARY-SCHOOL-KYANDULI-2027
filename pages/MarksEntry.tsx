
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Student, Mark, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const MarksEntry: React.FC<{ role: UserRole }> = ({ role }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    subject_id: 'Mathematics',
    marks: 0,
    term: 'Term 1'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setStudents(await mockApi.getStudents());
    setMarks(await mockApi.getMarks());
  };

  const handleOpenEntry = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      await mockApi.addMark({
        student_id: selectedStudent.id,
        ...formData
      });
      loadData();
      setShowModal(false);
      setSuccessMsg('Successfully registered or saved your information to the database.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this mark entry?')) {
      await mockApi.deleteMark(id);
      loadData();
    }
  };

  // Filter previous marks for the selected student and current subject selected in the form
  const previousMarks = selectedStudent 
    ? marks.filter(m => m.student_id === selectedStudent.id && m.subject_id === formData.subject_id)
    : [];

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Marks & Academic Records</h2>
          <p className="text-slate-500">Enter and manage student examination results</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student Identification</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-base">{student.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold tracking-tighter border border-slate-200 uppercase">
                          {student.admission_number}
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {student.class_id} {student.stream}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenEntry(student)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-50 active:scale-95"
                    >
                      Record Mark
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-blue-500">📜</span> Recent Entries
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {marks.slice().reverse().slice(0, 10).map(mark => {
                const student = students.find(s => s.id === mark.student_id);
                return (
                  <div key={mark.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{student?.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{mark.subject_id} • {mark.term}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black px-2 py-0.5 rounded ${mark.marks >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {mark.marks}%
                      </span>
                      {role === UserRole.ADMIN && (
                        <button 
                           onClick={() => handleDelete(mark.id)}
                           className="text-slate-400 hover:text-red-500"
                        >
                           🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200 border border-slate-200">
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900">Record Academic Marks</h3>
              <p className="text-slate-500 text-sm mt-1">
                Updating profile for <span className="font-black text-blue-600">{selectedStudent?.name}</span>
                <span className="block text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                  {selectedStudent?.admission_number} • {selectedStudent?.class_id}
                </span>
              </p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Subject</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium appearance-none"
                  value={formData.subject_id}
                  onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                >
                  <option>Mathematics</option>
                  <option>English Language</option>
                  <option>Physics</option>
                  <option>History</option>
                  <option>Biology</option>
                  <option>Chemistry</option>
                  <option>Geography</option>
                  <option>CRE</option>
                </select>
              </div>

              {previousMarks.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Previous Records in {formData.subject_id}</p>
                  <div className="space-y-1">
                    {previousMarks.map(prev => (
                      <div key={prev.id} className="flex justify-between text-xs font-bold text-blue-800">
                        <span>{prev.term}</span>
                        <span>{prev.marks}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Academic Term</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium appearance-none"
                  value={formData.term}
                  onChange={e => setFormData({ ...formData, term: e.target.value })}
                >
                  <option>Term 1</option>
                  <option>Term 2</option>
                  <option>Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Percentage Score (%)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold text-lg"
                    value={formData.marks}
                    onChange={e => setFormData({ ...formData, marks: parseInt(e.target.value) || 0 })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Finalize Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
