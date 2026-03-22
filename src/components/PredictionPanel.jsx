import React from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';

const PredictionPanel = ({ onPredict, isPredicting }) => {
  return (
    <div className="bg-white border text-center border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100">
        I have enough information to provide an initial health assessment.
      </div>
      <button 
        onClick={onPredict}
        disabled={isPredicting}
        className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center justify-center gap-2 min-w-[250px]"
      >
        {isPredicting ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Analyzing...
          </>
        ) : (
          "Predict Disease"
        )}
      </button>
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mt-2">
        <ShieldAlert size={14} />
        Your data is processed securely and is strictly confidential.
      </div>
    </div>
  );
};

export default PredictionPanel;
