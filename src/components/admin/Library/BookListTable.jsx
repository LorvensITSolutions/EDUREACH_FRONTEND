// src/components/admin/library/BookListTable.jsx
import { useLibraryStore } from "../../stores/useLibraryStore";
import { useState } from "react";

const BookListTable = () => {
  const { books, deleteBook, updateBook, loading } = useLibraryStore();
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEditClick = (book) => {
    setEditId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      totalCopies: book.totalCopies,
      description: book.description,
    });
  };

  const handleUpdate = async (id) => {
    await updateBook(id, formData);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this book?")) {
      await deleteBook(id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border border-gray-300">
        <thead className="bg-primary text-white">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Author</th>
            <th className="p-2 hidden md:table-cell">Category</th>
            <th className="p-2 hidden md:table-cell">Copies</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id} className="border-b">
              <td className="p-2">
                {editId === book._id ? (
                  <input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  book.title
                )}
              </td>
              <td className="p-2">
                {editId === book._id ? (
                  <input
                    value={formData.author || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  book.author
                )}
              </td>
              <td className="p-2 hidden md:table-cell">{book.category}</td>
              <td className="p-2 hidden md:table-cell">{book.totalCopies}</td>
              <td className="p-2 flex gap-2 flex-wrap">
                {editId === book._id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(book._id)}
                      disabled={loading}
                      className="bg-accent text-black px-3 py-1 rounded hover:bg-accent-dark"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="bg-gray-300 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(book)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookListTable;
