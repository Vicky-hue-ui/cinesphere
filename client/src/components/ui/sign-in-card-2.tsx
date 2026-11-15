import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  );
}

export function SignInCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, googleLogin } = useAuth();

  // If path is /signup, default to signup mode, else login mode
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // 3D card tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate('/profile');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (isSignUp ? 'Registration failed. Please check your details.' : 'Invalid email or password');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError('No credential received from Google');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/profile');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Google sign-in failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Try again.');
  };

  return (
    <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center py-12 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-purple-300/20 blur-[60px]"
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-purple-400/20 blur-[60px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* Animated glow spots */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 } as any}
        >
          <div className="relative group">
            {/* Card animated glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                  '0 0 15px 5px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.03)',
                ],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />

            {/* Traveling light beam border */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                animate={{ left: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ left: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' } }}
              />
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                animate={{ top: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ top: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                animate={{ right: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ right: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                animate={{ bottom: ['-50%', '100%'], opacity: [0.3, 0.7, 0.3], filter: ['blur(1px)', 'blur(2.5px)', 'blur(1px)'] }}
                transition={{ bottom: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
              />
              <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} />
              <motion.div className="absolute top-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', delay: 0.5 }} />
              <motion.div className="absolute bottom-0 right-0 h-[8px] w-[8px] rounded-full bg-white/60 blur-[2px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: 1 }} />
              <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: 'mirror', delay: 1.5 }} />
            </div>

            {/* Card border gradient on hover */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/3 via-white/7 to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Glass card body */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Logo & header */}
              <div className="text-center space-y-1 mb-5">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    🎬
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                >
                  {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 text-xs"
                >
                  {isSignUp ? 'Sign up to start saving your favourite movies' : 'Sign in to continue to Moviefy'}
                </motion.p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  {/* Name input (only for Sign Up) */}
                  {isSignUp && (
                    <motion.div
                      className={`relative ${focusedInput === 'name' ? 'z-10' : ''}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <User
                          className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                            focusedInput === 'name' ? 'text-white' : 'text-white/40'
                          }`}
                        />
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          required
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedInput('name')}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                        />
                        {focusedInput === 'name' && (
                          <motion.div
                            layoutId="input-highlight"
                            className="absolute inset-0 bg-white/5 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Email input */}
                  <motion.div
                    className={`relative ${focusedInput === 'email' ? 'z-10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail
                        className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === 'email' ? 'text-white' : 'text-white/40'
                        }`}
                      />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                      />
                      {focusedInput === 'email' && (
                        <motion.div
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Password input */}
                  <motion.div
                    className={`relative ${focusedInput === 'password' ? 'z-10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock
                        className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === 'password' ? 'text-white' : 'text-white/40'
                        }`}
                      />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        required
                        minLength={6}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                      />
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 cursor-pointer"
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                        )}
                      </div>
                      {focusedInput === 'password' && (
                        <motion.div
                          layoutId="input-highlight"
                          className="absolute inset-0 bg-white/5 -z-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Remember me & Forgot password */}
                {!isSignUp && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="appearance-none h-4 w-4 rounded border border-white/20 bg-white/5 checked:bg-white checked:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-200"
                        />
                        {rememberMe && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center text-black pointer-events-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <label htmlFor="remember-me" className="text-xs text-white/60 hover:text-white/80 transition-colors duration-200 cursor-pointer">
                        Remember me
                      </label>
                    </div>

                    <Link to="/forgot-password" className="text-xs text-white/60 hover:text-white transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-5"
                >
                  <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                  <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
                      style={{ opacity: isLoading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    />
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span key="button-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1 text-sm font-medium">
                          {isSignUp ? 'Sign Up' : 'Sign In'}
                          <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="flex items-center my-4 gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google Sign In / Sign Up */}
                <div className="w-full flex justify-center py-1">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="pill"
                    text={isSignUp ? 'signup_with' : 'signin_with'}
                    width="100%"
                  />
                </div>

                {/* Toggle Sign Up / Sign In */}
                <div className="text-center text-xs text-white/60 mt-4">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError(null);
                        }}
                        className="text-white hover:text-white/80 font-medium underline transition-colors"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError(null);
                        }}
                        className="text-white hover:text-white/80 font-medium underline transition-colors"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
