import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, Loader2, AlertCircle, Mail, MailCheck, Phone, PhoneCall, Monitor, Trash2 } from "lucide-react";
import { useTwoFactorStore } from "../stores/useTwoFactorStore";
import { useEmail2FAStore } from "../stores/useEmail2FAStore";
import { useSMS2FAStore } from "../stores/useSMS2FAStore";
import { useDeviceTrustStore } from "../stores/useDeviceTrustStore";
import { useUserStore } from "../stores/useUserStore";
import TwoFactorSetup from "../Auth/TwoFactorSetup";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const SecuritySettings = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  
  const {
    twoFactorEnabled,
    twoFactorVerified,
    get2FAStatus,
    disable2FA,
    loading: totpLoading,
  } = useTwoFactorStore();

  const {
    email2FAEnabled,
    hasEmail,
    getEmail2FAStatus,
    enableEmail2FA,
    disableEmail2FA,
    loading: emailLoading,
  } = useEmail2FAStore();

  const {
    sms2FAEnabled,
    hasPhone,
    phoneMasked,
    isParentPhone,
    getSMS2FAStatus,
    enableSMS2FA,
    disableSMS2FA,
    updatePhoneNumber,
    loading: smsLoading,
  } = useSMS2FAStore();

  const [phoneInput, setPhoneInput] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const {
    devices,
    loading: deviceLoading,
    getTrustedDevices,
    revokeDevice,
    revokeAllDevices,
  } = useDeviceTrustStore();

  const { user } = useUserStore();

  useEffect(() => {
    // Fetch all 2FA statuses on mount
    get2FAStatus();
    getEmail2FAStatus();
    getSMS2FAStatus();
    getTrustedDevices();
  }, [get2FAStatus, getEmail2FAStatus, getSMS2FAStatus, getTrustedDevices]);

  const handleDisable = async (e) => {
    e.preventDefault();
    
    if (disableCode.length !== 6) {
      toast.error("Please enter a complete 6-digit code");
      return;
    }

    try {
      await disable2FA(disableCode);
      setShowDisableForm(false);
      setDisableCode("");
      await get2FAStatus(); // Refresh status
    } catch (error) {
      // Error is already handled in the store
      setDisableCode("");
    }
  };

  const handleSetupComplete = async () => {
    setShowSetup(false);
    await get2FAStatus(); // Refresh status
  };

  const handleEnableSMS2FA = async () => {
    try {
      await enableSMS2FA(phoneInput || undefined);
      await getSMS2FAStatus();
      setPhoneInput("");
      setShowPhoneInput(false);
    } catch (error) {
      // Error is already handled in the store
    }
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md p-3 sm:p-4 md:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Security Settings</h2>
      </div>

      {/* TOTP 2FA Status Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {twoFactorEnabled && twoFactorVerified ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldOff className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Google Authenticator (TOTP)
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {twoFactorEnabled && twoFactorVerified
                  ? "TOTP 2FA is currently enabled on your account"
                  : "Use Google Authenticator app for 2FA"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          {twoFactorEnabled && twoFactorVerified ? (
            <button
              onClick={() => setShowDisableForm(!showDisableForm)}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
            >
              Disable TOTP 2FA
            </button>
          ) : (
            <button
              onClick={() => setShowSetup(true)}
              disabled={totpLoading}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              Enable TOTP 2FA
            </button>
          )}
        </div>
      </div>

      {/* SMS 2FA Status Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border border-purple-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {sms2FAEnabled ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                SMS-Based 2FA
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {sms2FAEnabled
                  ? `SMS 2FA is currently enabled on your account${phoneMasked ? ` (${phoneMasked})` : ""}${isParentPhone ? " - Using parent's phone number" : ""}`
                  : hasPhone
                  ? "Receive verification codes via SMS"
                  : user?.role === "student"
                  ? "SMS 2FA will use your parent's phone number if available"
                  : "Add a phone number to enable SMS 2FA"}
              </p>
              {isParentPhone && (
                <p className="text-xs text-blue-600 mt-1 font-medium break-words">
                  ℹ️ You're using your parent's phone number for SMS 2FA. Contact an administrator to add your own phone number.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {sms2FAEnabled ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to disable SMS 2FA?")) {
                    try {
                      await disableSMS2FA();
                      await getSMS2FAStatus();
                    } catch (error) {
                      // Error is already handled in the store
                    }
                  }
                }}
                disabled={smsLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
              >
                {smsLoading ? "Disabling..." : "Disable SMS 2FA"}
              </button>
              <button
                onClick={() => setShowPhoneInput(!showPhoneInput)}
                className="w-full sm:w-auto sm:ml-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
              >
                Update Phone
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                // For students, try to enable with parent's phone first
                if (user?.role === "student" && !hasPhone) {
                  handleEnableSMS2FA();
                } else if (!hasPhone) {
                  setShowPhoneInput(true);
                } else {
                  handleEnableSMS2FA();
                }
              }}
              disabled={smsLoading}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              {smsLoading ? "Enabling..." : user?.role === "student" && !hasPhone ? "Enable SMS 2FA (Using Parent's Phone)" : "Enable SMS 2FA"}
            </button>
          )}
        </div>

        {/* Phone Number Input */}
        <AnimatePresence>
          {showPhoneInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 sm:mt-4 space-y-2 sm:space-y-3"
            >
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Phone Number (E.164 format: +1234567890)
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For Indian numbers, enter 10 digits (e.g., 9876543210)
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!phoneInput.trim()) {
                      toast.error("Please enter a phone number");
                      return;
                    }
                    try {
                      await updatePhoneNumber(phoneInput);
                      setPhoneInput("");
                      setShowPhoneInput(false);
                      await getSMS2FAStatus();
                      if (!sms2FAEnabled) {
                        await handleEnableSMS2FA();
                      }
                    } catch (error) {
                      // Error is already handled in the store
                    }
                  }}
                  disabled={smsLoading || !phoneInput.trim()}
                  className="flex-1 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
                >
                  {smsLoading ? "Saving..." : sms2FAEnabled ? "Update Phone" : "Save & Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneInput(false);
                    setPhoneInput("");
                  }}
                  className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Email 2FA Status Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border border-green-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {email2FAEnabled ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MailCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Email-Based 2FA
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 break-words">
                {email2FAEnabled
                  ? "Email 2FA is currently enabled on your account"
                  : hasEmail
                  ? "Receive verification codes via email"
                  : "Add an email address to enable email 2FA"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          {email2FAEnabled ? (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to disable Email 2FA?")) {
                  try {
                    await disableEmail2FA();
                    await getEmail2FAStatus();
                  } catch (error) {
                    // Error is already handled in the store
                  }
                }
              }}
              disabled={emailLoading}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              {emailLoading ? "Disabling..." : "Disable Email 2FA"}
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!hasEmail) {
                  toast.error("No email address found. Please add an email to your account first.");
                  return;
                }
                try {
                  await enableEmail2FA();
                  await getEmail2FAStatus();
                } catch (error) {
                  // Error is already handled in the store
                }
              }}
              disabled={emailLoading || !hasEmail}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
            >
              {emailLoading ? "Enabling..." : "Enable Email 2FA"}
            </button>
          )}
        </div>
      </div>

      {/* Disable 2FA Form */}
      <AnimatePresence>
        {showDisableForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6"
          >
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-red-900 mb-1 text-sm sm:text-base">
                  Disable Two-Factor Authentication
                </h3>
                <p className="text-xs sm:text-sm text-red-700 break-words">
                  For security, please enter your current 2FA code to disable it.
                </p>
              </div>
            </div>

            <form onSubmit={handleDisable} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Enter 6-digit code from your authenticator app
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setDisableCode(value);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-center text-xl sm:text-2xl font-bold border-2 border-red-300 rounded-lg sm:rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableForm(false);
                    setDisableCode("");
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={totpLoading || disableCode.length !== 6}
                  className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {totpLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span>Disabling...</span>
                    </>
                  ) : (
                    "Disable TOTP 2FA"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setShowSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md"
            >
              <TwoFactorSetup
                onComplete={handleSetupComplete}
                onCancel={() => setShowSetup(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trusted Devices Management */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 border border-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Trusted Devices
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Manage devices that can skip 2FA for 30 days
              </p>
            </div>
          </div>
          {devices.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to revoke all trusted devices? You'll need to verify 2FA on all devices again.")) {
                  try {
                    await revokeAllDevices();
                    await getTrustedDevices();
                  } catch (error) {
                    // Error is already handled in the store
                  }
                }
              }}
              disabled={deviceLoading}
              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Revoke All</span>
            </button>
          )}
        </div>

        {deviceLoading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-indigo-600" />
          </div>
        ) : devices.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-600 text-center py-3 sm:py-4 px-2">
            No trusted devices. Devices will appear here after you check "Remember this device" during 2FA verification.
          </p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {devices.map((device) => (
              <div
                key={device._id}
                className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <p className="font-medium text-gray-900 text-sm sm:text-base break-words">
                        {device.deviceInfo?.browser || "Unknown Browser"} on {device.deviceInfo?.os || "Unknown OS"}
                      </p>
                      {device.deviceInfo?.platform && (
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
                          {device.deviceInfo.platform}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 md:gap-4 mt-1 text-xs text-gray-500">
                      <span className="break-words">IP: {device.ipAddress}</span>
                      <span className="break-words">Last used: {new Date(device.lastUsed).toLocaleDateString()}</span>
                      <span className="break-words">Expires: {new Date(device.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm("Are you sure you want to revoke this device?")) {
                      try {
                        await revokeDevice(device._id);
                        await getTrustedDevices();
                      } catch (error) {
                        // Error is already handled in the store
                      }
                    }
                  }}
                  disabled={deviceLoading}
                  className="self-start sm:self-auto sm:ml-4 p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Revoke device"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mt-4 sm:mt-5 md:mt-6">
        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">Security Tips</h3>
        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
            <span className="break-words">Keep your authenticator app secure and backed up (for TOTP)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
            <span className="break-words">Never share your 2FA codes with anyone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
            <span className="break-words">TOTP codes expire every 30 seconds, SMS and email codes expire in 10 minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
            <span className="break-words">Priority order: TOTP 2FA (highest) → SMS 2FA → Email 2FA</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
            <span className="break-words">Trusted devices skip 2FA for 30 days. Revoke devices you no longer use.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">•</span>
            <span className="break-words">If you lose access to your authenticator, phone, or email, contact support</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SecuritySettings;

