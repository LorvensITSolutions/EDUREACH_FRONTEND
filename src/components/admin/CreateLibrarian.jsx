import React, { useEffect, useState } from "react";
import { useLibrarianStore } from "../stores/useLibrarianStore";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, Trash2, Users } from "lucide-react";

const CreateLibrarian = () => {
  const {
    createLibrarian,
    getAllLibrarians,
    deleteLibrarian,
    librarians,
    loading,
  } = useLibrarianStore();

  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    getAllLibrarians();
  }, [getAllLibrarians]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createLibrarian(formData);
    setFormData({ name: "", email: "" });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this librarian?");
    if (confirm) await deleteLibrarian(id);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex flex-col items-center">
      {/* Create Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white shadow-card rounded-2xl p-6 border border-primary-light mb-10"
      >
        <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center flex items-center justify-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" />
          Create Librarian
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light shadow-sm"
              />
              <Mail className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-xl text-white font-semibold transition duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {loading ? "Creating..." : "Create Librarian"}
          </button>
        </form>
      </motion.div>

      {/* All Librarians */}
      <div className="w-full max-w-3xl">
        <h3 className="text-xl font-semibold text-primary-dark mb-4 flex items-center gap-2">
          <Users className="text-primary" /> All Librarians
        </h3>

        <div className="space-y-4">
          <AnimatePresence>
            {librarians.length === 0 && !loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-center"
              >
                No librarians found.
              </motion.p>
            )}

            {librarians.map((lib) => (
              <motion.div
                key={lib._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div>
                  <p className="font-medium text-text">{lib.name}</p>
                  <p className="text-sm text-gray-500">{lib.email}</p>
                </div>
                <button
                  onClick={() => handleDelete(lib._id)}
                  className="text-danger hover:text-red-700 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CreateLibrarian;
