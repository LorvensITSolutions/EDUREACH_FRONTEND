import { useState, useRef, useEffect } from "react";
import { Phone, Loader2, RefreshCw } from "lucide-react";
import { useSMS2FAStore } from "../stores/useSMS2FAStore";
import { useUserStore } from "../stores/useUserStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const SMS2FAVerify = ({ userId, userEmail, userPassword, phoneMasked, onSuccess, onCancel }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [rememberDevice, setRememberDevice] = useState(false);
  const inputRefs = useRef([]);
  const { verifySMS2FACode, sendSMS2FACode, loading } = useSMS2FAStore();
  const { getProfile } = useUserStore();
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        if (digits.length === 6) {
          inputRefs.current[5]?.focus();
        } else if (digits.length > 0) {
          inputRefs.current[digits.length]?.focus();
        }
      });
    }
  };

  const handleResendCode = async () => {
    if (!userEmail || !userPassword) {
      toast.error("Unable to resend code. Please try logging in again.");
      return;
    }

    setResending(true);
    try {
      await sendSMS2FACode(userEmail, userPassword);
      // Reset code inputs
      setCode(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      // Error is already handled in the store
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    
    if (fullCode.length !== 6) {
      toast.error("Please enter a complete 6-digit code");
      return;
    }

    // Validate code format
    if (!/^\d{6}$/.test(fullCode)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      // Get device information
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const result = await verifySMS2FACode(
        fullCode, 
        userId,
        rememberDevice,
        screenResolution,
        timezone
      );
      
      // Update user store with the returned user data
      // getProfile will set authChecked: true
      const profileData = await getProfile();
      
      // Call onSuccess with the profile data
      onSuccess(profileData || result.user || result);
    } catch (error) {
      // Error is already handled in the store
      // Reset code on error
      setCode(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Phone className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">SMS Verification</h2>
        <p className="text-gray-600">
          Enter the 6-digit code sent to your phone
        </p>
        {phoneMasked && (
          <p className="text-sm text-gray-500 mt-2">
            Code sent to: <span className="font-medium">{phoneMasked}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          ))}
        </div>

        {/* Remember Device Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberDeviceSMS"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="rememberDeviceSMS" className="text-sm text-gray-700 cursor-pointer">
            Remember this device for 30 days
          </label>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading || resending}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || resending || code.join("").length !== 6}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={loading || resending || !userEmail || !userPassword}
          className="text-sm text-green-600 hover:text-green-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend Code
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Didn't receive the code? Check your messages or click "Resend Code" above.
      </p>
    </motion.div>
  );
};

export default SMS2FAVerify;

