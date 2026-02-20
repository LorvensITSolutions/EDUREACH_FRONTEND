import { useState, useRef, useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";
import { useTwoFactorStore } from "../stores/useTwoFactorStore";
import { useUserStore } from "../stores/useUserStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const TwoFactorVerify = ({ userId, onSuccess, onCancel }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [rememberDevice, setRememberDevice] = useState(false);
  const inputRefs = useRef([]);
  const { verify2FACode, loading } = useTwoFactorStore();
  const { getProfile } = useUserStore();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    
    if (fullCode.length !== 6) {
      toast.error("Please enter a complete 6-digit code");
      return;
    }

    try {
      // Get device information for consistent device fingerprinting
      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const result = await verify2FACode(
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
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
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          ))}
        </div>

        {/* Remember Device Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberDevice"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="rememberDevice" className="text-sm text-gray-700 cursor-pointer">
            Remember this device for 30 days
          </label>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || code.join("").length !== 6}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      <p className="text-xs text-gray-500 text-center mt-4">
        Can't access your authenticator? Contact support for assistance.
      </p>
    </motion.div>
  );
};

export default TwoFactorVerify;

