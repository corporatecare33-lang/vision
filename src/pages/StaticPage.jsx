import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StaticPage = ({ title, subtitle, slug: propSlug }) => {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(!!slug);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetch(`${API_URL}/pages/slug/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isActive !== false) setPage(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const displayTitle = page?.title || title || slug || "Page";
  const displayContent = page?.content || subtitle || "";

  if (loading) {
    return (
      <div className="container-custom py-32 text-center">
        <div className="inline-block w-8 h-8 border-4 border-vision-blue/30 border-t-vision-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-100 py-20">
        <div className="container-custom text-center">
          <p className="section-kicker">Vision</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">{displayTitle}</h1>
          {displayContent && <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">{displayContent}</p>}
        </div>
      </section>
      {page?.content && (
        <section className="container-custom py-16">
          <div className="rounded-lg border border-slate-100 bg-white p-10 shadow-sm">
            <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">{page.content}</div>
          </div>
        </section>
      )}
    </div>
  );
};

export default StaticPage;
