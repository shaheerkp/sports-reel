// app/page.tsx
'use client';
import Header from '@/components/Header';
import { ReelPlayer } from '@/components/ReelPlayer';
import { useEffect, useState } from 'react';




export default function HomePage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch('/api/videos')
      .then((res) => res.json())
      .then(setVideos);
  }, []);

  return (
   

    <main className="pt-20">
       <Header/>
        <div>
     
      {videos.map((video: {id:string,url:string}) => (
        <ReelPlayer key={video.id} src={video.url} />
      ))}
    </div>
</main>
  );
}


