
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="text-slate-500 text-sm font-mono font-bold flex items-center gap-2">
      <span>{time.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
      <span className="text-slate-300">|</span>
      <span>{time.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  );
};

export default Clock;
