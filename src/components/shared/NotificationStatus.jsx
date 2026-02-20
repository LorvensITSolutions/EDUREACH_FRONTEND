import React, { memo } from 'react';
import { FaEnvelopeOpen, FaWhatsapp, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const NotificationStatus = memo(({ 
  emailSent = false, 
  whatsappSent = false, 
  emailError = null, 
  whatsappError = null,
  parentEmail = '',
  parentPhone = '',
  showDetails = false 
}) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Email Status */}
      <div className="flex items-center space-x-1">
        <div className={`p-1 rounded-full ${emailSent ? 'bg-green-100' : emailError ? 'bg-red-100' : 'bg-gray-100'}`}>
          {emailSent ? (
            <FaEnvelopeOpen className="text-green-600 text-sm" />
          ) : emailError ? (
            <FaExclamationTriangle className="text-red-600 text-sm" />
          ) : (
            <FaEnvelopeOpen className="text-gray-400 text-sm" />
          )}
        </div>
        {showDetails && (
          <span className="text-xs text-gray-600">
            {emailSent ? 'Email sent' : emailError ? 'Email failed' : 'Email pending'}
          </span>
        )}
      </div>

      {/* WhatsApp Status */}
      <div className="flex items-center space-x-1">
        <div className={`p-1 rounded-full ${whatsappSent ? 'bg-green-100' : whatsappError ? 'bg-red-100' : 'bg-gray-100'}`}>
          {whatsappSent ? (
            <FaWhatsapp className="text-green-600 text-sm" />
          ) : whatsappError ? (
            <FaExclamationTriangle className="text-red-600 text-sm" />
          ) : (
            <FaWhatsapp className="text-gray-400 text-sm" />
          )}
        </div>
        {showDetails && (
          <span className="text-xs text-gray-600">
            {whatsappSent ? 'WhatsApp sent' : whatsappError ? 'WhatsApp failed' : 'WhatsApp pending'}
          </span>
        )}
      </div>

      {/* Success Message */}
      {emailSent && whatsappSent && showDetails && (
        <div className="flex items-center space-x-1 text-green-600">
          <FaCheckCircle className="text-sm" />
          <span className="text-xs">All notifications sent</span>
        </div>
      )}
    </div>
  );
});

NotificationStatus.displayName = 'NotificationStatus';

export default NotificationStatus;
