
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { ExamSchedule, Subject, User, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const ExaminationPortal: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'timetable' | 'setup'>('timetable');
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState('S.4A');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    classId: 'S.4A',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    room: 'Main Hall',
    invigilator: ''
  });

  const loadData = async () => {
    setSchedules(await mockApi.getExamSchedules());
    setSubjects(await mockApi.getSubjects());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return alert('Please select a subject');

    await mockApi.addExamSchedule({
      ...formData
    });
    
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
    setFormData({
      ...formData,
      subject: '',
      startTime: '09:00',
      endTime: '11:00'
    });
    loadData();
    setActiveTab('timetable');
  };

  const handleDelete = async (id: number) => {
    if(confirm('Delete this exam entry?')) {
      await mockApi.deleteExamSchedule(id);
      loadData();
    }
  };

  const classOptions = [
    "S.1A", "S.1B", "S.2A", "S.2B", "S.3A", "S.3B",
    "S.4A", "S.4B", "S.5 ARTS", "S.5 SCI", "S.6 ARTS", "S.6 SCI"
  ];

  const filteredSchedules = schedules
    .filter(s => s.classId === selectedClass)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Examination Portal</h2>
          <p className="text-slate-500">Manage exam timetables and invigilation</p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'timetable' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            View Timetable
          </button>
          {currentUser.role === UserRole.ADMIN && (
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'setup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Setup Exams
            </button>
          )}
        </div>
      </div>

      {/* UNEB External Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href="https://ereg.uneb.ac.ug/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl shadow-lg shadow-blue-100 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-lg">UNEB eRegistration</h3>
            <p className="text-blue-100 text-sm font-medium">Official Portal for Candidate Registration</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
             🔗
          </div>
        </a>

        <a 
          href="https://uneb.ac.ug/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-slate-900 hover:bg-slate-800 text-white p-6 rounded-3xl shadow-lg shadow-slate-200 transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-lg">UNEB Results & News</h3>
            <p className="text-slate-400 text-sm font-medium">Check latest news and result release info</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
             🌍
          </div>
        </a>
      </div>

      {activeTab === 'setup' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <form onSubmit={handleAddSchedule} className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Schedule New Exam</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Class</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Start Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">End Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Exam Room</label>
                <input 
                  type="text"
                  placeholder="e.g. Main Hall"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.room}
                  onChange={e => setFormData({ ...formData, room: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chief Invigilator</label>
                <input 
                  type="text"
                  placeholder="e.g. Mr. Mutua"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.invigilator}
                  onChange={e => setFormData({ ...formData, invigilator: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 shadow-xl transition-all"
            >
              Add Exam to Schedule
            </button>
          </form>
        </div>
      )}

      {activeTab === 'timetable' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800">Exam Timetable</h3>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
                <select 
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold bg-slate-50 outline-none"
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                >
                    {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <button 
                  onClick={() => window.print()}
                  className="ml-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  🖨️ Print
                </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Venue</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Invigilator</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map(exam => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">{exam.date}</td>
                      <td className="px-6 py-4 font-mono text-sm text-blue-600 font-bold">
                        {exam.startTime} - {exam.endTime}
                      </td>
                      <td className="px-6 py-4">
                         <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{exam.subject}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{exam.room}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{exam.invigilator || 'TBA'}</td>
                      <td className="px-6 py-4 text-right">
                         {currentUser.role === UserRole.ADMIN && (
                           <button 
                             onClick={() => handleDelete(exam.id)}
                             className="text-red-500 hover:text-red-700 font-bold text-xs"
                           >
                             Remove
                           </button>
                         )}
                      </td>
                    </tr>
                ))}
                {filteredSchedules.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 italic">No exams scheduled for {selectedClass}</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationPortal;
