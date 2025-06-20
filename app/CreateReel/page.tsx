'use client';

import React, { useState } from 'react';

const CreateReelPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage('');
    setVideoUrl('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: title }),
      });

      const data = await res.json();

      if (!res.ok || !data.videoUrl) {
        throw new Error(data.message || 'Invalid response from API');
      }

      setVideoUrl(data.videoUrl);
      setResponseMessage('✅ Reel created successfully!');
    } catch (error: any) {
      setResponseMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Reel</h2>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter reel title"
            required
          />
        </div>



        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-2 rounded-md transition ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Generating video...' : 'Submit'}
        </button>

        <p>{loading?"please dont close the window":""}</p>
        {responseMessage && (
          <div className="text-sm text-gray-700 mt-4 bg-gray-100 p-3 rounded">
            {responseMessage}
          </div>
        )}
      </form>

      {videoUrl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Preview:</h3>
          <video
            src={videoUrl}
            controls
            className="w-full max-w-xl rounded-md shadow"
          />
        </div>
      )}
    </div>
  );
};

export default CreateReelPage;
