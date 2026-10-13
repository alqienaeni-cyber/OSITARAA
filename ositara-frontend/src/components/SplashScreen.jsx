import bgKuning from '../assets/splash screen.jpeg';
import bgBiru from '../assets/splash screen2.jpeg';
import logoOsitara from '../assets/LOGO OSITARA.png';

export default function SplashScreen() {
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col items-center justify-center font-sans select-none">

      {/* 1. ORNAMEN BIRU (KANAN) - DIBUAT PAS TINGGI LAYAR AGAR TIDAK KEPOTONG */}
      <div className="absolute right-0 top-0 bottom-0 w-[50vw] md:w-[45vw] h-full pointer-events-none z-0">
        <img
          src={bgBiru}
          alt="Ornamen Biru"
          className="w-full h-full object-fill object-right-top"
        />
      </div>

      {/* 2. ORNAMEN KUNING (KIRI BAWAH) */}
      <div className="absolute left-0 bottom-0 w-[45vw] md:w-[38vw] h-[45vh] pointer-events-none z-0">
        <img
          src={bgKuning}
          alt="Ornamen Kuning"
          className="w-full h-full object-contain object-left-bottom"
        />
      </div>

      {/* 3. KONTEN UTAMA: LOGO & TEKS OSITARA DI TENGAH */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">

        {/* Logo OSITARA */}
        <img
          src={logoOsitara}
          alt="Logo OSITARA"
          className="w-40 h-40 md:w-48 md:h-48 object-contain mb-3 drop-shadow-sm"
        />

        {/* Judul OSITARA */}
        <h1 className="text-4xl md:text-5xl font-black text-[#2158B8] tracking-wider mb-2 font-poppins">
          OSITARA
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
