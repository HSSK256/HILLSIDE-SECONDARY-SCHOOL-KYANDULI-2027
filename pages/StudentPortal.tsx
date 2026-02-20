
import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockApi } from '../services/mockApi';
import { analyzePerformance, speakAnalysis } from '../services/geminiService';
import { Student, Mark, User } from '../types';

interface StudentPortalProps {
  currentUser: User;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  
  // State for AI features
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Find the student record associated with this logged-in user (matched by ID from Login)
      const allStudents = await mockApi.getStudents();
      const currentStudent = allStudents.find(s => s.id === currentUser.id);
      
      if (currentStudent) {
        setStudent(currentStudent);
        const studentMarks = await mockApi.getMarksByStudent(currentStudent.id);
        setMarks(studentMarks);
        
        if (studentMarks.length > 0) {
            const avg = studentMarks.reduce((acc, curr) => acc + curr.marks, 0) / studentMarks.length;
            setAverageScore(Math.round(avg));
        }
      }
    };
    loadData();
  }, [currentUser]);

  const getGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };

  const handleAnalyzePerformance = async () => {
    if (!student || marks.length === 0) return;

    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsAnalyzing(true);
    const result = await analyzePerformance(student, marks);
    setAiAnalysis(result || "Could not generate analysis.");
    setIsAnalyzing(false);
  };

  const handleSpeakAnalysis = async () => {
    if (!aiAnalysis || isSpeaking) return;

    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          const success = await (window as any).aistudio.openSelectKey();
          if (!success) return;
        }
      }

    setIsSpeaking(true);
    const audioData = await speakAnalysis(aiAnalysis);
    if (audioData) {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const ctx = audioContextRef.current;
        const binary = atob(audioData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        
        const dataInt16 = new Int16Array(bytes.buffer);
        const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
    } else {
        setIsSpeaking(false);
    }
  };

  if (!student) {
    return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  }
  
  const chartData = marks.map(m => ({ subject: m.subject_id, score: m.marks }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-slate-200 z-10">
          {student.name[0]}
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-black text-slate-900">{student.name}</h1>
          <p className="text-slate-500 font-medium text-lg mb-4">{student.admission_number}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100">
               {student.class_id} {student.stream}
             </span>
             <span className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold border border-slate-100">
               {student.gender}
             </span>
             <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-100">
               Active Student
             </span>
          </div>
        </div>

        <div className="text-center bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[150px]">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mean Score</p>
            <div className="text-4xl font-black text-slate-900">{averageScore}%</div>
            <p className={`text-lg font-bold ${averageScore >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                Grade {getGrade(averageScore)}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Term Performance Breakdown</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Marks Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900">My Academic Results</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Term</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Score (%)</th>
                     <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Grade</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {marks.length > 0 ? (
                     marks.map((mark, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 font-bold text-slate-800">{mark.subject_id}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{mark.term}</td>
                         <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">{mark.marks}</td>
                         <td className="px-6 py-4 text-center font-black text-blue-600">{getGrade(mark.marks)}</td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                         No academic records found yet.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* AI Study Support Card */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 flex flex-col h-fit">
            <div className="flex-1">
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <span className="text-blue-400">✨</span> AI Study Support
                    </h3>
                    <p className="text-slate-400 text-sm">Personalized feedback on your performance.</p>
                </div>

                {!aiAnalysis && (
                  <button
                    onClick={handleAnalyzePerformance}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Analyzing...
                      </>
                    ) : 'Get My Feedback'}
                  </button>
                )}

                {aiAnalysis && (
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 animate-in fade-in zoom-in-95 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Analysis Result</h4>
                        <button 
                          onClick={handleSpeakAnalysis}
                          disabled={isSpeaking}
                          className="p-2 bg-white/10 rounded-full border border-white/10 shadow-sm hover:bg-white/20 transition-colors"
                        >
                          {isSpeaking ? (
                            <div className="flex gap-1 items-center h-5 w-5 justify-center">
                              <div className="w-1 h-2 bg-white animate-pulse"></div>
                              <div className="w-1 h-3 bg-white animate-pulse delay-75"></div>
                              <div className="w-1 h-2 bg-white animate-pulse delay-150"></div>
                            </div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed">{aiAnalysis}</p>
                    <button onClick={() => setAiAnalysis('')} className="text-xs text-blue-300 hover:underline font-bold mt-2">
                        Analyze Again
                    </button>
                  </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-slate-500">This is an AI-generated summary. Always consult your teacher for official academic guidance.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
