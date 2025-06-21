'use client';
import Header from '@/components/Header';
import { ReelPlayer } from '@/components/ReelPlayer';
import { useEffect, useState } from 'react';

interface Video {
  id: string;
  url: string;
  title: string;
  duration: number;
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async (page: number) => {
    setLoading(true);
    const skip = (page - 1) * limit;
    const res = await fetch(`/api/videos?skip=${skip}&limit=${limit}`);
    const data = await res.json();

    if (data.items.length === 0 || data.items.length < limit) {
      setHasMore(false);
    }

    setVideos((prev) => [...prev, ...data.items]);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <main className="pt-20">
      <Header />
      <div>
        {videos.map((video) => (
          <ReelPlayer key={video.id + video.url} src={video.url} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </main>
  );
}
