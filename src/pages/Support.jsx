import { Link } from "react-router-dom";
import { FileQuestion, Headphones, ShieldCheck, Wrench } from "lucide-react";

const Support = () => {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-100 py-16">
        <div className="container-custom">
          <p className="section-kicker">Customer Care</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">Support</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">Find service help, warranty guidance, manuals, and contact options for Vision products.</p>
        </div>
      </section>

      <section className="container-custom grid gap-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        {[
          [Headphones, "Hotline", "Talk to support for product questions and service booking."],
          [Wrench, "Service Request", "Submit a service request for repair or installation."],
          [ShieldCheck, "Warranty", "Check warranty terms and registration details."],
          [FileQuestion, "Manuals", "Download static product manuals and specification sheets."],
        ].map(([Icon, title, text]) => (
          <div key={title} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <Icon className="mb-5 h-10 w-10 text-vision-blue" />
            <h2 className="mb-2 text-xl font-black text-slate-950">{title}</h2>
            <p className="text-sm leading-7 text-slate-600">{text}</p>
          </div>
        ))}
      </section>

      <div className="container-custom pb-16">
        <div className="rounded-lg bg-slate-950 p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-black">Need direct help?</h2>
            <p className="text-slate-300">Send a message to Vision support from the contact page.</p>
          </div>
          <Link to="/contact" className="mt-6 inline-block rounded-md bg-white px-6 py-3 font-bold text-slate-950 md:mt-0">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default Support;
