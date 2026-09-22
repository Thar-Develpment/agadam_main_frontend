import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { adminSendOtp, adminResendOtp, adminResetPassword } from "../services/api";
import AadagamLogo from "../components/AadagamLogo";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Multi-step flow: 1 = Email, 2 = OTP & New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [remainingResends, setRemainingResends] = useState(3);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  const otpInputRefs = useRef([]);

  // 5-minute Countdown Timer for Step 2
  useEffect(() => {
    let interval = null;
    if (step === 2 && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, countdown]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    const res = await adminSendOtp(cleanEmail);
    setIsLoading(false);

    if (res && res.status === 1) {
      setStep(2);
      setCountdown(300);
      setSuccessToast("6-digit verification OTP has been sent to your email!");
      setTimeout(() => setSuccessToast(""), 4000);
      // Focus first OTP box
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);
    } else {
      setErrorMessage(res?.message || "Email address not found or failed to generate OTP.");
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (remainingResends <= 0 || isResending) return;
    setErrorMessage("");

    setIsResending(true);
    const res = await adminResendOtp(email.trim());
    setIsResending(false);

    if (res && res.status === 1) {
      setCountdown(300);
      setOtp(["", "", "", "", "", ""]);
      if (typeof res.remainingResends === "number") {
        setRemainingResends(res.remainingResends);
      } else {
        setRemainingResends((prev) => Math.max(0, prev - 1));
      }
      setSuccessToast(res.message || "Fresh 6-digit OTP resent to your email!");
      setTimeout(() => setSuccessToast(""), 4000);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } else {
      setErrorMessage(res?.message || "Failed to resend OTP. Please try again later.");
    }
  };

  // OTP Box Handlers
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input box if digit entered
    if (digit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    if (otpInputRefs.current[nextIndex]) {
      otpInputRefs.current[nextIndex].focus();
    }
  };

  const fullOtp = otp.join("");
  const isOtpComplete = fullOtp.length === 6;

  // Step 3: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your new password.");
      return;
    }

    if (countdown <= 0) {
      setErrorMessage("OTP has expired. Please click 'Resend Code' to receive a new OTP.");
      return;
    }

    setIsLoading(true);
    const res = await adminResetPassword(email.trim(), fullOtp, newPassword.trim());
    setIsLoading(false);

    if (res && res.status === 1) {
      setStep(3);
    } else {
      setErrorMessage(res?.message || "Failed to reset password. Please check your OTP and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 text-stone-900 selection:bg-[#783bf0] selection:text-white relative">
      {/* Back to Login Button */}
      <Link
        to="/admin"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#783bf0] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sign In</span>
      </Link>

      <div className="max-w-md w-full space-y-6 bg-white border border-stone-200/90 rounded-[28px] p-6 sm:p-8 shadow-xl shadow-stone-900/5 relative">
        {/* Brand Icon and Header */}
        <div className="text-center flex flex-col items-center">
          <AadagamLogo
            variant="stacked"
            size="sm"
            iconClassName="w-10 h-10 sm:w-12 sm:h-12"
            theme="light"
            className="mb-2"
          />

          <h2 className="font-serif text-2xl font-bold text-black tracking-wide">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Reset Your Password"}
            {step === 3 && "Password Reset Complete"}
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            {step === 1 && "Enter your registered showroom email to receive a 6-digit verification code."}
            {step === 2 && `Enter the 6-digit code sent to ${email} and choose a new password.`}
            {step === 3 && "Your showroom password has been successfully updated. You can now log in."}
          </p>
        </div>

        {/* Success Toast / Alert */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-fade-in shadow-xs">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* ===================================================================
         * STEP 1: ENTER REGISTERED EMAIL
         * =================================================================== */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="e.g. manager@yourbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-4 px-6 rounded-2xl text-sm tracking-wider uppercase transition-all shadow-md shadow-[#783bf0]/20 hover:shadow-xl hover:shadow-[#783bf0]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </form>
        )}

        {/* ===================================================================
         * STEP 2: ENTER OTP & NEW PASSWORD
         * =================================================================== */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 pt-1 text-left">
            {/* 6-Digit OTP Box Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", "", "", ""]);
                    setErrorMessage("");
                  }}
                  className="text-[11px] text-[#783bf0] hover:underline font-medium cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold bg-stone-50 border border-stone-300 rounded-2xl focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all shadow-inner"
                    required
                  />
                ))}
              </div>

              {/* Timer and Resend Row */}
              <div className="flex items-center justify-between pt-1 text-xs text-stone-500">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className={`w-2 h-2 rounded-full ${countdown > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span>
                    {countdown > 0 ? (
                      `Expires in ${formatTime(countdown)}`
                    ) : (
                      <span className="text-rose-600 font-semibold">Code expired</span>
                    )}
                  </span>
                </div>

                <div>
                  {remainingResends > 0 ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResending || countdown > 240}
                      className="inline-flex items-center gap-1 text-[#783bf0] hover:underline font-bold disabled:opacity-40 disabled:hover:no-underline cursor-pointer"
                    >
                      {isResending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                      <span>
                        Resend Code ({remainingResends} left)
                      </span>
                    </button>
                  ) : (
                    <span className="text-stone-400 text-[11px]">Resend limit reached</span>
                  )}
                </div>
              </div>
            </div>

            {/* New Password Section (Rendered once OTP starts being entered) */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  New Password (Min. 8 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new secure password"
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-stone-50/50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 bg-stone-50/50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Reset Password Button */}
            <button
              type="submit"
              disabled={isLoading || !isOtpComplete || newPassword.length < 8 || newPassword !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-4 px-6 rounded-2xl text-sm tracking-wider uppercase transition-all shadow-md shadow-[#783bf0]/20 hover:shadow-xl hover:shadow-[#783bf0]/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        {/* ===================================================================
         * STEP 3: SUCCESS STATE
         * =================================================================== */}
        {step === 3 && (
          <div className="space-y-6 pt-2 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Password Reset Successful!
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Your new showroom admin password is now active. You can sign in to your dashboard with your updated credentials.
              </p>
            </div>

            <Link
              to="/admin"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-4 px-6 rounded-2xl text-sm tracking-wider uppercase transition-all shadow-md shadow-[#783bf0]/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Proceed to Sign In</span>
            </Link>
          </div>
        )}

        {/* Footer Link Back to Sign In */}
        {step !== 3 && (
          <div className="text-center text-xs text-stone-500 pt-4 border-t border-stone-100">
            <span>Remembered your credentials? </span>
            <Link to="/admin" className="text-[#783bf0] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
