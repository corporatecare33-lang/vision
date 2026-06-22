import { useState, useEffect } from "react";
import { Image, Plus, Trash2, Edit, RefreshCcw, X, CheckCircle2, Upload, AlertTriangle } from "lucide-react";
import { getBanners, createBanner, updateBanner, deleteBanner } from "../services/api";

const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border whitespace-nowrap ${status ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status ? "bg-green-500" : "bg-red-500"}`} />
      {status ? "সক্রিয়" : "নিষ্ক্রিয়"}
    </span>
  );
};

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", alt: "", link: "", sortOrder: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState("");

  const loadBanners = async () => {
    setLoading(true);
    const data = await getBanners();
    if (Array.isArray(data)) setBanners(data);
    setLoading(false);
  };

  useEffect(() => { loadBanners(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("alt", form.alt);
    fd.append("link", form.link);
    fd.append("sortOrder", form.sortOrder);
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editingId) {
        const updateData = { title: form.title, alt: form.alt, link: form.link, sortOrder: form.sortOrder };
        if (imageFile) updateData.image = imageFile;
        await updateBanner(editingId, updateData);
      } else {
        await createBanner(fd);
      }
      setShowForm(false);
      setForm({ title: "", alt: "", link: "", sortOrder: 0 });
      setImageFile(null);
      setPreview("");
      setEditingId(null);
      loadBanners();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      await updateBanner(banner._id, { isActive: !banner.isActive, title: banner.title, alt: banner.alt, link: banner.link, sortOrder: banner.sortOrder });
      loadBanners();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ব্যানারটি মুছবেন?")) {
      await deleteBanner(id);
      loadBanners();
    }
  };

  const handleEdit = (banner) => {
    setForm({ title: banner.title, alt: banner.alt, link: banner.link, sortOrder: banner.sortOrder });
    setPreview(banner.image);
    setEditingId(banner._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900">ব্যানার ম্যানেজমেন্ট</h3>
          <p className="text-sm text-gray-500 mt-1">হিরো স্লাইডার ব্যানার আপলোড ও পরিচালনা</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", alt: "", link: "", sortOrder: 0 }); setPreview(""); setImageFile(null); }} className="flex items-center gap-2 bg-gradient-to-r from-vision-blue to-vision-cyan text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> নতুন ব্যানার
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900">{editingId ? "ব্যানার সম্পাদনা" : "নতুন ব্যানার"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ব্যানার ইমেজ *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-vision-blue/40 transition-all">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      <button type="button" onClick={() => { setPreview(""); setImageFile(null); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-300" />
                      <p className="text-xs text-gray-400">ছবি আপলোড করতে ক্লিক করুন</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">টাইটেল</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="ব্যানার টাইটেল" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ALT টেক্সট</label>
                <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="SEO alt text" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">লিংক (ঐচ্ছিক)</label>
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">সর্ট অর্ডার</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-vision-blue/50" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">বাতিল</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-vision-blue to-vision-cyan text-white rounded-xl text-xs font-bold hover:shadow-lg">
                  {editingId ? "আপডেট করুন" : "তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><RefreshCcw className="w-8 h-8 animate-spin mx-auto text-gray-300" /></div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center text-center">
          <Image className="w-16 h-16 text-gray-200 mb-4" />
          <h4 className="text-lg font-bold text-gray-900 mb-2">কোনো ব্যানার নেই</h4>
          <p className="text-sm text-gray-500">নতুন ব্যানার আপলোড করে হিরো স্লাইডার কাস্টমাইজ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="relative h-40 bg-gray-100">
                <img src={banner.image} alt={banner.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h4 className="text-sm font-bold text-gray-900 truncate">{banner.title}</h4>
                {banner.link && <p className="text-[10px] text-gray-400 truncate mt-0.5">{banner.link}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <StatusBadge status={banner.isActive} />
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleToggleStatus(banner)} className="p-1.5 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="স্ট্যাটাস টগল">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleEdit(banner)} className="p-1.5 text-gray-400 hover:text-vision-blue hover:bg-vision-blue/5 rounded-lg transition-all" title="সম্পাদনা">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="মুছুন">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerManager;