<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - OSITARA</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#FDFDFC] text-[#1b1b1b] flex items-center justify-center h-screen">
    <div class="p-8 bg-white rounded-xl shadow-md w-96 border">
        <h2 class="text-2xl font-bold mb-6 text-center text-[#2158B8]">Login OSITARA</h2>
        <form action="#" method="POST">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="mb-6">
                <label class="block text-sm font-medium mb-1">Password</label>
                <input type="password" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <button type="submit" class="w-full py-3 bg-[#2158B8] text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Masuk
            </button>
        </form>
    </div>
</body>
</html>
