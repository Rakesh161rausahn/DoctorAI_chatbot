import React from 'react';
import { Share2, Printer, MapPin, RefreshCw } from 'lucide-react';

const ActionButtons = ({ onReset, result }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Health Assessment Result',
          text: 'Check out my health assessment result from AI Disease Predictor.',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  const handleFindDoctor = () => {
    const specialistType = result?.recommendedSpecialist?.type || 'Doctor';
    const query = encodeURIComponent(`${specialistType} near me`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  return (
    <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200">
      <button onClick={handlePrint} className="flex-1 min-w-[120px] bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
        <Printer size={18} /> Print Report
      </button>
      <button onClick={handleShare} className="flex-1 min-w-[120px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
        <Share2 size={18} /> Share
      </button>
      <button onClick={handleFindDoctor} className="flex-1 min-w-[120px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
        <MapPin size={18} /> Find Doctor
      </button>
      <button onClick={onReset} className="flex-1 min-w-[120px] bg-red-50 hover:bg-red-100 text-red-700 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
        <RefreshCw size={18} /> New Assessment
      </button>
    </div>
  );
};

export default ActionButtons;
