import React, { useEffect, useState } from "react";
import { useLibraryStore } from "../stores/useLibraryStore";
import { motion } from "framer-motion";
import { FiDownload, FiBookOpen } from "react-icons/fi";
import { toast } from "react-hot-toast";

const AllBooksPage = () => {
  const {
    books,
    fetchBooks,
    requestBook,
    loading
  } = useLibraryStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = () => {
    let query = "?";
    if (search) query += `search=${search}`;
    if (category) query += `&category=${category}`;
    fetchBooks(query);
  };

  const handleRequest = async (bookId) => {
    await requestBook(bookId);
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-8 bg-background min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-4 sm:mb-5 md:mb-6"
      >
        📚 All Books
      </motion.h1>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
        <input
          type="text"
          placeholder="Search by title or author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 sm:p-2.5 border border-gray-300 rounded-md flex-1 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 sm:p-2.5 border border-gray-300 rounded-md flex-1 shadow-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          onClick={handleSearch}
          className="bg-primary text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-md hover:bg-primary-dark transition text-sm sm:text-base font-medium whitespace-nowrap w-full sm:w-auto"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p className="text-sm sm:text-base text-gray-600">Loading books...</p>
      ) : books.length === 0 ? (
        <p className="text-sm sm:text-base text-gray-600">No books found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {books.map((book) => (
            <motion.div
              key={book._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow p-3 sm:p-4 hover:shadow-md transition duration-300 border border-primary-light"
            >
              <h2 className="text-base sm:text-lg font-semibold text-text mb-1 break-words">{book.title}</h2>
              <p className="text-xs sm:text-sm text-gray-600 break-words">👤 {book.author}</p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">🏷️ {book.category}</p>
              <p className="text-xs sm:text-sm text-gray-600">📦 Available: {book.availableCopies}</p>
              <div className="mt-3 sm:mt-4 flex gap-2">
                {book.isDigital ? (
                  <a
                    href={book.ebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline text-xs sm:text-sm font-medium"
                  >
                    <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Download</span>
                  </a>
                ) : (
                  <button
                    onClick={() => handleRequest(book._id)}
                    className="bg-accent text-text px-2.5 sm:px-3 py-1 sm:py-1.5 rounded hover:bg-accent-dark transition text-xs sm:text-sm flex items-center gap-1 font-medium w-full sm:w-auto justify-center"
                  >
                    <FiBookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Request Book</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBooksPage;
