
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Student, Mark, User, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

// Payment Modal Component
const PaymentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  studentName: string;
  term: string;
}> = ({ onClose, onSuccess, studentName, term }) => {
  const [phone] = useState('0780151137'); // Pre-filled and constant
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = () => {
    setError('');
    setIsPaying(true);
    // Simulate API call to MTN and waiting for user to input PIN
    setTimeout(() => {
      onSuccess();
    }, 3000); // Simulate network delay
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-300 relative overflow-hidden">
        {isPaying ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="font-bold text-slate-800 text-lg">Awaiting Confirmation...</h3>
            <p className="text-slate-500 text-sm mt-2">
              A payment prompt of <span className="font-bold">UGX 2,500</span> has been sent to your phone. Please enter your Mobile Money PIN to approve the transaction.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border-4 border-amber-200">
                💰
              </div>
              <h2 className="text-2xl font-black text-slate-900">Unlock Report Card</h2>
              <p className="text-slate-500 text-sm mt-2">
                A one-time fee of <span className="font-bold text-slate-800">UGX 2,500</span> is required to access the report for <span className="font-bold text-slate-800">{studentName}</span> for <span className="font-bold text-slate-800">{term}</span>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm Payment Number</label>
                <input
                  type="tel"
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 outline-none font-mono font-bold text-lg text-slate-500 text-center"
                  value={phone}
                />
                {error && <p className="text-red-600 text-xs mt-1.5 ml-1">{error}</p>}
              </div>
              <button
                onClick={handlePay}
                className="w-full bg-amber-400 text-slate-900 font-black py-4 rounded-xl hover:bg-amber-500 transition-all shadow-lg shadow-amber-200 active:scale-95 flex items-center justify-center gap-3"
              >
                <span>Pay UGX 2,500 with</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MTN_Logo.svg/1024px-MTN_Logo.svg.png" alt="MTN" className="h-5" />
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">
              Payment is made to the official school number: +256780151137.
            </p>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-2xl leading-none">&times;</button>
          </>
        )}
      </div>
    </div>
  );
};


const ReportCards: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'paid' | 'unpaid'>('unpaid');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      if (currentUser.role === UserRole.PARENT) {
        const parent = await mockApi.getParentByUsername(currentUser.username);
        if (parent) setStudents(await mockApi.getChildrenOfParent(parent.id));
        else setStudents([]);
      } else {
        setStudents(await mockApi.getStudents());
      }
    };
    load();
    
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!selectedStudent) {
        setPaymentStatus('unpaid');
        return;
      }
      
      // Admins and Teachers bypass payment check
      if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.TEACHER) {
        setPaymentStatus('paid');
        const studentMarks = await mockApi.getMarksByStudent(selectedStudent.id);
        setMarks(studentMarks.filter(mark => mark.term === selectedTerm));
        return;
      }

      setPaymentStatus('checking');
      const hasPaid = await mockApi.getReportAccessStatus(selectedStudent.id, currentDateTime.getFullYear(), selectedTerm);
      setPaymentStatus(hasPaid ? 'paid' : 'unpaid');

      if (hasPaid) {
        const studentMarks = await mockApi.getMarksByStudent(selectedStudent.id);
        setMarks(studentMarks.filter(mark => mark.term === selectedTerm));
      } else {
        setMarks([]);
      }
    };
    checkPayment();
  }, [selectedStudent, selectedTerm]);

  const handleSuccessfulPayment = async () => {
    if (!selectedStudent) return;
    await mockApi.recordReportAccessPayment(selectedStudent.id, currentDateTime.getFullYear(), selectedTerm);
    setShowPaymentModal(false);
    setPaymentStatus('paid');
    setSuccessMsg('Payment successful! Report is now unlocked.');
    setTimeout(() => setSuccessMsg(''), 4000);

    // Reload marks after payment
    const studentMarks = await mockApi.getMarksByStudent(selectedStudent.id);
    setMarks(studentMarks.filter(mark => mark.term === selectedTerm));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const allStudents = await mockApi.getStudents();
    const found = allStudents.find(s => s.admission_number.toLowerCase() === searchTerm.trim().toLowerCase());
    if (found) {
      if (!students.some(s => s.id === found.id)) setStudents(prev => [found, ...prev]);
      setSelectedStudent(found);
      setSearchTerm('');
    } else alert('No student found with this Admission Number.');
  };

  const calculateGrade = (score: number) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  };

  const getMeanScore = () => {
    if (!marks.length) return 0;
    return Math.round(marks.reduce((a, b) => a + b.marks, 0) / marks.length);
  };
  
  const LockedReport: React.FC = () => (
    <div className="relative h-full min-h-[500px] flex flex-col items-center justify-center bg-white border rounded-3xl border-dashed p-8 text-center">
        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm z-10"></div>
        <div className="relative z-20">
            <p className="text-5xl mb-4">🔒</p>
            <h3 className="text-2xl font-black text-slate-900">Report Card Locked</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                This academic report is protected. A small fee is required for official viewing and printing.
            </p>
            <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
                Pay UGX 2,500 to Unlock
            </button>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      {showPaymentModal && selectedStudent && (
        <PaymentModal 
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleSuccessfulPayment}
          studentName={selectedStudent.name}
          term={selectedTerm}
        />
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Academic Report Cards</h2>
          <p className="text-slate-500">Official student performance summaries</p>
        </div>
        <div className="flex gap-4">
          <select 
            className="p-2 border rounded-xl"
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
          >
            <option>Term 1</option>
            <option>Term 2</option>
            <option>Term 3</option>
          </select>
          <button 
            onClick={() => window.print()} 
            disabled={paymentStatus !== 'paid'}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
          >
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 print:hidden">
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b space-y-3">
              <h3 className="font-bold text-slate-800">Select Student</h3>
              <form onSubmit={handleSearch} className="relative">
                <input 
                   type="text" 
                   placeholder="Enter Admission No..." 
                   className="w-full pl-3 pr-10 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 outline-none"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
                 <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                   🔍
                 </button>
              </form>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {students.length > 0 ? (
                students.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${selectedStudent?.id === s.id ? 'bg-blue-50' : ''}`}
                  >
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.admission_number}</p>
                  </button>
                ))
              ) : (
                 <div className="p-6 text-center text-sm text-slate-400">
                    <p>No students listed.</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          {!selectedStudent ? (
            <div className="h-full min-h-[500px] flex items-center justify-center bg-white border rounded-3xl border-dashed">
              <div className="text-center">
                 <p className="text-3xl mb-2">🎓</p>
                 <p className="text-slate-400 font-medium">Select a student to view their report</p>
              </div>
            </div>
          ) : paymentStatus === 'checking' ? (
            <div className="h-full min-h-[500px] flex items-center justify-center bg-white border rounded-3xl"><p>Checking access status...</p></div>
          ) : paymentStatus === 'unpaid' ? (
            <LockedReport />
          ) : (
            <div className="relative bg-white p-12 border-2 border-slate-100 rounded-3xl shadow-sm print:fixed print:inset-0 print:z-[9999] print:m-0 print:p-0 print:w-full print:h-full print:border-none print:shadow-none overflow-hidden">
              <style>{`
                @media print {
                  @page { size: A5 portrait; margin: 5mm; }
                  body { margin: 0; padding: 0; }
                }
              `}</style>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <div className="transform -rotate-45 opacity-[0.03] print:opacity-[0.05] text-center border-4 border-slate-900/20 p-8 rounded-3xl print:border-2 print:p-4">
                  <p className="text-[4rem] md:text-[6rem] leading-none font-black text-slate-900 uppercase tracking-tighter print:text-[3rem]">
                    Hillside<br/>Secondary<br/>School<br/>Kyanduli
                  </p>
                </div>
              </div>

              <div className="relative z-10 print:scale-100 print:origin-top print:h-full flex flex-col">
                <div className="text-center mb-8 border-b-2 border-slate-900 pb-6 print:mb-2 print:pb-2 print:border-b">
                  <h1 className="text-3xl font-black uppercase tracking-tighter print:text-xl print:leading-none">Hillside Secondary School</h1>
                  <p className="text-slate-600 font-bold print:text-[10px] print:mt-1">P.O BOX 513 BWERA-UGANDA • KYANDULI 1</p>
                  <h2 className="text-xl font-bold mt-4 bg-slate-900 text-white inline-block px-4 py-1 print:text-xs print:mt-1 print:px-2 print:py-0.5 print:rounded-sm">Student Progress Report</h2>
                </div>

                <div className="flex justify-between items-start mb-8 print:mb-3">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-2 print:gap-y-1 print:gap-x-4 print:text-[10px]">
                    <div className="col-span-2 space-y-1 print:space-y-0"><p className="text-xs font-bold text-slate-400 uppercase print:text-[8px]">Name of Student</p><p className="text-xl font-black print:text-base print:leading-tight">{selectedStudent.name}</p></div>
                    <div className="space-y-1 print:space-y-0"><p className="text-xs font-bold text-slate-400 uppercase print:text-[8px]">Admission Number</p><p className="text-lg font-mono font-bold print:text-xs print:leading-tight">{selectedStudent.admission_number}</p></div>
                    <div className="space-y-1 print:space-y-0"><p className="text-xs font-bold text-slate-400 uppercase print:text-[8px]">Class & Stream</p><p className="text-lg font-bold print:text-xs print:leading-tight">{selectedStudent.class_id} {selectedStudent.stream}</p></div>
                    <div className="space-y-1 print:space-y-0"><p className="text-xs font-bold text-slate-400 uppercase print:text-[8px]">Academic Period</p><p className="text-lg font-bold print:text-xs print:leading-tight">{currentDateTime.getFullYear()} - {selectedTerm}</p></div>
                    <div className="space-y-1 print:space-y-0"><p className="text-xs font-bold text-slate-400 uppercase print:text-[8px]">Report Generated</p><p className="text-lg font-bold text-slate-700 print:text-xs print:leading-tight">{currentDateTime.toLocaleDateString()} <span className="text-base text-slate-500 ml-2 font-medium print:hidden">{currentDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p></div>
                  </div>
                  
                  <div className="w-32 h-32 print:w-24 print:h-24 bg-slate-100 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                    {selectedStudent.photo ? (
                      <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-400 bg-slate-50 print:text-4xl">
                        {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                </div>


                <table className="w-full border-collapse mb-8 print:mb-3 print:text-[10px] flex-1">
                  <thead><tr className="bg-slate-100 border-2 border-slate-900 print:border"><th className="p-4 text-left font-bold uppercase text-sm print:p-1 print:text-[9px]">Subject Title</th><th className="p-4 text-center font-bold uppercase text-sm print:p-1 print:text-[9px]">Score (%)</th><th className="p-4 text-center font-bold uppercase text-sm print:p-1 print:text-[9px]">Grade</th><th className="p-4 text-left font-bold uppercase text-sm print:p-1 print:text-[9px]">Remarks</th></tr></thead>
                  <tbody className="divide-y-2 divide-slate-900 print:divide-y print:divide-slate-300">
                    {marks.length > 0 ? marks.map((m, i) => (
                      <tr key={i} className="border-x-2 border-slate-900 bg-white/50 print:border-x print:border-slate-300"><td className="p-4 font-bold print:p-1">{m.subject_id}</td><td className="p-4 text-center font-mono print:p-1">{m.marks}</td><td className="p-4 text-center font-black print:p-1">{calculateGrade(m.marks)}</td><td className="p-4 text-sm text-slate-600 italic print:p-1 print:text-[9px]">{m.marks >= 80 ? 'Excellent' : m.marks >= 60 ? 'Good' : 'Needs Improvement'}</td></tr>
                    )) : (<tr className="border-x-2 border-slate-900"><td colSpan={4} className="p-12 text-center text-slate-400 italic print:p-4">No records found for this term</td></tr>)}
                  </tbody>
                  <tfoot><tr className="bg-slate-900 text-white print:bg-slate-200 print:text-slate-900 print:border print:border-slate-900"><td className="p-4 font-bold uppercase text-sm print:p-1 print:text-[9px]">Mean Performance</td><td className="p-4 text-center font-black print:p-1 print:text-[9px]">{getMeanScore()}%</td><td className="p-4 text-center font-black print:p-1 print:text-[9px]">{calculateGrade(getMeanScore())}</td><td className="p-4 text-sm font-bold uppercase tracking-widest print:p-1 print:text-[9px]">Average</td></tr></tfoot>
                </table>

                <div className="grid grid-cols-2 gap-12 mt-auto pt-4 print:gap-4 print:mt-2">
                  <div className="border-t-2 border-slate-900 pt-4 text-center print:pt-2 print:border-t"><p className="font-bold print:text-[10px]">Class Teacher Signature</p></div>
                  <div className="border-t-2 border-slate-900 pt-4 text-center print:pt-2 print:border-t"><p className="font-bold print:text-[10px]">Principal Signature</p></div>
                </div>
                <div className="mt-8 text-center print:block hidden print:mt-2"><p className="text-[10px] text-slate-400 uppercase tracking-widest print:text-[8px]">System Generated Report • Hillside Secondary School</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCards;
