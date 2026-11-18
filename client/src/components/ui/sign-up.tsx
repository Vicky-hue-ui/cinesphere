import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, Children } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, Skull, Film, Sparkles, User } from "lucide-react";
import { AnimatePresence, motion, useInView, Variants, Transition } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

// --- CONFETTI LOGIC ---
import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti";
import confetti from "canvas-confetti";

type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & { options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean }>((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const canvasRef = useCallback((node: HTMLCanvasElement) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, [globalOptions]);
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
type TextLoopProps = { children: React.ReactNode[]; className?: string; interval?: number; transition?: Transition; variants?: Variants; onIndexChange?: (index: number) => void; stopOnEnd?: boolean; };
export function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- BUILT-IN BLUR FADE ANIMATION COMPONENT ---
interface BlurFadeProps { children: React.ReactNode; className?: string; variant?: { hidden: { y: number }; visible: { y: number } }; duration?: number; delay?: number; yOffset?: number; inView?: boolean; inViewMargin?: any; blur?: string; }
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// --- BUILT-IN GLASS BUTTON COMPONENT (WITH CLICK FIX) ---
const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } });
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } });
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> { contentClassName?: string; }
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector('button');
      if (button && e.target !== button) button.click();
    };
    return (
      <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
        <button className={cn("glass-button relative z-10", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
          <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none"></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

// --- SPOOKY RED & BLACK ANIMATED 3D GRADIENT SVG BACKGROUND ---
const SpookyRedGradientBackground = () => (
  <>
    <style>{`
      @keyframes spookyFloat1 { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-25px, 20px) scale(1.1); } 100% { transform: translate(0, 0) scale(1); } }
      @keyframes spookyFloat2 { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(25px, -25px) scale(1.15); } 100% { transform: translate(0, 0) scale(1); } }
      @keyframes spookyPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.65; } }
    `}</style>
    <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id="spooky_red1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#7f1d1d', stopOpacity: 0.4 }} />
        </linearGradient>
        <linearGradient id="spooky_red2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#b91c1c', stopOpacity: 0.85 }} />
          <stop offset="50%" style={{ stopColor: '#450a0a', stopOpacity: 0.7 }} />
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0.9 }} />
        </linearGradient>
        <radialGradient id="spooky_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0 }} />
        </radialGradient>
        <filter id="spooky_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
        <filter id="spooky_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
      </defs>
      <rect width="100%" height="100%" fill="#020202" />
      <g style={{ animation: 'spookyFloat1 18s ease-in-out infinite' }}>
        <ellipse cx="220" cy="480" rx="280" ry="200" fill="url(#spooky_red1)" filter="url(#spooky_blur1)" transform="rotate(-25 220 480)" />
        <rect x="480" y="80" width="320" height="260" rx="90" fill="url(#spooky_red2)" filter="url(#spooky_blur2)" transform="rotate(20 640 210)" />
      </g>
      <g style={{ animation: 'spookyFloat2 22s ease-in-out infinite' }}>
        <circle cx="680" cy="480" r="180" fill="url(#spooky_glow)" filter="url(#spooky_blur1)" />
        <ellipse cx="80" cy="160" rx="200" ry="140" fill="#991b1b" filter="url(#spooky_blur2)" opacity="0.5" />
      </g>
    </svg>
  </>
);

// --- MODAL PROGRESS STEPS ---
const modalSteps = [
  { message: "Summoning your account...", icon: <Skull className="w-12 h-12 text-red-500 animate-pulse" /> },
  { message: "Awakening your cinematic vault...", icon: <Loader className="w-12 h-12 text-red-500 animate-spin" /> },
  { message: "Binding credentials to database...", icon: <Sparkles className="w-12 h-12 text-red-400 animate-bounce" /> },
  { message: "Welcome to Moviefy!", icon: <PartyPopper className="w-12 h-12 text-red-400" /> }
];
const TEXT_LOOP_INTERVAL = 1.3;

const DefaultLogo = () => (
  <div className="bg-red-600 text-white rounded-lg p-2 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
    <Film className="h-5 w-5" />
  </div>
);

// --- MAIN SPOOKY 3D RED & BLACK AUTH COMPONENT ---
interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
}

export const AuthComponent = ({ logo = <DefaultLogo />, brandName = "Moviefy" }: AuthComponentProps) => {
  const navigate = useNavigate();
  const { signup, googleLogin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState<"name" | "email" | "password" | "confirmPassword">("name");
  const [modalStatus, setModalStatus] = useState<'closed' | 'loading' | 'error' | 'success'>('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const confettiRef = useRef<ConfettiRef>(null);

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const fireBloodConfetti = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 100, colors: ['#dc2626', '#ef4444', '#991b1b', '#000000', '#ffffff'] };
      fire({ ...defaults, particleCount: 60, origin: { x: 0, y: 1 }, angle: 60 });
      fire({ ...defaults, particleCount: 60, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStatus !== 'closed' || authStep !== 'confirmPassword') return;

    if (password !== confirmPassword) {
      setModalErrorMessage("Passwords do not match!");
      setModalStatus('error');
      return;
    }

    setModalStatus('loading');
    try {
      // Connect to MongoDB through backend
      await signup(name.trim(), email.trim(), password);

      const totalDuration = (modalSteps.length - 1) * TEXT_LOOP_INTERVAL * 1000;
      setTimeout(() => {
        fireBloodConfetti();
        setModalStatus('success');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }, totalDuration);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (!err?.response
          ? 'Cannot reach backend server. Please make sure the backend is running on port 5000.'
          : 'Registration failed. Please check your credentials.');
      setModalErrorMessage(msg);
      setModalStatus('error');
    }
  };

  const handleProgressStep = () => {
    if (authStep === 'name') {
      if (isNameValid) setAuthStep("email");
    } else if (authStep === 'email') {
      if (isEmailValid) setAuthStep("password");
    } else if (authStep === 'password') {
      if (isPasswordValid) setAuthStep("confirmPassword");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProgressStep();
    }
  };

  const handleGoBack = () => {
    if (authStep === 'confirmPassword') {
      setAuthStep('password');
      setConfirmPassword('');
    } else if (authStep === 'password') {
      setAuthStep('email');
    } else if (authStep === 'email') {
      setAuthStep('name');
    }
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (authStep === 'email') setTimeout(() => emailInputRef.current?.focus(), 300);
    else if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 300);
    else if (authStep === 'confirmPassword') setTimeout(() => confirmPasswordInputRef.current?.focus(), 300);
  }, [authStep]);

  useEffect(() => {
    if (modalStatus === 'success') {
      fireBloodConfetti();
    }
  }, [modalStatus]);

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== 'closed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-neutral-950/95 border-2 border-red-600/70 shadow-[0_0_60px_rgba(220,38,38,0.5)] rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-4">
            {(modalStatus === 'error' || modalStatus === 'success') && (
              <button onClick={closeModal} className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
            {modalStatus === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
                <p className="text-base font-bold text-red-300 text-center">{modalErrorMessage}</p>
                <button onClick={closeModal} className="mt-4 px-6 py-2 rounded-full font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-lg transition">
                  Try Again
                </button>
              </>
            )}
            {modalStatus === 'loading' && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                {modalSteps.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    {step.icon}
                    <p className="text-sm font-bold text-neutral-200 tracking-wide">{step.message}</p>
                  </div>
                ))}
              </TextLoop>
            )}
            {modalStatus === 'success' && (
              <div className="flex flex-col items-center gap-3 text-center">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-lg font-extrabold text-white">{modalSteps[modalSteps.length - 1].message}</p>
                <p className="text-xs text-neutral-400">Redirecting to your cinematic vault...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-black text-white min-h-screen w-screen flex flex-col relative overflow-hidden select-none">
      <style>{`
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #0a0a0c inset !important; -webkit-text-fill-color: #fff !important; }
        .glass-button-wrap { transition: transform 400ms cubic-bezier(0.25, 1, 0.5, 1); transform-style: preserve-3d; }
        .glass-button-wrap:hover { transform: translateY(-2px) scale(1.02); }
        .glass-button { backdrop-filter: blur(8px); background: linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(10,10,10,0.8) 100%); border: 1px solid rgba(239,68,68,0.4); box-shadow: 0 4px 20px rgba(220,38,38,0.25); color: #fff; }
        .glass-button:hover { background: linear-gradient(135deg, rgba(239,68,68,0.35) 0%, rgba(20,20,20,0.9) 100%); border-color: rgba(239,68,68,0.8); box-shadow: 0 0 25px rgba(239,68,68,0.6); }
        .glass-input-wrap { position: relative; z-index: 2; border-radius: 9999px; transition: transform 300ms ease; }
        .glass-input-wrap:focus-within { transform: scale(1.02); }
        .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.35rem 0.5rem; backdrop-filter: blur(12px); background: rgba(15, 15, 18, 0.85); border: 1px solid rgba(220, 38, 38, 0.35); box-shadow: 0 4px 25px rgba(0,0,0,0.8), inset 0 1px 1px rgba(239,68,68,0.2); transition: all 300ms ease; }
        .glass-input-wrap:focus-within .glass-input { border-color: #ef4444; box-shadow: 0 0 25px rgba(239,68,68,0.5), inset 0 0 10px rgba(239,68,68,0.2); }
      `}</style>

      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      {/* Top Header Logo */}
      <div className="fixed top-6 left-6 z-20 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          {logo}
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 group-hover:from-red-400 group-hover:to-rose-300 transition-colors">
            {brandName}
          </h1>
        </Link>
      </div>

      {/* Main 3D Spooky Card Container */}
      <div className="flex w-full flex-1 h-full items-center justify-center relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 z-0">
          <SpookyRedGradientBackground />
        </div>

        {/* 3D Glass Morphic Spooky Centerpiece */}
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-[380px] mx-auto p-8 rounded-3xl bg-neutral-950/70 border border-red-900/40 backdrop-blur-2xl shadow-[0_20px_70px_rgba(220,38,38,0.3)]">
          <AnimatePresence mode="wait">
            {authStep === "name" && (
              <motion.div key="name-step" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center text-center gap-3">
                <BlurFade delay={0.1}><div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><Skull className="w-6 h-6 animate-pulse" /></div></BlurFade>
                <BlurFade delay={0.2}><h2 className="font-black text-3xl tracking-tight text-white">Join the Crypt</h2></BlurFade>
                <BlurFade delay={0.3}><p className="text-xs text-neutral-400">Step into the dark realm of cinema. What shall we call you?</p></BlurFade>
              </motion.div>
            )}

            {authStep === "email" && (
              <motion.div key="email-step" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center text-center gap-3">
                <BlurFade delay={0.1}><div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><Mail className="w-6 h-6" /></div></BlurFade>
                <BlurFade delay={0.2}><h2 className="font-black text-3xl tracking-tight text-white">Your Bloodline Email</h2></BlurFade>
                <BlurFade delay={0.3}><p className="text-xs text-neutral-400">Provide an email to bind your movie reviews and watchlist.</p></BlurFade>
              </motion.div>
            )}

            {authStep === "password" && (
              <motion.div key="password-step" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center text-center gap-3">
                <BlurFade delay={0.1}><div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><Lock className="w-6 h-6" /></div></BlurFade>
                <BlurFade delay={0.2}><h2 className="font-black text-3xl tracking-tight text-white">Forge a Secret Key</h2></BlurFade>
                <BlurFade delay={0.3}><p className="text-xs text-neutral-400">Must be at least 6 characters to seal your account.</p></BlurFade>
              </motion.div>
            )}

            {authStep === "confirmPassword" && (
              <motion.div key="confirm-step" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full flex flex-col items-center text-center gap-3">
                <BlurFade delay={0.1}><div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"><Sparkles className="w-6 h-6" /></div></BlurFade>
                <BlurFade delay={0.2}><h2 className="font-black text-3xl tracking-tight text-white">Seal the Pact</h2></BlurFade>
                <BlurFade delay={0.3}><p className="text-xs text-neutral-400">Confirm your secret key to complete the ritual.</p></BlurFade>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields */}
          <form onSubmit={handleFinalSubmit} className="w-full space-y-4">
            {/* NAME STEP */}
            {authStep === "name" && (
              <BlurFade delay={0.35} className="w-full">
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <User className="h-5 w-5 text-red-400 ml-2 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={name}
                      autoFocus
                      required
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-9 w-full bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none px-2"
                    />
                    {isNameValid && (
                      <button
                        type="button"
                        onClick={handleProgressStep}
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </BlurFade>
            )}

            {/* EMAIL STEP */}
            {authStep === "email" && (
              <BlurFade delay={0.1} className="w-full">
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <Mail className="h-5 w-5 text-red-400 ml-2 flex-shrink-0" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      placeholder="Email address"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-9 w-full bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none px-2"
                    />
                    {isEmailValid && (
                      <button
                        type="button"
                        onClick={handleProgressStep}
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to name
                </button>
              </BlurFade>
            )}

            {/* PASSWORD STEP */}
            {authStep === "password" && (
              <BlurFade delay={0.1} className="w-full">
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <Lock className="h-5 w-5 text-red-400 ml-2 flex-shrink-0" />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password (min. 6 chars)"
                      value={password}
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-9 w-full bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none px-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-white p-1 mr-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {isPasswordValid && (
                      <button
                        type="button"
                        onClick={handleProgressStep}
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to email
                </button>
              </BlurFade>
            )}

            {/* CONFIRM PASSWORD STEP */}
            {authStep === "confirmPassword" && (
              <BlurFade delay={0.1} className="w-full">
                <div className="glass-input-wrap w-full">
                  <div className="glass-input">
                    <Lock className="h-5 w-5 text-red-400 ml-2 flex-shrink-0" />
                    <input
                      ref={confirmPasswordInputRef}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      required
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-9 w-full bg-transparent text-white placeholder:text-neutral-500 text-sm focus:outline-none px-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-neutral-400 hover:text-white p-1 mr-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {isConfirmPasswordValid && (
                      <button
                        type="submit"
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to password
                </button>
              </BlurFade>
            )}

            {/* Quick Action Buttons for initial step */}
            {authStep === "name" && (
              <>
                <div className="flex items-center w-full gap-2 my-4">
                  <hr className="w-full border-neutral-800" />
                  <span className="text-[10px] font-bold text-neutral-500 tracking-wider">OR</span>
                  <hr className="w-full border-neutral-800" />
                </div>
                <div className="flex flex-col items-center justify-center w-full">
                  <GoogleLogin
                    onSuccess={async (res) => {
                      if (res.credential) {
                        try {
                          await googleLogin(res.credential);
                          navigate('/profile');
                        } catch (e: any) {
                          const msg =
                            e?.response?.data?.message ||
                            (!e?.response
                              ? 'Cannot reach backend server. Please verify your backend is running on Render.'
                              : 'Google sign-up failed. Please try again.');
                          setModalErrorMessage(msg);
                          setModalStatus('error');
                        }
                      }
                    }}
                    onError={() => {
                      setModalErrorMessage('Google sign-in popup closed or origin not authorized. Check Google Cloud authorized origins.');
                      setModalStatus('error');
                    }}
                    theme="filled_black"
                    shape="pill"
                    text="signup_with"
                    width="100%"
                  />
                </div>
              </>
            )}
          </form>

          {/* Footer toggle to Sign In */}
          <div className="pt-2 border-t border-neutral-900 w-full text-center">
            <p className="text-xs text-neutral-500">
              Already possess an account?{" "}
              <Link to="/login" className="text-red-400 hover:text-red-300 font-bold underline transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
