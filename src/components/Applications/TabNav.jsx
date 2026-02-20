const TabsNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'info', label: 'Information' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'application', label: 'Apply Now' }
  ];

  return (
    <nav className="flex space-x-8 px-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-4 px-2 border-b-2 font-medium text-sm ${
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabsNav;
