import { Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16">
        <div className="container-custom text-center">
          <p className="section-kicker">Contact</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">Get In Touch</h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">Send a message, call support, or visit the Vision office information panel.</p>
        </div>
      </section>

      <section className="container-custom grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          {[
            [MapPin, "Visit Us", "Vision Tower, Plot 12, Dhaka, Bangladesh"],
            [Phone, "Call Us", "+880 123 456 789"],
            [Mail, "Email Us", "support@vision.com"],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
              <Icon className="mb-4 h-8 w-8 text-vision-blue" />
              <h2 className="mb-1 font-black text-slate-950">{title}</h2>
              <p className="text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <form className="rounded-lg border border-slate-100 bg-white p-7 shadow-sm">
          <h2 className="mb-6 text-2xl font-black text-slate-950">Send Message</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <input className="form-input" placeholder="Full name" />
            <input className="form-input" placeholder="Email address" />
          </div>
          <input className="form-input mt-5" placeholder="Subject" />
          <textarea className="form-input mt-5 min-h-36" placeholder="Message" />
          <button className="btn-primary mt-5 inline-flex items-center gap-2" type="button">
            Send Message <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
};

export default Contact;
