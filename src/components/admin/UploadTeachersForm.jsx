import { useTeacherStore } from '../stores/useTeacherStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { utils, writeFile } from 'xlsx';
import JSZip from 'jszip';

const UploadTeachersForm = () => {
  const { uploadTeachers, loading } = useTeacherStore();
  const [excelFile, setExcelFile] = useState(null);
  const [imagesZipFile, setImagesZipFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedTeachers, setUploadedTeachers] = useState([]);

  const handleExcelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setUploadStatus(null);
      setUploadedTeachers([]);
      
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
    }
  };

  const handleImagesZipChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagesZipFile(file);
      
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

  const downloadTemplate = () => {
    // Create template data with headers and example rows
    const templateData = [
      // Headers
      ["teacherId", "name", "phone", "subject", "qualification"],
      // Example row 1
      ["T1001", "John Smith", "1234567890", "Mathematics", "M.Sc. Mathematics"],
      // Example row 2
      ["T1002", "Jane Doe", "0987654321", "English", "M.A. English"],
      // Empty row for user to add more data
      ["", "", "", "", ""],
    ];

    // Create workbook and worksheet
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(templateData);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // teacherId
      { wch: 25 }, // name
      { wch: 15 }, // phone
      { wch: 20 }, // subject
      { wch: 30 }, // qualification
    ];

    // Style header row (bold)
    const headerStyle = { font: { bold: true } };
    for (let col = 0; col < templateData[0].length; col++) {
      const cellAddress = utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    // Add worksheet to workbook
    utils.book_append_sheet(wb, ws, "Teachers Template");

    // Write file
    writeFile(wb, "Teacher_Upload_Template.xlsx");
  };

  const downloadZipTemplate = async () => {
    try {
      const zip = new JSZip();
      
      // Create a README file with instructions
      const readmeContent = `TEACHER IMAGES ZIP TEMPLATE - INSTRUCTIONS
==========================================

This ZIP file shows the structure for organizing teacher images.

IMPORTANT RULES:
1. Each image file must be named exactly as the teacherId in your Excel file
2. Supported image formats: .jpg, .jpeg, .png
3. Image file names should match teacher IDs from your Excel file
   Example: If teacherId is "T1001", the image should be named "T1001.jpg"

EXAMPLES:
- Teacher ID: T1001 → Image file: T1001.jpg (or T1001.png)
- Teacher ID: T1002 → Image file: T1002.jpeg (or T1002.jpg)

STRUCTURE:
All image files should be placed directly in the root of the ZIP file (not in subfolders).

Example ZIP structure:
├── T1001.jpg
├── T1002.png
├── T1003.jpeg
└── ...

NOTE:
- The ZIP file is optional - you can upload teachers without images
- If you upload images, make sure the file names match the teacherId exactly
- Images will be automatically uploaded to Cloudinary and linked to teachers
`;

      // Add README file
      zip.file("README.txt", readmeContent);

      // Create placeholder text files as examples
      zip.file("T1001.jpg.txt", "This is a placeholder. Replace with actual image file named T1001.jpg");
      zip.file("T1002.png.txt", "This is a placeholder. Replace with actual image file named T1002.png");
      
      // Add instructions file
      const instructionsContent = `QUICK SETUP GUIDE:
1. Extract this ZIP file
2. Replace the .txt placeholder files with actual image files
3. Name each image file exactly as the teacherId from your Excel file
4. Accepted formats: .jpg, .jpeg, .png
5. Create a new ZIP file with all the images
6. Upload both the Excel file and the new ZIP file together

Example:
- Excel has teacherId: T1001
- Image file should be: T1001.jpg (or T1001.png or T1001.jpeg)
- Include both files in the upload form
`;
      zip.file("SETUP_INSTRUCTIONS.txt", instructionsContent);

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Teacher_Images_Template.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP template:", error);
      toast.error("Failed to create ZIP template. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!excelFile) {
      toast.error('Please select an Excel file first');
      return;
    }

    try {
      setUploadStatus('uploading');
      const result = await uploadTeachers(excelFile, imagesZipFile);
      
      if (result && result.teachers) {
        setUploadedTeachers(result.teachers);
        setUploadStatus('success');
        toast.success(`${result.count} teachers uploaded successfully!`);
      } else {
        setUploadStatus('success');
        toast.success('Teachers uploaded successfully!');
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5 md:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-primary">Upload Teachers</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span>Excel Template</span>
          </button>
          <button
            type="button"
            onClick={downloadZipTemplate}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span>ZIP Template</span>
          </button>
        </div>
      </div>

      {/* File Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blue-800 text-sm sm:text-base">File Upload Requirements:</h3>
        </div>
        <p className="text-xs sm:text-sm text-blue-600 mb-2 sm:mb-3 break-words">
          Download the Excel template for teacher data and ZIP template for image organization. Fill in your data and upload both files.
        </p>
        <div className="text-xs sm:text-sm text-blue-700 space-y-2">
          <div>
            <strong>Excel File Format:</strong>
            <ul className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1 mt-1">
              <li>• <strong>teacherId:</strong> Unique teacher ID (required) - e.g., T1001, T1002</li>
              <li>• <strong>name:</strong> Teacher's full name (required)</li>
              <li>• <strong>phone:</strong> Phone number (required)</li>
              <li>• <strong>subject:</strong> Teaching subject (optional)</li>
              <li>• <strong>qualification:</strong> Educational qualification (optional)</li>
            </ul>
          </div>
          <div>
            <strong>Images ZIP (Optional):</strong>
            <ul className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1 mt-1">
              <li>• ZIP file containing teacher images</li>
              <li>• Image files should be named with teacher IDs (e.g., T1001.jpg, T1002.png)</li>
              <li>• Supported formats: .jpg, .jpeg, .png</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2 break-words">
          <strong>Note:</strong> Login credentials will be automatically generated based on the teacher ID.
        </p>
      </div>

      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-5 md:mb-6">
        {/* Excel File Upload */}
        <div className="border-2 border-dashed rounded-lg p-4 sm:p-5 md:p-6 text-center transition-colors duration-200 border-primary bg-gray-50 hover:bg-gray-100">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelChange}
            disabled={loading}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-600 font-medium break-words px-2">
                {excelFile ? excelFile.name : "Click to upload Excel file"}
              </span>
              <span className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</span>
            </div>
          </label>
        </div>

        {/* Images ZIP Upload */}
        <div className="border-2 border-dashed rounded-lg p-4 sm:p-5 md:p-6 text-center transition-colors duration-200 border-primary bg-gray-50 hover:bg-gray-100">
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
              <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-600 font-medium break-words px-2">
                {imagesZipFile ? imagesZipFile.name : "Click to upload images ZIP (optional)"}
              </span>
              <span className="text-xs text-gray-500">ZIP files only (.zip)</span>
            </div>
          </label>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className="mb-4 sm:mb-5 md:mb-6 text-center">
          {uploadStatus === 'uploading' ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm text-blue-600 font-medium">Uploading...</span>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              <span className="text-xs sm:text-sm text-green-600 font-medium">Upload Successful!</span>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              <span className="text-xs sm:text-sm text-red-600 font-medium">Upload Failed</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
        <button
          onClick={handleUpload}
          disabled={!excelFile || loading}
          className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            !excelFile || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload Teachers'}
        </button>
      </div>

      {/* Generated Credentials Display */}
      {uploadedTeachers.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <h3 className="font-semibold text-green-800 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Generated Teacher Credentials</span>
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadedTeachers.map((teacher, index) => (
              <div key={index} className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{teacher.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">Teacher ID: {teacher.teacherId}</p>
                  </div>
                  <div className="text-left sm:text-right flex-1 sm:flex-none">
                    <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                      <span className="text-gray-500">Username:</span> {teacher.credentials?.username}
                    </p>
                    <p className="text-xs sm:text-sm font-mono text-gray-700 break-words">
                      <span className="text-gray-500">Password:</span> {teacher.credentials?.password}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-green-600 mt-2 break-words">
            <strong>Important:</strong> Please save these credentials securely. They will be needed for teacher login.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default UploadTeachersForm;
