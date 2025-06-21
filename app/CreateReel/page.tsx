"use client";

import React, { useState } from "react";

const CreateReelPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [voice, setVoice] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage("");
    setVideoUrl("");

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: title, voice }),
      });

      const data: { videoUrl: string; message: string } = await res.json();

      if (!res.ok || !data.videoUrl) {
        throw new Error(data.message || "Invalid response from API");
      }

      setResponseMessage(
        "✅ Reel meta generated successfully! ⏳ Preparing video..."
      );
      setLoading(true);

      setTimeout(() => {
        setVideoUrl(data.videoUrl);
        setResponseMessage("🎬 Video ready to watch!");
        setLoading(false);
      }, 60000);
    } catch (error: unknown) {
      console.error("Video creation error:", error);
      if (error instanceof Error) {
        setResponseMessage(`❌ Error: ${error.message}`);
      } else {
        setResponseMessage("❌ An unknown error occurred.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Create New Reel</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow-md"
      >
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Create New Reel</h2>
          <div className="relative group cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 7a1 1 0 012 0v3a1 1 0 01-2 0V7zm1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z"
                clipRule="evenodd"
              />
            </svg>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              ⚠️ Note: This video has been generated using a free AI tool with
              placeholder visuals. If you require high-quality content featuring
              actual images of real sports players, that would involve access to
              licensed assets and a paid version of the service.
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter the title to create an AI video reel
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter reel title"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose Voice Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="voice"
                value="male"
                checked={voice === "male"}
                onChange={() => setVoice("male")}
                disabled={loading}
              />
              <span>Male</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="voice"
                value="female"
                checked={voice === "female"}
                onChange={() => setVoice("female")}
                disabled={loading}
              />
              <span>Female</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-2 rounded-md transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating video..." : "Submit"}
        </button>

        {loading && (
          <p className="text-sm text-gray-500 mt-2">
            ⏳ Please don’t close the window. Processing your reel...
          </p>
        )}

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
