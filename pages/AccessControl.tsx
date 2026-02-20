
import React, { useState, useEffect, useRef } from 'react';
import { mockApi } from '../services/mockApi';
import { RegisteredUser, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const generateSchoolId = (role: UserRole, existingUsers: RegisteredUser[]): string => {
    const prefix = {
      [UserRole.ADMIN]: 'ADM',
      [UserRole.TEACHER]: 'TR',
      [UserRole.PARENT]: 'PR',
      [UserRole.STUDENT]: 'STU',
    }[role];
    
    let maxNum = 0;
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    existingUsers.forEach(u => {
        if(u.schoolId) {
            const match = u.schoolId.match(regex);
            if (match && parseInt(match[1]) > maxNum) {
                maxNum = parseInt(match[1]);
            }
        }
    });
    
    const sequence = (maxNum + 1).toString().padStart(3, '0');
    return `${prefix}-${sequence}`;
};

const AccessControl: React.FC = () => {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState<Partial<RegisteredUser>>({
    name: '',
    username: '',
    password: '',
    role: UserRole.TEACHER,
    schoolId: '',
    details: '',
    photo: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUsers = async () => {
    const data = await mockApi.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);
  
  useEffect(() => {
    if (isAdding && !editingId && formData.role) {
      const newId = generateSchoolId(formData.role, users);
      setFormData(prev => ({ ...prev, schoolId: newId }));
    }
  }, [isAdding, editingId, formData.role, users]);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.name) return;

    if (editingId) {
      const existingUser = users.find(u => u.id === editingId);
      if (existingUser) {
        await mockApi.updateUser({ ...existingUser, ...formData } as RegisteredUser);
      }
    } else {
      await mockApi.addUser(formData as RegisteredUser);
    }
    
    setFormData({
      name: '',
      username: '',
      password: '',
      role: UserRole.TEACHER,
      schoolId: '',
      details: '',
      photo: ''
    });
    setEditingId(null);
    setIsAdding(false);
    setSuccessMsg('User account updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
    loadUsers();
  };

  const handleEdit = (user: RegisteredUser) => {
    setFormData(user);
    setEditingId(user.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await mockApi.deleteUser(id);
      loadUsers();
    }
  };
  
  const handleAddNewClick = () => {
    if (isAdding) {
        setIsAdding(false);
        setEditingId(null);
    } else {
        const defaultRole = UserRole.TEACHER;
        const newId = generateSchoolId(defaultRole, users);
        setFormData({
            name: '',
            username: '',
            password: '',
            role: defaultRole,
            schoolId: newId,
            details: '',
            photo: ''
        });
        setIsAdding(true);
        setEditingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-slate-900">Access Control</h2>
           <p className="text-slate-500">Manage system administrators, teachers, and parent accounts</p>
        </div>
        <button
          onClick={handleAddNewClick}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          {isAdding ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-6 animate-in slide-in-from-top duration-300">
          <h3 className="text-xl font-bold text-slate-900 border-b pb-4">{editingId ? 'Edit User' : 'Create New User'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors relative group"
              >
                {formData.photo ? (
                  <>
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover rounded-full" />
                    <button 
                       onClick={handleRemovePhoto}
                       type="button"
                       className="absolute bottom-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       Remove
                     </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <span className="text-3xl text-slate-400">📷</span>
                    <p className="text-xs font-bold text-slate-500 mt-2">Upload Photo</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
                      <select 
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                         value={formData.role}
                         onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                      >
                         <option value={UserRole.ADMIN}>Administrator</option>
                         <option value={UserRole.TEACHER}>Teacher</option>
                         <option value={UserRole.PARENT}>Parent</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username / Email</label>
                      <input 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                      <input 
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Staff/Parent ID</label>
                      <input
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none font-mono"
                        value={formData.schoolId}
                        placeholder="Auto-generated"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Extra Details</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.details}
                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                        placeholder="Department, Contact, etc."
                      />
                   </div>
               </div>
            </div>
          </div>
          
          <button 
             type="submit"
             className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm"
          >
             {editingId ? 'Update Account' : 'Create Account'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">User Details</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Credentials</th>
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                   <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden">
                               {u.photo ? (
                                 <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                               ) : u.name[0]}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{u.name}</p>
                               <p className="text-xs text-slate-400 font-bold">{u.schoolId || 'N/A'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                            u.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                         }`}>
                            {u.role}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-sm font-bold text-slate-700">{u.username}</p>
                         <p className="text-xs font-mono text-slate-400">Pwd: {u.password}</p>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1 rounded-lg">Edit</button>
                         <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 px-3 py-1 rounded-lg">Delete</button>
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

export default AccessControl;
