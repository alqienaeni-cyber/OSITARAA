export default function Dashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard OSITARA</h1>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h2 className="text-lg font-semibold text-blue-900">
            Selamat Datang, {user?.name || 'Pengguna'}! 👋
          </h2>
          <p className="text-sm text-blue-700 mt-1">
            Email terdaftar: <strong>{user?.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
