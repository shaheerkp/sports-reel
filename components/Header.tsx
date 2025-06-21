'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/CreateReel');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Quick Reelzz</h1>
      <button
        onClick={handleCreate}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition duration-200"
      >
        Create
      </button>
    </header>
  );
};

export default Header;