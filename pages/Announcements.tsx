
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockApi } from '../services/mockApi';
import { generateAnnouncements } from '../services/geminiService';
import { notificationService } from '../services/notificationService';
import { Announcement, User, UserRole } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const Announcements: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Auto-select today's date
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    tag: 'General' as Announcement['tag']
  });

  const loadAnnouncements = async () => {
    const data = await mockApi.getAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleGenerateDraft = async () => {
    if (!aiTopic) return;
    
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            const success = await (window as any).aistudio.openSelectKey();
            if (!success) return;
        }
    }

    setIsGenerating(true);
    try {
        const draftText = await generateAnnouncements(aiTopic);
        if (draftText) {
            // Simple parsing: first line is title, rest is content.
            const lines = draftText.split('\n');
            const title = lines[0].replace(/^#+\s*/, '').trim(); // Remove markdown heading hashes
            const content = lines.slice(1).join('\n').trim();
            setFormData(prev => ({ ...prev, title, content }));
        }
    } catch (error) {
        console.error("Failed to generate announcement draft", error);
        alert("There was an error generating the draft. Please check your connection or API key.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let colorClass = 'bg-slate-100 text-slate-700';
    switch(formData.tag) {
        case 'Exam': colorClass = 'bg-blue-100 text-blue-700'; break;
        case 'Event': colorClass = 'bg-emerald-100 text-emerald-700'; break;
        case 'Sports': colorClass = 'bg-amber-100 text-amber-700'; break;
        case 'Finance': colorClass = 'bg-red-100 text-red-700'; break;
        case 'Academic': colorClass = 'bg-indigo-100 text-indigo-700'; break;
    }

    await mockApi.addAnnouncement({
        ...formData,
        color: colorClass
    });

    // --- Notification Logic ---
    let recipientRoles: UserRole[] = [UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.ADMIN]; // Default to all
    if (formData.tag === 'Finance') {
      recipientRoles = [UserRole.PARENT, UserRole.ADMIN];
    } else if (formData.tag === 'Academic' || formData.tag === 'Exam') {
      recipientRoles = [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN];
    }

    notificationService.addNotification({
      message: `New Announcement: ${formData.title}`,
      recipientRoles: recipientRoles,
      relatedLink: '/announcements'
    });
    // --------------------------

    setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0], // Reset to today
        tag: 'General'
    });
    setAiTopic('');
    setIsAdding(false);
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
    loadAnnouncements();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await mockApi.deleteAnnouncement(id);
      loadAnnouncements();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">School Announcements</h2>
          <p className="text-slate-500">Official news and updates from Hillside Secondary School</p>
        </div>
        <div className="flex items-center gap-4">
            {currentUser.role === UserRole.ADMIN && (
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
              >
                  {isAdding ? 'Close Editor' : '+ New Announcement'}
              </button>
            )}
            <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
            Back to Dashboard
            </Link>
        </div>
      </div>

      {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-xl animate-in slide-in-from-top duration-300">
             <h3 className="font-bold text-slate-900 mb-4 border-b pb-2">Draft New Announcement</h3>
             
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
               <div className="flex flex-col sm:flex-row items-center gap-3">
                 <div className="flex-1 w-full">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                         ✨ Generate with AI
                     </label>
                     <input
                         className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                         placeholder="Enter a topic, e.g., 'upcoming sports day'"
                         value={aiTopic}
                         onChange={(e) => setAiTopic(e.target.value)}
                     />
                 </div>
                 <button
                     type="button"
                     onClick={handleGenerateDraft}
                     disabled={isGenerating || !aiTopic}
                     className="w-full sm:w-auto self-end bg-slate-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                 >
                     {isGenerating ? 'Generating...' : 'Create Draft'}
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                    <input 
                       required
                       className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                       value={formData.title}
                       onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date (Auto-Selected)</label>
                    <input 
                       type="date"
                       required
                       className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                       value={formData.date}
                       onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Category Tag</label>
                    <select 
                       className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                       value={formData.tag}
                       onChange={e => setFormData({...formData, tag: e.target.value as any})}
                    >
                        <option>General</option>
                        <option>Exam</option>
                        <option>Event</option>
                        <option>Sports</option>
                        <option>Finance</option>
                        <option>Academic</option>
                    </select>
                 </div>
             </div>
             <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Content</label>
                <textarea 
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                />
             </div>
             <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                Publish Announcement
             </button>
          </form>
      )}

      <div className="space-y-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${ann.color}`}>
                {ann.tag}
              </span>
              <div className="flex items-center gap-3">
                 <span className="text-xs text-slate-400 font-medium">{formatDate(ann.date)}</span>
                 {currentUser.role === UserRole.ADMIN && (
                   <button 
                     onClick={() => handleDelete(ann.id)}
                     className="text-slate-300 hover:text-red-500 transition-colors"
                   >
                     🗑️
                   </button>
                 )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{ann.title}</h3>
            <p className="text-slate-600 leading-relaxed">{ann.content}</p>
          </div>
        ))}
      </div>

      <div className="text-center py-12 text-slate-400">
        <p className="text-sm italic">You have reached the end of the current announcements.</p>
      </div>
    </div>
  );
};

export default Announcements;
