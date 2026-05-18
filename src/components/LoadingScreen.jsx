import React from 'react';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[999] flex flex-col items-center justify-center">
    <div className="spinner mb-4"></div>
    <p className="text-slate-600 font-medium animate-pulse text-sm">
      Sinkronisasi Data MGM...
    </p>
  </div>
);

export default LoadingScreen;