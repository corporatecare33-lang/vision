import { Award, Factory, Leaf, Users } from "lucide-react";

const About = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16">
        <div className="container-custom">
          <p className="section-kicker">About Vision</p>
          <h1 className="mb-5 text-5xl font-black uppercase tracking-normal text-slate-950">Built For Everyday Life</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            Vision is a frontend-only appliance brand experience focused on clean browsing, clear category pages, and modern ecommerce interaction.
          </p>
        </div>
      </section>

      <section className="container-custom grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-3xl font-black text-slate-950">Our Promise</h2>
          <p className="mb-6 leading-8 text-slate-600">Vision products are presented around practical quality: efficient cooling, clear entertainment, reliable kitchen use, and customer support that is easy to find.</p>
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
    </div>
  );
};

export default About;
