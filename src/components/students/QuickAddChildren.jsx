import React, { useState } from 'react';
import { Plus, Users, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickAddChildren = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const options = [
    {
      id: 'add-multiple',
      title: 'Add Parent with Multiple Children',
      description: 'Create a new parent account and add multiple children at once',
      icon: UserPlus,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => navigate('/parent-management?tab=add-multiple')
    },
    {
      id: 'add-child',
      title: 'Add Child to Existing Parent',
      description: 'Add a new child to an existing parent account',
      icon: Plus,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/parent-management?tab=add-child')
    },
    {
      id: 'manage-parents',
      title: 'Manage All Parents',
      description: 'View and manage all parent accounts and their children',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => navigate('/parent-management')
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Children
      </button>

      {showOptions && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)}
          />
          
          {/* Options Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Add Multiple Children
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose how you want to add children to parent accounts
              </p>
              
              <div className="space-y-3">
                {options.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        option.action();
                        setShowOptions(false);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${option.color} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{option.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickAddChildren;
