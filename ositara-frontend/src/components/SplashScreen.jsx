import React, { useEffect, useState } from 'react';
import bgKuning from '../assets/splash screen.jpeg';
import bgBiruAtas from '../assets/sp3.png';
import bgBiruBawah from '../assets/sp4.png';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(false);
  // State untuk menyimpan indeks huruf yang sedang/pernah diklik (dipencet)
  const [clickedLetters, setClickedLetters] = useState({});

  useEffect(() => {
    // Efek Fade-In saat SplashScreen dimuat
    setIsVisible(true);
  }, []);

  // Handler saat huruf diklik/dipencet
  const handleLetterClick = (index) => {
    setClickedLetters((prev) => ({
      ...prev,
      [index]: !prev[index], // Toggle status dipencet (klik sekali menyala, klik lagi mati)
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

        {/* LOGO OSITARA DENGAN ANIMASI INTERAKTIF MENYALA (SAMA SEPERTI REGISTER & LOGIN) */}
        <div className="flex justify-center mb-4">
          <div className="relative group w-32 h-32 md:w-44 md:h-44 flex items-center justify-center cursor-pointer">
            <div className="absolute inset-3 bg-amber-300/35 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={logoOsitara}
              alt="OSITARA Logo"
              className="relative w-full h-full object-contain animate-[bounce_3s_infinite] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* TEKS OSITARA: BIRU SEMUA SECARA DEFAULT, NAIK & NYALA KUNING SAAT DIPENCET / DISENTUH */}
        <h1 className="text-4xl md:text-5xl font-black font-poppins tracking-wider mb-2 flex justify-center items-center py-1">
          {titleChars.map((char, index) => {
            const isClicked = clickedLetters[index];
            return (
              <span
                key={index}
                onClick={() => handleLetterClick(index)}
                className={`inline-block cursor-pointer select-none transition-all duration-200 hover:text-[#FFC700] hover:-translate-y-1.5 hover:scale-110 active:scale-125 ${
                  isClicked
                    ? 'text-[#FFC700] -translate-y-1.5 scale-110 drop-shadow-xs'
                    : 'text-[#1E40AF]'
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
          SISTEM MANAJEMEN OSIS <br />
          <span className="text-[#2158B8] font-extrabold">SMK BUDI BAKTI CIWIDEY</span>
        </p>

        {/* TOMBOL MASUK INTERAKTIF */}
        {onFinish && (
          <button
            type="button"
            onClick={onFinish}
            className="px-8 py-3 bg-[#FFC700] hover:bg-[#FFC700] text-[#2158B8] font-black text-sm md:text-base rounded-2xl shadow-lg shadow-amber-400/50 hover:shadow-xl hover:shadow-amber-400/80 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            Masuk Ke Aplikasi
          </button>
        )}

      </div>
    </div>
  );
}
