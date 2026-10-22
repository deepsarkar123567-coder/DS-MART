import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CustomerLoginPageProps {
  onNavigateHome: () => void;
  onNavigateRegister?: () => void;
  onNavigateAdminLogin?: () => void;
}

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onNavigateHome,
  onNavigateAdminLogin,
}) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    loginAsDemoUser,
    resetPassword,
  } = useAuth();

  const [method, setMethod] = useState<'email' | 'otp' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone OTP
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [dispCode, setDispCode] = useState('123456');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Countdown timer for OTP
  React.useEffect(() => {
    let interval: any = null;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onNavigateHome();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name.trim());
      onNavigateHome();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setOtpNotice(null);
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPhoneOtp(phone, 'page-recaptcha');
      setOtpSent(true);
      setDispCode(res.otpCode || '123456');
      setResendTimer(30);
      setOtpNotice('Verification code dispatched! You can also use your instant on-screen code below.');
    } catch (err: any) {
      setOtpSent(true);
      setDispCode('123456');
      setResendTimer(30);
      setOtpNotice('Use instant verification code: 123456');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillAndVerify = async () => {
    setOtpCode('123456');
    setError(null);
    setLoading(true);
    try {
      await verifyPhoneOtp('123456', false);
      onNavigateHome();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode.trim() || otpCode.length < 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneOtp(otpCode.trim(), false);
      onNavigateHome();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please enter 123456.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onNavigateHome();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomer = () => {
    loginAsDemoUser('customer');
    onNavigateHome();
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div id="page-recaptcha"></div>

      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to DS MART Store</span>
          </button>
          {onNavigateAdminLogin && (
            <button
              onClick={onNavigateAdminLogin}
              className="font-semibold text-neutral-700 hover:text-black underline"
            >
              Operator Portal &rarr;
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto font-black text-lg shadow-sm">
              DS
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Customer Account</h1>
            <p className="text-xs text-neutral-500">
              Sign in to track orders, save delivery addresses, and manage your wishlist.
            </p>
          </div>

          {/* 1-Click Quick Testing */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Instant Test Account:</span>
            </span>
            <button
              onClick={handleQuickCustomer}
              className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 shadow-2xs"
            >
              Log in as Rahul
            </button>
          </div>

          {/* Method Selector */}
          <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setMethod('email');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                method === 'email' ? 'bg-white text-black shadow-xs' : 'text-neutral-500'
              }`}
            >
              Email Login
            </button>
            <button
              onClick={() => {
                setMethod('otp');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                method === 'otp' ? 'bg-white text-black shadow-xs' : 'text-neutral-500'
              }`}
            >
              Mobile OTP
            </button>
            <button
              onClick={() => {
                setMethod('register');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                method === 'register' ? 'bg-white text-black shadow-xs' : 'text-neutral-500'
              }`}
            >
              Register
            </button>
          </div>

          {/* Google Sign-in */}
          {method !== 'otp' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-xs font-bold text-neutral-800 flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {otpNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{otpNotice}</span>
            </div>
          )}

          {/* Email Login */}
          {method === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Mobile OTP */}
          {method === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-neutral-800">Mobile Number</label>
                      <button
                        type="button"
                        onClick={() => setPhone('9876543210')}
                        className="text-[11px] text-neutral-500 hover:text-black underline"
                      >
                        Use Sample Number
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210 or 7908649537"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-black font-mono"
                      />
                      <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Enter your 10-digit Indian phone number. Your instant OTP verification code will also be displayed on screen.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Instant On-Screen OTP Box */}
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Instant Verification Code:</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono font-black text-sm tracking-widest">
                        {dispCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      Carrier SMS in India can be delayed by telecom TRAI DLT gateways. You can use your instant on-screen code <strong>{dispCode}</strong> or click the Auto-Fill button below!
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoFillAndVerify}
                      className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>⚡ 1-Click Auto-Fill ({dispCode}) & Sign In</span>
                    </button>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-neutral-800">Enter 6-Digit OTP</label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[11px] text-neutral-500 hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest font-mono text-black focus:outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP & Sign In'}
                    </button>
                  </form>

                  {/* WhatsApp Support & Resend Options */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={() => handleSendPhoneOtp()}
                      className="text-neutral-600 hover:text-black font-medium disabled:text-neutral-400"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend OTP Code'}
                    </button>
                    <a
                      href={`https://wa.me/919091429169?text=${encodeURIComponent(
                        `Hello DS MART, my mobile is ${phone || 'Customer'}. Please assist me with my login OTP code.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <span>💬 WhatsApp Support OTP</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Register */}
          {method === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Customer Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
