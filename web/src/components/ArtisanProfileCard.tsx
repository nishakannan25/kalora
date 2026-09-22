import React from 'react';
import { Award, ShieldCheck, MapPin, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface ArtisanProfileCardProps {
  artisanName: string;
  craftRole?: string;
  experienceYears?: number;
  location?: string;
  giTagStatus?: string;
  awards?: string[];
  bio?: string;
}

export const ArtisanProfileCard: React.FC<ArtisanProfileCardProps> = ({
  artisanName = 'Lakshmi Ammal',
  craftRole = 'Master Silk Weaver',
  experienceYears = 28,
  location = 'Kanchipuram, Tamil Nadu',
  giTagStatus = 'Registered GI Heritage Artisan',
  awards = ['National Handloom Award (2018)', 'State Craft Excellence Badge'],
  bio = 'Inherited the centuries-old Korvai silk weaving technique from her grandfather. Dedicated to preserving authentic mulberry silk craft.'
}) => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-2xl bg-terracotta-600 text-white font-serif font-bold text-2xl flex items-center justify-center shadow-md">
            {artisanName.charAt(0)}
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center space-x-2">
              <span>{artisanName}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-terracotta-700 font-semibold text-xs">{craftRole}</p>
          </div>
        </div>

        <span className="bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-amber-800" />
          <span>GI Verified</span>
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
        <div className="bg-white/80 border border-amber-100 p-2.5 rounded-2xl flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="text-stone-500 text-[10px] block">Experience</span>
            <span className="font-bold text-stone-900">{experienceYears} Years Master Craft</span>
          </div>
        </div>

        <div className="bg-white/80 border border-amber-100 p-2.5 rounded-2xl flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
          <div>
            <span className="text-stone-500 text-[10px] block">Origin Region</span>
            <span className="font-bold text-stone-900">{location}</span>
          </div>
        </div>
      </div>

      {/* Awards & Recognition */}
      {awards && awards.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Honors & Recognitions</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {awards.map((award, idx) => (
              <span key={idx} className="bg-white border border-amber-300 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-xl">
                🏆 {award}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      <p className="text-stone-600 text-xs italic bg-white/50 p-3 rounded-2xl border border-amber-100 leading-relaxed">
        "{bio}"
      </p>
    </div>
  );
};
