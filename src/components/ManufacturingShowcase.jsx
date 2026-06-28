import { useEffect, useState } from "react";
import { Factory, PlayCircle, ShieldCheck } from "lucide-react";
import { assetPath } from "../data/data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const staticHighlights = [
  { title: "Appliance Production", subtitle: "Refrigerator Manufacturing", imageUrl: "/manufacturing/appliance-washer-front.jpeg", isActive: true },
  { title: "AC Assembly Details", subtitle: "AC Manufacturing", imageUrl: "/manufacturing/ac-production-rack-front.jpeg", isActive: true },
];

const staticVideos = [
  { title: "Assembly Line", youtubeUrl: "", thumbnailUrl: "", src: "/manufacturing/factory-video-assembly-1.mp4", isActive: true },
  { title: "Component Check", youtubeUrl: "", thumbnailUrl: "", src: "/manufacturing/factory-video-assembly-2.mp4", isActive: true },
  { title: "Production View", youtubeUrl: "", thumbnailUrl: "", src: "/manufacturing/factory-video-assembly-3.mp4", isActive: true },
];

const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
};

const VideoCard = ({ video }) => {
  const ytId = getYoutubeId(video.youtubeUrl);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-100 bg-slate-950">
      {ytId ? (
        <iframe
          className="aspect-video w-full"
          src={`https://www.youtube.com/embed/${ytId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : video.src ? (
        <video className="aspect-video w-full object-cover" src={assetPath(video.src)} controls preload="metadata" playsInline />
      ) : video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} className="aspect-video w-full object-cover" />
      ) : (
        <div className="aspect-video w-full flex items-center justify-center bg-gray-800">
          <PlayCircle className="w-12 h-12 text-gray-600" />
        </div>
      )}
      <div className="bg-white px-4 py-3 text-sm font-black text-slate-950">{video.title}</div>
    </div>
  );
};

const ManufacturingShowcase = () => {
  const [highlights, setHighlights] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/settings/highlights`).then(r => r.json()).catch(() => ({ value: null })),
      fetch(`${API_URL}/settings/videos`).then(r => r.json()).catch(() => ({ value: null })),
    ]).then(([h, v]) => {
      setHighlights(Array.isArray(h?.value) && h.value.length > 0 ? h.value.filter(i => i.isActive !== false) : staticHighlights);
      setVideos(Array.isArray(v?.value) && v.value.length > 0 ? v.value.filter(i => i.isActive !== false) : staticVideos);
      setLoaded(true);
    });
  }, []);

  if (!loaded) return null;

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-16">
      <div className="container-custom">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Factory Gallery</p>
            <h2 className="section-title">Manufacturing Highlights</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-widest text-vision-dark">
            {highlights.slice(0, 2).map((h, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-white px-3 py-2">
                {i === 0 ? <Factory className="h-4 w-4 text-vision-blue" /> : <ShieldCheck className="h-4 w-4 text-vision-blue" />}
                {h.subtitle || h.title}
              </span>
            ))}
          </div>
        </div>

        {/* Highlights Grid */}
        {highlights.length > 0 && (
          <div className={`grid gap-6 ${highlights.length >= 2 ? "lg:grid-cols-2" : ""}`}>
            {highlights.map((h, i) => (
              <article key={i} className="overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-vision-blue">{h.subtitle}</p>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-normal text-slate-950">{h.title}</h3>
                  {h.description && <p className="mt-2 text-sm text-slate-500">{h.description}</p>}
                </div>
                {h.imageUrl && (
                  <div className="p-3">
                    <img src={h.imageUrl} alt={h.title} className="w-full rounded-lg object-cover aspect-video" loading="lazy" />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <PlayCircle className="h-6 w-6 text-vision-blue" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-vision-blue">Video Option</p>
                <h3 className="text-xl font-black uppercase tracking-normal text-slate-950">Factory Videos</h3>
              </div>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-3">
              {videos.map((video, i) => <VideoCard key={i} video={video} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ManufacturingShowcase;
