
import React from 'react';

export const SchoolLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => {
  return (
    <div className={`relative ${className} flex-shrink-0 select-none`}>
       <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        {/* Decorative Outer Rim */}
        <circle cx="100" cy="100" r="98" fill="#F59E0B" /> {/* Gold */}
        <circle cx="100" cy="100" r="95" fill="#1e3a8a" /> {/* Blue */}
        
        {/* Main Text Ring - White Background for Red Text */}
        <circle cx="100" cy="100" r="92" fill="#ffffff" />
        
        {/* Inner Border */}
        <circle cx="100" cy="100" r="62" fill="none" stroke="#F59E0B" strokeWidth="2" />
        
        {/* Inner Circle Background */}
        <circle cx="100" cy="100" r="60" fill="#1e3a8a" />

        {/* Text Paths */}
        <defs>
          {/* Top Arc: Left to Right */}
          <path id="topTextPath" d="M 25,100 A 75,75 0 0,1 175,100" />
          {/* Bottom Arc: Right to Left */}
          <path id="bottomTextPath" d="M 175,100 A 75,75 0 0,1 25,100" />
        </defs>

        {/* Top Text - HILLSIDE SECONDARY SCHOOL-KYANDULI */}
        <text fill="#DC2626" fontSize="13.5" fontWeight="normal" letterSpacing="0.5" textAnchor="middle" fontFamily="serif">
          <textPath href="#topTextPath" startOffset="50%">
            HILLSIDE SECONDARY SCHOOL-KYANDULI
          </textPath>
        </text>

        {/* Bottom Text - Seek Pearls And Dive Below */}
        <text fill="#DC2626" fontSize="12.5" fontWeight="normal" letterSpacing="0.5" textAnchor="middle" fontFamily="serif">
          <textPath href="#bottomTextPath" startOffset="50%" className="uppercase">
            Seek Pearls And Dive Below
          </textPath>
        </text>

        {/* Center Graphics */}
        <g transform="translate(100, 100)">
           {/* Subtle Starburst Background */}
           <path d="M0,-55 L5,-10 L50,-10 L10,10 L25,50 L0,20 L-25,50 L-10,10 L-50,-10 L-5,-10 Z" fill="#ffffff" opacity="0.1" />
           
           {/* Graduation Cap (Mortarboard) - Centered Above Book */}
           <g transform="translate(0, -25)">
             <path d="M-35,0 L0,-15 L35,0 L0,15 Z" fill="#1e3a8a" stroke="#F59E0B" strokeWidth="2" /> {/* Cap Top */}
             <path d="M-35,0 L-35,10 Q0,25 35,10 L35,0" fill="#1e3a8a" /> {/* Cap Base */}
             <line x1="35" y1="0" x2="35" y2="25" stroke="#F59E0B" strokeWidth="2" /> {/* Tassel Cord */}
             <circle cx="35" cy="25" r="3" fill="#F59E0B" /> {/* Tassel End */}
           </g>

           {/* Book - Centered Below Cap */}
           <text x="0" y="25" fontSize="50" textAnchor="middle" dominantBaseline="middle">📖</text>
           
           {/* Pen - Angled to the side */}
           <text x="25" y="10" fontSize="30" textAnchor="middle" dominantBaseline="middle" transform="rotate(-15)">🖊️</text>
        </g>
      </svg>
    </div>
  );
};
