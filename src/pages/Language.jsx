import { useEffect, useState } from "react";
import { CheckCircle, Globe, Lock } from "lucide-react";

const LANGUAGE_KEY = "vision-language";

const languages = [
  {
    id: "en",
    label: "English",
    subtitle: "Use the storefront in English.",
    available: true,
  },
  {
    id: "bn",
    label: "Bengali",
    subtitle: "Bengali storefront translation is coming soon.",
    available: false,
  },
];

const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || "en");

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
    localStorage.setItem(LANGUAGE_KEY, selectedLanguage);
    window.dispatchEvent(new Event("language-updated"));
  }, [selectedLanguage]);

  return (
    <div>
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-100 py-20">
        <div className="container-custom text-center">
          <p className="section-kicker">Vision</p>
          <h1 className="mb-4 text-5xl font-black uppercase tracking-normal text-slate-950">Language</h1>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">Choose your storefront language preference.</p>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="mx-auto max-w-4xl rounded-lg border border-cyan-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-cyan-50 text-vision-blue">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-vision-dark">Storefront Language</h2>
              <p className="text-sm text-slate-500">Your selection is saved on this device.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {languages.map((language) => {
              const isSelected = selectedLanguage === language.id;

              return (
                <button
                  key={language.id}
                  type="button"
                  disabled={!language.available}
                  onClick={() => setSelectedLanguage(language.id)}
                  className={`rounded-lg border p-5 text-left transition ${
                    isSelected
                      ? "border-vision-blue bg-cyan-50 ring-4 ring-cyan-100"
                      : "border-slate-200 bg-white hover:border-cyan-300"
                  } ${!language.available ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xl font-black text-slate-950">{language.label}</span>
                    {language.available ? (
                      isSelected ? <CheckCircle className="h-5 w-5 text-vision-blue" /> : <span className="h-5 w-5 rounded-full border border-slate-300" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{language.subtitle}</p>
                  {!language.available && (
                    <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-500">Coming Soon</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-md border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-vision-dark">
            Current language: {languages.find((language) => language.id === selectedLanguage)?.label || "English"}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Language;
