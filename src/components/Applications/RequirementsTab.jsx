import { CheckCircle, AlertCircle } from 'lucide-react';

const RequirementsTab = ({ admissionRequirements = [] }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Admission Requirements</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {admissionRequirements.map((req, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                {req.icon}
              </div>
              <h4 className="text-lg font-semibold text-gray-900">{req.title}</h4>
            </div>
            <p className="text-gray-600 text-sm">{req.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="text-blue-600 mt-1 mr-3" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Important Note</h4>
            <p className="text-blue-800 text-sm">
              Please ensure all documents are original or certified copies. Applications will be processed within 2-3 weeks of submission. You will be notified via email about the status of your application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsTab;
