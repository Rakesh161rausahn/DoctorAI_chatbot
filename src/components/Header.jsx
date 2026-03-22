import React, { useState } from 'react';
import { Activity } from 'lucide-react';

const Header = () => {
  const [cssFailed, setCssFailed] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm rounded-2xl p-6 border border-slate-200 text-center relative overflow-hidden">
      {cssFailed && (
        <div className="absolute top-0 left-0 w-full bg-amber-500 text-white text-xs py-1">
          Warning: Stylings might be limited. Using local fallback.
        </div>
      )}
      <div className="flex items-center justify-center gap-3 text-blue-600 mb-2">
        <Activity className="w-8 h-8" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Disease Predictor</h1>
      </div>
      <p className="text-slate-600 text-sm md:text-base font-medium">
        Advanced AI-powered health assessment tool. Describe your symptoms to get instant predictions and recommendations.
      </p>
      <div className="mt-3 text-xs text-slate-400">
        Developed by AI Health Tech
      </div>
    </header>
  );
};

export default Header;
