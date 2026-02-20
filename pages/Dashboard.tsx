
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockApi } from '../services/mockApi';
import { Student, ExamSchedule } from '../types';
import { analyzeSchoolPerformance } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageGrade: 0,
    attendanceRate: 0,
    males: 0,
    females: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  
  const [teacherCount, setTeacherCount] = useState(0);
  const [financialSummary, setFinancialSummary] = useState({ totalBilled: 0, totalBalance: 0 });
  const [upcomingExams, setUpcomingExams] = useState<ExamSchedule[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      const [studentData, marks, attendance, teacherData, allExams] = await Promise.all([
          mockApi.getStudents(),
          mockApi.getMarks(),
          mockApi.getAttendance(),
          mockApi.getTeachers(),
          mockApi.getExamSchedules()
      ]);
      setStudents(studentData);

      // Core Stats
      const avg = marks.reduce((acc, curr) => acc + curr.marks, 0) / (marks.length || 1);
      const attRate = (attendance.filter(a => a.status === 'present').length / (attendance.length || 1)) * 100;
      const males = studentData.filter(s => s.gender === 'Male').length;
      const females = studentData.filter(s => s.gender === 'Female').length;

      setStats({
        totalStudents: studentData.length,
        averageGrade: Math.round(avg),
        attendanceRate: Math.round(attRate),
        males,
        females
      });
      
      setGenderData([
        { name: 'Male', value: males, color: '#3b82f6' },
        { name: 'Female', value: females, color: '#ec4899' }
      ]);
      
      // Subject Performance
      const grouped = marks.reduce((acc: any, curr) => {
        acc[curr.subject_id] = (acc[curr.subject_id] || 0) + curr.marks;
        acc[curr.subject_id + '_count'] = (acc[curr.subject_id + '_count'] || 0) + 1;
        return acc;
      }, {});

      const data = Object.keys(grouped)
        .filter(k => !k.endsWith('_count'))
        .map(k => ({
          subject: k,
          average: Math.round(grouped[k] / grouped[k + '_count'])
        }));
      setChartData(data);
      
      // Teacher Count
      setTeacherCount(teacherData.length);

      // Financial Summary
      const summaryPromises = studentData.map(s => mockApi.getFeeSummary(s.id));
      const summaries = await Promise.all(summaryPromises);
      const totalBilled = summaries.reduce((acc, s) => acc + s.total_billed, 0);
      const totalBalance = summaries.reduce((acc, s) => acc + s.balance, 0);
      setFinancialSummary({ totalBilled, totalBalance });

      // Upcoming Exams
      const today = new Date();
      today.setHours(0, 0, 0, 0); // For date comparison
      const futureExams = allExams
        .filter(exam => new Date(exam.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingExams(futureExams);
    };

    fetchData();
  }, []);

  const handleGenerateInsight = async () => {
    if (chartData.length === 0) return;

    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsGeneratingInsight(true);
    const result = await analyzeSchoolPerformance(chartData);
    setAiInsight(result);
    setIsGeneratingInsight(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
           <p className="text-slate-500">System performance and school metrics</p>
        </div>
        <button 
           onClick={() => navigator.clipboard.writeText(window.location.href)}
           className="text-sm text-blue-600 font-medium hover:underline"
        >
           Share View
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/weekly-reports" className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg text-white flex items-center justify-between hover:shadow-xl transition-shadow group">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📅</span> Weekly Reports Portal
            </h3>
            <p className="text-blue-100 mt-1">Access detailed weekly academic and administrative updates.</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
        <WidgetCard 
          title="Total Enrollment" 
          value={stats.totalStudents} 
          subtitle="Active Students"
          icon="🎓" 
          bg="bg-white" 
        />
        <WidgetCard 
          title="Teaching Staff" 
          value={teacherCount} 
          subtitle="Active Teachers"
          icon="💼" 
          bg="bg-white" 
        />
        <WidgetCard 
          title="Average Grade" 
          value={`${stats.averageGrade}%`} 
          subtitle="School Mean"
          icon="📈" 
          bg="bg-white" 
        />
        <WidgetCard 
          title="Attendance" 
          value={`${stats.attendanceRate}%`} 
          subtitle="Daily Average"
          icon="✅" 
          bg="bg-white" 
        />
        <WidgetCard 
          title="Total Billed Fees" 
          value={`UGX ${financialSummary.totalBilled.toLocaleString()}`} 
          subtitle="This Academic Year"
          icon="🧾" 
          bg="bg-white" 
        />
        <WidgetCard 
          title="Outstanding Fees" 
          value={`UGX ${financialSummary.totalBalance.toLocaleString()}`} 
          subtitle="Across all students"
          icon="⚠️" 
          bg="bg-white" 
        />
      </div>

      {/* AI School Intelligence Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span>✨</span> AI School Intelligence
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Generate a comprehensive academic report based on current subject performance data.</p>
                </div>
                <button
                    onClick={handleGenerateInsight}
                    disabled={isGeneratingInsight || chartData.length === 0}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-900/50"
                >
                    {isGeneratingInsight ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <span>📊</span> Analyze Trends
                      </>
                    )}
                </button>
            </div>
            
            {aiInsight && (
                <div className="bg-white/10 rounded-xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 backdrop-blur-sm">
                    <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                        {aiInsight}
                    </div>
                </div>
            )}
        </div>
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Subject Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Widgets Column */}
        <div className="space-y-6">
          
          {/* Gender Pie */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-2">Student Composition</h3>
             <div className="h-[200px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={genderData}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {genderData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                   <span className="text-xs font-bold text-slate-600">Male</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                   <span className="text-xs font-bold text-slate-600">Female</span>
                </div>
             </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-slate-800 p-6 rounded-xl text-white shadow-md">
             <h4 className="text-sm font-bold uppercase text-slate-400 mb-3">🗓️ Upcoming Exams</h4>
             <div className="space-y-2">
               {upcomingExams.length > 0 ? upcomingExams.map(exam => (
                 <div key={exam.id} className="flex justify-between items-center text-sm bg-white/10 p-2.5 rounded-lg border border-white/5">
                   <div>
                     <p className="font-bold text-white">{exam.subject}</p>
                     <p className="text-xs text-slate-300">{exam.classId}</p>
                   </div>
                   <div className="text-right">
                      <p className="font-mono text-xs">{new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-xs font-bold text-slate-400">{exam.startTime}</p>
                   </div>
                 </div>
               )) : (
                 <p className="text-sm text-slate-400 italic">No exams scheduled.</p>
               )}
             </div>
             <Link to="/exams" className="text-xs text-blue-300 hover:text-white transition-colors mt-4 block text-center">
               View Full Exam Portal →
             </Link>
          </div>
        </div>
      </div>

      {/* Subject Performance Cards */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Average Grade per Subject</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {chartData.map((item) => (
            <div key={item.subject} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-700 text-sm truncate pr-2" title={item.subject}>{item.subject}</h4>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                  item.average >= 75 ? 'bg-emerald-100 text-emerald-700' :
                  item.average >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.average >= 80 ? 'Distinction' : item.average >= 60 ? 'Credit' : 'Pass'}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-3xl font-black ${
                   item.average >= 75 ? 'text-emerald-600' :
                   item.average >= 50 ? 'text-amber-600' :
                   'text-red-600'
                }`}>{item.average}%</span>
                <span className="text-xs text-slate-400 font-bold mb-1.5">Mean Score</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.average >= 75 ? 'bg-emerald-500' :
                    item.average >= 50 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} 
                  style={{ width: `${item.average}%` }}
                ></div>
              </div>
            </div>
          ))}
          {chartData.length === 0 && (
             <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No academic data available for analysis.
             </div>
          )}
        </div>
      </div>

      {/* Student Database Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Registered Students Database</h3>
          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{students.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Admission No.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Gender</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-4 font-bold text-slate-900">{student.name}</td>
                   <td className="px-6 py-4 text-sm font-mono text-slate-600 font-medium">{student.admission_number}</td>
                   <td className="px-6 py-4 text-sm font-bold text-blue-600">{student.class_id} {student.stream}</td>
                   <td className="px-6 py-4 text-sm text-slate-500 font-medium">{student.gender}</td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${student.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {student.active ? 'Active' : 'Inactive'}
                      </span>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const WidgetCard = ({ title, value, subtitle, icon, bg }: any) => (
  <div className={`${bg} p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between`}>
    <div>
      <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
    <div className="text-2xl opacity-80">{icon}</div>
  </div>
);

export default Dashboard;
