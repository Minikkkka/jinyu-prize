import React from 'react';

export const GameTitle: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8 transform scale-75 sm:scale-100">
      <div className="relative mb-4">
        <h1 className="font-bangers text-6xl text-white tracking-wider transform -rotate-3 text-shadow-purple drop-shadow-xl z-10 relative">
          PRIZE!
        </h1>
        <h1 className="font-bangers text-6xl text-white tracking-wider transform -rotate-3 absolute top-0 left-0 opacity-50 blur-sm">
          PRIZE!
        </h1>
      </div>
      
      <div className="flex space-x-2">
        {['T', 'I', 'M', 'E'].map((char, index) => (
          <div key={index} className="relative group">
            <div className="w-14 h-14 bg-white rounded-xl shadow-[0_4px_0_0_#b1c7fb] flex items-center justify-center transform transition-transform group-hover:-translate-y-1">
              <span className="font-paytone text-3xl text-[#5e34b9]">{char}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GameCard: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-white mb-4 text-center font-signika tracking-wide uppercase">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export const GameButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'success' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  const baseStyles = "w-full py-4 px-6 rounded-2xl font-paytone text-xl text-white shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-b from-[#ff8fa3] to-[#ff4d6d] shadow-[0_4px_0_0_#c9184a]",
    success: "bg-gradient-to-b from-[#4ade80] to-[#22c55e] shadow-[0_4px_0_0_#15803d]",
    danger: "bg-gradient-to-b from-[#f87171] to-[#ef4444] shadow-[0_4px_0_0_#b91c1c]",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const GameInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative mb-4">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`block w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 border-2 border-transparent focus:border-[#8b5cf6] rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none shadow-inner font-signika text-lg transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};
