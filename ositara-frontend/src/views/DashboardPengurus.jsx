import DashboardSekretaris from './DashboardSekretaris';
import DashboardBendahara from './DashboardBendahara';
import DashboardKetua from './DashboardKetua';

export default function DashboardPengurus(props) {
  const { user } = props;

  // Gabungkan seluruh informasi user (nama, username, email, jabatan, role) ke dalam satu string
  const getUserSearchText = (u) => {
    if (!u) return '';
    if (typeof u === 'string') return u.toLowerCase();

    return [
      u.nama, u.name, u.username, u.email,
      u.jabatan, u.role, u.level, u.type,
      u.user?.nama, u.user?.username, u.user?.jabatan, u.user?.role,
      u.data?.nama, u.data?.jabatan, u.data?.role
    ].filter(Boolean).join(' ').toLowerCase();
  };

  const userText = getUserSearchText(user);

  console.log("=== DEBUG USER SEARCH TEXT ===");
  console.log("Teks User Gabungan:", userText);

  // 1. Jika ada kata 'bendahara' di nama / email / role -> Masuk Bendahara
  if (userText.includes('bendahara') || userText.includes('keuangan')) {
    return <DashboardBendahara {...props} />;
  }

  // 2. Jika ada kata 'sekretaris', 'sekre', 'sekret', atau nama kamu memuat identitas sekre -> Masuk Sekretaris
  if (
    userText.includes('sekretaris') ||
    userText.includes('sekret') ||
    userText.includes('sekre')
  ) {
    return <DashboardSekretaris {...props} />;
  }

  // 3. Default: Ketua / Pengurus Umum
  return <DashboardKetua {...props} />;
}
