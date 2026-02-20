
import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { Student, UserRole } from '../types';
import { generateStudentBio } from '../services/geminiService';
import { SuccessMessage } from '../components/SuccessMessage';

const StudentManagement: React.FC<{ role: UserRole }> = ({ role }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search State with Debouncing
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    class_id: 'S.1A',
    stream: '', 
    gender: 'Male',
    admission_number: '', 
    parentName: '',
    parentPhone: '',
    photo: '',
    bio: '',
    notes: '',
    initialTuition: 800000,
    initialUniform: 150000,
    previousBalance: 0
  });

  const loadStudents = async () => {
    const data = await mockApi.getStudents();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Filter Logic
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    student.class_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isAdding && !editingId) {
      const year = new Date().getFullYear();
      const count = students.length + 1;
      const sequence = count.toString().padStart(3, '0');
      const generatedId = `HSS-${year}-${sequence}`;
      setFormData(prev => ({ ...prev, admission_number: generatedId }));
    }
  }, [isAdding, editingId, students.length]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAiGenerateBio = async () => {
    if (!formData.name) {
      alert("Please enter the student's name first.");
      return;
    }

    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsGeneratingBio(true);
    const generated = await generateStudentBio(formData.name, formData.class_id, formData.bio);
    if (generated) {
      setFormData(prev => ({ ...prev, bio: generated }));
    } else {
      alert("Failed to generate biography. Please try again.");
    }
    setIsGeneratingBio(false);
  };

  const handleEdit = (student: Student) => {
    // Teachers can view details but not edit
    if (role !== UserRole.ADMIN) return;
    
    setFormData({
      name: student.name,
      class_id: student.class_id,
      stream: student.stream,
      gender: student.gender,
      admission_number: student.admission_number,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      photo: student.photo || '',
      bio: student.bio || '',
      notes: student.notes || '',
      initialTuition: 0,
      initialUniform: 0,
      previousBalance: 0
    });
    setEditingId(student.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (confirm('Are you sure you want to permanently delete this student record?')) {
      await mockApi.deleteStudent(id);
      loadStudents();
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { initialTuition, initialUniform, previousBalance, ...studentData } = formData;
    
    if (editingId) {
      const originalStudent = students.find(s => s.id === editingId);
      if (originalStudent) {
        await mockApi.updateStudent({
          ...originalStudent,
          ...studentData,
        });
      }
    } else {
      await mockApi.addStudent(studentData, { 
        tuition: initialTuition, 
        uniform: initialUniform,
        previousBalance: previousBalance
      });
    }
    
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
    resetForm();
    loadStudents();
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      class_id: 'S.1A', 
      stream: '', 
      gender: 'Male', 
      admission_number: '',
      parentName: '',
      parentPhone: '',
      photo: '',
      bio: '',
      notes: '',
      initialTuition: 800000,
      initialUniform: 150000,
      previousBalance: 0
    });
    setIsAdding(false);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const classOptions = [
    "S.1A", "S.1B", "S.2A", "S.2B", "S.3A", "S.3B",
    "S.4A", "S.4B", "S.5 ARTS", "S.5 SCI", "S.6 ARTS", "S.6 SCI"
  ];

  const inputClass = "w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none placeholder-slate-400";
  const disabledInputClass = "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Student Management</h2>
          <p className="text-slate-500 text-sm">Manage student records and admissions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
             <input 
               type="text"
               placeholder="Search students..."
               className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          {role === UserRole.ADMIN && (
            <button
              onClick={() => {
                if (isAdding) resetForm();
                else setIsAdding(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isAdding ? 'Cancel' : '+ New Student'}
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3 flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors relative group"
              >
                {formData.photo ? (
                  <>
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    <button 
                       onClick={handleRemovePhoto}
                       type="button"
                       className="absolute bottom-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       Remove
                     </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl text-slate-500">📷</span>
                    <p className="text-xs font-bold text-slate-400 mt-2">Upload Photo</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <div className="md:col-span-9 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input
                    required
                    className={inputClass}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Admission No.</label>
                   <input 
                     disabled
                     className={disabledInputClass}
                     value={formData.admission_number || 'Generating...'}
                   />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Gender</label>
                  <select
                    className={inputClass}
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Class</label>
                  <select
                    className={inputClass}
                    value={formData.class_id}
                    onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                  >
                    {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Stream</label>
                  <input
                    className={inputClass}
                    value={formData.stream}
                    onChange={e => setFormData({ ...formData, stream: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-500">Student Biography</label>
                    <button type="button" onClick={handleAiGenerateBio} disabled={isGeneratingBio} className="text-xs text-blue-600 font-bold hover:underline">
                      {isGeneratingBio ? 'Generating...' : '✨ Auto-Generate with AI'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Public student profile summary..."
                  />
                </div>

                <div className="space-y-2">
                   <label className="block text-xs font-bold text-slate-500">Administrative Notes (Private)</label>
                   <textarea
                     rows={2}
                     className={inputClass}
                     value={formData.notes}
                     onChange={e => setFormData({ ...formData, notes: e.target.value })}
                     placeholder="Internal comments, health issues, behavioral notes..."
                   />
                </div>
              </div>

              {!editingId && (
                <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tuition Fee</label>
                    <input type="number" className={inputClass} value={formData.initialTuition} onChange={e => setFormData({ ...formData, initialTuition: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Uniform Fee</label>
                    <input type="number" className={inputClass} value={formData.initialUniform} onChange={e => setFormData({ ...formData, initialUniform: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Prev. Balance</label>
                    <input type="number" className={inputClass} value={formData.previousBalance} onChange={e => setFormData({ ...formData, previousBalance: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                {editingId ? 'Update Student Record' : 'Register Student'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Admission No.</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Class</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleEdit(student)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">{student.name[0]}</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">{student.admission_number}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                      {student.class_id} {student.stream}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {student.active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {role === UserRole.ADMIN && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">Edit</button>
                    )}
                    {role === UserRole.ADMIN && (
                      <button 
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        onClick={(e) => handleDelete(student.id, e)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {students.length === 0 ? "No students registered yet." : "No students matching your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManagement;
