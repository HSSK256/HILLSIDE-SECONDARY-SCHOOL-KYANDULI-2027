
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SchoolLogo } from '../components/SchoolLogo';

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <SchoolLogo className="w-8 h-8" />
              <span className="font-bold text-slate-900">Hillside Secondary</span>
           </Link>
           <Link to="/" className="text-sm font-bold text-slate-500 hover:text-blue-600">Back to Home</Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Contact Us</h1>
          <p className="text-lg text-slate-500">We'd love to hear from you. Here is how you can reach us.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
                📍
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Our Location</h3>
                <p className="text-slate-600 leading-relaxed">
                  Hillside Secondary School<br/>
                  Kyanduli, Bwera<br/>
                  Kasese District, Uganda
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">
                📞
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Phone & Email</h3>
                <a href="tel:+256780151137" className="text-slate-600 font-medium hover:text-blue-600 transition-colors block">
                  +256 780 151 137
                </a>
                <a href="mailto:jamesmumbere.ug@gmail.com" className="text-slate-600 font-medium mt-1 hover:text-blue-600 transition-colors block">
                  jamesmumbere.ug@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">
                🕒
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">Office Hours</h3>
                <p className="text-slate-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-slate-600">Saturday: 9:00 AM - 1:00 PM</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4">
                   ✉️
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                 <p className="text-slate-500 mt-2">Thanks for reaching out. We will get back to you shortly.</p>
                 <button onClick={() => setSent(false)} className="mt-6 text-blue-600 font-bold hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Send a Message</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label>
                    <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Subject</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>General Inquiry</option>
                      <option>Admissions</option>
                      <option>Fee Structure</option>
                      <option>Careers</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message</label>
                    <textarea required rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg">
                   Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
