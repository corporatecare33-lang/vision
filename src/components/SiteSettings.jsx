import { useState, useEffect } from "react";
import { Save, RefreshCcw, Upload, Image } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const SiteSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "", siteUrl: "", email: "", phone: "", address: "", logoUrl: "", faviconUrl: "", facebook: "", twitter: "", instagram: "", youtube: "", footerText: "", seoTitle: "", seoDescription: "", seoKeywords: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        const data = await res.json();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = settings.logoUrl;
      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const uploadRes = await fetch(`${API_URL}/settings/upload`, {
          method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) logoUrl = uploadData.url;
      }

      await fetch(`${API_URL}/settings/batch`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ settings: { ...settings, logoUrl } }),
      });
      setSettings(prev => ({ ...prev, logoUrl }));
      setLogoFile(null);
      alert("✅ Settings saved!");
    } catch (e) { alert("Error: " + e.message); }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-vision-blue/20 border-t-vision-blue rounded-full animate-spin" /></div>;
  }

  const fields = [
    { key: "siteName", label: "Site Name", type: "text" },
    { key: "siteUrl", label: "Site URL", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "text" },
  ];

  const socialFields = [
    { key: "facebook", label: "Facebook URL" },
    { key: "twitter", label: "Twitter URL" },
    { key: "instagram", label: "Instagram URL" },
    { key: "youtube", label: "YouTube URL" },
  ];

  const seoFields = [
    { key: "seoTitle", label: "SEO Title", type: "text" },
    { key: "seoDescription", label: "SEO Description", type: "textarea" },
    { key: "seoKeywords", label: "SEO Keywords (comma separated)", type: "text" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">Site Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Global website settings and configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4">General Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                <input type={f.type || "text"} value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4">Address & Footer</h4>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Address</label>
              <textarea value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} rows={2}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Footer Text</label>
              <input value={settings.footerText || ""} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4">Logo & Favicon</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Site Logo</label>
              {settings.logoUrl && (
                <div className="mb-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-vision-blue/10 file:text-vision-blue" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Favicon URL</label>
              <input value={settings.faviconUrl || ""} onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="https://..." />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4">Social Links</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialFields.map(f => (
              <div key={f.key}>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                <input value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="https://..." />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4">SEO Settings</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seoFields.map(f => (
              <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} rows={2}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                ) : (
                  <input value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;