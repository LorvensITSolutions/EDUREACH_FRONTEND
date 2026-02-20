import { useState } from 'react';
import { useStudentStore } from '../stores/useStudentStore';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, Image, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UpdateStudentImages = () => {
  const { updateStudentImages, isLoading } = useStudentStore();
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
      const result = await updateStudentImages(imagesZipFile);
      
      setUploadResults(result);
      setUploadStatus('success');
      
      // Reset file input
      setImagesZipFile(null);
      document.getElementById('student-images-upload').value = '';
      
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload error:', error);
    }
  };

  return (
    <motion.div
      className="p-6 bg-white rounded-2xl shadow-md w-full max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Image className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-primary">Update Student Images</h2>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">How to Update Student Images:</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <div>
            <strong>Step 1:</strong> Create a ZIP file containing student images
          </div>
          <div>
            <strong>Step 2:</strong> Name each image file with the student's ID (e.g., S24001.jpg, S24002.png)
          </div>
          <div>
            <strong>Step 3:</strong> Upload the ZIP file below
          </div>
          <div>
            <strong>Supported formats:</strong> .jpg, .jpeg, .png
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          <strong>Note:</strong> Only students that exist in the database will be updated. Images will replace existing ones.
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 border-primary bg-gray-50 hover:bg-gray-100 mb-6">
        <input
          type="file"
          accept=".zip"
          onChange={handleImagesZipChange}
          disabled={isLoading}
          className="hidden"
          id="student-images-upload"
        />
        <label htmlFor="student-images-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Image className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600 font-medium">
              {imagesZipFile ? imagesZipFile.name : "Click to upload images ZIP file"}
            </span>
            <span className="text-xs text-gray-500">ZIP files only (.zip)</span>
          </div>
        </label>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className="mb-6 text-center">
          {uploadStatus === 'uploading' ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600 font-medium">Updating images...</span>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Images updated successfully!</span>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Update failed</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload Results
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Successfully updated:</span>
              <span className="font-medium text-green-600">{uploadResults.updated} students</span>
            </div>
            {uploadResults.notFound > 0 && (
              <div className="flex justify-between">
                <span>Students not found:</span>
                <span className="font-medium text-orange-600">{uploadResults.notFound} students</span>
              </div>
            )}
            {uploadResults.errors > 0 && (
              <div className="flex justify-between">
                <span>Upload errors:</span>
                <span className="font-medium text-red-600">{uploadResults.errors} images</span>
              </div>
            )}
          </div>
          
          {uploadResults.details?.updatedStudents?.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-2">Updated Students:</h4>
              <div className="flex flex-wrap gap-2">
                {uploadResults.details.updatedStudents.map((student, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {student.studentId} - {student.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {uploadResults.details?.notFoundStudents?.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-2">Students Not Found:</h4>
              <div className="flex flex-wrap gap-2">
                {uploadResults.details.notFoundStudents.map((studentId, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {studentId}
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
          disabled={!imagesZipFile || isLoading}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            !imagesZipFile || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? 'Updating Images...' : 'Update Student Images'}
        </button>
      </div>
    </motion.div>
  );
};

export default UpdateStudentImages;
