
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SchoolLogo } from '../components/SchoolLogo';

const Admissions: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <SchoolLogo className="w-8 h-8" />
              <span className="font-bold text-slate-900">Hillside Secondary</span>
           </Link>
           <Link to="/" className="text-sm font-bold text-slate-500 hover:text-blue-600">Back to Home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-slate-900 mb-4">Join Our Community</h1>
           <p className="text-lg text-slate-500">
             Admission applications for the 2025 Academic Year are now open. 
             Complete the form below to start your journey at Hillside Secondary School.
           </p>
        </div>

        {submitted ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-blue-100 text-center animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
               ✅
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Application Received!</h2>
             <p className="text-slate-500 mb-8 max-w-md mx-auto">
               Thank you for applying to Hillside Secondary School. Our admissions team will review your details and contact you within 5 business days.
             </p>
             <Link to="/" className="inline-block bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors">
               Return Home
             </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 space-y-8">
             <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest border-b pb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">First Name</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Last Name</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date of Birth</label>
                      <input type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gender</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                         <option>Male</option>
                         <option>Female</option>
                      </select>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest border-b pb-2">Academic History</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Previous School Attended</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PLE / UCE Aggregate</label>
                         <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 12" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Class Applying For</label>
                         <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>Senior 1</option>
                            <option>Senior 2</option>
                            <option>Senior 3</option>
                            <option>Senior 5 (Arts)</option>
                            <option>Senior 5 (Sciences)</option>
                         </select>
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest border-b pb-2">Guardian Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Guardian Name</label>
                      <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                      <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                      <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                   </div>
                </div>
             </div>

             <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 uppercase tracking-widest">
                Submit Application
             </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Admissions;
