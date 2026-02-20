import { useState, useEffect } from "react";
import { Shield, Loader2, CheckCircle, Copy, QrCode } from "lucide-react";
import { useTwoFactorStore } from "../stores/useTwoFactorStore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const TwoFactorSetup = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Show QR, 2: Verify
  const [verificationCode, setVerificationCode] = useState("");
  const { generate2FA, verify2FASetup, qrCode, secret, loading } = useTwoFactorStore();

  useEffect(() => {
    // Generate QR code on mount
    generate2FA().catch((error) => {
      console.error("Failed to generate 2FA:", error);
    });
  }, []);

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success("Secret key copied to clipboard!");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    // Ensure code is exactly 6 digits
    const cleanCode = verificationCode.replace(/\D/g, "").slice(0, 6);
    
    if (cleanCode.length !== 6) {
      toast.error("Please enter a complete 6-digit code");
      return;
    }

    try {
      // Send as string to ensure proper handling
      await verify2FASetup(cleanCode);
      toast.success("2FA has been successfully enabled!");
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      // Error is already handled in the store
      setVerificationCode("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
    >
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Enable Two-Factor Authentication</h2>
        <p className="text-gray-600 text-xs">
          {step === 1
            ? "Scan the QR code with your authenticator app"
            : "Enter the code from your authenticator app to verify"}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            {loading ? (
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
              </div>
            ) : qrCode ? (
              <div className="bg-white p-3 rounded-xl border-2 border-gray-200">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                <QrCode className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Manual Entry */}
          {secret && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Can't scan? Enter this code manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono break-all">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex-shrink-0"
                  title="Copy secret"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-3">
            <h3 className="font-semibold text-blue-900 mb-2 text-xs">Setup Instructions:</h3>
            <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Install Google Authenticator or similar app</li>
              <li>Scan the QR code above (or enter secret manually)</li>
              <li>Wait for a fresh 6-digit code to appear in the app</li>
              <li>Click "Continue" and enter the code</li>
            </ol>
            <p className="text-xs text-blue-700 mt-2 font-medium">
              ⚠️ Important: Codes expire every 30 seconds. Use the current code from your app!
            </p>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={loading || !qrCode}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Enter 6-digit code from your authenticator app
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setVerificationCode(value);
              }}
              className="w-full px-3 py-2.5 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="000000"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1.5 text-center">
              Make sure you're entering the current code (codes change every 30 seconds)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verify & Enable
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default TwoFactorSetup;

