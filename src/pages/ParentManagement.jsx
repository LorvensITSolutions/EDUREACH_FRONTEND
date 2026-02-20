import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Plus, Search, Eye, UserPlus } from 'lucide-react';
import AddMultipleChildren from '../components/Parents/AddMultipleChildren';
import AddChildToParent from '../components/Parents/AddChildToParent';
import ParentList from '../components/Parents/ParentList';

const ParentManagement = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedParent, setSelectedParent] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['list', 'add-multiple', 'add-child'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'list', label: 'All Parents', icon: Users },
    { id: 'add-multiple', label: 'Add Parent with Children', icon: UserPlus },
    { id: 'add-child', label: 'Add Child to Parent', icon: Plus }
  ];

  const handleSuccess = (data) => {
    console.log('Operation successful:', data);
    setRefreshKey(prev => prev + 1); // Refresh the list
    setActiveTab('list'); // Switch back to list view
  };

  const handleParentSelect = (parent) => {
    setSelectedParent(parent);
    setActiveTab('add-child');
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6" style={{ borderColor: '#4DB6AC' }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#00796B' }}>Parent Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage parents and their children</p>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Manage parent accounts and multiple children
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: '#4DB6AC' }}>
        <div className="p-2 sm:p-3 md:p-4">
          <nav className="flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto -mx-2 sm:-mx-3 md:-mx-4 px-2 sm:px-3 md:px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-primary hover:border-primary-light'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? '#00796B' : 'transparent',
                    color: activeTab === tab.id ? '#00796B' : '#6B7280'
                  }}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {activeTab === 'list' && (
          <ParentList 
            key={refreshKey}
            onParentSelect={handleParentSelect}
          />
        )}

        {activeTab === 'add-multiple' && (
          <AddMultipleChildren onSuccess={handleSuccess} />
        )}

        {activeTab === 'add-child' && (
          <div>
            {selectedParent ? (
              <AddChildToParent 
                parentId={selectedParent._id}
                onSuccess={handleSuccess}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 text-center">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Select a Parent
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                  Choose a parent from the list to add a new child
                </p>
                <button
                  onClick={() => setActiveTab('list')}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Browse Parents
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentManagement;
