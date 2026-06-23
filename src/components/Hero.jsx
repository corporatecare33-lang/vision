import { useState, useEffect } from "react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { assetPath } from "../data/data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FALLBACK_SLIDES = [
  { image: "/hero/non-forst-english-1920x550.jpg", alt: "Vision Appliances" },
  { image: "/hero/side-by-side.jpg", alt: "Vision Refrigerators" },
  { image: "/hero/single-door.jpg", alt: "Vision Products" },
];

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/banners`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      } catch {
        setSlides(FALLBACK_SLIDES);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <section className="relative overflow-hidden">
        <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-vision-blue/20 border-t-vision-blue rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (!slides.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden">
      <Swiper modules={[Pagination, Autoplay, EffectFade]} effect="fade" pagination={{ clickable: true }} autoplay={{ delay: 4500 }} loop className="hero-swiper">
        {slides.map((slide, index) => (
          <SwiperSlide key={slide._id || slide.image || index}>
            <div className="hero-banner">
              <img src={slide.image.startsWith("http") ? slide.image : assetPath(slide.image)} alt={slide.alt || "Vision banner"} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
