import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, Zap, Calendar, BarChart2, FileText, ArrowRight
} from 'lucide-react';

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-[13px] text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  // If already logged in and authorized, redirect to dashboard
  useEffect(() => {
    if (user && (role === 'owner' || role === 'admin')) {
      navigate('/dashboard');
    }
  }, [user, role, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !pass) return;
    
    setLoading(true);
    setError('');
    
    try {
      const sdk = getOCEClient();
      await sdk.signIn(email, pass);
      // AuthContext will automatically pick up the session change 
      // and redirect via the useEffect above.
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fa] font-sans">
      
      {/* Left Side - Brand Area */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-14 relative overflow-hidden bg-white">
        {/* Subtle background abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gray-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col h-full max-w-lg">
          {/* Top Logo */}
          <div className="mb-16 flex items-center gap-3">
            <img src="/admin/logo.png" alt="Originyx Icon" className="h-10 w-auto object-contain" />
            <img src="/admin/brand.png" alt="Originyx Brand" className="h-6 w-auto object-contain" />
          </div>

          {/* Headline section */}
          <div className="mb-6 relative z-10">
            <p className="text-[11px] font-bold tracking-[0.25em] text-gray-500 mb-4 uppercase">O R I G I N Y X</p>
            <h1 className="text-5xl font-black text-[#1a2b22] mb-3 tracking-tight">Content Engine</h1>
            <p className="text-lg text-gray-500 font-medium tracking-wide">Create • Automate • Publish • Grow</p>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-12 relative z-10">
            Your centralized workspace to plan, create, automate and manage content across platforms.
          </p>

          {/* Features List */}
          <div className="space-y-6 mb-12 relative z-10">
            <FeatureItem 
              icon={<FileText size={20} className="text-[#244235]" />} 
              title="Plan Better" 
              desc="Organize ideas and campaigns" 
            />
            <FeatureItem 
              icon={<Zap size={20} className="text-[#244235]" />} 
              title="Create Faster" 
              desc="Use AI to generate content" 
            />
            <FeatureItem 
              icon={<Calendar size={20} className="text-[#244235]" />} 
              title="Automate Publishing" 
              desc="Schedule across platforms" 
            />
            <FeatureItem 
              icon={<BarChart2 size={20} className="text-[#244235]" />} 
              title="Track Performance" 
              desc="Measure what works" 
            />
          </div>

          {/* Footer text */}
          <div className="mt-auto relative z-10">
            <p className="text-sm font-semibold text-gray-900">Built by Originyx</p>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">Business Automation Companies, India</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[460px] bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
          
          <div className="text-center mb-8">
            <img src="/admin/logo.png" alt="Originyx Icon" className="h-12 mx-auto mb-3 object-contain" />
            <img src="/admin/brand.png" alt="Originyx Brand" className="h-5 mx-auto mb-6 object-contain" />
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Originyx Content Engine</h2>
            <p className="text-sm text-gray-500">Sign in to your workspace</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input 
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#244235] focus:ring-1 focus:ring-[#244235]/20 transition-all placeholder-gray-400"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type={showPass ? "text" : "password"} 
                  value={pass} 
                  onChange={e => setPass(e.target.value)} 
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#244235] focus:ring-1 focus:ring-[#244235]/20 transition-all placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-300 bg-white group-hover:border-[#244235] transition-colors">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="absolute inset-0 bg-[#244235] rounded hidden peer-checked:flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-[13px] font-medium text-gray-700">Keep me signed in</span>
              </label>
              <a href="#" className="text-[13px] font-semibold text-[#244235] hover:underline">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#182d24] text-white px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-[#11211a] transition-colors disabled:opacity-70 flex justify-center items-center group relative overflow-hidden mt-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-700 ease-in-out transition-transform" />
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight size={16} className="absolute right-4 text-white/70 group-hover:text-white transition-colors" />}
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-gray-500">
            New to Originyx Content Engine? <a href="#" className="font-semibold text-[#244235] hover:underline">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
}
