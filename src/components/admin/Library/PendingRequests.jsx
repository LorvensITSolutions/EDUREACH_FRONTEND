// src/components/admin/library/PendingRequests.jsx
import { useLibraryStore } from "../../stores/useLibraryStore";

const PendingRequests = () => {
  const { pendingRequests, approveRequest, loading } = useLibraryStore();

  if (pendingRequests.length === 0) {
    return <p className="text-gray-500 italic">No pending requests.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border border-gray-300">
        <thead className="bg-primary text-white">
          <tr>
            <th className="p-2">Book</th>
            <th className="p-2">Requested By</th>
            <th className="p-2">Model</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingRequests.map((req) => (
            <tr key={req._id} className="border-b">
              <td className="p-2">{req.book?.title}</td>
              <td className="p-2">{req.requesterId?.name}</td>
              <td className="p-2">{req.requesterModel}</td>
              <td className="p-2">
                <button
                  onClick={() => approveRequest(req._id)}
                  disabled={loading}
                  className="bg-accent text-black px-3 py-1 rounded hover:bg-accent-dark disabled:opacity-50"
                >
                  Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingRequests;
