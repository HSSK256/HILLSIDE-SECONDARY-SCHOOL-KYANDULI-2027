
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { analyzeFinancialHistory } from '../services/geminiService';
import { Student, FinancialRecord, UserRole, User, FeeSummary } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

interface FinancialRecordsProps {
  role: UserRole;
  currentUser: User;
}

const FinancialRecords: React.FC<FinancialRecordsProps> = ({ role, currentUser }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [summaries, setSummaries] = useState<Record<number, FeeSummary>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<FinancialRecord[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatement, setShowStatement] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // AI Analysis State
  const [financialAnalysis, setFinancialAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Date Range Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    category: 'Tuition' as FinancialRecord['category'],
    description: '',
    type: 'credit' as 'credit' | 'debit'
  });

  const loadData = async () => {
    let studentList: Student[] = [];
    if (role === UserRole.PARENT) {
      const parent = await mockApi.getParentByUsername(currentUser.username);
      if (parent) studentList = await mockApi.getChildrenOfParent(parent.id);
    } else {
      studentList = await mockApi.getStudents();
    }
    setStudents(studentList);

    const summaryMap: Record<number, FeeSummary> = {};
    for (const s of studentList) {
      summaryMap[s.id] = await mockApi.getFeeSummary(s.id);
    }
    setSummaries(summaryMap);
  };

  useEffect(() => { loadData(); }, [currentUser, role]);

  // Effect to handle deep linking from Parent Portal
  useEffect(() => {
    if (students.length > 0) {
      const params = new URLSearchParams(location.search);
      const studentIdParam = params.get('studentId');
      const viewParam = params.get('view');

      if (studentIdParam && viewParam === 'statement') {
        const studentId = parseInt(studentIdParam, 10);
        const student = students.find(s => s.id === studentId);

        if (student) {
          // Manually set state for deep link to show statement directly
          setSelectedStudent(student);
          mockApi.getFinancialRecordsByStudent(student.id).then(tx => {
            setTransactions(tx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setShowStatement(true);
            setIsAddingPayment(false);
            setFinancialAnalysis('');
            setStartDate('');
            setEndDate('');
            // Clean URL to prevent re-triggering
            navigate('/finance', { replace: true });
          });
        }
      }
    }
  }, [students, location.search, navigate]);

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    const tx = await mockApi.getFinancialRecordsByStudent(student.id);
    setTransactions(tx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsAddingPayment(false);
    setShowStatement(false); // Default to transaction view on manual select
    setFinancialAnalysis(''); // Reset analysis
    setStartDate('');
    setEndDate('');
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    await mockApi.addFinancialRecord({
      student_id: selectedStudent.id,
      amount: paymentForm.amount,
      type: paymentForm.type,
      category: paymentForm.category,
      description: paymentForm.description || `${paymentForm.category} payment`
    });

    setPaymentForm({ amount: 0, category: 'Tuition', description: '', type: 'credit' });
    setIsAddingPayment(false);
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
    await loadData();
    const updatedTx = await mockApi.getFinancialRecordsByStudent(selectedStudent.id);
    setTransactions(updatedTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      await mockApi.deleteFinancialRecord(id);
      await loadData();
      if (selectedStudent) {
         const updatedTx = await mockApi.getFinancialRecordsByStudent(selectedStudent.id);
         setTransactions(updatedTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    }
  };
  
  const handleAnalyzeFinance = async () => {
    if (!selectedStudent) return;

    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await (window as any).aistudio.openSelectKey();
        if (!success) return;
      }
    }

    setIsAnalyzing(true);
    const summary = summaries[selectedStudent.id];
    const tx = await mockApi.getFinancialRecordsByStudent(selectedStudent.id);
    
    const result = await analyzeFinancialHistory(selectedStudent, tx, summary);
    setFinancialAnalysis(result || 'No analysis generated.');
    setIsAnalyzing(false);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    if (startDate && new Date(startDate) > txDate) return false;
    if (endDate && new Date(endDate) < txDate) return false;
    return true;
  });

  const periodBilled = filteredTransactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const periodPaid = filteredTransactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const periodBalance = periodBilled - periodPaid;

  const totalBilled = Object.values(summaries).reduce((acc: number, s: FeeSummary) => (acc as number) + (s.total_billed as number), 0);
  const totalPaid = Object.values(summaries).reduce((acc: number, s: FeeSummary) => (acc as number) + (s.total_paid as number), 0);
  const totalBalance = (totalBilled as number) - (totalPaid as number);

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showStatement && selectedStudent) {
    const summary = summaries[selectedStudent.id];
    return (
      <div className="bg-white p-12 max-w-4xl mx-auto shadow-2xl rounded-3xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-10 border-b-2 border-slate-900 pb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Hillside Secondary School</h1>
            <p className="text-slate-600 font-bold">Financial Department • Mini Statement</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">Date Generated</p>
            <p className="font-bold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student Account</p>
            <p className="text-xl font-bold">{selectedStudent.name}</p>
            <p className="text-slate-500 font-mono text-sm">{selectedStudent.admission_number}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Balance</p>
            <p className={`text-3xl font-black ${summary?.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              UGX {summary?.balance.toLocaleString()}
            </p>
          </div>
        </div>

        <table className="w-full mb-10">
          <thead className="border-y-2 border-slate-900">
            <tr>
              <th className="py-3 text-left text-xs font-bold uppercase">Date & Time</th>
              <th className="py-3 text-left text-xs font-bold uppercase">S.ID</th>
              <th className="py-3 text-left text-xs font-bold uppercase">Description</th>
              <th className="py-3 text-right text-xs font-bold uppercase">Amount (UGX)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.map(tx => (
              <tr key={tx.id}>
                <td className="py-4 text-sm font-medium text-slate-500 whitespace-nowrap">{formatDateTime(tx.date)}</td>
                <td className="py-4 text-sm font-mono text-slate-400">{tx.student_id}</td>
                <td className="py-4">
                  <p className="font-bold text-slate-800">{tx.description}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{tx.category}</p>
                </td>
                <td className={`py-4 text-right font-black font-mono ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-slate-50 p-6 rounded-2xl flex justify-between items-center print:hidden">
          <button 
            onClick={() => setShowStatement(false)}
            className="text-slate-500 font-bold hover:text-slate-900"
          >
            ← Back to Accounts
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800"
          >
            Print Statement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Financial Management</h2>
          <p className="text-slate-500">Track fee payments and student account balances</p>
        </div>
      </div>

      {role !== UserRole.PARENT && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Expected" value={`UGX ${totalBilled.toLocaleString()}`} icon="📄" color="bg-slate-800" />
          <StatCard title="Total Collected" value={`UGX ${totalPaid.toLocaleString()}`} icon="💰" color="bg-emerald-600" />
          <StatCard title="Outstanding" value={`UGX ${totalBalance.toLocaleString()}`} icon="⏳" color="bg-amber-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <input 
                placeholder="Search student..."
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white font-bold text-slate-900"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const summary = summaries[student.id];
                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center justify-between ${selectedStudent?.id === student.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{student.admission_number}</p>
                    </div>
                    {summary && (
                      <div className="text-right">
                        <p className={`text-sm font-black ${summary.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {summary.balance > 0 ? `-${summary.balance.toLocaleString()}` : 'Cleared'}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Balance</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Prominent Balance Display Card */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight">{selectedStudent.name}</h3>
                    <p className="text-slate-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      Active Account • {selectedStudent.admission_number}
                    </p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Current Outstanding Balance</p>
                    <p className={`text-4xl md:text-5xl font-black font-mono transition-all duration-500 ${summaries[selectedStudent.id]?.balance > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                      UGX {summaries[selectedStudent.id]?.balance.toLocaleString()}
                    </p>
                    {summaries[selectedStudent.id]?.balance <= 0 && (
                      <span className="inline-block text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-500/30">
                        Account Cleared
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Secondary Info Bar in the Balance Card */}
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Billed</span>
                    <span className="text-sm font-black text-slate-200">UGX {summaries[selectedStudent.id]?.total_billed.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Paid</span>
                    <span className="text-sm font-black text-slate-200">UGX {summaries[selectedStudent.id]?.total_paid.toLocaleString()}</span>
                  </div>
                  {(startDate || endDate) && (
                    <div className="flex flex-col bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/20 animate-in zoom-in">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Period Net Balance</span>
                      <span className={`text-sm font-black ${periodBalance >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        UGX {periodBalance.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowStatement(true)}
                    className="bg-white border-2 border-slate-100 text-slate-700 px-5 py-2 rounded-xl font-black hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm text-sm"
                  >
                    📄 Mini Statement
                  </button>
                  <button 
                    onClick={handleAnalyzeFinance}
                    disabled={isAnalyzing}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 text-sm disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                    ) : (
                        <>
                          <span>🤖</span> AI Risk Assessment
                        </>
                    )}
                  </button>
                  {(role === UserRole.ADMIN || role === UserRole.TEACHER) && (
                    <button 
                      onClick={() => setIsAddingPayment(!isAddingPayment)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 text-sm"
                    >
                      {isAddingPayment ? '✕ Cancel' : '+ Record Entry'}
                    </button>
                  )}
                </div>
              </div>

              {financialAnalysis && (
                <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4">
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2">
                          <span className="text-xl">🧠</span> AI Financial Insight
                      </h3>
                      <button onClick={() => setFinancialAnalysis('')} className="text-indigo-400 hover:text-indigo-700 font-bold">✕</button>
                  </div>
                  <div className="prose prose-sm prose-indigo max-w-none text-slate-700 font-medium">
                      <div className="whitespace-pre-wrap">{financialAnalysis}</div>
                  </div>
                </div>
              )}

              {isAddingPayment && (
                <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl animate-in slide-in-from-top duration-300">
                  <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-blue-400">New Ledger Entry</h4>
                  <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Type</label>
                      <div className="flex bg-slate-800 p-1.5 rounded-xl">
                        <button 
                          type="button" 
                          onClick={() => setPaymentForm({...paymentForm, type: 'credit'})}
                          className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${paymentForm.type === 'credit' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500'}`}
                        >
                          Payment (Credit)
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setPaymentForm({...paymentForm, type: 'debit'})}
                          className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${paymentForm.type === 'debit' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-500'}`}
                        >
                          Billing (Debit)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                      <select 
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
                        value={paymentForm.category}
                        onChange={e => setPaymentForm({...paymentForm, category: e.target.value as any})}
                      >
                        <option>Tuition</option>
                        <option>Uniform</option>
                        <option>Laboratory</option>
                        <option>Transport</option>
                        <option>Development</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount (UGX)</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold text-lg"
                        value={paymentForm.amount}
                        onChange={e => setPaymentForm({...paymentForm, amount: parseInt(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Internal Memo / Desc</label>
                      <input 
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-800 border-none outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
                        placeholder="e.g. Term 3 Balance, Bank Slip ref..."
                        value={paymentForm.description}
                        onChange={e => setPaymentForm({...paymentForm, description: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="md:col-span-2 bg-white text-slate-900 font-black py-4 rounded-xl hover:bg-blue-50 transition-all uppercase tracking-widest text-sm shadow-xl active:scale-95">
                      Confirm & Update Ledger
                    </button>
                  </form>
                </div>
              )}

              {/* Date Filter Bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter History:</span>
                   <div className="flex items-center gap-2 flex-1 md:flex-none">
                      <input 
                        type="date"
                        className="px-3 py-2 rounded-xl border-2 border-slate-100 font-bold text-slate-900 text-sm focus:border-blue-500 outline-none"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        placeholder="Start Date"
                      />
                      <span className="text-slate-300 font-bold">to</span>
                      <input 
                        type="date"
                        className="px-3 py-2 rounded-xl border-2 border-slate-100 font-bold text-slate-900 text-sm focus:border-blue-500 outline-none"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        placeholder="End Date"
                      />
                   </div>
                </div>
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase underline underline-offset-4"
                  >
                    Clear Filter
                  </button>
                )}
                {startDate && endDate && (
                  <div className="ml-auto text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    Showing {filteredTransactions.length} results
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Transaction Ledger</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount (UGX)</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 text-xs font-black text-slate-500 whitespace-nowrap">{formatDateTime(tx.date)}</td>
                          <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400">{tx.student_id}</td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase border border-slate-200">
                              {tx.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{tx.description}</td>
                          <td className={`px-6 py-4 text-right font-black font-mono text-base ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {role === UserRole.ADMIN && (
                              <button 
                                 onClick={() => handleDelete(tx.id)}
                                 className="text-red-500 hover:text-red-700 font-bold text-xs"
                              >
                                 Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-2 opacity-30">
                              <span className="text-4xl">🧾</span>
                              <p className="font-black text-slate-900 uppercase tracking-widest text-sm">
                                {startDate || endDate ? 'No transactions in this date range' : 'No history available'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-3xl text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50 border border-slate-100 shadow-inner">💳</div>
              <p className="font-black text-slate-300 uppercase tracking-[0.2em] text-sm">Select student to manage account</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-black/10`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default FinancialRecords;
