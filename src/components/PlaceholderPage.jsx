import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-[#3d2a20] mb-6">{title}</h1>
      <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl h-[60vh] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
        <div className="text-lg font-medium">Content for {title}</div>
        <p className="text-sm mt-2">This page is currently under development.</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
