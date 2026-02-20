// src/components/students/UploadStudentDragDrop.jsx
import { useState, useRef } from "react";
import { useStudentStore } from "../stores/useStudentStore";
import { utils, writeFile } from "xlsx";
import { Download } from "lucide-react";
import JSZip from "jszip";

const UploadStudentDragDrop = () => {
  const { uploadStudents } = useStudentStore();
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const excelInputRef = useRef();
  const zipInputRef = useRef();

  const handleFiles = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "excel") setExcelFile(file);
    else if (type === "zip") setZipFile(file);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (type === "excel" && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setExcelFile(file);
    } else if (type === "zip" && file.name.endsWith(".zip")) {
      setZipFile(file);
    } else {
      alert("Invalid file type");
    }
  };

  const downloadTemplate = () => {
    // Create template data with headers and example rows
    // Note: Backend normalizes to lowercase, but both camelCase and lowercase work
    const templateData = [
      // Headers (can use either format - backend normalizes)
      ["studentId", "name", "class", "section", "birthDate", "parentName", "parentPhone"],
      // Example row 1
      ["S1001", "John Doe", "1", "A", "2010-05-15", "Jane Doe", "1234567890"],
      // Example row 2
      ["S1002", "Jane Smith", "2", "B", "2009-03-20", "John Smith", "0987654321"],
      // Empty row for user to add more data
      ["", "", "", "", "", "", ""],
    ];

    // Create workbook and worksheet
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(templateData);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // studentId
      { wch: 20 }, // name
      { wch: 10 }, // class
      { wch: 10 }, // section
      { wch: 15 }, // birthDate
      { wch: 20 }, // parentName
      { wch: 15 }, // parentPhone
    ];

    // Style header row (bold)
    const headerStyle = { font: { bold: true } };
    for (let col = 0; col < templateData[0].length; col++) {
      const cellAddress = utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    // Add worksheet to workbook
    utils.book_append_sheet(wb, ws, "Students Template");

    // Write file
    writeFile(wb, "Student_Upload_Template.xlsx");
  };

  const downloadZipTemplate = async () => {
    try {
      const zip = new JSZip();
      
      // Create a README file with instructions
      const readmeContent = `STUDENT IMAGES ZIP TEMPLATE - INSTRUCTIONS
==========================================

This ZIP file shows the structure for organizing student images.

IMPORTANT RULES:
1. Each image file must be named exactly as the studentId in your Excel file
2. Supported image formats: .jpg, .jpeg, .png
3. Image file names should match student IDs from your Excel file
   Example: If studentId is "S1001", the image should be named "S1001.jpg"

EXAMPLES:
- Student ID: S1001 → Image file: S1001.jpg (or S1001.png)
- Student ID: S1002 → Image file: S1002.jpeg (or S1002.jpg)

STRUCTURE:
All image files should be placed directly in the root of the ZIP file (not in subfolders).

Example ZIP structure:
├── S1001.jpg
├── S1002.png
├── S1003.jpeg
└── ...

NOTE:
- The ZIP file is optional - you can upload students without images
- If you upload images, make sure the file names match the studentId exactly
- Images will be automatically uploaded to Cloudinary and linked to students
`;

      // Add README file
      zip.file("README.txt", readmeContent);

      // Create placeholder text files as examples (since we can't create actual images)
      zip.file("S1001.jpg.txt", "This is a placeholder. Replace with actual image file named S1001.jpg");
      zip.file("S1002.png.txt", "This is a placeholder. Replace with actual image file named S1002.png");
      
      // Add instructions file
      const instructionsContent = `QUICK SETUP GUIDE:
1. Extract this ZIP file
2. Replace the .txt placeholder files with actual image files
3. Name each image file exactly as the studentId from your Excel file
4. Accepted formats: .jpg, .jpeg, .png
5. Create a new ZIP file with all the images
6. Upload both the Excel file and the new ZIP file together

Example:
- Excel has studentId: S1001
- Image file should be: S1001.jpg (or S1001.png or S1001.jpeg)
- Include both files in the upload form
`;
      zip.file("SETUP_INSTRUCTIONS.txt", instructionsContent);

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Student_Images_Template.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP template:", error);
      alert("Failed to create ZIP template. Please try again.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("excel", excelFile);
    if (zipFile) formData.append("imagesZip", zipFile);

    await uploadStudents(formData);

    // Reset
    setExcelFile(null);
    setZipFile(null);
    excelInputRef.current.value = "";
    zipInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleUpload}
      className="bg-white p-3 sm:p-6 rounded-2xl shadow-md flex flex-col gap-3 sm:gap-4"
    >
      {/* Download Template Buttons */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Upload Students</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
          >
            <Download size={16} />
            Excel Template
          </button>
          <button
            type="button"
            onClick={downloadZipTemplate}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
          >
            <Download size={16} />
            ZIP Template
          </button>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 mb-2">
        Download the Excel template for student data and ZIP template for image organization. Fill in your data and upload both files.
      </p>

      {/* Excel Upload */}
      <div
        className="border-2 border-dashed border-gray-400 rounded p-3 sm:p-4 text-center cursor-pointer hover:border-primary transition"
        onDrop={(e) => handleDrop(e, "excel")}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => excelInputRef.current.click()}
      >
        {excelFile ? (
          <p className="text-sm sm:text-base">{excelFile.name}</p>
        ) : (
          <p className="text-sm sm:text-base">Drag & drop Excel file here, or click to select</p>
        )}
        <input
          type="file"
          ref={excelInputRef}
          accept=".xlsx, .xls"
          className="hidden"
          onChange={(e) => handleFiles(e, "excel")}
        />
      </div>

      {/* ZIP Upload */}
      <div
        className="border-2 border-dashed border-gray-400 rounded p-3 sm:p-4 text-center cursor-pointer hover:border-primary transition"
        onDrop={(e) => handleDrop(e, "zip")}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => zipInputRef.current.click()}
      >
        {zipFile ? (
          <p className="text-sm sm:text-base">{zipFile.name}</p>
        ) : (
          <p className="text-sm sm:text-base">Drag & drop ZIP file here (optional), or click to select</p>
        )}
        <input
          type="file"
          ref={zipInputRef}
          accept=".zip"
          className="hidden"
          onChange={(e) => handleFiles(e, "zip")}
        />
      </div>

      <button
        type="submit"
        className="bg-primary text-white px-4 sm:px-6 py-2 rounded hover:bg-primary-dark transition text-sm sm:text-base w-full sm:w-auto"
      >
        Upload Students
      </button>
    </form>
  );
};

export default UploadStudentDragDrop;
