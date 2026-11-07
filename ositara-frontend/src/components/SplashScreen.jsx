import React, { useEffect, useState } from 'react';
import bgKuning from '../assets/splash screen.jpeg';
import bgBiruAtas from '../assets/sp3.png';
import bgBiruBawah from '../assets/sp4.png'; // Atau ganti jadi '../assets/sp2.png' sesuai nama file kamu
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Efek Fade-In saat splashscreen dimuat
    setIsVisible(true);
  }, []);

  return (
    <div className={`relative w-full h-screen bg-white overflow-hidden flex flex-col items-center justify-center font-sans select-none transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

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

        {/* Logo OSITARA Interaktif */}
        <div className="relative mb-3 group cursor-pointer">
          <img
            src={logoOsitara}
            alt="Logo OSITARA"
            className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-md animate-bounce hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Judul OSITARA: Pop-Up per huruf (Persis seperti di Register) */}
        <h1 className="text-4xl md:text-5xl font-black font-poppins text-[#2158B8] tracking-wider mb-2 flex justify-center items-center overflow-hidden py-1">
          {['O', 'S', 'I', 'T', 'A', 'R', 'A'].map((char, index) => (
            <span
              key={index}
              className="inline-block animate-[bounce_1s_ease-in-out_infinite] hover:scale-125 transition-transform cursor-default"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Subtitle Nama Sekolah */}
        <p className="text-xs md:text-sm font-bold text-[#2158B8] tracking-widest uppercase leading-tight max-w-xs">
          SISTEM MANAJEMEN OSIS<br />
          <span className="text-[#2158B8]">SMK BUDI BAKTI CIWIDEY</span>
        </p>

      </div>

    </div>
  );
}
