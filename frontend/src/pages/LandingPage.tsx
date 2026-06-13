import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Package, 
  Factory, 
  Truck, 
  CheckCircle, 
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import api from '../services/api';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in';
}

// Reusable ScrollReveal wrapper component utilizing IntersectionObserver
const ScrollReveal = ({ children, className = "", delay = 0, variant = "fade-up" }: ScrollRevealProps) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false); // Resets to trigger animations each time it enters viewport
        }
      },
      { threshold: 0.05 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'fade-up':
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        };
      case 'fade-in':
        return {
          opacity: isVisible ? 1 : 0,
        };
      case 'slide-left':
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
        };
      case 'slide-right':
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        };
      case 'scale-in':
        return {
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        };
      default:
        return {};
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...getVariantStyles(),
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

interface AnimatedCounterProps {
  endValue: string;
  duration?: number;
}

// Viewport-aware counter that runs numbers up from 0 to the target value
const AnimatedCounter = ({ endValue, duration = 1200 }: AnimatedCounterProps) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setCount(0); // Reset count when scrolled out of view
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;
    
    const numericPart = parseInt(endValue.replace(/[^0-9]/g, ''), 10) || 0;
    
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const currentCount = Math.floor(progress * numericPart);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(numericPart);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isVisible, endValue, duration]);

  const displaySuffix = endValue.includes('+') ? '+' : (endValue.includes('%') ? '%' : '');

  return (
    <span ref={ref}>
      {count}{displaySuffix}
    </span>
  );
};

// Section separator to avoid visual cuts
const SectionSeparator = () => (
  <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [scrollY, setScrollY] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Unified glassmorphism styling tokens used across all main containers
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  };

  // Custom glassmorphism without backdrop blur specifically for the Hero panel to keep the backdrop image clear
  const heroGlassStyle = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)'
  };

  return (
    <div className="min-h-screen bg-[#04112A] text-white font-sans selection:bg-[#FF7A00]/30 selection:text-white relative overflow-hidden">
      
      {/* Component Specific CSS styles for reflection shine effect */}
      <style>{`
        .glass-shine-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-100%);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 1;
        }
        .group:hover .glass-shine-overlay {
          transform: translateX(100%);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>

      {/* Decorative Glow Elements - Persistent during scroll */}
      <div className="absolute top-[-5%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#FF7A00]/10 blur-[130px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[35%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#0066FF]/6 blur-[160px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[65%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF7A00]/6 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[5%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#0066FF]/8 blur-[150px] pointer-events-none animate-pulse-slow"></div>

      {/* Continuous Background Experience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Full-page fixed background image visible everywhere */}
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{ 
            backgroundImage: "linear-gradient(180deg, rgba(4, 17, 42, 0.45) 0%, rgba(4, 17, 42, 0.65) 100%), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1800')" 
          }}
        />
        {/* Repeating Blueprint Dot Grid texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glowing vertical connect beam between elements */}
        <div className="absolute top-[25%] bottom-10 left-1/2 w-[1px] bg-gradient-to-b from-[#FF7A00]/20 via-[#0066FF]/15 to-transparent -translate-x-1/2 hidden lg:block" />
      </div>

      {/* Navbar - Premium Floating Glassmorphic Effect */}
      <nav 
        className={`fixed top-4 left-6 right-6 z-50 rounded-2xl transition-all duration-300 py-3.5 px-6 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.37)] ${
          scrolled ? 'border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]' : 'border-white/5'
        }`}
        style={glassStyle}
      >
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-[#FF7A00] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF7A00]/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Shiv<span className="text-[#FF7A00]">ERP</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-white/75 uppercase tracking-wider">
          <a href="#solutions" className="hover:text-[#FF9F43] transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-[#FF9F43] transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-5 py-2.5 rounded-lg font-bold text-xs bg-[#FF7A00] hover:bg-[#d96500] text-white shadow-md shadow-[#FF7A00]/10 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')} 
                className="px-5 py-2.5 rounded-lg font-bold text-xs text-white/80 hover:text-white hover:bg-white/5 border border-white/10 transition-all duration-300 cursor-pointer"
              >
                PORTAL LOGIN
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-lg font-bold text-xs bg-[#FF7A00] hover:bg-[#d96500] text-white shadow-md shadow-[#FF7A00]/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer uppercase tracking-wider"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - Aligned in unified max-w-7xl grid */}
      <section className="relative min-h-screen flex items-center pt-32 pb-24 z-10">
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Padded Glassmorphic panel for readability */}
          <div className="lg:col-span-7">
            <ScrollReveal variant="scale-in">
              <div 
                className="group p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] space-y-6 relative overflow-hidden transition-all duration-500 hover:border-[#FF7A00]/25"
                style={heroGlassStyle}
              >
                <div className="glass-shine-overlay" />
                <span className="text-xs font-bold text-[#FF9F43] uppercase tracking-widest block relative z-10">
                  INDUSTRIAL GRADE PRECISION
                </span>
                
                <h1 className="text-4xl md:text-6xl font-black leading-tight text-white tracking-tight relative z-10">
                  From Demand <br />
                  To <span className="text-[#FF7A00]">Delivery</span>
                </h1>
                
                <p className="text-white/75 text-xs md:text-sm leading-relaxed max-w-lg relative z-10">
                  The intelligent operating system for modern furniture manufacturing. Optimize your production floor with industrial-grade precision.
                </p>
                
                <div className="flex gap-4 pt-2 relative z-10">
                  <button 
                    onClick={() => {
                      if (isLoggedIn) {
                        navigate('/dashboard');
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                    className="px-8 py-3.5 text-xs font-bold bg-[#FF7A00] hover:bg-[#d96500] text-white rounded-lg shadow-lg shadow-[#FF7A00]/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-3.5 text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-300 cursor-pointer uppercase tracking-wider"
                  >
                    View Demo
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section - Premium Glass Cards aligned inside max-w-7xl */}
      <section className="py-12 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "500+", label: "Factories Optimized" },
            { value: "30%", label: "Cost Reduction" },
            { value: "12M+", label: "Items Managed" },
            { value: "99%", label: "On-Time Delivery" }
          ].map((item, idx) => (
            <ScrollReveal key={idx} delay={idx * 100} variant="scale-in">
              <div 
                className="group p-6 rounded-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-[1.05] hover:border-[#FF7A00]/40 hover:shadow-[#FF7A00]/10 transition-all duration-500 cursor-default relative overflow-hidden"
                style={glassStyle}
              >
                <div className="glass-shine-overlay" />
                <p className="text-3xl font-black text-[#FF7A00] relative z-10">
                  <AnimatedCounter endValue={item.value} />
                </p>
                <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest mt-2 relative z-10">{item.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <SectionSeparator />

      {/* Integrated Solutions */}
      <section id="solutions" className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <ScrollReveal variant="fade-up">
            <div className="mb-16">
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">Integrated Solutions</h2>
              <div className="w-12 h-1 bg-[#FF7A00]"></div>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <ScrollReveal delay={0} variant="fade-up">
              <div 
                className="group p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-[#FF7A00]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,122,0,0.15)] transition-all duration-500 cursor-default relative overflow-hidden"
                style={glassStyle}
              >
                <div className="glass-shine-overlay" />
                <div className="w-10 h-10 rounded bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] mb-6 group-hover:bg-[#FF7A00] group-hover:text-white transition-all duration-300 relative z-10">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 relative z-10">Inventory Management</h3>
                <p className="text-white/70 text-xs leading-relaxed relative z-10">
                  Real-time stock tracking and automated reordering to ensure production never stops.
                </p>
              </div>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal delay={150} variant="fade-up">
              <div 
                className="group p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-[#FF7A00]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,122,0,0.15)] transition-all duration-500 cursor-default relative overflow-hidden"
                style={glassStyle}
              >
                <div className="glass-shine-overlay" />
                <div className="w-10 h-10 rounded bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] mb-6 group-hover:bg-[#FF7A00] group-hover:text-white transition-all duration-300 relative z-10">
                  <Factory className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 relative z-10">Production Planning</h3>
                <p className="text-white/70 text-xs leading-relaxed relative z-10">
                  Smart scheduling and work order management to maximize equipment utilization.
                </p>
              </div>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal delay={300} variant="fade-up">
              <div 
                className="group p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-[#FF7A00]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,122,0,0.15)] transition-all duration-500 cursor-default relative overflow-hidden"
                style={glassStyle}
              >
                <div className="glass-shine-overlay" />
                <div className="w-10 h-10 rounded bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] mb-6 group-hover:bg-[#FF7A00] group-hover:text-white transition-all duration-300 relative z-10">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 relative z-10">Logistics & Delivery</h3>
                <p className="text-white/70 text-xs leading-relaxed relative z-10">
                  Fleet tracking and route optimization for seamless last-mile furniture fulfillment.
                </p>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      <SectionSeparator />

      {/* CTA Section - Aligned in max-w-7xl, continuing the design language */}
      <section id="pricing" className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <ScrollReveal variant="scale-in">
            <div 
              className="group p-8 md:p-16 rounded-2xl text-center shadow-[0_12px_45px_rgba(0,0,0,0.4)] relative overflow-hidden transition-all duration-500 hover:border-[#FF7A00]/30"
              style={glassStyle}
            >
              <div className="glass-shine-overlay" />
              {/* Radial glow effect */}
              <div className="absolute -inset-10 bg-[#FF7A00]/10 rounded-full blur-[100px] opacity-35 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight relative z-10 leading-tight">
                Ready to modernize your <br />production floor?
              </h2>
              <p className="text-white/70 text-sm max-w-2xl mx-auto leading-relaxed relative z-10">
                Join the elite circle of furniture manufacturers driving the future of the industry. Optimize workflows, coordinate craftsman talent, and ensure precision from woodshop to final delivery.
              </p>
              
              <div className="mt-10 relative z-10 flex justify-center">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-5 text-sm font-bold bg-[#FF7A00] hover:bg-[#d96500] text-white rounded-lg shadow-lg shadow-[#FF7A00]/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-3 border border-[#FF7A00]/20 hover:border-[#FF9F43]/50"
                >
                  Request a Personalized Demo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer separator */}
      <SectionSeparator />

      {/* Footer - Carrying the exact same border-top, backdrop-filters, and container alignment */}
      <footer 
        className="py-16 text-gray-400 text-xs relative z-10"
        style={{ 
          background: 'rgba(7, 10, 16, 0.45)', 
          backdropFilter: 'blur(18px)', 
          WebkitBackdropFilter: 'blur(18px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start text-white font-bold text-base mb-1">
              <div className="w-6 h-6 bg-[#FF7A00] rounded-lg flex items-center justify-center">
                <Zap className="text-white w-4 h-4 fill-current" />
              </div>
              <span>Shiv<span className="text-[#FF7A00]">ERP</span></span>
            </div>
            <p>© 2026 ShivERP. All rights reserved. Industrial Grade Precision.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 uppercase tracking-wider font-semibold text-[10px]">
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Access Request Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <RequestForm onSuccess={() => setTimeout(() => setIsModalOpen(false), 3000)} />
      </Modal>

    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative"
        style={{ 
          background: 'rgba(15, 23, 42, 0.45)', 
          backdropFilter: 'blur(20px)', 
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Soft background glow spot in modal */}
        <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] rounded-full bg-[#FF7A00]/10 blur-[50px] pointer-events-none" />
        
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.01]">
          <h3 className="text-sm font-black uppercase tracking-wider text-[#FF7A00]">Request Portal Access</h3>
          <button onClick={onClose} className="text-gray-450 hover:text-white text-2xl font-light focus:outline-none cursor-pointer">&times;</button>
        </div>
        <div className="p-6 relative z-10">{children}</div>
      </div>
    </div>
  );
};

interface RequestFormProps {
  onSuccess?: () => void;
}

const RequestForm = ({ onSuccess }: RequestFormProps) => {
  const [formData, setFormData] = React.useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests/submit', formData);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-white/10 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] focus:ring-2 focus:ring-[#FF7A00]/30 focus:border-[#FF7A00] outline-none transition-all text-white placeholder-white/40 text-xs";

  if (submitted) {
    return (
      <div className="text-center py-10 bg-[#FF7A00]/10 rounded-xl border border-[#FF7A00]/20 animate-in zoom-in duration-500">
         <div className="w-12 h-12 bg-[#FF7A00]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#FF7A00]">
            <CheckCircle className="w-6 h-6" />
         </div>
         <h3 className="text-base font-bold text-white uppercase tracking-wider">Request Submitted</h3>
         <p className="text-gray-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
           The administrator will review your access request and contact you via email shortly.
         </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
       <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 w-full">
            <input 
              type="text"
              placeholder="Full Name" 
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
              required
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <input 
              type="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
              required
              className={inputClass}
            />
          </div>
       </div>
       <div className="flex flex-col gap-1 w-full">
         <input 
            type="text"
            placeholder="Company Name" 
            value={formData.company}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, company: e.target.value})}
            required
            className={inputClass}
         />
       </div>
       <div className="flex flex-col gap-1 w-full">
         <textarea 
            placeholder="Why do you need access? (e.g. Sales Department)"
            className={`${inputClass} h-28 resize-none leading-relaxed`}
            value={formData.message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, message: e.target.value})}
            required
         ></textarea>
       </div>
       <button 
          type="submit" 
          disabled={loading} 
          className="w-full h-12 text-xs font-bold bg-[#FF7A00] hover:bg-[#d96500] disabled:opacity-50 text-white rounded-lg transition-all duration-300 shadow-md shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/20 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
       >
          {loading ? "Submitting..." : "Send Request"}
       </button>
    </form>
  );
};

export default LandingPage;
