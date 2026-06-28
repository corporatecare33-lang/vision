import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { assetPath, categories } from "../data/data";

const defaultSocialLinks = [
  { Icon: Facebook, key: "facebook", label: "Facebook" },
  { Icon: Instagram, key: "instagram", label: "Instagram" },
  { Icon: Youtube, key: "youtube", label: "Youtube" },
];

const officeLocations = [
  {
    title: "Singapore Office",
    address: "15C Kang Choon Bin Road, S548276 Singapore.",
  },
  {
    title: "Bangladesh Office",
    address: "House: 12, Road: 01, Block: F, Banani, Dhaka-1236.",
  },
  {
    title: "Timor-Leste Office",
    address: "Aimutin, Comoro, Dom Aleixo, Dili, Timor-Leste.",
  },
];

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState({ phone1: "+670 7551 3983", phone2: "+670 7717 9555", email: "visionsg26@gmail.com", facebook: "#", instagram: "#", youtube: "#", github: "https://github.com/", tagline: "Modern electronics and appliances designed for Bangladeshi homes, shops, and everyday routines." });

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    fetch(`${API_URL}/settings/general`).then(r => r.json()).then(d => { if (d?.value) setSiteSettings(s => ({ ...s, ...d.value })); }).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-cyan-200 bg-vision-dark pt-14 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 items-start gap-10 pb-10 text-center md:text-left lg:grid-cols-[1.35fr_0.75fr_1fr_1.05fr]">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-5 flex items-center justify-center gap-3 lg:justify-start">
              <img src={assetPath("/vision-logo.jpeg")} alt="Vision Smart" className="h-16 w-auto rounded-md bg-white object-contain p-2" />
            </div>
            <p className="mx-auto max-w-md text-sm leading-7 text-slate-300 lg:mx-0">
              {siteSettings.tagline || "Modern electronics and appliances designed for Bangladeshi homes, shops, and everyday routines."}
            </p>
            <div className="mt-6 flex justify-center gap-3 lg:justify-start">
              {defaultSocialLinks.map(({ Icon, key, label }) => {
                const raw = siteSettings[key] || "";
                const href = raw ? (raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`) : "#";
                return (
                  <a key={label} href={href} target={href === "#" ? undefined : "_blank"} rel={href === "#" ? undefined : "noreferrer"} className="grid h-10 w-10 place-items-center rounded-md bg-white/10 transition hover:bg-vision-cyan hover:text-vision-dark" aria-label={label}>
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Left column: Quick Links + Contact stacked (mobile), separate columns (desktop) */}
          <div className="min-w-0 lg:contents">
            <div className="mb-8 lg:mb-0">
              <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-left">Quick Links</h3>
              <ul className="space-y-3 text-sm text-slate-300 text-left">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/support" className="hover:text-white">Support</Link></li>
                <li><Link to="/news" className="hover:text-white">News</Link></li>
                <li><Link to="/media" className="hover:text-white">Media & Events</Link></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-black uppercase tracking-widest text-left">Contact</h3>
              <ul className="space-y-4 text-sm text-slate-300 text-left">
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-vision-cyan" />
                  <div>
                    <div className="mb-1 font-black uppercase text-white">Hotline</div>
                    <div className="space-y-1">
                      {[siteSettings.phone1, siteSettings.phone2].filter(Boolean).map((number) => (
                        <a key={number} href={`tel:${number.replace(/\s/g, "")}`} className="block hover:text-white">
                          {number}
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-vision-cyan" />
                  <a href={`mailto:${siteSettings.email || "visionsg26@gmail.com"}`} className="hover:text-white">{siteSettings.email || "visionsg26@gmail.com"}</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="min-w-0 text-left">
            <h3 className="mb-5 text-sm font-black uppercase tracking-widest">Products</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {categories.map((category) => (
                <li key={category.id}><Link to={category.path} className="hover:text-white">{category.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-10 rounded-lg border border-white/10 bg-white/5 p-5 md:p-6">
          <h3 className="mb-5 text-center text-sm font-black uppercase tracking-widest text-white">Our Locations</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {officeLocations.map((location) => (
              <div key={location.title} className="flex gap-3 rounded-md bg-white/5 p-4 text-left">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-vision-cyan" />
                <div>
                  <div className="mb-1 font-black text-white">{location.title}</div>
                  <p className="text-sm leading-6 text-slate-300">{location.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-white/10 py-6 text-center text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <p className="leading-6">Copyright 2026 Vision Appliances. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="https://digitalwebars.com/" target="_blank" rel="noreferrer" className="hover:text-white">Design and Development by DigitalWebars</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
