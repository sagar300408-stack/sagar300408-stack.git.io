import { NavLink } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

export default function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <div className="min-h-full bg-[#f5f5f4] flex flex-col items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-[#244235]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#244235]/10">
          <Construction size={28} className="text-[#244235]" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          {description}
        </p>
        
        <div className="flex justify-center">
          <NavLink 
            to="/dashboard" 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#244235] text-white rounded-lg text-sm font-medium hover:bg-[#1a3026] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Command Center
          </NavLink>
        </div>
      </div>
    </div>
  );
}
