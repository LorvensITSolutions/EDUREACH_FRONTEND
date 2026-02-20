import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, User, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const PasswordResetRequest = () => {
  const [formData, setFormData] = useState({
    username: "",
    userType: "student" // student or parent
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/auth/request-password-reset", {
        username: formData.username,
        userType: formData.userType
      });

      if (response.data.success) {
        toast.success("Password reset instructions sent! Please check your email or contact admin.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your username to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: "student" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.userType === "student"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: "parent" })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.userType === "parent"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Parent</span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={formData.userType === "student" ? "e.g., S25001" : "e.g., PS25001"}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.userType === "student" 
                ? "Enter your student ID (e.g., S25001)"
                : "Enter your parent username (e.g., PS25001)"
              }
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending Request..." : "Send Reset Instructions"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Need Help?</h3>
          <p className="text-xs text-yellow-700">
            If you can't remember your username or need immediate assistance, 
            please contact your school administrator or teacher.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
