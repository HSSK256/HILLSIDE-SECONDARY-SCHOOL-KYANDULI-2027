
import React, { useState, useEffect, useRef } from 'react';
import { analyzePerformance, generateAnnouncements, speakAnalysis, searchEducationalResources } from '../services/geminiService';
import { mockApi } from '../services/mockApi';
import { Student } from '../types';

const Insights: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ text: string, links: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const load = async () => {
      setStudents(await mockApi.getStudents());
    };
    load();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedStudent) return;
    
    // Check for API key in this specific environment context if available
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsAnalyzing(true);
    setAnalysis('');
    const student = students.find(s => s.id === selectedStudent);
    const marks = await mockApi.getMarksByStudent(selectedStudent as number);
    if (student) {
      const result = await analyzePerformance(student, marks);
      setAnalysis(result || 'No analysis available.');
    }
    setIsAnalyzing(false);
  };

  const handleSpeak = async () => {
    if (!analysis || isSpeaking) return;

    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsSpeaking(true);
    const audioData = await speakAnalysis(analysis);
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

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsSearching(true);
    const result = await searchEducationalResources(searchQuery);
    setSearchResults(result);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Academic AI Suite</h2>
        <p className="text-slate-500">Intelligent tools to enhance teaching and student outcomes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Analysis with TTS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🧠</span> Performance Analyst
            </h3>
            <p className="text-indigo-100 text-sm mt-1">AI-driven feedback with voice synthesis.</p>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Select Student</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={selectedStudent}
                onChange={e => setSelectedStudent(parseInt(e.target.value) || '')}
              >
                <option value="">-- Choose a Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.admission_number})</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedStudent}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Generate Insights'}
            </button>
            
            {analysis && (
              <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Analysis Result</h4>
                  <button 
                    onClick={handleSpeak}
                    disabled={isSpeaking}
                    className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-indigo-600"
                  >
                    {isSpeaking ? (
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-indigo-600 animate-pulse"></div>
                        <div className="w-1 h-3 bg-indigo-600 animate-pulse delay-75"></div>
                        <div className="w-1 h-3 bg-indigo-600 animate-pulse delay-150"></div>
                      </div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">{analysis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Google Search Grounding Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>🌐</span> Academic Researcher
            </h3>
            <p className="text-emerald-100 text-sm mt-1">Live curriculum and scholarship discovery via Google Search.</p>
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                 <input 
                  placeholder="Search scholarships, teaching trends..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-slate-50 pr-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery}
                className="bg-emerald-600 text-white px-5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {isSearching ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Search"}
              </button>
            </div>
            
            {searchResults && (
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-700 text-sm leading-relaxed">{searchResults.text}</p>
                </div>
                
                {searchResults.links.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase px-1">Sources</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {searchResults.links.map((link, idx) => (
                        <a 
                          key={idx} 
                          href={link.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all text-sm group"
                        >
                          <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold group-hover:bg-emerald-100 group-hover:text-emerald-600">{idx + 1}</span>
                          <span className="flex-1 truncate font-medium text-slate-700">{link.title || link.uri}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!searchResults && !isSearching && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">No active search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
