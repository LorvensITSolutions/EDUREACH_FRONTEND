import { useEffect } from "react";
import { useLeaveStore } from "../../stores/useLeaveStore";
import { useTranslation } from "react-i18next";

const ParentLeaveList = () => {
  const { myLeaves, fetchMyLeaves, loading } = useLeaveStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  return (
    <div className="bg-white p-4 shadow-md rounded-xl mt-6 w-full max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold text-primary mb-4">{t('parent.leave.yourApplications')}</h2>

      {loading ? (
        <p className="text-gray-500">{t('loading')}</p>
      ) : myLeaves.length === 0 ? (
        <p className="text-gray-500">{t('parent.leave.none')}</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2 text-left">{t('parent.leave.from')}</th>
                <th className="p-2 text-left">{t('parent.leave.to')}</th>
                <th className="p-2 text-left">{t('parent.leave.reason')}</th>
                <th className="p-2 text-left">{t('parent.leave.status')}</th>
                <th className="p-2 text-left">{t('parent.leave.submittedOn')}</th>
                <th className="p-2 text-left">{t('parent.leave.reviewedBy')}</th>
                <th className="p-2 text-left">{t('parent.leave.rejectionReason')}</th>
              </tr>
            </thead>
<tbody>
  {myLeaves.map((leave) => (
    <tr key={leave._id} className="border-b hover:bg-gray-50">
      <td className="p-2">{new Date(leave.fromDate).toLocaleDateString()}</td>
      <td className="p-2">{new Date(leave.toDate).toLocaleDateString()}</td>
      <td className="p-2">{leave.reason}</td>
      <td className="p-2 capitalize">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            leave.status === "approved"
              ? "bg-green-100 text-green-600"
              : leave.status === "rejected"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {t(`parent.leave.statuses.${leave.status}`)}
        </span>
      </td>
      <td className="p-2">{new Date(leave.createdAt).toLocaleDateString()}</td>
      <td className="p-2">
        {leave.approvedBy?.name || "—"}
      </td>
      <td className="p-2 text-red-600 italic max-w-xs">
        <div className="truncate" title={leave.rejectionReason}>
          {leave.status === "rejected" ? leave.rejectionReason || "—" : "—"}
        </div>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default ParentLeaveList;
