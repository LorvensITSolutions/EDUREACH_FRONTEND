import React, { useEffect, useState } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import axios from "../../lib/axios";
import { Loader2, CreditCard, Banknote } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ParentFeePage = () => {
  const {
    childrenFees,
    loading,
    error,
    fetchChildrenFees,
    initiatePayment,
    initiateOfflinePayment,
    offlinePaymentLoading,
  } = useFeeStore();
  const { t } = useTranslation();

  const [amountInputs, setAmountInputs] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({}); // ✅ New: Track payment method for each student
  const [expandedAcademicYears, setExpandedAcademicYears] = useState({}); // Track which academic year cards are expanded

  useEffect(() => {
    fetchChildrenFees();
  }, []);

  const handleAmountChange = (studentId, value) => {
    const cleaned = parseFloat(value);
    setAmountInputs((prev) => ({
      ...prev,
      [studentId]: isNaN(cleaned) ? "" : cleaned,
    }));
  };

  // ✅ New: Handle payment method selection
  const handlePaymentMethodChange = (studentId, method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [studentId]: method,
    }));
  };

  // ✅ New: Handle payment initiation based on method
  const handlePayment = async (studentId, amount, parentName, parentEmail, academicYear) => {
    const key = `${studentId}_${academicYear}`;
    const paymentMethod = paymentMethods[key] || "online";

    if (paymentMethod === "offline") {
      await initiateOfflinePayment(studentId, amount, academicYear);
    } else {
      await initiatePayment(studentId, amount, parentName, parentEmail, academicYear);
    }
  };

  // Toggle academic year expansion
  const toggleAcademicYear = (studentId, academicYear) => {
    const key = `${studentId}_${academicYear}`;
    setExpandedAcademicYears(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 animate-fade-in">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
        <span className="ml-3 text-text font-medium">{t('parent.fees.loading')}</span>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return <div className="text-danger p-4 text-center font-semibold">{error}</div>;
  }

  if (childrenFees.length === 0) {
    return <div className="text-gray-500 p-4 text-center">{t('parent.fees.none')}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-slide-up">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">{t('parent.fees.title')}</h1>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        {childrenFees.map(({ student, feeStructures }) => {
          // If no fee structures, show message
          if (!feeStructures || feeStructures.length === 0) {
            return (
              <div
                key={student._id}
                className="bg-white shadow-card rounded-2xl p-6 border border-gray-100"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-text">{student.name} - {t('parent.fees.class')} {student.class} {student.section}</h2>
                </div>
                <p className="text-danger mt-4">{t('parent.fees.notAvailable')}</p>
              </div>
            );
          }

          return (
            <div
              key={student._id}
              className="bg-white shadow-card rounded-2xl p-6 border border-gray-100 transition-shadow hover:shadow-hover"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-text">{student.name} - {t('parent.fees.class')} {student.class} {student.section}</h2>
              </div>

              {/* Display fee structures for all academic years */}
              <div className="space-y-4">
                {feeStructures.map(({
                  academicYear,
                  displayClass,
                  displaySection,
                  feeStructure,
                  discount,
                  discountPercentage,
                  latestPayment,
                  paymentHistory,
                  totalPaid,
                  remaining,
                }) => {
                  const totalFee = feeStructure?.totalFee || 0;
                  const paidAmount = totalPaid || 0;
                  const remainingAmount = remaining || 0;
                  const isPaid = paidAmount >= totalFee;
                  const percentPaid = Math.min((paidAmount / totalFee) * 100, 100).toFixed(0);
                  const key = `${student._id}_${academicYear}`;
                  const enteredAmount = amountInputs[key] || "";
                  const selectedPaymentMethod = paymentMethods[key] || "online";
                  const isExpanded = expandedAcademicYears[key] !== false; // Default to expanded

                  return (
                    <div
                      key={academicYear}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      {/* Academic Year Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-text">
                            {t('parent.fees.academicYear')}: {academicYear}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {t('parent.fees.class')} {displayClass} {displaySection}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleAcademicYear(student._id, academicYear)}
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </div>

                      {isExpanded && (
                        <>
                          {feeStructure ? (
                            <>
                              <div>
                                <p className="font-medium text-text mb-1">{t('parent.fees.totalFee')}: <span className="text-primary font-semibold">₹{totalFee}</span></p>

                                {discount > 0 && (
                                  <p className="text-green-600 text-sm">🎁 {t('parent.fees.discount')}: ₹{discount} ({discountPercentage})</p>
                                )}

                                <ul className="ml-4 mt-2 text-sm text-gray-700 list-disc space-y-1">
                                  {feeStructure.breakdown &&
                                    Object.entries(feeStructure.breakdown).map(([key, value]) => (
                                      <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: ₹{value}</li>
                                    ))}
                                </ul>

                                <div className="mt-4">
                                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                                    <div
                                      className="bg-primary h-3 rounded-full"
                                      style={{ width: `${percentPaid}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-600 flex justify-between">
                                    <span>{t('parent.fees.paid')}: ₹{paidAmount}</span>
                                    <span>{t('parent.fees.remaining')}: ₹{remainingAmount}</span>
                                  </div>
                                </div>
                              </div>

                              {isPaid && latestPayment ? (
                                <div className="mt-4">
                                  <p className="text-success font-semibold">✅ {t('parent.fees.fullyPaidOn')} {new Date(latestPayment.paidAt).toLocaleDateString()}</p>
                                </div>
                              ) : (
                                <div className="mt-4 space-y-3">
                                  <label className="block text-sm font-medium text-gray-700">{t('parent.fees.enterAmount')}</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={remainingAmount}
                                    step="1"
                                    value={enteredAmount}
                                    onChange={(e) =>
                                      handleAmountChange(key, e.target.value)
                                    }
                                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder={`${t('parent.fees.max')} ₹${remainingAmount}`}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") e.target.blur();
                                    }}
                                  />
                                  {enteredAmount > 0 && enteredAmount < 1 && (<p className="text-xs text-red-500">⚠️ {t('parent.fees.minAmount')}</p>)}

                                  {/* ✅ Payment Method Selection */}
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">{t('parent.fees.paymentMethod')}</label>
                                    <div className="flex gap-3">
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`paymentMethod_${key}`}
                                          value="online"
                                          checked={selectedPaymentMethod === "online"}
                                          onChange={(e) => handlePaymentMethodChange(key, e.target.value)}
                                          className="text-primary focus:ring-primary"
                                        />
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm">{t('parent.fees.online')}</span>
                                      </label>
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="radio"
                                          name={`paymentMethod_${key}`}
                                          value="offline"
                                          checked={selectedPaymentMethod === "offline"}
                                          onChange={(e) => handlePaymentMethodChange(key, e.target.value)}
                                          className="text-primary focus:ring-primary"
                                        />
                                        <Banknote className="w-4 h-4 text-green-600" />
                                        <span className="text-sm">{t('parent.fees.offline')}</span>
                                      </label>
                                    </div>
                                  </div>

                                  {/* ✅ Payment Button */}
                                  <button
                                    disabled={
                                      !enteredAmount ||
                                      enteredAmount < 1 ||
                                      enteredAmount > remainingAmount ||
                                      offlinePaymentLoading
                                    }
                                    onClick={() =>
                                      handlePayment(
                                        student._id,
                                        enteredAmount,
                                        student.parentName || "Parent",
                                        student.parentEmail || "parent@example.com",
                                        academicYear
                                      )
                                    }
                                    className={`w-full px-5 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 ${
                                      selectedPaymentMethod === "offline"
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-primary hover:bg-primary-dark text-white"
                                    }`}
                                  >
                                    {offlinePaymentLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('parent.fees.processing')}
                                      </>
                                    ) : (
                                      <>
                                        {selectedPaymentMethod === "offline" ? (
                                          <Banknote className="w-4 h-4" />
                                        ) : (
                                          <CreditCard className="w-4 h-4" />
                                        )}
                                        {selectedPaymentMethod === "offline" ? t('parent.fees.requestCash') : t('parent.fees.payOnline')} ₹{enteredAmount || 0}
                                      </>
                                    )}
                                  </button>

                                  {/* ✅ Offline Payment Info */}
                                  {selectedPaymentMethod === "offline" && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                      <p className="font-medium mb-1">💡 {t('parent.fees.offlineHow')}</p>
                                      <ol className="list-decimal list-inside space-y-1 text-xs">
                                        <li>{t('parent.fees.step1')}</li>
                                        <li>{t('parent.fees.step2', { amount: enteredAmount || 0 })}</li>
                                        <li>{t('parent.fees.step3')}</li>
                                        <li>{t('parent.fees.step4')}</li>
                                      </ol>
                                    </div>
                                  )}
                                </div>
                              )}

                              {paymentHistory && paymentHistory.length > 0 && (
                                <div className="mt-6">
                                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📄 {t('parent.fees.history')}</h3>
                                  <ul className="text-sm space-y-2">
                                    {paymentHistory.map((p, idx) => (
                                      <li
                                        key={idx}
                                        className="border p-3 rounded-md bg-gray-50 flex justify-between items-start"
                                      >
                                        <div>
                                          <p className="font-medium text-text">₹{p.total} {t('parent.fees.paidOn')} {new Date(p.paidAt).toLocaleDateString()}</p>
                                          <p className="text-xs text-gray-500">
                                            {t('parent.fees.receipt')}: {p.receiptNumber} | {t('parent.fees.status')}: {p.status}
                                            {p.paymentMethod && ` | ${t('parent.fees.method')}: ${p.paymentMethod}`}
                                          </p>
                                        </div>
                                        {p.receiptUrl && (
                                          <button
                                            onClick={async () => {
                                              try {
                                                // If it's a Cloudinary (or any full http) URL, open directly
                                                if (p.receiptUrl.startsWith('http')) {
                                                  window.open(p.receiptUrl, '_blank');
                                                  return;
                                                }
                                                // API path like /api/payment/receipt/:id — use axios so base URL works on localhost and deployed domain
                                                const paymentId = p.receiptUrl.replace(/.*\/receipt\//, '').split('/')[0];
                                                if (!paymentId) {
                                                  toast.error('Invalid receipt link.');
                                                  return;
                                                }
                                                const { data } = await axios.get(`/payment/receipt/${paymentId}`, {
                                                  responseType: 'blob',
                                                });
                                                const url = window.URL.createObjectURL(data);
                                                const w = window.open(url, '_blank', 'noopener,noreferrer');
                                                if (w) setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                                                else window.URL.revokeObjectURL(url);
                                              } catch (error) {
                                                console.error('Error opening receipt:', error);
                                                toast.error(error.response?.status === 403 ? 'Not allowed.' : error.response?.status === 404 ? 'Receipt not found.' : 'Failed to open receipt. Please try again.');
                                              }
                                            }}
                                            className="text-sm text-info underline hover:text-info/80 cursor-pointer bg-transparent border-none p-0"
                                          >
                                            {t('parent.fees.viewReceipt')}
                                          </button>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="text-danger mt-2">{t('parent.fees.notAvailable')}</p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParentFeePage;
