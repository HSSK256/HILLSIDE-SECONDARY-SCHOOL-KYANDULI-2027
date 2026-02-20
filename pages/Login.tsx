
import React, { useState, useEffect } from 'react';
import { User, UserRole, RegisteredUser } from '../types';
import { mockApi } from '../services/mockApi';
import { SchoolLogo } from '../components/SchoolLogo';
import { Link } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: User) => void;
}

const WelcomeScreen: React.FC = () => {
  const imageUrl = "https://storage.googleapis.com/cropt-cloud-prod-images/da9b37c0-d3cb-4f1d-b847-f57999719323/da9b37c0-d3cb-4f1d-b847-f57999719323.jpeg";

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 font-sans animate-in fade-in duration-1000 relative"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right'
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1">
        <SchoolLogo className="w-40 h-40 mb-8" />
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider">
          Welcome to
        </h1>
        <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mt-2">
          Hillside Secondary School
        </h2>
        <p className="text-lg font-bold text-blue-200 mt-1">Kyanduli</p>

        <div className="w-full max-w-sm mt-16">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-loading-bar"></div>
          </div>
        </div>
      </div>
      <div className="relative z-10 text-center text-slate-500 font-mono text-xs pb-4">
        <p>Developed by dajames.ug256pro</p>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


const LoginForm: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState(''); // New state for student login
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [schoolId, setSchoolId] = useState(''); 
  const [extraInfo, setExtraInfo] = useState(''); 
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Handle Student Login via ID Only
    if (role === UserRole.STUDENT && !isRegistering) {
      if (!studentId) {
        setError('Please enter your Admission Number');
        return;
      }
      
      try {
        const students = await mockApi.getStudents();
        const student = students.find(s => s.admission_number.toUpperCase() === studentId.toUpperCase());
        
        if (student) {
          onLogin({
            id: student.id,
            username: student.admission_number,
            role: UserRole.STUDENT,
            name: student.name
          });
        } else {
          setError('Invalid Student ID / Admission Number');
        }
      } catch (err) {
        setError('System error. Please try again.');
      }
      return;
    }

    if (isRegistering) {
      if (!username || !password || !fullName || !schoolId) {
        setError('Please fill in all registration fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      const users = await mockApi.getUsers();
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('Username already exists');
        return;
      }

      const newUser: RegisteredUser = {
        id: Date.now(),
        username,
        password,
        role,
        name: fullName.toUpperCase(),
        schoolId,
        details: extraInfo
      };

      await mockApi.addUser(newUser);
      setSuccess('Account created successfully! Please sign in now.');
      setIsRegistering(false);
      setPassword(''); 
      setConfirmPassword('');
      setUsername(''); 
      setSchoolId('');
      setExtraInfo('');
      setFullName('');
    } else {
      const foundUser = await mockApi.verifyUser(username, password);

      if (foundUser) {
        onLogin({
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
          name: foundUser.name
        });
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const handleGoogleLogin = () => {
    const googleUser: User = {
      id: Date.now(),
      username: `google.${role.toLowerCase()}@hillside.ac.ke`,
      role: role,
      name: `Google ${role.charAt(0).toUpperCase() + role.slice(1)} User`
    };
    setSuccess('Authenticating with Google...');
    setTimeout(() => {
      onLogin(googleUser);
    }, 1500);
  };

  const inputClass = "w-full px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 relative overflow-hidden animate-in fade-in duration-500">
      {/* Navigation Back */}
      <Link to="/" className="absolute top-6 left-6 text-slate-500 font-bold text-sm hover:text-blue-600 transition-colors flex items-center gap-2 z-20">
        ← Back to School Website
      </Link>

      {/* Endless Marquee Footer */}
      <div className="absolute bottom-0 w-full bg-slate-900 py-3 overflow-hidden flex z-0">
         <div className="animate-marquee shrink-0 whitespace-nowrap text-white text-xs font-mono font-bold uppercase tracking-widest opacity-90 px-4">
           Hillside Secondary School-kyanduli • Our school motto is seek pearls and dive below • Developer dajames.ug256pro • +256780151137 •
         </div>
         <div className="animate-marquee shrink-0 whitespace-nowrap text-white text-xs font-mono font-bold uppercase tracking-widest opacity-90 px-4">
           Hillside Secondary School-kyanduli • Our school motto is seek pearls and dive below • Developer dajames.ug256pro • +256780151137 •
         </div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200 z-10 relative">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-fit">
            <SchoolLogo className="w-28 h-28" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Hillside Secondary</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            {isRegistering ? 'Create your account' : 'Access School Portal'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
               <span>✅</span> {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select User Role</label>
            <div className="grid grid-cols-4 gap-2 bg-slate-100 p-1 rounded-xl">
              {[UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setIsRegistering(false); setError(''); }}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {role === UserRole.STUDENT && !isRegistering ? (
            <div className="animate-in fade-in zoom-in duration-300 py-4">
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-center">
                 <p className="text-blue-800 text-sm font-bold">Student Portal Access</p>
                 <p className="text-blue-600 text-xs mt-1">Enter your admission number to view results.</p>
               </div>
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Admission Number</label>
               <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none text-center font-black text-lg tracking-wider shadow-sm"
                placeholder="e.g. HSS-2024-001"
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              {isRegistering && (
                <div className="space-y-4">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      placeholder="Full Name"
                      required
                    />
                    <input
                      type="text"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      className={inputClass}
                      placeholder="ID Number"
                      required
                    />
                    <input
                      type="text"
                      value={extraInfo}
                      onChange={(e) => setExtraInfo(e.target.value)}
                      className={inputClass}
                      placeholder="Class/Department"
                    />
                </div>
              )}

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="Username"
                required
              />
              
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Password"
                required
              />

              {isRegistering && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Confirm Password"
                  required
                />
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 uppercase tracking-widest text-sm"
          >
            {role === UserRole.STUDENT && !isRegistering ? 'Access Portal' : (isRegistering ? 'Register Account' : 'Secure Login')}
          </button>

          {role !== UserRole.STUDENT && (
            <div className="mt-4">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-95"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {role !== UserRole.STUDENT && (
             <div className="text-center mt-4">
               <button
                 type="button"
                 onClick={() => setIsRegistering(!isRegistering)}
                 className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide"
               >
                 {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
               </button>
             </div>
          )}
        </form>
      </div>
    </div>
  );
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <WelcomeScreen />;
  }

  return <LoginForm onLogin={onLogin} />;
};


export default Login;
