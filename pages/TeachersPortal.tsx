
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { generateLessonPlan } from '../services/geminiService';
import { Teacher, UserRole, User } from '../types';

interface TeachersPortalProps {
  role: UserRole;
  currentUser: User;
}

interface ScheduleItemProps {
  time: string;
  subject: string;
  targetClass: string;
  room: string;
  day: string;
  isAlt?: boolean;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ time, subject, targetClass, room, day, isAlt }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isAlt ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] uppercase leading-tight ${isAlt ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
      <span>{day.substring(0, 3)}</span>
      <span className="text-xs">{time.split(':')[0]}</span>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <h5 className="font-bold text-slate-900">{subject}</h5>
        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded uppercase font-bold text-slate-600">{room}</span>
      </div>
      <p className="text-sm text-slate-500">{targetClass}</p>
    </div>
    <div className="text-xs font-mono text-slate-400">
      {time}
    </div>
  </div>
);

const TeachersPortal: React.FC<TeachersPortalProps> = ({ role, currentUser }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'planner' | 'directory'>('overview');
  
  const [plannerData, setPlannerData] = useState({ subject: 'Mathematics', topic: '', level: 'S.4A' });
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await mockApi.getTeachers();
        setTeachers(data);
      } catch (err) {
        console.error("Failed to load teachers", err);
      }
    };
    load();
  }, []);

  const currentTeacher = teachers.find(t => 
    t.name.toLowerCase().includes(currentUser.name.toLowerCase()) || 
    t.email.toLowerCase() === currentUser.username.toLowerCase()
  ) || teachers[0];

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerData.topic) return;

    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsGenerating(true);
    try {
      const plan = await generateLessonPlan(plannerData.subject, plannerData.topic, plannerData.level);
      setGeneratedPlan(plan || 'Failed to generate plan.');
    } catch (error) {
      setGeneratedPlan('Error generating lesson plan.');
    } finally {
      setIsGenerating(false);
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

  const assignments = currentTeacher?.assignments || [];
  // Sort assignments by day and then by time approximately
  const sortedAssignments = [...assignments].sort((a, b) => {
     const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
     const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
     if (dayDiff !== 0) return dayDiff;
     return a.time.localeCompare(b.time);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            {role === UserRole.TEACHER ? 'School Timetable' : 'Teachers Portal'}
          </h2>
          <p className="text-slate-500">
            {role === UserRole.TEACHER ? 'Your weekly class schedule' : 'Professional workspace for Hillside staff'}
          </p>
        </div>
        
        {role !== UserRole.TEACHER && (
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            {(['overview', 'planner', 'directory'] as const).map((tab) => (
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
        )}
      </div>

      {activeTab === 'overview' && currentTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6 print:hidden">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                {currentTeacher.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{currentTeacher.name}</h3>
              <p className="text-blue-600 font-medium text-sm">{currentTeacher.staff_id}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-800">{currentTeacher.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{currentTeacher.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-400">📝</span> Teaching Load
              </h4>
              <div className="space-y-2">
                {Array.from(new Set(currentTeacher.assignments?.map(a => a.classId))).map((cls, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm font-medium">{cls}</span>
                  </div>
                ))}
                {(!currentTeacher.assignments || currentTeacher.assignments.length === 0) && (
                   <p className="text-slate-400 text-sm">No active classes.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Weekly Schedule</h3>
                <button onClick={() => window.print()} className="text-blue-600 hover:text-blue-700 text-sm font-bold print:hidden">
                  🖨️ Print
                </button>
              </div>
              
              <div className="space-y-4">
                {sortedAssignments.length > 0 ? sortedAssignments.map((assignment, idx) => (
                  <ScheduleItem 
                    key={assignment.id}
                    day={assignment.day}
                    time={assignment.time}
                    subject={assignment.subject}
                    targetClass={assignment.classId}
                    room={assignment.room}
                    isAlt={idx % 2 !== 0}
                  />
                )) : (
                  <div className="text-center py-12 text-slate-400 italic">
                    No classes scheduled for this week.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
            <div className="mb-6">
               <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <span>✨</span> AI Lesson Planner
               </h3>
               <p className="text-slate-500 text-sm">Generate comprehensive lesson plans instantly.</p>
            </div>
            
            <form onSubmit={handleGeneratePlan} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Class Level</label>
                  <select 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                     value={plannerData.level}
                     onChange={e => setPlannerData({...plannerData, level: e.target.value})}
                  >
                     {classOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
                  <input 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                     value={plannerData.subject}
                     onChange={e => setPlannerData({...plannerData, subject: e.target.value})}
                     placeholder="e.g. Mathematics"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Topic</label>
                  <input 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                     value={plannerData.topic}
                     onChange={e => setPlannerData({...plannerData, topic: e.target.value})}
                     placeholder="e.g. Calculus: Differentiation"
                     required
                  />
               </div>
               <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
               >
                  {isGenerating ? 'Generating Plan...' : 'Create Lesson Plan'}
               </button>
            </form>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 h-full min-h-[500px] overflow-y-auto">
             {generatedPlan ? (
               <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-wrap font-medium text-slate-700">{generatedPlan}</div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-2">📄</span>
                  <p className="font-bold text-sm">Lesson plan will appear here</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900">Staff Directory</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {teachers.map(t => (
                 <div key={t.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                       {t.name[0]}
                    </div>
                    <div>
                       <p className="font-bold text-slate-900">{t.name}</p>
                       <p className="text-xs text-slate-500">{t.department}</p>
                       <p className="text-xs text-blue-600 mt-1">{t.email}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default TeachersPortal;
