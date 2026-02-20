import React, { useEffect, useState } from "react";
import { useLibraryStore } from "../stores/useLibraryStore";
import { motion } from "framer-motion";
import {
  FaBookOpen as BookIcon,
  FaCalendarCheck as DueIcon,
  FaCalendarDay as IssueIcon,
  FaUndoAlt as ReturnIcon,
} from "react-icons/fa";
import { format } from "date-fns";

const MyIssuedBooksPage = () => {
  const {
    fetchMyIssuedBooks,
    myIssuedBooks,
    loading,
    returnBook,
  } = useLibraryStore();

  const [filter, setFilter] = useState("all");
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    fetchMyIssuedBooks();
  }, []);

  const handleReturn = async (issueId) => {
    const confirm = window.confirm("Are you sure you want to return this book?");
    if (!confirm) return;
    setReturningId(issueId);
    await returnBook(issueId);
    setReturningId(null);
  };

  const filteredBooks = myIssuedBooks.filter((book) => {
    if (filter === "issued") return book.status !== "returned";
    if (filter === "returned") return book.status === "returned";
    return true;
  });

  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-8 bg-background text-text">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-5 md:mb-6 text-primary-dark">
        📦 My Issued Books
      </h2>

      {/* Filter Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6 flex-wrap">
        {["all", "issued", "returned"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition text-xs sm:text-sm whitespace-nowrap ${
              filter === key
                ? "bg-primary text-white"
                : "bg-white text-primary border border-primary"
            }`}
          >
            {key === "all" && "All"}
            {key === "issued" && "Issued"}
            {key === "returned" && "Returned"}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-sm sm:text-base text-primary font-medium">Loading books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center text-sm sm:text-base text-accent-dark font-medium">
          No books found for selected filter.
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((issue) => (
            <motion.div
              key={issue._id}
              className="bg-white shadow-md rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 border border-primary-light flex flex-col justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <BookIcon className="text-primary flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                  <h3 className="text-base sm:text-lg font-semibold text-primary-dark break-words">
                    {issue.book?.title || "Untitled"}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 mb-1 break-words">
                  <span className="font-medium">Author:</span>{" "}
                  {issue.book?.author || "N/A"}
                </p>

                <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 mb-1">
                  <IssueIcon className="text-accent flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    <span className="font-medium">Issued:</span>{" "}
                    {format(new Date(issue.issueDate), "dd MMM yyyy")}
                  </span>
                </p>

                <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 mb-1">
                  <DueIcon className="text-accent-dark flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    <span className="font-medium">Due:</span>{" "}
                    {format(new Date(issue.dueDate), "dd MMM yyyy")}
                  </span>
                </p>

                {issue.status === "returned" && issue.returnDate && (
                  <p className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-700">
                    <ReturnIcon className="flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      <span className="font-medium">Returned:</span>{" "}
                      {format(new Date(issue.returnDate), "dd MMM yyyy")}
                    </span>
                  </p>
                )}
              </div>

              {/* Return Book Button */}
              {issue.status !== "returned" && (
                <button
                  onClick={() => handleReturn(issue._id)}
                  disabled={returningId === issue._id}
                  className={`mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition w-full sm:w-auto ${
                    returningId === issue._id
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {returningId === issue._id ? "Returning..." : "Return Book"}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyIssuedBooksPage;
