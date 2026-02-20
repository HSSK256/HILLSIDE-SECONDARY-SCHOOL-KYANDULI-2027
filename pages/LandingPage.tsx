
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SchoolLogo } from '../components/SchoolLogo';

export const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
               <SchoolLogo className="w-10 h-10" />
               <div className="leading-tight hidden sm:block">
                 <h1 className="font-bold text-lg text-slate-900">Hillside Secondary</h1>
                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Kyanduli</p>
               </div>
             </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
             <Link to="/" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
             <Link to="/admissions" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Admissions</Link>
             <Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Contact Us</Link>
             
             {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>📲</span> Install App
                </button>
             )}

             <Link to="/login" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 text-sm flex items-center gap-2">
               <span>🔒</span> Access Portal
             </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl">
             <Link to="/" className="block text-sm font-bold text-slate-600 hover:text-blue-600">Home</Link>
             <Link to="/admissions" className="block text-sm font-bold text-slate-600 hover:text-blue-600">Admissions</Link>
             <Link to="/contact" className="block text-sm font-bold text-slate-600 hover:text-blue-600">Contact Us</Link>
             
             {deferredPrompt && (
                <button 
                  onClick={handleInstallClick}
                  className="block w-full text-left text-sm font-bold text-emerald-600 hover:text-emerald-700"
                >
                  📲 Install App
                </button>
             )}

             <Link to="/login" className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">
               Access Portal
             </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
         {/* Animated Background Blobs */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-1000"></div>
            <div className="absolute -bottom-24 left-1/2 w-96 h-96 bg-emerald-500 rounded-full blur-3xl mix-blend-multiply animate-pulse delay-2000"></div>
         </div>
         
         <div className="relative max-w-7xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 shadow-lg shadow-blue-900/20 backdrop-blur-sm">
               ✨ Welcome to Excellence
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6">
               Seek Pearls and <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Dive Below</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 font-medium">
               Hillside Secondary School - Kyanduli is committed to nurturing holistic students through academic rigor, discipline, and co-curricular excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10">
               <Link to="/admissions" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all text-lg shadow-xl shadow-white/10 active:scale-95">
                  Apply for Admission
               </Link>
               <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold rounded-2xl border-2 border-slate-700 hover:bg-slate-800/50 hover:border-slate-500 transition-all text-lg active:scale-95">
                  Contact School
               </Link>
            </div>
         </div>
      </div>

      {/* Marquee */}
      <div className="bg-blue-600 py-3 overflow-hidden flex relative z-20 shadow-xl">
        <div className="animate-marquee shrink-0 whitespace-nowrap text-white text-xs font-mono font-bold uppercase tracking-widest opacity-90 px-4">
          Hillside Secondary School-Kyanduli • Admissions Open for 2024 • Excellence in Sciences and Arts • Contact: +256780151137 / jamesmumbere.ug@gmail.com •
        </div>
        <div className="animate-marquee shrink-0 whitespace-nowrap text-white text-xs font-mono font-bold uppercase tracking-widest opacity-90 px-4">
          Hillside Secondary School-Kyanduli • Admissions Open for 2024 • Excellence in Sciences and Arts • Contact: +256780151137 / jamesmumbere.ug@gmail.com •
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-white relative">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black text-slate-900 mb-4">Why Choose Hillside?</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">We provide a supportive environment where every student can achieve their full potential.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <FeatureCard 
                 icon="🎓" 
                 title="Academic Excellence" 
                 desc="Consistently top-performing in UNEB examinations with a focus on Sciences and Arts. Our curriculum is designed to challenge and inspire." 
               />
               <FeatureCard 
                 icon="🏆" 
                 title="Sports & Talent" 
                 desc="Nurturing talent in football, athletics, and music dance & drama. We believe in building character through competitive sports." 
               />
               <FeatureCard 
                 icon="🔬" 
                 title="Modern Facilities" 
                 desc="Fully equipped science laboratories, modern computer rooms for digital learning, and spacious library resources." 
               />
            </div>
         </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem number="1,200+" label="Happy Students" />
            <StatItem number="98%" label="Pass Rate" />
            <StatItem number="45+" label="Qualified Teachers" />
            <StatItem number="25" label="Years of Excellence" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-white rounded-full">
                 <SchoolLogo className="w-12 h-12" />
               </div>
               <div className="text-left">
                  <p className="font-bold text-white text-lg">Hillside Secondary School</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kyanduli, Bwera-Uganda</p>
               </div>
            </div>
            <div className="text-center md:text-right text-sm font-medium space-y-2">
               <p className="text-white">© 2024 Hillside Secondary School. All rights reserved.</p>
               <p className="opacity-60">
                 Developer: dajames.ug256pro • 
                 <a href="tel:+256780151137" className="hover:text-white transition-colors"> +256780151137</a>
               </p>
               <div className="flex gap-4 justify-center md:justify-end mt-4">
                  <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                  <Link to="/admissions" className="hover:text-white transition-colors">Admissions</Link>
                  <Link to="/login" className="hover:text-white transition-colors">Staff Login</Link>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
   <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group hover:-translate-y-1">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
   </div>
);

const StatItem = ({ number, label }: any) => (
  <div>
    <p className="text-4xl font-black text-slate-900 mb-2">{number}</p>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

export default LandingPage;
