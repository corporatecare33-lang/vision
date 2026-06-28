import { useState, useEffect } from "react";
import { Award, Factory, Leaf, Users } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const About = () => {
  const [cmsPage, setCmsPage] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/pages/slug/about`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.isActive && data?.content) setCmsPage(data); })
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16">
        <div className="container-custom">
          <p className="section-kicker">About Vision</p>
          <h1 className="mb-5 text-5xl font-black uppercase tracking-normal text-slate-950">
            {cmsPage?.title || "Built For Everyday Life"}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            Vision is a leading appliance brand delivering quality electronics for homes and businesses across the region.
          </p>
        </div>
      </section>

      {cmsPage ? (
        <section className="container-custom py-16">
          <div className="prose max-w-none text-slate-700 leading-8 whitespace-pre-line">
            {cmsPage.content}
          </div>
        </section>
      ) : (
        <section className="container-custom grid gap-10 py-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-3xl font-black text-slate-950">Our Promise</h2>
            <p className="mb-6 leading-8 text-slate-600">Vision products are built around practical quality: efficient cooling, clear entertainment, reliable kitchen use, and customer support that is easy to find.</p>
            <p className="leading-8 text-slate-600">The design language uses Vision blue, white space, dense product grids, and category navigation inspired by large appliance retailers.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Factory, "Production Focus"],
              [Award, "Quality Standards"],
              [Leaf, "Energy Awareness"],
              [Users, "Customer Care"],
            ].map(([Icon, title]) => (
              <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-6">
                <Icon className="mb-5 h-10 w-10 text-vision-blue" />
                <h3 className="font-black text-slate-950">{title}</h3>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
