
import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { Student, AttendanceRecord } from '../types';
import { SuccessMessage } from '../components/SuccessMessage';

const Attendance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      setStudents(await mockApi.getStudents());
    };
    load();
  }, []);

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    for (const [studentId, status] of Object.entries(attendance)) {
      await mockApi.recordAttendance({
        student_id: parseInt(studentId),
        date,
        status: status as any
      });
    }
    setSuccessMsg('Successfully registered or saved your information to the database.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {successMsg && <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Register</h2>
          <p className="text-slate-500">Track daily student presence</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button 
            onClick={saveAttendance}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-emerald-100 transition-all"
          >
            Submit Register
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Present</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Absent</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Late</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.class_id} • {student.stream}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="radio" 
                    name={`att-${student.id}`} 
                    className="w-5 h-5 accent-emerald-500"
                    onChange={() => handleStatusChange(student.id, 'present')}
                    checked={attendance[student.id] === 'present'}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="radio" 
                    name={`att-${student.id}`} 
                    className="w-5 h-5 accent-red-500"
                    onChange={() => handleStatusChange(student.id, 'absent')}
                    checked={attendance[student.id] === 'absent'}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="radio" 
                    name={`att-${student.id}`} 
                    className="w-5 h-5 accent-amber-500"
                    onChange={() => handleStatusChange(student.id, 'late')}
                    checked={attendance[student.id] === 'late'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
