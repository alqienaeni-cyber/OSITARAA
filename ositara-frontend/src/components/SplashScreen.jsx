import React, { useEffect, useState } from 'react';
import bgKuning from '../assets/splash screen.jpeg';
import bgBiruAtas from '../assets/sp3.png';
import bgBiruBawah from '../assets/sp4.png';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(false);
  // State untuk menyimpan index huruf yang sedang/pernah diklik (dipencet)
  const [clickedLetters, setClickedLetters] = useState({});

  useEffect(() => {
    // Efek Fade-In saat splashscreen dimuat
    setIsVisible(true);
  }, []);

  // Handler saat huruf diklik/dipencet
  const handleLetterClick = (index) => {
    setClickedLetters((prev) => ({
      ...prev,
      [index]: !prev[index] // Toggle status dipencet (klik sekali menyala, klik lagi mati)
    }));
  };

  const titleChars = ['O', 'S', 'I', 'T', 'A', 'R', 'A'];

  return (
    <div
      className={`relative w-full h-screen bg-white overflow-hidden flex flex-col items-center justify-center font-sans select-none transition-opacity duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. ORNAMEN BIRU TUA (KANAN ATAS) */}
      <div className="absolute right-0 top-0 w-[45vw] md:w-[35vw] h-[50vh] pointer-events-none z-0 transition-transform duration-1000 ease-out">
        <img
          src={bgBiruAtas}
          alt="Ornamen Biru Atas"
          className="w-full h-full object-contain object-right-top"
        />
      </div>

      {/* 2. ORNAMEN BIRU MUDA (KANAN BAWAH) */}
      <div className="absolute right-0 bottom-0 w-[40vw] md:w-[30vw] h-[40vh] pointer-events-none z-0">
        <img
          src={bgBiruBawah}
          alt="Ornamen Biru Bawah"
          className="w-full h-full object-contain object-right-bottom"
        />
      </div>

      {/* 3. ORNAMEN KUNING (KIRI BAWAH) */}
      <div className="absolute left-0 bottom-0 w-[45vw] md:w-[38vw] h-[45vh] pointer-events-none z-0">
        <img
          src={bgKuning}
          alt="Ornamen Kuning"
          className="w-full h-full object-contain object-left-bottom"
        />
      </div>

      {/* 4. KONTEN UTAMA: LOGO & TEKS OSITARA DI TENGAH */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 transform transition-all duration-700">

        {/* LOGO OSITARA DENGAN ANIMASI INTERAKTIF */}
        <div className="flex justify-center mb-4">
          <div className="relative group cursor-pointer">
            <img
              src={logoOsitara}
              alt="OSITARA Logo"
              className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-xl animate-bounce hover:scale-110 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* TEKS OSITARA: BIRU SEMUA SECARA DEFAULT, NYALA KUNING HANYA SAAT DIPENCET */}
        <h1 className="text-4xl md:text-5xl font-black font-poppins tracking-wider mb-2 flex justify-center items-center overflow-hidden py-1">
          {titleChars.map((char, index) => {
            const isClicked = clickedLetters[index];

            return (
              <span
                key={index}
                onClick={() => handleLetterClick(index)}
                style={{ animationDelay: `${index * 150}ms` }}
                className={`inline-block animate-[bounce_1s_ease-in-out_infinite] hover:scale-125 transition-all duration-200 cursor-pointer select-none ${
                  isClicked
                    ? 'text-[#FFC700] hover:text-[#e0af00] drop-shadow-[0_2px_8px_rgba(255,199,0,0.6)] scale-110'
                    : 'text-[#2158B8] hover:text-[#FFC700]'
                }`}
                title="Klik huruf untuk menyalakan warna kuning!"
              >
                {char}
              </span>
            );
          })}
        </h1>

        {/* SUBTITLE */}
        <p className="text-xs md:text-sm font-bold text-[#2158B8] tracking-widest uppercase leading-tight max-w-xs mb-6">
          SISTEM MANAJEMEN OSIS<br />
          <span className="text-[#2158B8] font-extrabold">SMK BUDI BAKTI CIWIDEY</span>
        </p>

        {/* TOMBOL MASUK INTERAKTIF */}
        {onFinish && (
          <button
            type="button"
            onClick={onFinish}
            className="px-8 py-3 bg-[#FFC700] hover:bg-[#e0af00] text-[#2158B8] font-black text-sm md:text-base rounded-2xl shadow-md hover:shadow-lg hover:shadow-amber-400/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Masuk Ke Aplikasi
          </button>
        )}

      </div>
    </div>
  );
}
