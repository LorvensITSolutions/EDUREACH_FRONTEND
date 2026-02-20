import React, { useEffect, useState } from "react";
import { useClassStore } from "../stores/useClassStore";
import { useSubjectStore } from "../stores/useSubjectStore";
import { useTimetableStore } from "../stores/useTimetableStore";

export default function ClassManager() {
  const { classes, loading, error, fetchClasses, addClass, updateClass, deleteClass } = useClassStore();
  const { subjects, fetchSubjects } = useSubjectStore();
  const { teachersList, fetchTeachers } = useTimetableStore(); // Reuse teacher fetch

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodsPerWeek, setPeriodsPerWeek] = useState(5);
  const [teacherId, setTeacherId] = useState("");
  const [classSubjects, setClassSubjects] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [fetchClasses, fetchSubjects, fetchTeachers]);

  const handleAddSubject = () => {
    if (!subjectId || !periodsPerWeek) return;
    setClassSubjects([
      ...classSubjects,
      { subject: subjectId, periodsPerWeek, teacher: teacherId || null },
    ]);
    setSubjectId("");
    setPeriodsPerWeek(5);
    setTeacherId("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || classSubjects.length === 0) return;
    if (editId) {
      updateClass(editId, { name, subjects: classSubjects });
      setEditId(null);
    } else {
      addClass({ name, subjects: classSubjects });
    }
    setName("");
    setClassSubjects([]);
  };

  const handleEdit = (cls) => {
    setEditId(cls._id);
    setName(cls.name);
    setClassSubjects(
      cls.subjects.map((s) => ({
        subject: s.subject?._id || s.subject,
        periodsPerWeek: s.periodsPerWeek,
        teacher: s.teacher?._id || s.teacher || ""
      }))
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Class Management</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Class Name (e.g. 10A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <div className="flex gap-2 items-end">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select Subject</option>
            {subjects.map((subj) => (
              <option key={subj._id} value={subj._id}>{subj.name}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={periodsPerWeek}
            onChange={(e) => setPeriodsPerWeek(Number(e.target.value))}
            className="border p-2 rounded w-32"
            placeholder="Periods/week"
          />
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="border p-2 rounded flex-1"
          >
            <option value="">Assign Teacher (optional)</option>
            {teachersList.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
          <button type="button" onClick={handleAddSubject} className="bg-accent text-white px-3 py-2 rounded">Add Subject</button>
        </div>
        {/* Show subjects added to class */}
        {classSubjects.length > 0 && (
          <ul className="mt-2 space-y-1">
            {classSubjects.map((s, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2 items-center">
                {subjects.find(sub => sub._id === s.subject)?.name || "(Unknown Subject)"} ({s.periodsPerWeek} per week)
                {s.teacher && (
                  <span className="ml-2 text-xs text-gray-500">Teacher: {teachersList.find(t => t._id === s.teacher)?.name || "(Unknown)"}</span>
                )}
                <button type="button" className="ml-2 text-red-600" onClick={() => setClassSubjects(classSubjects.filter((_, i) => i !== idx))}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {editId ? "Update Class" : "Add Class"}
        </button>
        {editId && (
          <button
            type="button"
            className="ml-2 px-4 py-2 rounded bg-gray-400 text-white"
            onClick={() => {
              setEditId(null);
              setName("");
              setClassSubjects([]);
            }}
          >
            Cancel
          </button>
        )}
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Class</th>
            <th className="border px-2 py-1">Subjects</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => (
            <tr key={cls._id}>
              <td className="border px-2 py-1 font-semibold">{cls.name}</td>
              <td className="border px-2 py-1">
                <ul>
                  {cls.subjects.map((s, idx) => (
                    <li key={idx}>
                      {s.subject?.name || "(Unknown Subject)"} ({s.periodsPerWeek} per week)
                      {s.teacher && (
                        <span className="ml-2 text-xs text-gray-500">Teacher: {s.teacher?.name || "(Unknown)"}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border px-2 py-1">
                <button className="text-blue-600 mr-2" onClick={() => handleEdit(cls)}>Edit</button>
                <button className="text-red-600" onClick={() => deleteClass(cls._id)} disabled={loading}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
