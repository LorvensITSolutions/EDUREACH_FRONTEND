import { useState } from 'react';
import { useTeacherStore } from '../stores/useTeacherStore';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Image, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UpdateTeacherImages = () => {
  const { updateTeacherImages, loading } = useTeacherStore();
  const [imagesZipFile, setImagesZipFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const handleImagesZipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagesZipFile(file);
      setUploadStatus(null);
      setUploadResults(null);
      
      // Validate file type
      if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
        toast.error('Please upload a valid ZIP file');
        return;
      }
      
      // Validate file size (max 50MB for images)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('ZIP file size must be less than 50MB');
        return;
      }
    }
  };

  const handleUpload = async () => {
    if (!imagesZipFile) {
      toast.error('Please select a ZIP file first');
      return;
    }

    try {
      setUploadStatus('uploading');
      const result = await updateTeacherImages(imagesZipFile);
      
      setUploadResults(result);
      setUploadStatus('success');
      
      // Reset file input
      setImagesZipFile(null);
      document.getElementById('images-upload').value = '';
      
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload error:', error);
    }
  };

  return (
    <motion.div
      className="p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md w-full max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        <Image className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
        <h2 className="text-xl sm:text-2xl font-bold text-primary">Update Teacher Images</h2>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
        <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">How to Update Teacher Images:</h3>
        <div className="text-xs sm:text-sm text-blue-700 space-y-1.5 sm:space-y-2">
          <div className="break-words">
            <strong>Step 1:</strong> Create a ZIP file containing teacher images
          </div>
          <div className="break-words">
            <strong>Step 2:</strong> Name each image file with the teacher's ID (e.g., T25053.jpg, T25054.png)
          </div>
          <div className="break-words">
            <strong>Step 3:</strong> Upload the ZIP file below
          </div>
          <div className="break-words">
            <strong>Supported formats:</strong> .jpg, .jpeg, .png
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2 break-words">
          <strong>Note:</strong> Only teachers that exist in the database will be updated. Images will replace existing ones.
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors duration-200 border-primary bg-gray-50 hover:bg-gray-100 mb-4 sm:mb-5 md:mb-6">
        <input
          type="file"
          accept=".zip"
          onChange={handleImagesZipChange}
          disabled={loading}
          className="hidden"
          id="images-upload"
        />
        <label htmlFor="images-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            <Image className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
            <span className="text-xs sm:text-sm text-gray-600 font-medium break-words px-2">
              {imagesZipFile ? imagesZipFile.name : "Click to upload images ZIP file"}
            </span>
            <span className="text-xs text-gray-500">ZIP files only (.zip)</span>
          </div>
        </label>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className="mb-4 sm:mb-5 md:mb-6 text-center">
          {uploadStatus === 'uploading' ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm text-blue-600 font-medium">Updating images...</span>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <span className="text-xs sm:text-sm text-green-600 font-medium">Images updated successfully!</span>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              <span className="text-xs sm:text-sm text-red-600 font-medium">Update failed</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
          <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Upload Results</span>
          </h3>
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span>Successfully updated:</span>
              <span className="font-medium text-green-600">{uploadResults.updated} teachers</span>
            </div>
            {uploadResults.notFound > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span>Teachers not found:</span>
                <span className="font-medium text-orange-600">{uploadResults.notFound} teachers</span>
              </div>
            )}
            {uploadResults.errors > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span>Upload errors:</span>
                <span className="font-medium text-red-600">{uploadResults.errors} images</span>
              </div>
            )}
          </div>
          
          {uploadResults.details?.updatedTeachers?.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <h4 className="font-medium text-gray-700 mb-1.5 sm:mb-2 text-xs sm:text-sm">Updated Teachers:</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {uploadResults.details.updatedTeachers.map((teacher, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 break-words"
                  >
                    {teacher.teacherId} - {teacher.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {uploadResults.details?.notFoundTeachers?.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <h4 className="font-medium text-gray-700 mb-1.5 sm:mb-2 text-xs sm:text-sm">Teachers Not Found:</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {uploadResults.details.notFoundTeachers.map((teacherId, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 break-words"
                  >
                    {teacherId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!imagesZipFile || loading}
          className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            !imagesZipFile || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? 'Updating Images...' : 'Update Teacher Images'}
        </button>
      </div>
    </motion.div>
  );
};

export default UpdateTeacherImages;
