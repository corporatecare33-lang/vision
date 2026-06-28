import { useEffect, useState } from "react";
import { CheckCircle, Mail, MapPin, Phone, Send } from "lucide-react";

const Contact = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [settings, setSettings] = useState({ phone1: "", phone2: "", email: "visionsg26@gmail.com" });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/settings/general`)
      .then(r => r.json())
      .then(d => { if (d?.value) setSettings(s => ({ ...s, ...d.value })); })
      .catch(() => {});
  }, []);

  const phones = [settings.phone1, settings.phone2].filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("Name, email and message are required."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to send message."); }
      else { setSent(true); setForm({ name: "", email: "", subject: "", message: "" }); }
    } catch { setError("Network error. Please try again."); }
    setSending(false);
  };

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
          <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <MapPin className="mb-4 h-8 w-8 text-vision-blue" />
            <h2 className="mb-1 font-black text-slate-950">Visit Us</h2>
            <p className="text-sm leading-6 text-slate-600">Vision Tower, Plot 12, Dhaka, Bangladesh</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <Phone className="mb-4 h-8 w-8 text-vision-blue" />
            <h2 className="mb-1 font-black text-slate-950">Call Us</h2>
            {phones.length > 0 ? phones.map(num => (
              <a key={num} href={`tel:${num.replace(/\s/g, "")}`} className="block text-sm leading-7 text-slate-600 hover:text-vision-blue">{num}</a>
            )) : <p className="text-sm text-slate-400">Not set</p>}
          </div>
          <div className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <Mail className="mb-4 h-8 w-8 text-vision-blue" />
            <h2 className="mb-1 font-black text-slate-950">Email Us</h2>
            <a href={`mailto:${settings.email}`} className="text-sm leading-6 text-slate-600 hover:text-vision-blue">{settings.email || "visionsg26@gmail.com"}</a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-100 bg-white p-7 shadow-sm">
          <h2 className="mb-6 text-2xl font-black text-slate-950">Send Message</h2>

          {sent ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <p className="text-lg font-black text-slate-900">Message Sent!</p>
              <p className="text-sm text-slate-500">We'll get back to you as soon as possible.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-2 text-sm font-bold text-vision-blue hover:underline">Send another message</button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <input className="form-input" placeholder="Full name *" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} />
                <input className="form-input" placeholder="Email address *" type="email" value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} />
              </div>
              <input className="form-input mt-5" placeholder="Subject" value={form.subject} onChange={e => setForm(s => ({ ...s, subject: e.target.value }))} />
              <textarea className="form-input mt-5 min-h-36" placeholder="Message *" value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} />
              {error && <p className="mt-3 text-sm font-bold text-red-500">{error}</p>}
              <button className="btn-primary mt-5 inline-flex items-center gap-2 disabled:opacity-50" type="submit" disabled={sending}>
                {sending ? "Sending..." : <><Send className="h-4 w-4" /> Send Message</>}
              </button>
            </>
          )}
        </form>
      </section>
    </div>
  );
};

export default Contact;
