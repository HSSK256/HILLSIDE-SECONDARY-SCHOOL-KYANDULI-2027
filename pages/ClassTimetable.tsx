
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { TeacherAssignment } from '../types';

interface AssignmentWithTeacher extends TeacherAssignment {
  teacherName: string;
}

const ClassTimetable: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('S.4A');
  const [timetable, setTimetable] = useState<Record<string, Record<string, AssignmentWithTeacher>>>({});
  const [loading, setLoading] = useState(true);

  // Time slots and Days configuration matches StaffManagement
  const timeSlots = ["08:00 - 09:20", "09:20 - 10:40", "11:00 - 12:20", "14:00 - 15:20", "15:20 - 16:40"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  const classOptions = [
    "S.1A", "S.1B", "S.2A", "S.2B", "S.3A", "S.3B",
    "S.4A", "S.4B", "S.5 ARTS", "S.5 SCI", "S.6 ARTS", "S.6 SCI"
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      const teachers = await mockApi.getTeachers();
      
      // Build timetable map: Day -> Time -> Assignment
      const map: Record<string, Record<string, AssignmentWithTeacher>> = {};
      
      teachers.forEach(teacher => {
        if (teacher.assignments) {
          teacher.assignments.forEach(assignment => {
            if (assignment.classId === selectedClass) {
              if (!map[assignment.day]) map[assignment.day] = {};
              
              // Normalize times to match the fixed slots if they are slightly different in DB
              // For now assuming strict match or just mapping by string equality
              map[assignment.day][assignment.time] = { 
                ...assignment, 
                teacherName: teacher.name 
              }; 
            }
          });
        }
      });
      
      setTimetable(map);
      setLoading(false);
    };
    
    fetchTimetable();
  }, [selectedClass]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Class Timetables</h2>
          <p className="text-slate-500">View weekly schedules for specific classes</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center">
             <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Select Class:</span>
             <select 
               value={selectedClass}
               onChange={(e) => setSelectedClass(e.target.value)}
               className="p-2 outline-none font-bold text-slate-900 bg-transparent cursor-pointer"
             >
               {classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
             </select>
           </div>
           <button 
             onClick={handlePrint}
             className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
           >
             🖨️ Print
           </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:p-0 print:border-none print:shadow-none">
         <div className="mb-6 text-center border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Weekly Timetable</h3>
            <p className="text-blue-600 font-bold text-lg">{selectedClass} Class Schedule</p>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                 <tr>
                   <th className="p-4 border bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest w-32">Time / Day</th>
                   {days.map(day => (
                     <th key={day} className="p-4 border bg-slate-50 text-xs font-black text-slate-800 uppercase tracking-widest">
                       {day}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {timeSlots.map(time => (
                   <tr key={time}>
                     <td className="p-4 border bg-slate-50/50 text-xs font-bold text-slate-500 text-center font-mono whitespace-nowrap">
                       {time}
                     </td>
                     {days.map(day => {
                       const session = timetable[day]?.[time];
                       return (
                         <td key={`${day}-${time}`} className="p-2 border h-24 align-top w-1/5 hover:bg-slate-50 transition-colors">
                           {session ? (
                             <div className="h-full bg-blue-50 rounded-xl p-3 border border-blue-100 flex flex-col justify-between group">
                                <div>
                                  <p className="font-black text-slate-900 text-sm">{session.subject}</p>
                                  <p className="text-xs text-blue-600 font-bold mt-1">{session.teacherName}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                   <span className="text-[10px] bg-white px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-wider border border-blue-100">
                                     {session.room || 'Room TBA'}
                                   </span>
                                </div>
                             </div>
                           ) : (
                             <div className="h-full flex items-center justify-center text-slate-300 text-xs font-medium italic">
                               - Free -
                             </div>
                           )}
                         </td>
                       );
                     })}
                   </tr>
                 ))}
                 <tr>
                   <td className="p-4 border bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest">Break / Lunch</td>
                   <td colSpan={5} className="p-4 border text-center text-sm font-bold text-slate-400 italic bg-slate-50/30">
                     Standard break times apply: 10:40 - 11:00 (Break) and 12:20 - 14:00 (Lunch)
                   </td>
                 </tr>
               </tbody>
            </table>
         </div>

         <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400 font-medium print:mt-4">
            <p>Generated by Hillside School Management System</p>
            <p>Effective from: Term 1, 2024</p>
         </div>
      </div>
    </div>
  );
};

export default ClassTimetable;
