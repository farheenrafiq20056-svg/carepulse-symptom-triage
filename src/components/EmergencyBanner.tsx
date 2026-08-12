import React, { useState } from 'react';
import { PhoneCall, X, ShieldAlert } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div id="emergency-alert-banner" className="bg-[#fcf2f0] border-b border-[#f0d2ce] text-[#7a2b22] px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="p-1.5 bg-[#b84a39] text-white rounded-lg shrink-0 shadow-2xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="leading-snug">
            <strong className="font-semibold text-[#662017]">Emergency Medical Warning:</strong> If you or someone with you has crushing chest pain, severe shortness of breath, sudden slurred speech, or loss of consciousness, call{' '}
            <span className="inline-flex items-center gap-1 font-bold text-[#8f2b1d] bg-[#fae2de] border border-[#f2c2ba] px-2 py-0.5 rounded-full text-xs">
              <PhoneCall className="w-3 h-3 inline" /> 911 / Local Emergency
            </span>{' '}
            immediately.
          </p>
        </div>
        <button
          id="dismiss-emergency-banner-btn"
          onClick={() => setDismissed(true)}
          className="text-[#99473b] hover:text-[#662017] p-1.5 hover:bg-[#fae2de] rounded-lg transition-colors shrink-0"
          title="Dismiss advisory"
          aria-label="Dismiss advisory"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

