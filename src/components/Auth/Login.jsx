import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import TwoFactorVerify from "./TwoFactorVerify";
import Email2FAVerify from "./Email2FAVerify";
import SMS2FAVerify from "./SMS2FAVerify";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);
  const [requiresEmail2FA, setRequiresEmail2FA] = useState(false);
  const [email2FAUserId, setEmail2FAUserId] = useState(null);
  const [requiresSMS2FA, setRequiresSMS2FA] = useState(false);
  const [sms2FAUserId, setSms2FAUserId] = useState(null);
  const [smsPhoneMasked, setSmsPhoneMasked] = useState(null);

  const login = useUserStore((s) => s.login);
  const loading = useUserStore((s) => s.loading);
  const { getProfile } = useUserStore();

  const navigate = useNavigate();

  // Remove the checkAuth call that might interfere with login flow
  // useEffect(() => {
  //   checkAuth(); // Optional: For session refresh
  // }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);

    if (result) {
      // If device is trusted, result will be the user profile data
      // Check if it's a role-based navigation (device trusted login)
      if (result.role) {
        if (result.mustChangePassword) {
          navigate("/change-password");
          return;
        }
        // Navigate based on role
        handleRoleNavigation(result.role);
        return;
      }

      // Check if TOTP 2FA is required (highest priority)
      if (result.requires2FA) {
        setRequires2FA(true);
        setTwoFactorUserId(result.userId);
        return;
      }

      // Check if SMS 2FA is required (second priority)
      if (result.requiresSMS2FA) {
        setRequiresSMS2FA(true);
        setSms2FAUserId(result.userId);
        setSmsPhoneMasked(result.phoneMasked || null);
        return;
      }

      // Check if email 2FA is required (third priority)
      if (result.requiresEmail2FA) {
        setRequiresEmail2FA(true);
        setEmail2FAUserId(result.userId);
        return;
      }

      if (result.mustChangePassword) {
        navigate("/change-password");
        return;
      }

      // Navigate based on role
      handleRoleNavigation(result.role);
    }
  };

  const handleRoleNavigation = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "teacher":
        navigate("/teacher-dashboard");
        break;
      case "student":
        navigate("/student-dashboard");
        break;
      case "parent":
        navigate("/parent-dashboard");
        break;
      case "librarian":
        navigate("/library-dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const handle2FASuccess = async (user) => {
    try {
      // Update user store and ensure auth is checked
      const profileData = await getProfile();
      
      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate based on role
      const role = profileData?.role || user?.role;
      if (role) {
        handleRoleNavigation(role);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error after 2FA verification:", error);
      // Still navigate even if profile fetch fails (user is already authenticated)
      if (user && user.role) {
        handleRoleNavigation(user.role);
      } else {
        navigate("/");
      }
    }
  };

  const handle2FACancel = () => {
    setRequires2FA(false);
    setTwoFactorUserId(null);
  };

  const handleEmail2FACancel = () => {
    setRequiresEmail2FA(false);
    setEmail2FAUserId(null);
  };

  const handleSMS2FACancel = () => {
    setRequiresSMS2FA(false);
    setSms2FAUserId(null);
    setSmsPhoneMasked(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-primary to-primary-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent/10 to-transparent rounded-full transform rotate-12"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 to-transparent rounded-full transform -rotate-12"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-accent-light/20 rounded-full blur-lg animate-bounce"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {requires2FA ? (
          <TwoFactorVerify
            userId={twoFactorUserId}
            onSuccess={handle2FASuccess}
            onCancel={handle2FACancel}
          />
        ) : requiresSMS2FA ? (
          <SMS2FAVerify
            userId={sms2FAUserId}
            userEmail={username.includes('@') ? username : null}
            userPassword={password}
            phoneMasked={smsPhoneMasked}
            onSuccess={handle2FASuccess}
            onCancel={handleSMS2FACancel}
          />
        ) : requiresEmail2FA ? (
          <Email2FAVerify
            userId={email2FAUserId}
            userEmail={username.includes('@') ? username : null}
            userPassword={password}
            onSuccess={handle2FASuccess}
            onCancel={handleEmail2FACancel}
          />
        ) : (
          <>
            <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 shadow-xl">
            <svg className="w-10 h-10 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">EduPortal</h1>
          <p className="text-primary-light/80 text-lg">Welcome back to learning</p>
        </div>

        <div className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl transform transition-all duration-300 ${isFormFocused ? 'scale-105 shadow-3xl' : ''}`} style={{ opacity: 1, visibility: 'visible' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text mb-2">Sign In</h2>
            <p className="text-gray-600">Access your educational dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter your username (e.g., S25001, PS25001)"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white focus:outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFormFocused(true)}
                onBlur={() => setIsFormFocused(false)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-primary focus:bg-white focus:outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFormFocused(true)}
                onBlur={() => setIsFormFocused(false)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-primary hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>

            {/* Footer */}
            <div className="text-center mt-8 space-y-4 text-white/80">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-sm">🔐 Secure Login</span>
                <span className="text-sm">🛡️ Protected Data</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
