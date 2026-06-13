import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, Package, Factory, ShoppingCart, ArrowRight, ChevronRight } from 'lucide-react';
import { Button, Input } from '../components/UI';
import api from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-gray-900">Shiv<span className="text-blue-600">Furniture</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#solution" className="hover:text-blue-600 transition-colors">Solution</a>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button onClick={() => navigate('/dashboard')} variant="primary">
              Go to Dashboard <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}>PORTAL LOGIN</Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Trusted by Shiv Furniture Works
            </div>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] text-gray-900 tracking-tighter">
              Orchestrate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Business</span> from Demand to Delivery.
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
              Stop fighting with spreadsheets. Manage Sales, Inventory, and Manufacturing in one unified, real-time operating system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={() => navigate('/signup')} className="h-14 px-8 text-lg">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4 px-6 text-gray-400 font-medium">
                 <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />)}
                 </div>
                 <span className="text-sm">Joined by 500+ Furniture Makers</span>
              </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in duration-1000">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-[3rem] blur-2xl opacity-50" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000" 
                 alt="Furniture Workshop" 
                 className="w-full h-[500px] object-cover opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
               <div className="absolute bottom-8 left-8 right-8 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Real-time Manufacturing Traceability</span>
                  </div>
                  <p className="text-2xl font-bold">"This system transformed our production efficiency by 40%."</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 text-center mb-20">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">A Complete Digital Backbone</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">Everything you need to move from manual chaos to centralized operational excellence.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Package className="text-blue-600" />} 
            title="Inventory" 
            desc="Real-time tracking of On Hand and Reserved stock with MTO automation."
          />
          <FeatureCard 
            icon={<ShoppingCart className="text-orange-600" />} 
            title="Sales" 
            desc="Streamlined order confirmation that auto-triggers procurement shortages."
          />
          <FeatureCard 
            icon={<Factory className="text-purple-600" />} 
            title="Manufacturing" 
            desc="BoM-based production orders with component consumption tracking."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-green-600" />} 
            title="Analytics" 
            desc="Full stock ledger traceability and executive KPI dashboards."
          />
        </div>
      </section>

      {/* Access Request Form */}
      <section id="solution" className="py-32 bg-white">
        <div className="max-w-3xl mx-auto px-8">
           <div className="bg-[#f1f5f9] p-12 rounded-[3rem] border border-blue-100 shadow-xl shadow-blue-50/50">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Request Portal Access</h2>
                <p className="text-gray-500 font-medium text-sm px-4">Shiv Furniture Works is a private network. Submit your details to request an employee account.</p>
              </div>
              
              <RequestForm />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-400 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="font-bold text-gray-900">Shiv Furniture Works © 2026</span>
          </div>
          <div className="flex gap-8">
             <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
             <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-10 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50 group">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
      {React.cloneElement(icon, { className: "w-7 h-7" })}
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm font-medium">{desc}</p>
  </div>
);

const RequestForm = () => {
  const [formData, setFormData] = React.useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests/submit', formData);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10 bg-green-50 rounded-3xl border border-green-100 animate-in zoom-in duration-500">
         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
         </div>
         <h3 className="text-xl font-bold text-green-900">Request Sent Successfully</h3>
         <p className="text-green-700 text-sm mt-2">The Admin will review your request and contact you via email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="grid md:grid-cols-2 gap-6">
          <Input 
            placeholder="Full Name" 
            value={formData.name}
            onChange={(e: any) => setFormData({...formData, name: e.target.value})}
            required
            className="bg-white"
          />
          <Input 
            placeholder="Email Address" 
            type="email"
            value={formData.email}
            onChange={(e: any) => setFormData({...formData, email: e.target.value})}
            required
            className="bg-white"
          />
       </div>
       <Input 
          placeholder="Company Name" 
          value={formData.company}
          onChange={(e: any) => setFormData({...formData, company: e.target.value})}
          required
          className="bg-white"
       />
       <textarea 
          placeholder="Why do you need access? (e.g. Sales Department)"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 outline-none h-32 text-sm font-medium"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
       ></textarea>
       <Button type="submit" disabled={loading} className="w-full h-14 text-lg">
          {loading ? "SUBMITTING..." : "SEND REQUEST"}
       </Button>
    </form>
  );
};

export default LandingPage;
