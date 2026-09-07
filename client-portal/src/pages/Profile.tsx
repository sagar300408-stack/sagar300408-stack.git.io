import { useState, useEffect } from 'react';
import { getOCEClient } from '../lib/sdk';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../components/Layout/ToastProvider';
import { User, Building2, FileText, MapPin, ShieldCheck, LogOut, Send } from 'lucide-react';

export default function Profile() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    role: '',
    email: '',
    company: '',
    website: '',
    industry: '',
    company_size: '',
    business_phone: '',
    business_email: '',
    description: '',
    products_services: '',
    target_market: '',
    business_model: '',
    growth_stage: '',
    business_goals: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });

  useEffect(() => {
    async function load() {
      try {
        const profile = await getOCEClient().getClientProfile();
        if (profile) {
          setForm({
            name: profile.name || '',
            role: profile.role || '',
            email: profile.email || '',
            company: profile.company || '',
            website: profile.website || '',
            industry: profile.industry || '',
            company_size: profile.company_size || '',
            business_phone: profile.business_phone || '',
            business_email: profile.business_email || '',
            description: profile.description || '',
            products_services: profile.products_services || '',
            target_market: profile.target_market || '',
            business_model: profile.business_model || '',
            growth_stage: profile.growth_stage || '',
            business_goals: profile.business_goals || '',
            address_line1: profile.address_line1 || '',
            address_line2: profile.address_line2 || '',
            city: profile.city || '',
            state: profile.state || '',
            postal_code: profile.postal_code || '',
            country: profile.country || ''
          });
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleResetPassword = async () => {
    try {
      setSendingReset(true);
      const { error } = await getOCEClient().supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: window.location.origin + '/account'
      });
      if (error) throw error;
      showToast('Check your email for the password reset link.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await getOCEClient().updateClientProfile(form);
      showToast('Your account information has been saved.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <div className="w-6 h-6 border-2 border-[#244235] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Core Layout */
        .profile-container {
          display: flex;
          min-height: calc(100vh - 72px);
          background-color: #fbfbfa;
          font-family: Calibri, 'Segoe UI', sans-serif;
        }
        .profile-content {
          flex: 1 1 65%;
          padding: 60px 80px;
          max-width: 1200px;
        }
        .profile-hero {
          flex: 1 1 35%;
          position: sticky;
          top: 72px;
          height: calc(100vh - 72px);
          background-image: url('/hero-client-account.png');
          background-size: cover;
          background-position: center;
          border-left: 1px solid #e8e8e5;
          overflow: hidden;
        }
        
        /* Editorial Caption on Right Panel */
        .hero-editorial-caption {
          position: absolute;
          bottom: 40px;
          right: 40px;
          text-align: right;
          opacity: 0.95;
        }
        .hero-editorial-caption .caption-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #244235;
          text-transform: uppercase;
          margin: 0 0 6px 0;
        }
        .hero-editorial-caption .caption-main {
          font-family: 'Lora', serif;
          font-size: 1.25rem;
          font-weight: 400;
          color: #1c1c1c;
          letter-spacing: -0.01em;
          margin: 0;
        }

        /* Typography */
        .page-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #787875;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .page-title {
          font-family: 'Lora', serif;
          font-size: 3.5rem;
          font-weight: 400;
          color: #1c1c1c;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 16px 0;
        }
        .page-subtitle {
          font-size: 18px;
          color: #4a4a4a;
          line-height: 1.6;
          margin: 0;
        }

        /* Section Cards */
        .section-form-list {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 48px;
        }
        .section-card {
          display: flex;
          gap: 48px;
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          border-radius: 12px;
          padding: 48px 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.015);
          transition: box-shadow 0.3s ease;
        }
        .section-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.03);
        }
        .section-info {
          flex: 0 0 35%;
          max-width: 35%;
        }
        .section-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f5f5f2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .section-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #787875;
          margin: 20px 0 12px 0;
        }
        .section-title {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #1c1c1c;
          margin: 0 0 12px 0;
        }
        .section-desc {
          font-size: 17px;
          color: #787875;
          line-height: 1.5;
          margin: 0;
        }
        .section-fields {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        
        /* Form Field Layouts */
        .field-row {
          display: flex;
          gap: 32px;
        }
        .field-col {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Input Styles */
        .form-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #4a4a4a;
          margin-bottom: 10px;
        }
        .form-label span.req {
          color: #a32a3f;
          font-weight: 400;
          margin-left: 2px;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          color: #1c1c1c;
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
          font-family: inherit;
          height: 46px; /* Consistent height for inputs and selects */
        }
        textarea.form-input {
          height: auto;
          min-height: 150px;
          resize: vertical;
        }
        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23787875' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        .form-input:focus {
          border-color: #244235;
          box-shadow: 0 0 0 3px rgba(36, 66, 53, 0.05);
        }
        .form-input:disabled {
          background-color: #f5f5f2;
          color: #787875;
          border-color: #e8e8e5;
          cursor: not-allowed;
        }
        .form-helper {
          font-size: 15px;
          color: #787875;
          margin: 8px 0 0 0;
        }

        /* Action Buttons */
        .btn-save {
          padding: 14px 32px;
          background-color: #244235;
          color: #ffffff;
          font-size: 16px;
          font-weight: 500;
          font-family: inherit;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .btn-save:hover:not(:disabled) {
          background-color: #1a3026;
        }
        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background-color: #ffffff;
          border: 1px solid #e8e8e5;
          color: #4a4a4a;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover:not(:disabled) {
          background-color: #f5f5f2;
          color: #1c1c1c;
          border-color: #d0d0cd;
        }
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-danger {
          color: #a32a3f;
        }
        .btn-danger:hover:not(:disabled) {
          background-color: #fff0f2;
          border-color: #ffd1d8;
          color: #8c1e2f;
        }

        /* Responsive Media Queries */
        @media (max-width: 1250px) {
          .profile-content { padding: 40px; }
          .section-card { gap: 40px; padding: 40px 32px; }
        }
        
        @media (max-width: 1024px) {
          .profile-hero { display: none; }
          .profile-content { flex: 1 1 100%; max-width: none; }
        }

        @media (max-width: 768px) {
          .profile-content { padding: 24px; }
          .page-title { font-size: 2.5rem; }
          .section-form-list { margin-top: 32px; }
          .section-card { 
            flex-direction: column; 
            gap: 24px; 
            padding: 24px; 
          }
          .section-info { flex: auto; max-width: none; }
          .field-row { flex-direction: column; gap: 24px; }
        }
      `}</style>

      <div className="profile-container">
        {/* ─── Left Side: Form Content ─── */}
        <div className="profile-content">
          
          <header>
            <p className="page-eyebrow">Account Settings</p>
            <h1 className="page-title">Your Account.</h1>
            <p className="page-subtitle">
              Manage your personal information, company details, and security preferences.
            </p>
          </header>

          <form onSubmit={save} className="section-form-list">
            
            {/* 01 PERSONAL INFORMATION */}
            <div className="section-card">
              <div className="section-info">
                <div className="section-icon">
                  <User size={16} color="#4a4a4a" />
                </div>
                <p className="section-number">01</p>
                <h3 className="section-title">PERSONAL INFORMATION</h3>
                <p className="section-desc">Your personal details and role within your organization.</p>
              </div>
              <div className="section-fields">
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. John Smith" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Job Title / Role <span className="req">*</span></label>
                    <input type="text" name="role" value={form.role} onChange={handleChange} required placeholder="e.g. Product Manager" className="form-input" />
                  </div>
                </div>
                <div className="field-col">
                  <label className="form-label">Email Address</label>
                  <input type="email" value={form.email} disabled className="form-input" />
                  <p className="form-helper">Your email address cannot be changed. Contact Originyx to update your email.</p>
                </div>
              </div>
            </div>

            {/* 02 COMPANY INFORMATION */}
            <div className="section-card">
              <div className="section-info">
                <div className="section-icon">
                  <Building2 size={16} color="#4a4a4a" />
                </div>
                <p className="section-number">02</p>
                <h3 className="section-title">COMPANY INFORMATION</h3>
                <p className="section-desc">Tell us about your company. This helps us understand your business better.</p>
              </div>
              <div className="section-fields">
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Company Name <span className="req">*</span></label>
                    <input type="text" name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Acme Technologies" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Website</label>
                    <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://www.example.com" className="form-input" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Industry</label>
                    <select name="industry" value={form.industry} onChange={handleChange} className="form-input">
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="field-col">
                    <label className="form-label">Company Size</label>
                    <select name="company_size" value={form.company_size} onChange={handleChange} className="form-input">
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Business Phone</label>
                    <input type="text" name="business_phone" value={form.business_phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Business Email</label>
                    <input type="email" name="business_email" value={form.business_email} onChange={handleChange} placeholder="info@example.com" className="form-input" />
                  </div>
                </div>
              </div>
            </div>

            {/* 03 BUSINESS DETAILS */}
            <div className="section-card">
              <div className="section-info">
                <div className="section-icon">
                  <FileText size={16} color="#4a4a4a" />
                </div>
                <p className="section-number">03</p>
                <h3 className="section-title">BUSINESS DETAILS</h3>
                <p className="section-desc">Help us understand your business, what you do, and where you're headed.</p>
              </div>
              <div className="section-fields">
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Business Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="A short description of what your company does..." className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Primary Products / Services</label>
                    <textarea name="products_services" value={form.products_services} onChange={handleChange} placeholder="Software solutions, consulting, etc..." className="form-input" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Target Market</label>
                    <input type="text" name="target_market" value={form.target_market} onChange={handleChange} placeholder="e.g. Mid-market businesses" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Business Model</label>
                    <select name="business_model" value={form.business_model} onChange={handleChange} className="form-input">
                      <option value="">Select business model</option>
                      <option value="B2B">B2B</option>
                      <option value="B2C">B2C</option>
                      <option value="B2B2C">B2B2C</option>
                      <option value="Marketplace">Marketplace</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Growth Stage</label>
                    <select name="growth_stage" value={form.growth_stage} onChange={handleChange} className="form-input">
                      <option value="">Select growth stage</option>
                      <option value="Idea">Idea</option>
                      <option value="Startup">Startup / Seed</option>
                      <option value="Growth">Growth / Scaling</option>
                      <option value="Mature">Mature</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="field-col">
                    <label className="form-label">Primary Business Goals</label>
                    <input type="text" name="business_goals" value={form.business_goals} onChange={handleChange} placeholder="e.g. Improve efficiency, expand to new markets" className="form-input" />
                  </div>
                </div>
              </div>
            </div>

            {/* 04 BUSINESS ADDRESS */}
            <div className="section-card">
              <div className="section-info">
                <div className="section-icon">
                  <MapPin size={16} color="#4a4a4a" />
                </div>
                <p className="section-number">04</p>
                <h3 className="section-title">BUSINESS ADDRESS</h3>
                <p className="section-desc">Your company's registered or primary business address.</p>
              </div>
              <div className="section-fields">
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">Address Line 1 <span className="req">*</span></label>
                    <input type="text" name="address_line1" value={form.address_line1} onChange={handleChange} required placeholder="123 Business Park" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Address Line 2</label>
                    <input type="text" name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Building A, Suite 400" className="form-input" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">City <span className="req">*</span></label>
                    <input type="text" name="city" value={form.city} onChange={handleChange} required placeholder="San Francisco" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">State / Region <span className="req">*</span></label>
                    <input type="text" name="state" value={form.state} onChange={handleChange} required placeholder="California" className="form-input" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label">PIN / Postal Code <span className="req">*</span></label>
                    <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} required placeholder="94107" className="form-input" />
                  </div>
                  <div className="field-col">
                    <label className="form-label">Country <span className="req">*</span></label>
                    <select name="country" value={form.country} onChange={handleChange} required className="form-input">
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="IN">India</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 05 SECURITY & SESSION */}
            <div className="section-card">
              <div className="section-info">
                <div className="section-icon">
                  <ShieldCheck size={16} color="#4a4a4a" />
                </div>
                <p className="section-number">05</p>
                <h3 className="section-title">SECURITY & SESSION</h3>
                <p className="section-desc">Manage your account security and session settings.</p>
              </div>
              <div className="section-fields">
                <div className="field-row">
                  <div className="field-col">
                    <label className="form-label" style={{ color: '#1c1c1c' }}>Password Reset</label>
                    <p className="form-helper" style={{ margin: '0 0 12px 0' }}>Send a secure reset link to your email address.</p>
                    <button type="button" onClick={handleResetPassword} disabled={sendingReset} className="btn-secondary">
                      <Send size={14} />
                      {sendingReset ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                  <div className="field-col">
                    <label className="form-label" style={{ color: '#1c1c1c' }}>Sign Out</label>
                    <p className="form-helper" style={{ margin: '0 0 12px 0' }}>Securely end your current session.</p>
                    <button type="button" onClick={handleSignOut} className="btn-secondary btn-danger">
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingBottom: '40px' }}>
              <button type="submit" disabled={saving} className="btn-save">
                {saving && (
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </form>
        </div>

        {/* ─── Right Side: Sticky Hero Image ─── */}
        <div className="profile-hero">
          <div className="hero-editorial-caption">
            <p className="caption-eyebrow">Originyx Workspace</p>
            <p className="caption-main">Smarter operations. Brighter growth.</p>
          </div>
        </div>
      </div>
    </>
  );
}
