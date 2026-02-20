// src/components/admin/parents/ParentFilters.jsx
import { useState } from "react";
import { useParentStore } from "../stores/useParentStore"; // adjust if needed

const ParentFilters = () => {
  const { fetchParents } = useParentStore();
  const [search, setSearch] = useState("");
  const [childClass, setChildClass] = useState("");
  const [childSection, setChildSection] = useState("");
  const [childName, setChildName] = useState("");

  const handleFilter = () => {
    fetchParents({
      search: search.trim(),
      childClass: childClass.trim(),
      childSection: childSection.trim(),
      childName: childName.trim(),
    });
  };

  const handleClear = () => {
    setSearch("");
    setChildClass("");
    setChildSection("");
    setChildName("");
    fetchParents(); // fetch all without filters
  };

  return (
    <div className="flex flex-wrap gap-4 items-end mb-4 animate-fade-in">
      <input
        type="text"
        placeholder="Search parent name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded w-full sm:w-60"
      />
      <input
        type="text"
        placeholder="Child's class"
        value={childClass}
        onChange={(e) => setChildClass(e.target.value)}
        className="border px-3 py-2 rounded w-32"
      />
      <input
        type="text"
        placeholder="Child's section"
        value={childSection}
        onChange={(e) => setChildSection(e.target.value)}
        className="border px-3 py-2 rounded w-32"
      />
      <input
        type="text"
        placeholder="Child's name"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
        className="border px-3 py-2 rounded w-full sm:w-60"
      />
      <div className="flex gap-2">
        <button
          onClick={handleFilter}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
        >
          Filter
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default ParentFilters;
