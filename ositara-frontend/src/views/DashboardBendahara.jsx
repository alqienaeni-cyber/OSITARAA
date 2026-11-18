import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';
import logoOsitara from '../assets/LOGO OSITARA.png';

const API_BASE = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// --- FORMAT RUPIAH & TANGGAL ---
const formatRupiah = (angka) => {
  const num = Number(angka);
  if (Number.isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatRibuanInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseRibuanToNumber = (value) => {
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const formatTanggal = (tgl) => {
  if (!tgl) return '-';
  const cleanDate = String(tgl).split('T')[0].split(' ')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return cleanDate;
};

const formatTanggalFormal = () => {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// --- NORMALISASI & CACHE TRANSAKSI KEUANGAN ---
const SEPARATED_CACHE_KEY = 'ositara_keuangan_separated_v1';
const OVERRIDE_CACHE_KEY = 'ositara_keuangan_overrides_v1';
const NOTA_CACHE_KEY = 'ositara_keuangan_nota_cache_v1';

const normalizeNominal = (item) => {
  if (!item || typeof item !== 'object') return 0;
  const raw = item.jumlah ?? item.nominal ?? item.amount ?? 0;
  if (typeof raw === 'number') return Number.isNaN(raw) ? 0 : raw;
  const parsed = Number(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeJenis = (item) => {
  if (!item || typeof item !== 'object') return 'Pemasukan';
  const raw = String(
    item.jenis ?? item.jenis_transaksi ?? item.kategori ?? item.tipe ?? item.type ?? ''
  )
    .toLowerCase()
    .trim();
  if (
    raw === 'pengeluaran' ||
    raw === 'keluar' ||
    raw === 'expense' ||
    raw === 'debit' ||
    raw === 'out' ||
    raw.includes('keluar')
  ) {
    return 'Pengeluaran';
  }
  return 'Pemasukan';
};

const normalizeKategoriSumber = (item) => {
  if (!item || typeof item !== 'object') return 'Kas OSIS';
  const raw = String(
    item.kategori_sumber ?? item.sumber ?? item.sumber_dana ?? item.judul_sumber ?? 'Kas OSIS'
  ).trim();
  const low = raw.toLowerCase();
  if (low === 'kas osis' || low === 'kas' || low === '') return 'Kas OSIS';
  if (low === 'dana sekolah' || low === 'sekolah') return 'Dana Sekolah';
  if (low === 'sponsor' || low === 'sponsorship') return 'Sponsor';
  return 'Lainnya';
};

const normalizeSumberLabel = (item) => {
  if (!item || typeof item !== 'object') return 'Kas OSIS';
  const raw = String(
    item.sumber ?? item.sumber_dana ?? item.judul_sumber ?? item.kategori_sumber ?? 'Kas OSIS'
  ).trim();
  return raw || 'Kas OSIS';
};

const getFingerprint = (item) => {
  const tgl = String(item?.tanggal || '').split('T')[0].split(' ')[0];
  const ket = String(item?.keterangan || '').trim().toLowerCase();
  const nom = normalizeNominal(item);
  const jns = normalizeJenis(item);
  return `${tgl}|${ket}|${nom}|${jns}`;
};

const getNotaCacheMap = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTA_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveNotaToCache = (item, dataUrl) => {
  if (!dataUrl || !item) return;
  try {
    const map = getNotaCacheMap();
    if (item.id !== undefined && item.id !== null) {
      map[`id:${item.id}`] = dataUrl;
    }
    map[`fp:${getFingerprint(item)}`] = dataUrl;
    localStorage.setItem(NOTA_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Abaikan jika penuh
  }
};

const normalizeBuktiNota = (item) => {
  if (!item || typeof item !== 'object') return '';
  const direct = item.bukti_nota || item.foto_nota || item.nota || item.bukti || '';
  if (direct && typeof direct === 'string') {
    if (direct.startsWith('data:image') || direct.startsWith('http')) return direct;
    return `http://localhost:8000/storage/${direct.replace(/^\/+/, '')}`;
  }
  const map = getNotaCacheMap();
  if (item.id !== undefined && item.id !== null && map[`id:${item.id}`]) {
    return map[`id:${item.id}`];
  }
  return map[`fp:${getFingerprint(item)}`] || '';
};

const getLocalOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDE_CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveLocalOverride = (record) => {
  if (!record) return;
  try {
    const map = getLocalOverrides();
    if (record.id !== undefined && record.id !== null) {
      map[`id:${record.id}`] = record;
    }
    map[`fp:${getFingerprint(record)}`] = record;
    localStorage.setItem(OVERRIDE_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Abaikan error storage
  }
};

const removeLocalOverride = (record) => {
  if (!record) return;
  try {
    const map = getLocalOverrides();
    if (record.id !== undefined && record.id !== null) {
      delete map[`id:${record.id}`];
    }
    delete map[`fp:${getFingerprint(record)}`];
    localStorage.setItem(OVERRIDE_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Abaikan error storage
  }
};

const sanitizeKeuanganList = (list) => {
  if (!Array.isArray(list)) return [];
  const overrides = getLocalOverrides();
  const seenIds = new Set();
  const seenFps = new Set();
  const result = [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const ov =
      (item.id !== undefined && item.id !== null && overrides[`id:${item.id}`]) ||
      overrides[`fp:${getFingerprint(item)}`] ||
      null;
    const merged = ov ? { ...item, ...ov, id: item.id ?? ov.id } : item;
    const idKey = merged.id !== undefined && merged.id !== null ? `id:${merged.id}` : null;
    const fpKey = `fp:${getFingerprint(merged)}`;

    if (idKey && seenIds.has(idKey)) continue;
    if (seenFps.has(fpKey)) continue;
    if (idKey) seenIds.add(idKey);
    seenFps.add(fpKey);

    const jenisFix = normalizeJenis(merged);
    const nomFix = normalizeNominal(merged);

    result.push({
      ...merged,
      id: merged.id ?? `row-${result.length}-${Date.now()}`,
      tanggal: merged.tanggal || new Date().toISOString().split('T')[0],
      keterangan: merged.keterangan || '-',
      jenis: jenisFix,
      jenis_transaksi: jenisFix,
      kategori: jenisFix,
      tipe: jenisFix,
      type: jenisFix,
      nominal: nomFix,
      jumlah: nomFix,
      sumber: normalizeSumberLabel(merged),
      sumber_dana: normalizeSumberLabel(merged),
      kategori_sumber: normalizeKategoriSumber(merged),
      bukti_nota: normalizeBuktiNota(merged),
    });
  }
  return result;
};

// SINKRONISASI KE STORAGE GLOBAL & APP.JSX AGAR PEMASUKAN & PENGELUARAN TERUPDATE DI SEMUA DASHBOARD
const syncGlobalKeuanganStorage = (gabunganList, onUpdateKeuanganCallback) => {
  const cleanAll = sanitizeKeuanganList(gabunganList);
  // Versi ringan tanpa base64 gambar besar agar tidak pernah gagal karena limit 5MB localStorage
  const ringan = cleanAll.map((item) => ({
    ...item,
    bukti_nota:
      typeof item.bukti_nota === 'string' && item.bukti_nota.startsWith('data:image')
        ? ''
        : item.bukti_nota || '',
    foto_nota: '',
  }));

  try {
    localStorage.setItem('ositara_keuangan_list', JSON.stringify(cleanAll));
    localStorage.setItem('ositara_keuangan', JSON.stringify(cleanAll));
    localStorage.setItem('keuanganList', JSON.stringify(cleanAll));
  } catch {
    try {
      localStorage.setItem('ositara_keuangan_list', JSON.stringify(ringan));
      localStorage.setItem('ositara_keuangan', JSON.stringify(ringan));
      localStorage.setItem('keuanganList', JSON.stringify(ringan));
    } catch {
      // Tetap lanjutkan broadcast via callback & CustomEvent
    }
  }

  if (typeof onUpdateKeuanganCallback === 'function') {
    onUpdateKeuanganCallback(cleanAll);
  }

  window.dispatchEvent(new Event('ositara_keuangan_updated'));
  window.dispatchEvent(
    new CustomEvent('ositara-keuangan-updated', { detail: { keuanganList: cleanAll } })
  );
};

const persistSeparatedKeuangan = (masukList, keluarList, onUpdateKeuanganCallback) => {
  const cleanMasuk = sanitizeKeuanganList(masukList);
  const cleanKeluar = sanitizeKeuanganList(keluarList);
  try {
    localStorage.setItem(
      SEPARATED_CACHE_KEY,
      JSON.stringify({
        pemasukan: cleanMasuk,
        pengeluaran: cleanKeluar,
      })
    );
  } catch {
    try {
      const ringanMasuk = cleanMasuk.map((i) => ({ ...i, bukti_nota: '', foto_nota: '' }));
      const ringanKeluar = cleanKeluar.map((i) => ({ ...i, bukti_nota: '', foto_nota: '' }));
      localStorage.setItem(
        SEPARATED_CACHE_KEY,
        JSON.stringify({
          pemasukan: ringanMasuk,
          pengeluaran: ringanKeluar,
        })
      );
    } catch {
      // Abaikan error storage
    }
  }
  syncGlobalKeuanganStorage([...cleanMasuk, ...cleanKeluar], onUpdateKeuanganCallback);
};

const loadInitialSeparatedKeuangan = (fallbackList = []) => {
  try {
    const raw = localStorage.getItem(SEPARATED_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.pemasukan) || Array.isArray(parsed?.pengeluaran)) {
        const masuk = sanitizeKeuanganList(parsed.pemasukan || []).map((i) => ({
          ...i,
          jenis: 'Pemasukan',
          jenis_transaksi: 'Pemasukan',
          kategori: 'Pemasukan',
          tipe: 'Pemasukan',
          type: 'Pemasukan',
        }));
        const keluar = sanitizeKeuanganList(parsed.pengeluaran || []).map((i) => ({
          ...i,
          jenis: 'Pengeluaran',
          jenis_transaksi: 'Pengeluaran',
          kategori: 'Pengeluaran',
          tipe: 'Pengeluaran',
          type: 'Pengeluaran',
        }));
        return {
          pemasukan: masuk,
          pengeluaran: keluar,
        };
      }
    }
  } catch {
    // Lanjut fallback
  }

  const globalFallback =
    fallbackList && fallbackList.length > 0
      ? fallbackList
      : (() => {
          try {
            return JSON.parse(
              localStorage.getItem('ositara_keuangan_list') ||
                localStorage.getItem('ositara_keuangan') ||
                localStorage.getItem('keuanganList') ||
                '[]'
            );
          } catch {
            return [];
          }
        })();

  const clean = sanitizeKeuanganList(globalFallback);
  return {
    pemasukan: clean.filter((i) => normalizeJenis(i) === 'Pemasukan'),
    pengeluaran: clean.filter((i) => normalizeJenis(i) === 'Pengeluaran'),
  };
};

// --- KOMPRESI GAMBAR NOTA ---
const compressImageToDataUrl = (file, maxWidth = 900, quality = 0.72) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

const isItemKegiatanSekre = (item) => {
  if (!item || typeof item !== 'object') return false;
  const isEventFlag =
    Number(item.is_event) === 1 ||
    item.is_event === true ||
    String(item.is_event).toLowerCase() === 'true';
  const tipe = String(item.jenis || item.tipe || item.kategori || '')
    .toLowerCase()
    .trim();
  const pj = String(item.penanggung_jawab || item.pengaju || item.divisi || '')
    .toLowerCase()
    .trim();
  return (
    isEventFlag ||
    tipe.includes('kegiatan') ||
    tipe.includes('event') ||
    pj.includes('sekretaris')
  );
};

// --- KOMPONEN IKON SVG ---
const Icon = ({ type }) => {
  switch (type) {
    case 'beranda':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      );
    case 'keuangan':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'proposal':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'proker':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      );
    case 'anggota':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case 'kegiatan':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    case 'export':
      return (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'edit':
      return (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    case 'trash':
      return (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      );
    case 'image':
      return (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    case 'camera':
      return (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case 'logout':
      return (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      );
    default:
      return null;
  }
};

export default function DashboardBendahara({
  user,
  onLogout,
  keuanganList: propKeuangan = [],
  onUpdateKeuangan,
  proposalList: propProposal = [],
  prokerList: propProker = [],
  kegiatanList: propKegiatan = [],
  anggotaList: propAnggota = [],
  pesertaList: propPeserta = [],
  pendaftaranList: propPendaftaran = [],
}) {
  const [activeMenu, setActiveMenu] = useState('beranda');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    () => localStorage.getItem('ositara_bendahara_avatar') || null
  );
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const initialSeparated = loadInitialSeparatedKeuangan(propKeuangan);
  const [pemasukanList, setPemasukanList] = useState(initialSeparated.pemasukan);
  const [pengeluaranList, setPengeluaranList] = useState(initialSeparated.pengeluaran);

  const keuanganList = [...pemasukanList, ...pengeluaranList].sort((a, b) =>
    String(b.tanggal || '').localeCompare(String(a.tanggal || ''))
  );

  // SINKRONKAN SETIAP PERUBAHAN PEMASUKAN & PENGELUARAN KE GLOBAL STORAGE & DASHBOARD LAIN
  useEffect(() => {
    persistSeparatedKeuangan(pemasukanList, pengeluaranList, onUpdateKeuangan);
  }, [pemasukanList, pengeluaranList, onUpdateKeuangan]);

  const [proposalList, setProposalList] = useState(Array.isArray(propProposal) ? propProposal : []);
  const [prokerList, setProkerList] = useState(
    Array.isArray(propProker) ? propProker.filter((p) => !isItemKegiatanSekre(p)) : []
  );
  const [kegiatanList, setKegiatanList] = useState(
    Array.isArray(propKegiatan) && propKegiatan.length > 0
      ? propKegiatan
      : Array.isArray(propProker)
      ? propProker.filter((p) => isItemKegiatanSekre(p))
      : []
  );
  const [anggotaList, setAnggotaList] = useState(Array.isArray(propAnggota) ? propAnggota : []);
  const [pendaftaranList, setPendaftaranList] = useState(
    Array.isArray(propPeserta) && propPeserta.length > 0
      ? propPeserta
      : Array.isArray(propPendaftaran)
      ? propPendaftaran
      : []
  );

  const [kasSubView, setKasSubView] = useState('overview');
  const [selectedSumberDetail, setSelectedSumberDetail] = useState('Kas OSIS');
  const [activeTabelKategori, setActiveTabelKategori] = useState('Pemasukan');
  const [showOverviewKeseluruhan, setShowOverviewKeseluruhan] = useState(false);
  const [overviewKategoriFilter, setOverviewKategoriFilter] = useState('Pemasukan');

  const [isTambahKasModalOpen, setIsTambahKasModalOpen] = useState(false);
  const [isSumberLocked, setIsSumberLocked] = useState(false);
  const [sumber, setSumber] = useState('Kas OSIS');
  const [judulSumberCustom, setJudulSumberCustom] = useState('');
  const [jenisTransaksi, setJenisTransaksi] = useState('Pemasukan');
  const [tanggalTransaksi, setTanggalTransaksi] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [keterangan, setKeterangan] = useState('');
  const [nominalDisplay, setNominalDisplay] = useState('');
  const [buktiNota, setBuktiNota] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [editKasModal, setEditKasModal] = useState({
    isOpen: false,
    id: null,
    tanggal: '',
    keterangan: '',
    sumber: 'Kas OSIS',
    judulSumberCustom: '',
    jenis: 'Pemasukan',
    nominalDisplay: '',
    buktiNota: '',
  });
  const [isUpdatingKas, setIsUpdatingKas] = useState(false);

  const [cameraTarget, setCameraTarget] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState('');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const tambahGalleryRef = useRef(null);
  const editGalleryRef = useRef(null);

  const [pilihTabelModal, setPilihTabelModal] = useState({
    isOpen: false,
    sumber: 'Kas OSIS',
    pilihan: 'Pemasukan',
  });

  const [previewNotaModal, setPreviewNotaModal] = useState({
    isOpen: false,
    imageUrl: '',
    keterangan: '',
    tanggal: '',
    nominal: 0,
  });

  const [isLaporanModalOpen, setIsLaporanModalOpen] = useState(false);
  const [laporanSumberFilter, setLaporanSumberFilter] = useState('Semua');
  const [laporanJenisFilter, setLaporanJenisFilter] = useState('Semua');
  const [laporanPeriodeFilter, setLaporanPeriodeFilter] = useState('semua');
  const [laporanDraftList, setLaporanDraftList] = useState([]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const [selectedKegiatanPeserta, setSelectedKegiatanPeserta] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3200);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size >= 2 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar! Maksimal 2MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('ositara_bendahara_avatar', reader.result);
        setShowAvatarModal(false);
        showToast('Foto profil Bendahara berhasil diperbarui!');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleHapusAvatar = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Foto Profil?',
      message: 'Foto profil Anda akan dikembalikan ke inisial nama default.',
      onConfirm: () => {
        setAvatarUrl(null);
        localStorage.removeItem('ositara_bendahara_avatar');
        setShowAvatarModal(false);
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        showToast('Foto profil berhasil dihapus.');
      },
    });
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraTarget(null);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async (target) => {
    setCameraError('');
    setCapturedPreview('');
    stopCamera();
    setCameraTarget(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraTarget(null);
      setCameraError('Izin kamera ditolak atau perangkat kamera tidak tersedia.');
    }
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const maxW = 900;
    const scale = video.videoWidth > maxW ? maxW / video.videoWidth : 1;
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
    setCapturedPreview(dataUrl);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleRetakePhoto = () => {
    const currentTarget = cameraTarget;
    setCapturedPreview('');
    if (currentTarget) startCamera(currentTarget);
  };

  const handleUseCapturedPhoto = () => {
    if (!capturedPreview) return;
    if (cameraTarget === 'tambah') {
      setBuktiNota(capturedPreview);
    } else if (cameraTarget === 'edit') {
      setEditKasModal((prev) => ({ ...prev, buktiNota: capturedPreview }));
    }
    setCapturedPreview('');
    stopCamera();
  };

  const handlePickGalleryNota = async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 900, 0.72);
      if (target === 'tambah') {
        setBuktiNota(compressed);
      } else {
        setEditKasModal((prev) => ({ ...prev, buktiNota: compressed }));
      }
      setCapturedPreview('');
      stopCamera();
    } catch (err) {
      showToast(err.message || 'Gagal memproses gambar', 'warning');
    }
    e.target.value = '';
  };

  const syncAllFromServer = useCallback(async () => {
    try {
      const [resKeu, resProp, resProk, resAng, resPend] = await Promise.allSettled([
        api.get('/keuangan'),
        api.get('/proposal'),
        api.get('/program-kerja'),
        api.get('/pengurus'),
        api.get('/pendaftaran'),
      ]);
      if (resKeu.status === 'fulfilled') {
        const rawKeu = resKeu.value?.data?.data || resKeu.value?.data || [];
        if (Array.isArray(rawKeu) && rawKeu.length > 0) {
          const clean = sanitizeKeuanganList(rawKeu);
          const masuk = clean.filter((i) => normalizeJenis(i) === 'Pemasukan');
          const keluar = clean.filter((i) => normalizeJenis(i) === 'Pengeluaran');
          setPemasukanList(masuk);
          setPengeluaranList(keluar);
          persistSeparatedKeuangan(masuk, keluar, onUpdateKeuangan);
        }
      }
      if (resProp.status === 'fulfilled') {
        const rawProp = resProp.value?.data?.data || resProp.value?.data || [];
        if (Array.isArray(rawProp)) setProposalList(rawProp);
      }
      if (resProk.status === 'fulfilled') {
        const rawProk = resProk.value?.data?.data || resProk.value?.data || [];
        if (Array.isArray(rawProk)) {
          setProkerList(rawProk.filter((p) => !isItemKegiatanSekre(p)));
          setKegiatanList(rawProk.filter((p) => isItemKegiatanSekre(p)));
        }
      }
      if (resAng.status === 'fulfilled') {
        const rawAng = resAng.value?.data?.data || resAng.value?.data || [];
        if (Array.isArray(rawAng)) setAnggotaList(rawAng);
      }
      if (resPend.status === 'fulfilled') {
        const rawPend = resPend.value?.data?.data || resPend.value?.data || [];
        if (Array.isArray(rawPend)) setPendaftaranList(rawPend);
      }
    } catch {
      // Tetap gunakan state lokal jika offline
    }
  }, [onUpdateKeuangan]);

  useEffect(() => {
    syncAllFromServer();
  }, [syncAllFromServer]);

  const handleBukaDetailSumber = (sumberNama, kategoriAwal = 'Pemasukan') => {
    setSelectedSumberDetail(sumberNama);
    setActiveTabelKategori(kategoriAwal);
    setKasSubView('detail-sumber');
  };

  const handleBukaModalTambah = ({ lockedSumber = null, defaultJenis = 'Pemasukan' } = {}) => {
    stopCamera();
    setCapturedPreview('');
    setCameraError('');
    if (lockedSumber) {
      setSumber(lockedSumber);
      setIsSumberLocked(true);
    } else {
      setSumber('Kas OSIS');
      setIsSumberLocked(false);
    }
    setJudulSumberCustom('');
    setJenisTransaksi(defaultJenis);
    setTanggalTransaksi(new Date().toISOString().split('T')[0]);
    setKeterangan('');
    setNominalDisplay('');
    setBuktiNota('');
    setIsTambahKasModalOpen(true);
  };

  const getRingkasanBySumber = (sumberKategori) => {
    const masuk = pemasukanList.filter(
      (i) => normalizeKategoriSumber(i).toLowerCase() === sumberKategori.toLowerCase()
    );
    const keluar = pengeluaranList.filter(
      (i) => normalizeKategoriSumber(i).toLowerCase() === sumberKategori.toLowerCase()
    );
    const totalMasuk = masuk.reduce((acc, c) => acc + normalizeNominal(c), 0);
    const totalKeluar = keluar.reduce((acc, c) => acc + normalizeNominal(c), 0);
    return {
      pemasukanList: masuk,
      pengeluaranList: keluar,
      totalMasuk,
      totalKeluar,
      saldo: totalMasuk - totalKeluar,
    };
  };

  const handleTambahKas = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    const nominalNum = parseRibuanToNumber(nominalDisplay);
    if (!keterangan.trim() || nominalNum <= 0) {
      showToast('Silakan lengkapi keterangan dan nominal yang valid!', 'warning');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const tglFix = tanggalTransaksi || new Date().toISOString().split('T')[0];
    const kategoriSumberFix = isSumberLocked ? selectedSumberDetail : sumber || 'Kas OSIS';
    const sumberLabelFix =
      kategoriSumberFix === 'Lainnya'
        ? judulSumberCustom.trim() || 'Lainnya'
        : kategoriSumberFix;
    const jenisFix = jenisTransaksi === 'Pengeluaran' ? 'Pengeluaran' : 'Pemasukan';
    const notaFix = jenisFix === 'Pengeluaran' ? buktiNota : '';

    const payload = {
      tanggal: tglFix,
      keterangan: keterangan.trim(),
      kategori_sumber: kategoriSumberFix,
      sumber: sumberLabelFix,
      sumber_dana: sumberLabelFix,
      judul_sumber: sumberLabelFix,
      jenis: jenisFix,
      jenis_transaksi: jenisFix,
      kategori: jenisFix,
      tipe: jenisFix,
      type: jenisFix,
      jumlah: nominalNum,
      nominal: nominalNum,
      bukti_nota: notaFix,
      foto_nota: notaFix,
    };

    const tempLocalId = `local-${Date.now()}`;
    const recordLokalAwal = {
      id: tempLocalId,
      ...payload,
    };

    saveLocalOverride(recordLokalAwal);
    if (notaFix) saveNotaToCache(recordLokalAwal, notaFix);

    let currentMasuk = pemasukanList;
    let currentKeluar = pengeluaranList;

    if (jenisFix === 'Pengeluaran') {
      currentKeluar = sanitizeKeuanganList([recordLokalAwal, ...pengeluaranList]);
      setPengeluaranList(currentKeluar);
      persistSeparatedKeuangan(currentMasuk, currentKeluar, onUpdateKeuangan);
      if (kasSubView === 'detail-sumber' && activeTabelKategori !== 'Saldo') {
        setActiveTabelKategori('Pengeluaran');
      }
    } else {
      currentMasuk = sanitizeKeuanganList([recordLokalAwal, ...pemasukanList]);
      setPemasukanList(currentMasuk);
      persistSeparatedKeuangan(currentMasuk, currentKeluar, onUpdateKeuangan);
      if (kasSubView === 'detail-sumber' && activeTabelKategori !== 'Saldo') {
        setActiveTabelKategori('Pemasukan');
      }
    }

    let resData = null;
    const payloadTanpaFoto = { ...payload, bukti_nota: '', foto_nota: '' };

    try {
      const axiosRes = await api.post('/keuangan', payload);
      if (axiosRes && axiosRes.status >= 200 && axiosRes.status < 300) {
        resData = axiosRes.data?.data || axiosRes.data;
      }
    } catch {
      try {
        const axiosResLight = await api.post('/keuangan', payloadTanpaFoto);
        if (axiosResLight && axiosResLight.status >= 200 && axiosResLight.status < 300) {
          resData = axiosResLight.data?.data || axiosResLight.data;
        }
      } catch {
        try {
          const res = await fetch(`${API_BASE}/keuangan`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payloadTanpaFoto),
          });
          if (res.ok) {
            const json = await res.json().catch(() => ({}));
            resData = json?.data || json;
          }
        } catch {
          // Tetap aman tersimpan di localStorage & global state
        }
      }
    }

    if (resData && typeof resData === 'object' && resData.id) {
      removeLocalOverride(recordLokalAwal);
      const recordSynced = {
        ...recordLokalAwal,
        ...resData,
        id: resData.id,
        tanggal: tglFix,
        keterangan: keterangan.trim(),
        kategori_sumber: kategoriSumberFix,
        sumber: sumberLabelFix,
        sumber_dana: sumberLabelFix,
        jenis: jenisFix,
        jenis_transaksi: jenisFix,
        kategori: jenisFix,
        tipe: jenisFix,
        type: jenisFix,
        nominal: nominalNum,
        jumlah: nominalNum,
        bukti_nota: notaFix,
      };
      saveLocalOverride(recordSynced);
      if (notaFix) saveNotaToCache(recordSynced, notaFix);

      if (jenisFix === 'Pengeluaran') {
        const updatedKeluar = sanitizeKeuanganList(
          currentKeluar.map((it) => (it.id === tempLocalId ? recordSynced : it))
        );
        setPengeluaranList(updatedKeluar);
        persistSeparatedKeuangan(currentMasuk, updatedKeluar, onUpdateKeuangan);
      } else {
        const updatedMasuk = sanitizeKeuanganList(
          currentMasuk.map((it) => (it.id === tempLocalId ? recordSynced : it))
        );
        setPemasukanList(updatedMasuk);
        persistSeparatedKeuangan(updatedMasuk, currentKeluar, onUpdateKeuangan);
      }
    }

    stopCamera();
    setCapturedPreview('');
    setKeterangan('');
    setJudulSumberCustom('');
    setNominalDisplay('');
    setBuktiNota('');
    setTanggalTransaksi(new Date().toISOString().split('T')[0]);
    setIsTambahKasModalOpen(false);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    showToast(`Transaksi ${jenisFix} (${sumberLabelFix}) berhasil disimpan & disinkronkan!`);
  };

  const handleOpenEditKas = (item) => {
    stopCamera();
    setCapturedPreview('');
    setCameraError('');
    const cleanDate = item.tanggal
      ? String(item.tanggal).split('T')[0].split(' ')[0]
      : new Date().toISOString().split('T')[0];
    const katSumber = normalizeKategoriSumber(item);
    const labelSumber = normalizeSumberLabel(item);
    setEditKasModal({
      isOpen: true,
      id: item.id,
      tanggal: cleanDate,
      keterangan: item.keterangan || '',
      sumber: katSumber,
      judulSumberCustom:
        katSumber === 'Lainnya' && labelSumber !== 'Lainnya' ? labelSumber : '',
      jenis: normalizeJenis(item),
      nominalDisplay: formatRibuanInput(normalizeNominal(item)),
      buktiNota: normalizeBuktiNota(item),
    });
  };

  const handleUpdateKas = async (e) => {
    e.preventDefault();
    const nominalNum = parseRibuanToNumber(editKasModal.nominalDisplay);
    if (!editKasModal.keterangan.trim() || nominalNum <= 0) {
      showToast('Lengkapi keterangan dan nominal transaksi!', 'warning');
      return;
    }

    setIsUpdatingKas(true);
    const kategoriSumberFix = editKasModal.sumber || 'Kas OSIS';
    const sumberLabelFix =
      kategoriSumberFix === 'Lainnya'
        ? editKasModal.judulSumberCustom.trim() || 'Lainnya'
        : kategoriSumberFix;
    const jenisFix = editKasModal.jenis === 'Pengeluaran' ? 'Pengeluaran' : 'Pemasukan';
    const notaFix = jenisFix === 'Pengeluaran' ? editKasModal.buktiNota : '';

    const updatedRecord = {
      id: editKasModal.id,
      tanggal: editKasModal.tanggal,
      keterangan: editKasModal.keterangan.trim(),
      kategori_sumber: kategoriSumberFix,
      sumber: sumberLabelFix,
      sumber_dana: sumberLabelFix,
      jenis: jenisFix,
      jenis_transaksi: jenisFix,
      kategori: jenisFix,
      tipe: jenisFix,
      type: jenisFix,
      nominal: nominalNum,
      jumlah: nominalNum,
      bukti_nota: notaFix,
      foto_nota: notaFix,
    };

    saveLocalOverride(updatedRecord);
    if (notaFix) saveNotaToCache(updatedRecord, notaFix);

    const tanpaId = [...pemasukanList, ...pengeluaranList].filter(
      (i) => i.id !== editKasModal.id
    );
    const nextAll = sanitizeKeuanganList([updatedRecord, ...tanpaId]);
    const nextMasuk = nextAll.filter((i) => normalizeJenis(i) === 'Pemasukan');
    const nextKeluar = nextAll.filter((i) => normalizeJenis(i) === 'Pengeluaran');

    setPemasukanList(nextMasuk);
    setPengeluaranList(nextKeluar);
    persistSeparatedKeuangan(nextMasuk, nextKeluar, onUpdateKeuangan);

    if (!String(editKasModal.id).startsWith('local-')) {
      try {
        await api.put(`/keuangan/${editKasModal.id}`, updatedRecord);
      } catch {
        try {
          await api.put(`/keuangan/${editKasModal.id}`, {
            ...updatedRecord,
            bukti_nota: '',
            foto_nota: '',
          });
        } catch {
          // Sudah tersimpan di state lokal & global
        }
      }
    }

    stopCamera();
    setCapturedPreview('');
    setIsUpdatingKas(false);
    setEditKasModal((prev) => ({ ...prev, isOpen: false }));
    showToast('Perubahan transaksi berhasil disimpan & disinkronkan!');
  };

  const handleHapusKas = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Transaksi Kas',
      message: `Yakin ingin menghapus transaksi "${item.keterangan}" sebesar ${formatRupiah(
        normalizeNominal(item)
      )}?`,
      onConfirm: async () => {
        removeLocalOverride(item);
        const nextMasuk = pemasukanList.filter((i) => i.id !== item.id);
        const nextKeluar = pengeluaranList.filter((i) => i.id !== item.id);
        setPemasukanList(nextMasuk);
        setPengeluaranList(nextKeluar);
        persistSeparatedKeuangan(nextMasuk, nextKeluar, onUpdateKeuangan);

        if (!String(item.id).startsWith('local-')) {
          try {
            await api.delete(`/keuangan/${item.id}`);
          } catch {
            // Tetap terhapus dari state lokal & global
          }
        }
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        showToast('Transaksi berhasil dihapus & disinkronkan.');
      },
    });
  };

  const getPesertaByKegiatan = (keg) => {
    if (!keg) return [];
    const targetId = String(keg.id || '');
    const targetNama = String(keg.nama_proker || keg.namaKegiatan || keg.nama || '')
      .toLowerCase()
      .trim();
    return pendaftaranList.filter((p) => {
      const pId = String(p.kegiatan_id || p.proker_id || p.event_id || '');
      const pNama = String(p.nama_kegiatan || p.namaKegiatan || p.kegiatan || '')
        .toLowerCase()
        .trim();
      if (targetId && pId && targetId === pId) return true;
      if (targetNama && pNama && targetNama === pNama) return true;
      return false;
    });
  };

  const handleBukaUnduhProposal = async (item) => {
    const rawFile = item.file_proposal || item.file_url || item.berkas || '';
    if (!rawFile) {
      showToast('Berkas proposal tidak tersedia.', 'warning');
      return;
    }
    const idKey = item.id || rawFile;
    setDownloadingId(idKey);
    try {
      const fullUrl = String(rawFile).startsWith('http')
        ? rawFile
        : `http://localhost:8000/storage/${String(rawFile).replace(/^\/+/, '')}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPemasukan = pemasukanList.reduce((acc, c) => acc + normalizeNominal(c), 0);
  const totalPengeluaran = pengeluaranList.reduce((acc, c) => acc + normalizeNominal(c), 0);
  const saldoSaatIni = totalPemasukan - totalPengeluaran;

  const DAFTAR_SUMBER_DANA = ['Kas OSIS', 'Dana Sekolah', 'Sponsor', 'Lainnya'];
  const rekapPerSumberRows = DAFTAR_SUMBER_DANA.map((namaSumber) => {
    const info = getRingkasanBySumber(namaSumber);
    return {
      sumber: namaSumber,
      jumlahTransaksi: info.pemasukanList.length + info.pengeluaranList.length,
      totalMasuk: info.totalMasuk,
      totalKeluar: info.totalKeluar,
      saldo: info.saldo,
    };
  });

  const filterTransaksiLaporan = useCallback(
    (sumberF, jenisF, periodeF) => {
      const now = new Date();
      return keuanganList.filter((item) => {
        if (sumberF !== 'Semua' && normalizeKategoriSumber(item) !== sumberF) {
          return false;
        }
        if (jenisF !== 'Semua' && normalizeJenis(item) !== jenisF) {
          return false;
        }
        if (periodeF !== 'semua' && item.tanggal) {
          const itemDate = new Date(String(item.tanggal).split('T')[0]);
          if (!Number.isNaN(itemDate.getTime())) {
            const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
            if (periodeF === 'minggu' && diffDays > 7) return false;
            if (periodeF === 'bulan' && diffDays > 30) return false;
            if (periodeF === 'tahun' && diffDays > 365) return false;
          }
        }
        return true;
      });
    },
    [keuanganList]
  );

  const handleBukaLaporanDariCard = (jenisAwal = 'Semua', sumberAwal = 'Semua') => {
    setLaporanSumberFilter(sumberAwal);
    setLaporanJenisFilter(jenisAwal);
    setLaporanPeriodeFilter('semua');
    const filtered = filterTransaksiLaporan(sumberAwal, jenisAwal, 'semua').map((item, idx) => ({
      ...item,
      bukti_nota: normalizeBuktiNota(item),
      _draftId: `draft-${item.id || idx}-${Date.now()}`,
    }));
    setLaporanDraftList(filtered);
    setIsLaporanModalOpen(true);
  };

  useEffect(() => {
    if (!isLaporanModalOpen) return;
    const filtered = filterTransaksiLaporan(
      laporanSumberFilter,
      laporanJenisFilter,
      laporanPeriodeFilter
    ).map((item, idx) => ({
      ...item,
      bukti_nota: normalizeBuktiNota(item),
      _draftId: `draft-${item.id || idx}-${Date.now()}`,
    }));
    setLaporanDraftList(filtered);
  }, [
    isLaporanModalOpen,
    laporanSumberFilter,
    laporanJenisFilter,
    laporanPeriodeFilter,
    filterTransaksiLaporan,
  ]);

  const updateLaporanDraft = (draftId, field, value) => {
    setLaporanDraftList((prev) =>
      prev.map((row) => (row._draftId === draftId ? { ...row, [field]: value } : row))
    );
  };

  const tambahBarisLaporan = () => {
    setLaporanDraftList((prev) => [
      ...prev,
      {
        _draftId: `draft-new-${Date.now()}`,
        id: `local-${Date.now()}`,
        tanggal: new Date().toISOString().split('T')[0],
        kategori_sumber: 'Kas OSIS',
        sumber: 'Kas OSIS',
        keterangan: '',
        jenis: 'Pemasukan',
        jenis_transaksi: 'Pemasukan',
        kategori: 'Pemasukan',
        jumlah: 0,
        nominal: 0,
        bukti_nota: '',
      },
    ]);
  };

  const hapusBarisLaporan = (draftId) => {
    setLaporanDraftList((prev) => prev.filter((row) => row._draftId !== draftId));
  };

  const terapkanDraftKeDataKas = () => {
    const cleanedDraft = sanitizeKeuanganList(laporanDraftList);
    const nextMasuk = cleanedDraft.filter((i) => normalizeJenis(i) === 'Pemasukan');
    const nextKeluar = cleanedDraft.filter((i) => normalizeJenis(i) === 'Pengeluaran');
    setPemasukanList(nextMasuk);
    setPengeluaranList(nextKeluar);
    persistSeparatedKeuangan(nextMasuk, nextKeluar, onUpdateKeuangan);
    showToast('Perubahan draf laporan berhasil diterapkan ke daftar kas & semua dashboard!');
  };

  const getLabelPeriode = () => {
    if (laporanPeriodeFilter === 'minggu') return '7 Hari Terakhir';
    if (laporanPeriodeFilter === 'bulan') return '30 Hari Terakhir';
    if (laporanPeriodeFilter === 'tahun') return '1 Tahun Terakhir';
    return 'Seluruh Periode Berjalan';
  };

  const laporanTotalMasuk = laporanDraftList
    .filter((i) => String(i.jenis || i.jenis_transaksi || 'Pemasukan') === 'Pemasukan')
    .reduce((acc, c) => acc + Number(c.jumlah ?? c.nominal ?? 0), 0);

  const laporanTotalKeluar = laporanDraftList
    .filter((i) => String(i.jenis || i.jenis_transaksi || 'Pemasukan') !== 'Pemasukan')
    .reduce((acc, c) => acc + Number(c.jumlah ?? c.nominal ?? 0), 0);

  const laporanSaldoAkhir = laporanTotalMasuk - laporanTotalKeluar;

  const laporanNotaList = laporanDraftList.filter(
    (item) =>
      String(item.jenis || item.jenis_transaksi || 'Pemasukan') !== 'Pemasukan' &&
      Boolean(normalizeBuktiNota(item))
  );

  const handlePrintPdfLaporan = () => {
    window.print();
  };

  const handleExportLaporanImage = async (ext = 'png') => {
    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const loadedNotas = await Promise.all(
      laporanNotaList.map(async (item) => ({
        item,
        img: await loadImage(normalizeBuktiNota(item)),
      }))
    );
    const validNotas = loadedNotas.filter((n) => n.img !== null);

    const canvas = document.createElement('canvas');
    const rowHeight = 36;
    const headerHeight = 250;
    const footerHeight = 140;
    const notaCols = 3;
    const notaCardH = 230;
    const notaRows = Math.ceil(validNotas.length / notaCols);
    const notaSectionHeight = validNotas.length > 0 ? 70 + notaRows * notaCardH : 0;

    const width = 1000;
    const height =
      headerHeight +
      Math.max(1, laporanDraftList.length) * rowHeight +
      footerHeight +
      notaSectionHeight;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ORGANISASI SISWA INTRA SEKOLAH (OSIS)', width / 2, 48);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('LAPORAN PERTANGGUNGJAWABAN KEUANGAN', width / 2, 80);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Periode: ${getLabelPeriode()} | Dicetak: ${formatTanggalFormal()}`, width / 2, 108);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`Total Pemasukan: ${formatRupiah(laporanTotalMasuk)}`, 50, 155);
    ctx.fillText(`Total Pengeluaran: ${formatRupiah(laporanTotalKeluar)}`, 360, 155);
    ctx.fillText(`Saldo Akhir: ${formatRupiah(laporanSaldoAkhir)}`, 680, 155);

    let y = 205;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, y - 22, width - 80, 32);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('No', 55, y);
    ctx.fillText('Tanggal', 100, y);
    ctx.fillText('Sumber', 210, y);
    ctx.fillText('Keterangan', 330, y);
    ctx.fillText('Nota', 625, y);
    ctx.fillText('Jenis', 705, y);
    ctx.fillText('Nominal', 825, y);

    y += 34;
    ctx.font = '13px sans-serif';

    if (laporanDraftList.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.fillText('Tidak ada data transaksi pada filter yang dipilih.', 55, y);
    } else {
      laporanDraftList.forEach((row, idx) => {
        const isMasuk =
          String(row.jenis || row.jenis_transaksi || 'Pemasukan') === 'Pemasukan';
        const hasNota = !isMasuk && Boolean(normalizeBuktiNota(row));

        ctx.fillStyle = '#1e293b';
        ctx.fillText(String(idx + 1), 55, y);
        ctx.fillText(formatTanggal(row.tanggal), 100, y);
        ctx.fillText(String(row.sumber || row.kategori_sumber || 'Kas OSIS').slice(0, 14), 210, y);
        ctx.fillText(String(row.keterangan || '-').slice(0, 34), 330, y);

        ctx.fillStyle = hasNota ? '#1d4ed8' : '#94a3b8';
        ctx.fillText(hasNota ? 'Ada Nota' : '-', 625, y);

        ctx.fillStyle = isMasuk ? '#047857' : '#be123c';
        ctx.fillText(isMasuk ? 'Pemasukan' : 'Pengeluaran', 705, y);
        ctx.fillText(formatRupiah(Number(row.jumlah ?? row.nominal ?? 0)), 825, y);
        y += rowHeight;
      });
    }

    y += 14;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(
      `JUMLAH TOTAL: Pemasukan ${formatRupiah(laporanTotalMasuk)} - Pengeluaran ${formatRupiah(
        laporanTotalKeluar
      )} = Sisa Saldo ${formatRupiah(laporanSaldoAkhir)}`,
      55,
      y
    );

    if (validNotas.length > 0) {
      y += 45;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`LAMPIRAN BUKTI NOTA PENGELUARAN (${validNotas.length} NOTA)`, 50, y);
      y += 18;

      const cardW = 285;
      const gap = 22;
      validNotas.forEach(({ item, img }, idx) => {
        const col = idx % notaCols;
        const row = Math.floor(idx / notaCols);
        const cardX = 50 + col * (cardW + gap);
        const cardY = y + row * notaCardH;

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cardX, cardY, cardW, notaCardH - 14);

        const imgBoxH = 155;
        const ratio = Math.min((cardW - 16) / img.width, (imgBoxH - 10) / img.height);
        const drawW = img.width * ratio;
        const drawH = img.height * ratio;
        const drawX = cardX + (cardW - drawW) / 2;
        const drawY = cardY + 8 + (imgBoxH - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(
          `${idx + 1}. ${String(item.keterangan || '-').slice(0, 30)}`,
          cardX + 10,
          cardY + imgBoxH + 18
        );

        ctx.fillStyle = '#be123c';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(
          `${formatTanggal(item.tanggal)} • ${formatRupiah(normalizeNominal(item))}`,
          cardX + 10,
          cardY + imgBoxH + 36
        );
      });
    }

    const mimeType = ext === 'jpg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = `Laporan-Keuangan-OSIS-${new Date().toISOString().split('T')[0]}.${ext}`;
    link.href = canvas.toDataURL(mimeType, 0.92);
    link.click();
    showToast(`Laporan beserta bukti nota berhasil diunduh (${ext.toUpperCase()})!`);
  };

  const namaBendahara = user?.name || user?.nama || user?.namaLengkap || 'Bendahara OSIS';
  const namaKetuaOsis = 'Ketua OSIS';
  const inisialUser = String(namaBendahara || 'B').trim().charAt(0).toUpperCase();

  const menuItems = [
    { id: 'beranda', label: 'Beranda Utama', icon: 'beranda' },
    { id: 'catat-kas', label: 'Kelola Keuangan & Laporan', icon: 'keuangan' },
    { id: 'proposal-masuk', label: 'Proposal Masuk', icon: 'proposal' },
    { id: 'program-kerja', label: 'Program Kerja', icon: 'proker' },
    { id: 'anggota-osis', label: 'Anggota OSIS', icon: 'anggota' },
    { id: 'kegiatan-osis', label: 'Kegiatan OSIS', icon: 'kegiatan' },
  ];

  const sumberSummary = getRingkasanBySumber(selectedSumberDetail);
  const overviewFilteredList = keuanganList.filter((item) => {
    return normalizeJenis(item) === overviewKategoriFilter;
  });

  const buildMutasiSaldoBerjalan = (masukArr, keluarArr) => {
    const kronologis = [...masukArr, ...keluarArr].sort((a, b) =>
      String(a.tanggal || '').localeCompare(String(b.tanggal || ''))
    );
    let runningSaldo = 0;
    return kronologis.map((item) => {
      const isMasuk = normalizeJenis(item) === 'Pemasukan';
      const nom = normalizeNominal(item);
      runningSaldo += isMasuk ? nom : -nom;
      return {
        ...item,
        _isMasuk: isMasuk,
        _nom: nom,
        _saldoBerjalan: runningSaldo,
      };
    });
  };

  const overviewMutasiSaldo = buildMutasiSaldoBerjalan(pemasukanList, pengeluaranList);
  const sumberMutasiSaldo = buildMutasiSaldoBerjalan(
    sumberSummary.pemasukanList,
    sumberSummary.pengeluaranList
  );

  return (
    <div className="min-h-screen bg-[#EEF3FA] flex flex-col lg:flex-row font-sans text-slate-800">
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[60] animate-[fadeIn_0.25s_ease-out]">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
              toast.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* HEADER MOBILE */}
      <div className="lg:hidden bg-gradient-to-r from-[#1B4694] to-[#2158B8] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <img src={logoOsitara} alt="Logo OSITARA" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-black text-base tracking-tight block leading-none">
              OSITARA
            </span>
            <span className="text-[9px] font-bold text-[#FFD43B] uppercase tracking-wider">
              BENDAHARA OSIS
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs cursor-pointer"
        >
          {isSidebarOpen ? 'X Tutup' : '☰ Menu'}
        </button>
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR (DENGAN h-dvh & SAFE BOTTOM PADDING AGAR LOGOUT TIDAK TERTUTUP ADDRESS BAR / LOCALHOST DI LAYAR 690PX) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-dvh lg:h-screen w-64 bg-gradient-to-b from-[#1B4694] via-[#2158B8] to-[#3A86EF] text-white flex flex-col justify-between gap-4 p-5 pb-24 lg:pb-5 overflow-y-auto shrink-0 shadow-2xl border-r border-blue-600/40 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="px-1 py-2 mb-6 flex items-center gap-3.5">
            <img
              src={logoOsitara}
              alt="Logo OSITARA"
              className="w-10 h-10 object-contain drop-shadow-md"
            />
            <div>
              <h1 className="font-black text-xl text-white tracking-widest leading-none drop-shadow-md">
                OSITARA
              </h1>
              <span className="text-[10px] font-extrabold text-[#FFD43B] uppercase tracking-wider mt-1 block drop-shadow-xs">
                BENDAHARA OSIS
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((m) => {
              const active = activeMenu === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setActiveMenu(m.id);
                    if (m.id === 'catat-kas') setKasSubView('overview');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-start text-left gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#f4d875] to-[#f4d875] text-[#1B4694] shadow-lg shadow-amber-400/40 font-black translate-x-1'
                      : 'text-blue-50 hover:bg-white/15 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon type={m.icon} />
                  <span className="leading-snug">{m.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-2 shrink-0">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-start text-left gap-3 py-3.5 px-4 rounded-2xl bg-[#E63946] hover:bg-[#D62828] border border-rose-500 text-white font-black text-sm shadow-lg shadow-rose-600/40 transition-all duration-300 cursor-pointer"
          >
            <Icon type="logout" />
            <span className="tracking-wide">Logout</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto space-y-5">
        {/* BANNER PROFIL */}
        <div className="relative overflow-hidden bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200/90 transition-all duration-300 hover:shadow-md">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#2158B8]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="relative group cursor-pointer shrink-0"
              title="Klik untuk ubah foto profil"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profil Bendahara"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/40 group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#1B4694] to-[#3A86EF] flex items-center justify-center text-white border-2 border-white shadow-md ring-2 ring-blue-500/30 rounded-2xl font-black text-lg sm:text-2xl group-hover:scale-105 transition-all duration-300">
                  {inisialUser}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-bold transition-all duration-300 shadow-inner">
                Ubah
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-2xl font-black text-slate-800 leading-snug">
                Selamat Datang, <span className="text-[#2158B8]">{namaBendahara}</span>!
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-semibold">Jabatan:</span>
                <span className="px-3 py-0.5 rounded-full bg-blue-100/80 text-[#2158B8] border border-blue-300 text-[10px] font-black uppercase tracking-wider">
                  BENDAHARA OSIS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MENU 1: BERANDA UTAMA */}
        {activeMenu === 'beranda' && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => handleBukaLaporanDariCard('Pemasukan')}
                className="text-left p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">
                    TOTAL PEMASUKAN
                  </p>
                  <p className="text-2xl sm:text-3xl font-black mt-1">
                    {formatRupiah(totalPemasukan)}
                  </p>
                  <p className="text-[11px] mt-1.5 font-semibold underline opacity-95">
                    Klik laporan &amp; ekspor PDF/PNG/JPG &rarr;
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg shrink-0">
                  ↑
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleBukaLaporanDariCard('Pengeluaran')}
                className="text-left p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">
                    TOTAL PENGELUARAN
                  </p>
                  <p className="text-2xl sm:text-3xl font-black mt-1">
                    {formatRupiah(totalPengeluaran)}
                  </p>
                  <p className="text-[11px] mt-1.5 font-semibold underline opacity-95">
                    Klik laporan &amp; ekspor PDF/PNG/JPG &rarr;
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg shrink-0">
                  ↓
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleBukaLaporanDariCard('Semua')}
                className="text-left p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#2256B7] to-[#5899F2] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">
                    SALDO KAS SAAT INI
                  </p>
                  <p className="text-2xl sm:text-3xl font-black mt-1">
                    {formatRupiah(saldoSaatIni)}
                  </p>
                  <p className="text-[11px] mt-1.5 font-semibold underline opacity-95">
                    Klik laporan lengkap &amp; ekspor &rarr;
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg shrink-0">
                  $
                </div>
              </button>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2256B7]" />
                  Ringkasan Rekap Agregat per Sumber Dana
                </h3>
                <span className="text-[11px] font-bold text-[#2256B7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Total: {keuanganList.length} Transaksi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                      <th className="py-3 px-4 rounded-l-xl">Sumber Dana</th>
                      <th className="py-3 px-4 text-center">Jumlah Transaksi</th>
                      <th className="py-3 px-4 text-right text-emerald-700">Total Pemasukan</th>
                      <th className="py-3 px-4 text-right text-rose-700">Total Pengeluaran</th>
                      <th className="py-3 px-4 text-right text-[#2256B7] rounded-r-xl">
                        Saldo Akhir
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapPerSumberRows.map((row) => (
                      <tr
                        key={row.sumber}
                        onClick={() => {
                          setActiveMenu('catat-kas');
                          handleBukaDetailSumber(row.sumber, 'Saldo');
                        }}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                        title={`Klik untuk melihat mutasi ${row.sumber}`}
                      >
                        <td className="py-3.5 px-4 font-bold">
                          <span className="px-3 py-1 text-xs rounded-xl inline-block bg-blue-50 text-[#2256B7] border border-blue-200">
                            {row.sumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                          {row.jumlahTransaksi} transaksi
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                          +{formatRupiah(row.totalMasuk)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-rose-500">
                          -{formatRupiah(row.totalKeluar)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[#2256B7]">
                          {formatRupiah(row.saldo)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100/80 font-black border-t-2 border-slate-200">
                      <td className="py-3.5 px-4 text-slate-800 rounded-l-xl">
                        Total Keseluruhan OSIS
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700">
                        {keuanganList.length} transaksi
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-700">
                        +{formatRupiah(totalPemasukan)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-rose-700">
                        -{formatRupiah(totalPengeluaran)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#2256B7] rounded-r-xl">
                        {formatRupiah(saldoSaatIni)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Pemasukan Terbaru ({pemasukanList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('catat-kas')}
                    className="text-xs font-bold text-[#2256B7] hover:underline cursor-pointer"
                  >
                    Kelola &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {pemasukanList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada catatan pemasukan.
                      </p>
                    </div>
                  ) : (
                    pemasukanList.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-200/70 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {item.keterangan}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {formatTanggal(item.tanggal)} &bull; {normalizeSumberLabel(item)}
                          </p>
                        </div>
                        <span className="font-black text-xs sm:text-sm shrink-0 px-3 py-1 rounded-xl border text-emerald-700 bg-emerald-100/80 border-emerald-200">
                          +{formatRupiah(normalizeNominal(item))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Pengeluaran Terbaru ({pengeluaranList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('catat-kas')}
                    className="text-xs font-bold text-[#2256B7] hover:underline cursor-pointer"
                  >
                    Kelola &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {pengeluaranList.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-medium">
                        Belum ada catatan pengeluaran.
                      </p>
                    </div>
                  ) : (
                    pengeluaranList.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-200/70 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {item.keterangan}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {formatTanggal(item.tanggal)} &bull; {normalizeSumberLabel(item)}
                          </p>
                        </div>
                        <span className="font-black text-xs sm:text-sm shrink-0 px-3 py-1 rounded-xl border text-rose-600 bg-rose-100/80 border-rose-200">
                          -{formatRupiah(normalizeNominal(item))}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MENU 2: KELOLA KEUANGAN & LAPORAN */}
        {activeMenu === 'catat-kas' && (
          <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
            {kasSubView === 'overview' ? (
              <>
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800">
                      Manajemen Kas &amp; Sumber Dana OSIS
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik Pemasukan, Pengeluaran, atau langsung klik SALDO untuk melihat tabel
                      gabungan pemasukan &amp; pengeluaran.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleBukaLaporanDariCard('Semua', 'Semua')}
                      className="px-4 py-2.5 rounded-2xl bg-[#109868] hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Icon type="export" />
                      <span>Ekspor Laporan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBukaModalTambah()}
                      className="px-4 py-2.5 rounded-2xl bg-[#2256B7] hover:bg-[#1A469B] text-white font-black text-xs shadow-sm transition-all cursor-pointer"
                    >
                      + Tambah Transaksi
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2256B7]" />
                      TOTAL KESELURUHAN SEMUA SUMBER DANA ({keuanganList.length} TRANSAKSI)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Klik salah satu kartu untuk membuka tabel rincian keseluruhan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setOverviewKategoriFilter('Pemasukan');
                        setShowOverviewKeseluruhan(true);
                      }}
                      className="text-left p-5 rounded-2xl bg-gradient-to-r from-[#10A37F] to-[#2DD4BF] text-white shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                          TOTAL SELURUH PEMASUKAN
                        </p>
                        <p className="text-xl sm:text-2xl font-black mt-1">
                          {formatRupiah(totalPemasukan)}
                        </p>
                        <p className="text-[11px] mt-1.5 underline opacity-95">
                          Klik lihat tabel {pemasukanList.length} pemasukan &rarr;
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black shrink-0">
                        ↑
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOverviewKategoriFilter('Pengeluaran');
                        setShowOverviewKeseluruhan(true);
                      }}
                      className="text-left p-5 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#F472B6] text-white shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                          TOTAL SELURUH PENGELUARAN
                        </p>
                        <p className="text-xl sm:text-2xl font-black mt-1">
                          {formatRupiah(totalPengeluaran)}
                        </p>
                        <p className="text-[11px] mt-1.5 underline opacity-95">
                          Klik lihat tabel {pengeluaranList.length} pengeluaran &rarr;
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black shrink-0">
                        ↓
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOverviewKategoriFilter('Saldo');
                        setShowOverviewKeseluruhan(true);
                      }}
                      className="text-left p-5 rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#60A5FA] text-white shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                          TOTAL SALDO AKHIR OSIS
                        </p>
                        <p className="text-xl sm:text-2xl font-black mt-1">
                          {formatRupiah(saldoSaatIni)}
                        </p>
                        <p className="text-[11px] mt-1.5 underline opacity-95">
                          Klik lihat tabel gabungan pemasukan &amp; pengeluaran &rarr;
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs shrink-0">
                        Rp
                      </div>
                    </button>
                  </div>

                  {showOverviewKeseluruhan && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-700 uppercase">
                          {overviewKategoriFilter === 'Saldo'
                            ? `Tabel Gabungan Pemasukan & Pengeluaran (${overviewMutasiSaldo.length} Transaksi)`
                            : `Tabel ${overviewKategoriFilter} Keseluruhan (${overviewFilteredList.length} Transaksi)`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowOverviewKeseluruhan(false)}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Tutup Tabel X
                        </button>
                      </div>

                      {overviewKategoriFilter === 'Saldo' ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px] bg-blue-50/70">
                                <th className="py-2.5 px-3 rounded-l-xl">Tanggal</th>
                                <th className="py-2.5 px-3">Sumber</th>
                                <th className="py-2.5 px-3">Keterangan</th>
                                <th className="py-2.5 px-3 text-right text-emerald-700">
                                  Pemasukan (+)
                                </th>
                                <th className="py-2.5 px-3 text-right text-rose-700">
                                  Pengeluaran (-)
                                </th>
                                <th className="py-2.5 px-3 text-right text-[#2256B7]">
                                  Saldo Berjalan
                                </th>
                                <th className="py-2.5 px-3 text-center rounded-r-xl">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {overviewMutasiSaldo.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-8 text-center text-slate-400">
                                    Belum ada mutasi transaksi.
                                  </td>
                                </tr>
                              ) : (
                                overviewMutasiSaldo.map((item) => (
                                  <tr key={item.id} className="hover:bg-blue-50/40">
                                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                      {formatTanggal(item.tanggal)}
                                    </td>
                                    <td className="py-3 px-3 font-bold text-slate-700">
                                      {normalizeSumberLabel(item)}
                                    </td>
                                    <td className="py-3 px-3 font-semibold text-slate-800">
                                      {item.keterangan}
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-emerald-600 whitespace-nowrap">
                                      {item._isMasuk ? `+${formatRupiah(item._nom)}` : '-'}
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-rose-600 whitespace-nowrap">
                                      {!item._isMasuk ? `-${formatRupiah(item._nom)}` : '-'}
                                    </td>
                                    <td className="py-3 px-3 text-right font-black text-[#2256B7] bg-blue-50/30 whitespace-nowrap">
                                      {formatRupiah(item._saldoBerjalan)}
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditKas(item)}
                                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 cursor-pointer"
                                        >
                                          <Icon type="edit" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleHapusKas(item)}
                                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                        >
                                          <Icon type="trash" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {overviewMutasiSaldo.length > 0 && (
                              <tfoot>
                                <tr className="bg-slate-100/90 font-black text-slate-800 border-t-2 border-slate-200">
                                  <td colSpan="3" className="py-3 px-3 rounded-l-xl">
                                    Total Rekapitulasi Keseluruhan
                                  </td>
                                  <td className="py-3 px-3 text-right text-emerald-700 whitespace-nowrap">
                                    +{formatRupiah(totalPemasukan)}
                                  </td>
                                  <td className="py-3 px-3 text-right text-rose-700 whitespace-nowrap">
                                    -{formatRupiah(totalPengeluaran)}
                                  </td>
                                  <td className="py-3 px-3 text-right text-[#2256B7] whitespace-nowrap">
                                    {formatRupiah(saldoSaatIni)}
                                  </td>
                                  <td className="py-3 px-3 rounded-r-xl" />
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px] bg-slate-100/70">
                                <th className="py-2.5 px-3 rounded-l-xl">Tanggal</th>
                                <th className="py-2.5 px-3">Sumber</th>
                                <th className="py-2.5 px-3">Keterangan</th>
                                <th className="py-2.5 px-3 text-right">Nominal</th>
                                <th className="py-2.5 px-3 text-center">Nota</th>
                                <th className="py-2.5 px-3 text-center rounded-r-xl">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {overviewFilteredList.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="py-8 text-center text-slate-400">
                                    Belum ada transaksi pada kategori ini.
                                  </td>
                                </tr>
                              ) : (
                                overviewFilteredList.map((item) => {
                                  const isMasuk = normalizeJenis(item) === 'Pemasukan';
                                  const notaUrl = normalizeBuktiNota(item);
                                  return (
                                    <tr key={item.id} className="hover:bg-blue-50/40">
                                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                        {formatTanggal(item.tanggal)}
                                      </td>
                                      <td className="py-3 px-3 font-bold text-slate-700">
                                        {normalizeSumberLabel(item)}
                                      </td>
                                      <td className="py-3 px-3 font-semibold text-slate-800">
                                        {item.keterangan}
                                      </td>
                                      <td
                                        className={`py-3 px-3 text-right font-black whitespace-nowrap ${
                                          isMasuk ? 'text-emerald-600' : 'text-rose-600'
                                        }`}
                                      >
                                        {isMasuk ? '+' : '-'}
                                        {formatRupiah(normalizeNominal(item))}
                                      </td>
                                      <td className="py-3 px-3 text-center">
                                        {notaUrl ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setPreviewNotaModal({
                                                isOpen: true,
                                                imageUrl: notaUrl,
                                                keterangan: item.keterangan,
                                                tanggal: formatTanggal(item.tanggal),
                                                nominal: normalizeNominal(item),
                                              })
                                            }
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#2256B7] border border-blue-200 text-[11px] font-bold cursor-pointer"
                                          >
                                            <Icon type="image" />
                                            <span>Nota</span>
                                          </button>
                                        ) : (
                                          <span className="text-[11px] text-slate-400">-</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditKas(item)}
                                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 cursor-pointer"
                                          >
                                            <Icon type="edit" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleHapusKas(item)}
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                          >
                                            <Icon type="trash" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DAFTAR_SUMBER_DANA.map((namaSumber) => {
                    const ringkasan = getRingkasanBySumber(namaSumber);
                    return (
                      <div
                        key={namaSumber}
                        className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2256B7] border border-blue-200/80 text-xs font-extrabold shrink-0">
                              {namaSumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium truncate">
                              ({ringkasan.pemasukanList.length} masuk &bull;{' '}
                              {ringkasan.pengeluaranList.length} keluar)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setPilihTabelModal({
                                isOpen: true,
                                sumber: namaSumber,
                                pilihan: 'Pemasukan',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-blue-50/70 hover:bg-blue-100 text-[#2256B7] border border-blue-200/70 text-[11px] font-extrabold shrink-0 cursor-pointer transition-all"
                          >
                            Buka Tabel &rarr;
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleBukaDetailSumber(namaSumber, 'Pemasukan')}
                            className="text-left p-3 rounded-2xl bg-gradient-to-r from-[#10A37F] to-[#2DD4BF] text-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
                          >
                            <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">
                              PEMASUKAN
                            </p>
                            <p className="text-xs sm:text-sm font-black mt-0.5 truncate">
                              {formatRupiah(ringkasan.totalMasuk)}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBukaDetailSumber(namaSumber, 'Pengeluaran')}
                            className="text-left p-3 rounded-2xl bg-gradient-to-r from-[#E11D48] to-[#F472B6] text-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
                          >
                            <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">
                              PENGELUARAN
                            </p>
                            <p className="text-xs sm:text-sm font-black mt-0.5 truncate">
                              {formatRupiah(ringkasan.totalKeluar)}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBukaDetailSumber(namaSumber, 'Saldo')}
                            className="text-left p-3 rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#60A5FA] text-white shadow-xs hover:opacity-95 transition-all cursor-pointer"
                          >
                            <p className="text-[9px] font-extrabold uppercase tracking-wider opacity-90">
                              SALDO
                            </p>
                            <p className="text-xs sm:text-sm font-black mt-0.5 truncate">
                              {formatRupiah(ringkasan.saldo)}
                            </p>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setKasSubView('overview')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
                    >
                      &larr; Kembali
                    </button>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-800">
                        {activeTabelKategori === 'Saldo'
                          ? `Tabel Saldo (Gabungan Pemasukan & Pengeluaran): ${selectedSumberDetail}`
                          : `Rincian Kas: ${selectedSumberDetail}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Masuk:{' '}
                        <strong className="text-emerald-600">
                          {formatRupiah(sumberSummary.totalMasuk)}
                        </strong>{' '}
                        &bull; Keluar:{' '}
                        <strong className="text-rose-600">
                          {formatRupiah(sumberSummary.totalKeluar)}
                        </strong>{' '}
                        &bull; Sisa Saldo:{' '}
                        <strong className="text-[#2256B7]">
                          {formatRupiah(sumberSummary.saldo)}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBukaLaporanDariCard('Semua', selectedSumberDetail)}
                      className="px-3.5 py-2.5 rounded-2xl bg-[#109868] hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Icon type="export" />
                      <span>Ekspor Laporan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleBukaModalTambah({
                          lockedSumber: selectedSumberDetail,
                          defaultJenis:
                            activeTabelKategori === 'Pengeluaran' ? 'Pengeluaran' : 'Pemasukan',
                        })
                      }
                      className="px-4 py-2.5 rounded-2xl bg-[#2256B7] hover:bg-[#1A469B] text-white font-black text-xs shadow-sm cursor-pointer"
                    >
                      + Tambah{' '}
                      {activeTabelKategori === 'Saldo' ? 'Transaksi' : activeTabelKategori}
                    </button>
                  </div>
                </div>

                {activeTabelKategori !== 'Saldo' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTabelKategori('Pemasukan')}
                      className={`px-4 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                        activeTabelKategori === 'Pemasukan'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      Tabel Pemasukan ({sumberSummary.pemasukanList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabelKategori('Pengeluaran')}
                      className={`px-4 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                        activeTabelKategori === 'Pengeluaran'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      Tabel Pengeluaran ({sumberSummary.pengeluaranList.length})
                    </button>
                  </div>
                )}

                {activeTabelKategori === 'Saldo' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px] bg-blue-50/70">
                          <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                          <th className="py-3 px-4">Sumber</th>
                          <th className="py-3 px-4">Keterangan</th>
                          <th className="py-3 px-4 text-right text-emerald-700">
                            Pemasukan (+)
                          </th>
                          <th className="py-3 px-4 text-right text-rose-700">
                            Pengeluaran (-)
                          </th>
                          <th className="py-3 px-4 text-right text-[#2256B7]">
                            Saldo Berjalan
                          </th>
                          <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sumberMutasiSaldo.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-10 text-center text-slate-400">
                              Belum ada transaksi pemasukan maupun pengeluaran pada{' '}
                              {selectedSumberDetail}.
                            </td>
                          </tr>
                        ) : (
                          sumberMutasiSaldo.map((item) => {
                            const notaUrl = normalizeBuktiNota(item);
                            return (
                              <tr key={item.id} className="hover:bg-blue-50/40">
                                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                  {formatTanggal(item.tanggal)}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-700">
                                  {normalizeSumberLabel(item)}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  <div className="flex items-center gap-2">
                                    <span>{item.keterangan}</span>
                                    {notaUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewNotaModal({
                                            isOpen: true,
                                            imageUrl: notaUrl,
                                            keterangan: item.keterangan,
                                            tanggal: formatTanggal(item.tanggal),
                                            nominal: item._nom,
                                          })
                                        }
                                        className="px-2 py-0.5 rounded-md bg-blue-50 text-[#2256B7] border border-blue-200 text-[10px] font-bold cursor-pointer"
                                      >
                                        Nota
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right font-black text-emerald-600 whitespace-nowrap">
                                  {item._isMasuk ? `+${formatRupiah(item._nom)}` : '-'}
                                </td>
                                <td className="py-3.5 px-4 text-right font-black text-rose-600 whitespace-nowrap">
                                  {!item._isMasuk ? `-${formatRupiah(item._nom)}` : '-'}
                                </td>
                                <td className="py-3.5 px-4 text-right font-black text-[#2256B7] bg-blue-50/30 whitespace-nowrap">
                                  {formatRupiah(item._saldoBerjalan)}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditKas(item)}
                                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 cursor-pointer"
                                    >
                                      <Icon type="edit" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleHapusKas(item)}
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                    >
                                      <Icon type="trash" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                      {sumberMutasiSaldo.length > 0 && (
                        <tfoot>
                          <tr className="bg-slate-100/90 font-black text-slate-800 border-t-2 border-slate-200">
                            <td colSpan="3" className="py-3.5 px-4 rounded-l-xl">
                              Total Rekapitulasi {selectedSumberDetail}
                            </td>
                            <td className="py-3.5 px-4 text-right text-emerald-700 whitespace-nowrap">
                              +{formatRupiah(sumberSummary.totalMasuk)}
                            </td>
                            <td className="py-3.5 px-4 text-right text-rose-700 whitespace-nowrap">
                              -{formatRupiah(sumberSummary.totalKeluar)}
                            </td>
                            <td className="py-3.5 px-4 text-right text-[#2256B7] whitespace-nowrap">
                              {formatRupiah(sumberSummary.saldo)}
                            </td>
                            <td className="py-3.5 px-4 rounded-r-xl" />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px] bg-slate-100/70">
                          <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                          <th className="py-3 px-4">Sumber</th>
                          <th className="py-3 px-4">Keterangan</th>
                          <th className="py-3 px-4 text-right">Nominal</th>
                          {activeTabelKategori === 'Pengeluaran' && (
                            <th className="py-3 px-4 text-center">Bukti Nota</th>
                          )}
                          <th className="py-3 px-4 text-center rounded-r-xl">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(activeTabelKategori === 'Pemasukan'
                          ? sumberSummary.pemasukanList
                          : sumberSummary.pengeluaranList
                        ).length === 0 ? (
                          <tr>
                            <td
                              colSpan={activeTabelKategori === 'Pengeluaran' ? 6 : 5}
                              className="py-10 text-center text-slate-400"
                            >
                              Belum ada data {activeTabelKategori.toLowerCase()} pada{' '}
                              {selectedSumberDetail}.
                            </td>
                          </tr>
                        ) : (
                          (activeTabelKategori === 'Pemasukan'
                            ? sumberSummary.pemasukanList
                            : sumberSummary.pengeluaranList
                          ).map((item) => {
                            const notaUrl = normalizeBuktiNota(item);
                            return (
                              <tr key={item.id} className="hover:bg-blue-50/40">
                                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                  {formatTanggal(item.tanggal)}
                                </td>
                                <td className="py-3.5 px-4 font-bold text-slate-700">
                                  {normalizeSumberLabel(item)}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  {item.keterangan}
                                </td>
                                <td
                                  className={`py-3.5 px-4 text-right font-black whitespace-nowrap ${
                                    activeTabelKategori === 'Pemasukan'
                                      ? 'text-emerald-600'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {activeTabelKategori === 'Pemasukan' ? '+' : '-'}
                                  {formatRupiah(normalizeNominal(item))}
                                </td>
                                {activeTabelKategori === 'Pengeluaran' && (
                                  <td className="py-3.5 px-4 text-center">
                                    {notaUrl ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewNotaModal({
                                            isOpen: true,
                                            imageUrl: notaUrl,
                                            keterangan: item.keterangan,
                                            tanggal: formatTanggal(item.tanggal),
                                            nominal: normalizeNominal(item),
                                          })
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#2256B7] border border-blue-200 text-xs font-bold cursor-pointer"
                                      >
                                        <Icon type="image" />
                                        <span>Lihat Nota</span>
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400">-</span>
                                    )}
                                  </td>
                                )}
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditKas(item)}
                                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 cursor-pointer"
                                    >
                                      <Icon type="edit" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleHapusKas(item)}
                                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                    >
                                      <Icon type="trash" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MENU 3: PROPOSAL MASUK */}
        {activeMenu === 'proposal-masuk' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Daftar Proposal Kegiatan OSIS
              </h3>
              <span className="text-[11px] font-bold text-[#2256B7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Total: {proposalList.length} Proposal
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Judul Proposal</th>
                    <th className="py-3 px-4">Estimasi Anggaran</th>
                    <th className="py-3 px-4">Berkas</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 rounded-r-xl">Catatan Pembina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposalList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada proposal kegiatan yang diajukan.
                      </td>
                    </tr>
                  ) : (
                    proposalList.map((item, idx) => {
                      const hasFile = Boolean(
                        item.file_proposal || item.file_url || item.berkas
                      );
                      const fileNameLabel =
                        item.nama_file ||
                        (item.file_proposal
                          ? String(item.file_proposal).split('/').pop()
                          : null) ||
                        'Unduh Berkas';
                      const isDownloadingThis = downloadingId === (item.id || fileNameLabel);
                      return (
                        <tr key={item.id || idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div>{item.judul_proposal || item.judul || item.nama}</div>
                            <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                              Pengaju: {item.pengaju || item.sekbid || item.divisi || 'Sekretaris OSIS'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                            {formatRupiah(item.anggaran || item.dana || item.estimasi_dana || 0)}
                          </td>
                          <td className="py-3.5 px-4">
                            {hasFile ? (
                              <button
                                type="button"
                                onClick={() => handleBukaUnduhProposal(item)}
                                disabled={isDownloadingThis}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#2256B7] font-bold text-xs transition-all max-w-[175px] cursor-pointer active:scale-95"
                              >
                                <span className="truncate">
                                  {isDownloadingThis ? 'Membuka...' : fileNameLabel}
                                </span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Tidak ada berkas</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {formatTanggal(item.tanggal || item.created_at)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`px-3 py-1 font-bold text-[10px] sm:text-xs rounded-xl inline-block uppercase ${
                                item.status === 'Disetujui' ||
                                item.status === 'DISETUJUI' ||
                                item.status === 'Diterima'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : item.status === 'Ditolak' || item.status === 'DITOLAK'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {item.status || 'Menunggu Persetujuan'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 italic text-xs">
                            {item.catatan_pembina || item.catatan || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MENU 4: PROGRAM KERJA */}
        {activeMenu === 'program-kerja' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Program Kerja OSIS
              </h3>
              <span className="text-[11px] font-bold text-[#2256B7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Total: {prokerList.length} Program Kerja
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Nama Program Kerja</th>
                    <th className="py-3 px-4">Divisi Pelaksana</th>
                    <th className="py-3 px-4 rounded-r-xl">Target Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prokerList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada program kerja terdaftar dari Ketua OSIS.
                      </td>
                    </tr>
                  ) : (
                    prokerList.map((pk, idx) => (
                      <tr key={pk.id || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {pk.nama_proker || pk.namaKegiatan || pk.nama}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {pk.divisi || pk.sekbid || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                          {formatTanggal(pk.target || pk.tanggal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MENU 5: ANGGOTA OSIS */}
        {activeMenu === 'anggota-osis' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Daftar Anggota Pengurus OSIS
              </h3>
              <span className="text-[11px] font-bold text-[#2256B7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Total: {anggotaList.length} Pengurus
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Nama Lengkap</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4 rounded-r-xl">Divisi / Sekbid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggotaList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada data pengurus OSIS.
                      </td>
                    </tr>
                  ) : (
                    anggotaList.map((ang, idx) => (
                      <tr key={ang.id || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {ang.nama || ang.namaLengkap || ang.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {ang.kelas || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-[#2256B7] border border-blue-200">
                            {ang.jabatan || 'Anggota'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {ang.divisi || ang.sekbid || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MENU 6: KEGIATAN OSIS */}
        {activeMenu === 'kegiatan-osis' && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden w-full animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Daftar Kegiatan &amp; Event OSIS
              </h3>
              <span className="text-[11px] font-bold text-[#2256B7] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Total: {kegiatanList.length} Kegiatan
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px] bg-slate-100/70">
                    <th className="py-3 px-4 rounded-l-xl">Nama Kegiatan</th>
                    <th className="py-3 px-4">Tanggal Pelaksanaan</th>
                    <th className="py-3 px-4">Lokasi / Keterangan</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Peserta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kegiatanList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                        Belum ada agenda kegiatan terdaftar dari Sekretaris OSIS.
                      </td>
                    </tr>
                  ) : (
                    kegiatanList.map((keg, idx) => {
                      const pesertaKeg = getPesertaByKegiatan(keg);
                      return (
                        <tr key={keg.id || idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {keg.nama_proker || keg.namaKegiatan || keg.nama}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {formatTanggal(keg.tanggal || keg.target)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {keg.lokasi || keg.deskripsi || keg.keterangan || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedKegiatanPeserta(keg)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2256B7] font-bold text-xs border border-blue-200 transition-all cursor-pointer active:scale-95"
                            >
                              <span>Lihat Peserta ({pesertaKeg.length})</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PREVIEW NOTA */}
      {previewNotaModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Bukti Nota Pengeluaran
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {previewNotaModal.keterangan} &bull; {previewNotaModal.tanggal} &bull;{' '}
                  <strong className="text-rose-600">
                    {formatRupiah(previewNotaModal.nominal)}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreviewNotaModal({
                    isOpen: false,
                    imageUrl: '',
                    keterangan: '',
                    tanggal: '',
                    nominal: 0,
                  })
                }
                className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 font-black flex items-center justify-center cursor-pointer"
              >
                X
              </button>
            </div>
            <div className="p-5 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewNotaModal.imageUrl}
                alt="Bukti Nota Pengeluaran"
                className="max-h-[60vh] w-auto rounded-2xl shadow-md border border-slate-300 object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL LAPORAN & EKSPOR */}
      {isLaporanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                  Dokumen Resmi Bendahara OSIS
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
                  Laporan Pertanggungjawaban Keuangan OSIS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLaporanModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 font-black flex items-center justify-center cursor-pointer"
              >
                X
              </button>
            </div>

            <div className="px-6 py-3.5 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Sumber Dana
                </label>
                <select
                  value={laporanSumberFilter}
                  onChange={(e) => setLaporanSumberFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                >
                  <option value="Semua">Semua Sumber Dana ({keuanganList.length})</option>
                  <option value="Kas OSIS">Kas OSIS</option>
                  <option value="Dana Sekolah">Dana Sekolah</option>
                  <option value="Sponsor">Sponsor</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Jenis Transaksi
                </label>
                <select
                  value={laporanJenisFilter}
                  onChange={(e) => setLaporanJenisFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                >
                  <option value="Semua">Semua (Pemasukan &amp; Pengeluaran)</option>
                  <option value="Pemasukan">Hanya Pemasukan</option>
                  <option value="Pengeluaran">Hanya Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">
                  Periode Laporan
                </label>
                <select
                  value={laporanPeriodeFilter}
                  onChange={(e) => setLaporanPeriodeFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                >
                  <option value="semua">Seluruh Periode Berjalan</option>
                  <option value="minggu">7 Hari Terakhir</option>
                  <option value="bulan">30 Hari Terakhir</option>
                  <option value="tahun">1 Tahun Terakhir</option>
                </select>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto bg-slate-200/75 flex-1">
              <div className="max-w-4xl mx-auto mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-600">
                  Edit draf, lalu klik Simpan Perubahan agar daftar pemasukan dan pengeluaran ikut
                  diperbarui.
                </p>
                <button
                  type="button"
                  onClick={tambahBarisLaporan}
                  className="rounded-xl bg-[#2256B7] px-4 py-2 text-xs font-black text-white hover:bg-[#1A469B] cursor-pointer"
                >
                  + Tambah Baris
                </button>
              </div>

              <div className="bg-white p-6 sm:p-10 border border-slate-400 shadow-md max-w-4xl mx-auto text-slate-900 space-y-5">
                <div className="text-center border-b-4 border-double border-slate-900 pb-4">
                  <p className="text-xs sm:text-sm font-serif font-bold uppercase tracking-widest text-slate-800">
                    Organisasi Siswa Intra Sekolah (OSIS)
                  </p>
                  <h4 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wide text-slate-950 mt-0.5">
                    Laporan Pertanggungjawaban Keuangan
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Sistem Informasi Administrasi &amp; Keuangan OSITARA
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                  <div className="space-y-1">
                    <p>
                      <span className="font-bold inline-block w-36">Sumber Dana</span>:{' '}
                      {laporanSumberFilter === 'Semua'
                        ? 'Semua Sumber Dana'
                        : laporanSumberFilter}
                    </p>
                    <p>
                      <span className="font-bold inline-block w-36">Kategori Transaksi</span>:{' '}
                      {laporanJenisFilter === 'Semua'
                        ? 'Pemasukan & Pengeluaran'
                        : laporanJenisFilter}
                    </p>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <p>
                      <span className="font-bold">Periode:</span> {getLabelPeriode()}
                    </p>
                    <p>
                      <span className="font-bold">Jumlah Data:</span>{' '}
                      {laporanDraftList.length} Transaksi ({laporanNotaList.length} Bukti Nota)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-500 divide-y sm:divide-y-0 sm:divide-x divide-slate-500 bg-slate-50">
                  <div className="p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Total Pemasukan
                    </span>
                    <strong className="text-sm sm:text-base font-black text-emerald-800">
                      + {formatRupiah(laporanTotalMasuk)}
                    </strong>
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Total Pengeluaran
                    </span>
                    <strong className="text-sm sm:text-base font-black text-rose-800">
                      - {formatRupiah(laporanTotalKeluar)}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-700 block">
                      Saldo Akhir Periode
                    </span>
                    <strong className="text-sm sm:text-base font-black text-[#2256B7]">
                      {formatRupiah(laporanSaldoAkhir)}
                    </strong>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-slate-500">
                    <thead>
                      <tr className="bg-slate-200 text-slate-900 font-bold uppercase text-[11px]">
                        <th className="border border-slate-500 py-2 px-2.5 text-center w-10">
                          No
                        </th>
                        <th className="border border-slate-500 py-2 px-2.5 text-center w-24">
                          Tanggal
                        </th>
                        <th className="border border-slate-500 py-2 px-2.5 w-32">
                          Sumber Dana
                        </th>
                        <th className="border border-slate-500 py-2 px-2.5">
                          Uraian / Keterangan Transaksi
                        </th>
                        <th className="border border-slate-500 py-2 px-2 text-center w-20">
                          Bukti Nota
                        </th>
                        <th className="border border-slate-500 py-2 px-2.5 text-right w-32">
                          Pemasukan
                        </th>
                        <th className="border border-slate-500 py-2 px-2.5 text-right w-32">
                          Pengeluaran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporanDraftList.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="border border-slate-500 py-8 text-center text-slate-500 italic"
                          >
                            Tidak ada transaksi pada filter laporan yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        laporanDraftList.map((item, i) => {
                          const isMasuk =
                            String(item.jenis || item.jenis_transaksi || 'Pemasukan') ===
                            'Pemasukan';
                          const nomStr = formatRupiah(Number(item.jumlah ?? item.nominal ?? 0));
                          const notaSrc = !isMasuk ? normalizeBuktiNota(item) : '';
                          return (
                            <tr
                              key={item._draftId || `prev-${item.id || i}`}
                              className={i % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}
                            >
                              <td className="border border-slate-500 py-2 px-2.5 text-center">
                                {i + 1}
                              </td>
                              <td className="border border-slate-500 py-1 px-1">
                                <input
                                  type="date"
                                  value={String(item.tanggal || '').split('T')[0]}
                                  onChange={(e) =>
                                    updateLaporanDraft(item._draftId, 'tanggal', e.target.value)
                                  }
                                  className="w-full min-w-[112px] rounded-md border border-slate-300 px-1.5 py-1 text-[10px]"
                                />
                              </td>
                              <td className="border border-slate-500 py-1 px-1">
                                <select
                                  value={String(item.kategori_sumber || 'Kas OSIS')}
                                  onChange={(e) => {
                                    updateLaporanDraft(
                                      item._draftId,
                                      'kategori_sumber',
                                      e.target.value
                                    );
                                    updateLaporanDraft(item._draftId, 'sumber', e.target.value);
                                  }}
                                  className="w-full min-w-[105px] rounded-md border border-slate-300 px-1 py-1 text-[10px]"
                                >
                                  <option>Kas OSIS</option>
                                  <option>Dana Sekolah</option>
                                  <option>Sponsor</option>
                                  <option>Lainnya</option>
                                </select>
                              </td>
                              <td className="border border-slate-500 py-1 px-1">
                                <input
                                  value={item.keterangan || ''}
                                  onChange={(e) =>
                                    updateLaporanDraft(item._draftId, 'keterangan', e.target.value)
                                  }
                                  className="w-full min-w-[150px] rounded-md border border-slate-300 px-2 py-1 text-[10px]"
                                  placeholder="Uraian transaksi"
                                />
                                <div className="flex gap-1 mt-1">
                                  <select
                                    value={String(
                                      item.jenis || item.jenis_transaksi || 'Pemasukan'
                                    )}
                                    onChange={(e) => {
                                      updateLaporanDraft(item._draftId, 'jenis', e.target.value);
                                      updateLaporanDraft(
                                        item._draftId,
                                        'kategori',
                                        e.target.value
                                      );
                                    }}
                                    className="rounded-md border border-slate-300 px-1 py-0.5 text-[9px]"
                                  >
                                    <option>Pemasukan</option>
                                    <option>Pengeluaran</option>
                                  </select>
                                  <input
                                    type="number"
                                    min="0"
                                    value={Number(item.jumlah ?? item.nominal ?? 0)}
                                    onChange={(e) => {
                                      const n = Math.max(0, Number(e.target.value) || 0);
                                      updateLaporanDraft(item._draftId, 'jumlah', n);
                                      updateLaporanDraft(item._draftId, 'nominal', n);
                                    }}
                                    className="w-24 rounded-md border border-slate-300 px-1 py-0.5 text-[9px]"
                                    aria-label="Nominal transaksi"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => hapusBarisLaporan(item._draftId)}
                                    className="rounded-md bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 hover:bg-rose-200 cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                              <td className="border border-slate-500 py-1.5 px-2 text-center">
                                {notaSrc ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewNotaModal({
                                        isOpen: true,
                                        imageUrl: notaSrc,
                                        keterangan: item.keterangan,
                                        tanggal: formatTanggal(item.tanggal),
                                        nominal: Number(item.jumlah ?? item.nominal ?? 0),
                                      })
                                    }
                                    className="inline-flex flex-col items-center justify-center group cursor-pointer"
                                    title="Klik untuk memperbesar foto nota"
                                  >
                                    <img
                                      src={notaSrc}
                                      alt="Bukti Nota"
                                      className="w-10 h-10 object-cover rounded border border-slate-400 group-hover:scale-105 transition-transform"
                                    />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400">-</span>
                                )}
                              </td>
                              <td className="border border-slate-500 py-2 px-2.5 text-right font-semibold text-emerald-800 whitespace-nowrap">
                                {isMasuk ? nomStr : '-'}
                              </td>
                              <td className="border border-slate-500 py-2 px-2.5 text-right font-semibold text-rose-800 whitespace-nowrap">
                                {!isMasuk ? nomStr : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-200 font-bold text-slate-950">
                        <td
                          colSpan="5"
                          className="border border-slate-500 py-2.5 px-3 text-right uppercase text-[11px]"
                        >
                          Jumlah Total Pemasukan &amp; Pengeluaran
                        </td>
                        <td className="border border-slate-500 py-2.5 px-2.5 text-right text-emerald-900 whitespace-nowrap">
                          {formatRupiah(laporanTotalMasuk)}
                        </td>
                        <td className="border border-slate-500 py-2.5 px-2.5 text-right text-rose-900 whitespace-nowrap">
                          {formatRupiah(laporanTotalKeluar)}
                        </td>
                      </tr>
                      <tr className="bg-blue-100/90 font-black text-slate-950">
                        <td
                          colSpan="5"
                          className="border border-slate-500 py-2.5 px-3 text-right uppercase text-[11px]"
                        >
                          Sisa Saldo Akhir (Total Pemasukan - Total Pengeluaran)
                        </td>
                        <td
                          colSpan="2"
                          className="border border-slate-500 py-2.5 px-3 text-right text-[#2256B7] text-sm whitespace-nowrap"
                        >
                          {formatRupiah(laporanSaldoAkhir)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* TANDA TANGAN PENGESAHAN */}
                <div className="pt-6 grid grid-cols-2 gap-6 text-xs text-slate-900 text-center">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">{namaKetuaOsis}</p>
                    <div className="h-16" />
                    <p className="font-bold underline">_________________________</p>
                  </div>
                  <div>
                    <p>{formatTanggalFormal()}</p>
                    <p className="font-bold">Bendahara OSIS</p>
                    <div className="h-16" />
                    <p className="font-bold underline">{namaBendahara}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER AKSI EKSPOR LAPORAN */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={terapkanDraftKeDataKas}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs cursor-pointer"
              >
                Simpan Perubahan Draf ke Kas
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportLaporanImage('png')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Unduh PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLaporanImage('jpg')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                >
                  Unduh JPG
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdfLaporan}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Cetak / PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PILIH TABEL PER SUMBER DANA */}
      {pilihTabelModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">
                Buka Tabel: {pilihTabelModal.sumber}
              </h3>
              <button
                type="button"
                onClick={() => setPilihTabelModal({ ...pilihTabelModal, isOpen: false })}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                X
              </button>
            </div>
            <div className="space-y-2">
              {['Pemasukan', 'Pengeluaran', 'Saldo'].map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setPilihTabelModal({ ...pilihTabelModal, pilihan: kat })}
                  className={`w-full py-2.5 px-4 rounded-xl text-left text-xs font-extrabold border-2 transition-all cursor-pointer ${
                    pilihTabelModal.pilihan === kat
                      ? 'border-[#2256B7] bg-blue-50 text-[#2256B7]'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {kat === 'Saldo' ? 'Tabel Saldo (Gabungan Masuk & Keluar)' : `Tabel ${kat}`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPilihTabelModal({ ...pilihTabelModal, isOpen: false })}
                className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetSumber = pilihTabelModal.sumber;
                  const targetKategori = pilihTabelModal.pilihan;
                  setPilihTabelModal({ ...pilihTabelModal, isOpen: false });
                  handleBukaDetailSumber(targetSumber, targetKategori);
                }}
                className="flex-1 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-[#2256B7] hover:bg-[#1A469B] shadow-md cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KAS */}
      {isTambahKasModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Tambah Catatan Transaksi
                </h3>
                {isSumberLocked && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#2256B7] border border-blue-200 text-[11px] font-black">
                    Sumber Dana: {selectedSumberDetail}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsTambahKasModalOpen(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                X
              </button>
            </div>

            <form onSubmit={handleTambahKas} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setJenisTransaksi('Pemasukan')}
                    className={`py-2.5 px-3 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                      jenisTransaksi === 'Pemasukan'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    + Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisTransaksi('Pengeluaran')}
                    className={`py-2.5 px-3 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                      jenisTransaksi === 'Pengeluaran'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    - Pengeluaran
                  </button>
                </div>
              </div>

              {!isSumberLocked && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                    Sumber Dana
                  </label>
                  <select
                    value={sumber}
                    onChange={(e) => setSumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                  >
                    <option value="Kas OSIS">Kas OSIS</option>
                    <option value="Dana Sekolah">Dana Sekolah</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              )}

              {(isSumberLocked ? selectedSumberDetail === 'Lainnya' : sumber === 'Lainnya') && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                    Nama Sumber Dana Lainnya
                  </label>
                  <input
                    type="text"
                    value={judulSumberCustom}
                    onChange={(e) => setJudulSumberCustom(e.target.value)}
                    placeholder="Contoh: Donasi Alumni / Bazaar OSIS"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={tanggalTransaksi}
                  onChange={(e) => setTanggalTransaksi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Uraian / Keterangan
                </label>
                <input
                  type="text"
                  required
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Pembelian konsumsi rapat / Iuran kas mingguan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={nominalDisplay}
                  onChange={(e) => setNominalDisplay(formatRibuanInput(e.target.value))}
                  placeholder="Contoh: 150.000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                />
              </div>

              {jenisTransaksi === 'Pengeluaran' && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-extrabold text-slate-600 uppercase">
                    Foto Bukti Nota (Opsional - Otomatis Masuk ke Laporan)
                  </label>
                  <input
                    ref={tambahGalleryRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePickGalleryNota(e, 'tambah')}
                    className="hidden"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => tambahGalleryRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#2256B7] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Icon type="image" />
                      <span>Pilih dari Galeri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera('tambah')}
                      className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Icon type="camera" />
                      <span>Buka Kamera</span>
                    </button>
                  </div>

                  {cameraError && (
                    <p className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                      {cameraError}
                    </p>
                  )}

                  {cameraTarget === 'tambah' && !capturedPreview && (
                    <div className="p-3 rounded-2xl bg-slate-900 space-y-2.5">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-52 object-cover rounded-xl bg-black"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="flex-1 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Tutup Kamera
                        </button>
                        <button
                          type="button"
                          onClick={handleTakePhoto}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer"
                        >
                          Ambil Foto
                        </button>
                      </div>
                    </div>
                  )}

                  {cameraTarget === 'tambah' && capturedPreview && (
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-2.5">
                      <img
                        src={capturedPreview}
                        alt="Hasil Jepretan Nota"
                        className="w-full max-h-52 object-contain rounded-xl bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black cursor-pointer"
                        >
                          Retake (Foto Ulang)
                        </button>
                        <button
                          type="button"
                          onClick={handleUseCapturedPhoto}
                          className="flex-1 py-2 rounded-xl bg-[#2256B7] hover:bg-[#1A469B] text-white text-xs font-black cursor-pointer"
                        >
                          Gunakan Foto Ini
                        </button>
                      </div>
                    </div>
                  )}

                  {buktiNota && cameraTarget !== 'tambah' && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={buktiNota}
                          alt="Preview Nota"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                        />
                        <span className="text-xs font-bold text-emerald-700 truncate">
                          Foto nota siap &amp; otomatis masuk laporan
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBuktiNota('')}
                        className="text-xs font-bold text-rose-600 hover:underline shrink-0 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsTambahKasModalOpen(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-[#2256B7] hover:bg-[#1A469B] shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KAS */}
      {editKasModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Edit Transaksi Kas
              </h3>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setEditKasModal({ ...editKasModal, isOpen: false });
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                X
              </button>
            </div>

            <form onSubmit={handleUpdateKas} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1.5">
                  Jenis Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditKasModal((prev) => ({ ...prev, jenis: 'Pemasukan' }))
                    }
                    className={`py-2.5 px-3 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                      editKasModal.jenis === 'Pemasukan'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    + Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditKasModal((prev) => ({ ...prev, jenis: 'Pengeluaran' }))
                    }
                    className={`py-2.5 px-3 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                      editKasModal.jenis === 'Pengeluaran'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    - Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Sumber Dana
                </label>
                <select
                  value={editKasModal.sumber}
                  onChange={(e) =>
                    setEditKasModal((prev) => ({ ...prev, sumber: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2256B7]"
                >
                  <option value="Kas OSIS">Kas OSIS</option>
                  <option value="Dana Sekolah">Dana Sekolah</option>
                  <option value="Sponsor">Sponsor</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {editKasModal.sumber === 'Lainnya' && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                    Nama Sumber Dana Lainnya
                  </label>
                  <input
                    type="text"
                    value={editKasModal.judulSumberCustom}
                    onChange={(e) =>
                      setEditKasModal((prev) => ({
                        ...prev,
                        judulSumberCustom: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  required
                  value={editKasModal.tanggal}
                  onChange={(e) =>
                    setEditKasModal((prev) => ({ ...prev, tanggal: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Uraian / Keterangan
                </label>
                <input
                  type="text"
                  required
                  value={editKasModal.keterangan}
                  onChange={(e) =>
                    setEditKasModal((prev) => ({ ...prev, keterangan: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-600 uppercase mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={editKasModal.nominalDisplay}
                  onChange={(e) =>
                    setEditKasModal((prev) => ({
                      ...prev,
                      nominalDisplay: formatRibuanInput(e.target.value),
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-black"
                />
              </div>

              {editKasModal.jenis === 'Pengeluaran' && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-extrabold text-slate-600 uppercase">
                    Foto Bukti Nota (Opsional - Otomatis Masuk ke Laporan)
                  </label>
                  <input
                    ref={editGalleryRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePickGalleryNota(e, 'edit')}
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => editGalleryRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#2256B7] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Icon type="image" />
                      <span>Pilih dari Galeri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera('edit')}
                      className="py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Icon type="camera" />
                      <span>Buka Kamera</span>
                    </button>
                  </div>

                  {cameraTarget === 'edit' && !capturedPreview && (
                    <div className="p-3 rounded-2xl bg-slate-900 space-y-2.5">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-52 object-cover rounded-xl bg-black"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="flex-1 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Tutup Kamera
                        </button>
                        <button
                          type="button"
                          onClick={handleTakePhoto}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer"
                        >
                          Ambil Foto
                        </button>
                      </div>
                    </div>
                  )}

                  {cameraTarget === 'edit' && capturedPreview && (
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 space-y-2.5">
                      <img
                        src={capturedPreview}
                        alt="Hasil Jepretan Nota"
                        className="w-full max-h-52 object-contain rounded-xl bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black cursor-pointer"
                        >
                          Retake (Foto Ulang)
                        </button>
                        <button
                          type="button"
                          onClick={handleUseCapturedPhoto}
                          className="flex-1 py-2 rounded-xl bg-[#2256B7] hover:bg-[#1A469B] text-white text-xs font-black cursor-pointer"
                        >
                          Gunakan Foto Ini
                        </button>
                      </div>
                    </div>
                  )}

                  {editKasModal.buktiNota && cameraTarget !== 'edit' && (
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <img
                        src={editKasModal.buktiNota}
                        alt="Preview Nota"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditKasModal((prev) => ({ ...prev, buktiNota: '' }))
                        }
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setEditKasModal({ ...editKasModal, isOpen: false });
                  }}
                  className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingKas}
                  className="flex-1 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-[#2256B7] hover:bg-[#1A469B] shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingKas ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-100">
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              {confirmModal.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })
                }
                className="flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DAFTAR PESERTA KEGIATAN */}
      {selectedKegiatanPeserta && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Peserta:{' '}
                {selectedKegiatanPeserta.nama_proker ||
                  selectedKegiatanPeserta.namaKegiatan ||
                  selectedKegiatanPeserta.nama}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedKegiatanPeserta(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center cursor-pointer"
              >
                X
              </button>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px] bg-slate-100/70">
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3">Alasan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getPesertaByKegiatan(selectedKegiatanPeserta).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        Belum ada siswa yang mendaftar kegiatan ini.
                      </td>
                    </tr>
                  ) : (
                    getPesertaByKegiatan(selectedKegiatanPeserta).map((p, i) => (
                      <tr key={p.id || i}>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{p.nis || '-'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {p.namaSiswa || p.nama || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{p.kelas || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{p.catatan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA AVATAR */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-blue-100 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Kelola Foto Profil
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              >
                X
              </button>
            </div>
            <div className="flex justify-center py-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Preview Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-tr from-[#1B4694] to-[#3A86EF] rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-md font-black text-2xl">
                  {inisialUser}
                </div>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <label
                htmlFor="avatar-input-bendahara"
                className="w-full py-3 bg-[#2158B8] hover:bg-[#1B4694] text-white rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                {avatarUrl ? 'Ganti / Unggah Foto Baru' : 'Tambah Foto Profil'}
              </label>
              <input
                id="avatar-input-bendahara"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleHapusAvatar}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-bold text-xs flex items-center justify-center cursor-pointer border border-rose-200 active:scale-95 transition-all"
                >
                  Hapus Foto Profil
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}