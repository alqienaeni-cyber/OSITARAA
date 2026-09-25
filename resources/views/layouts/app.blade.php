<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSITARA - @yield('title', 'Sistem Manajemen OSIS')</title>
    <!-- Framework CSS: Bootstrap 5 CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #F8FAFC; color: #0F172A; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .navbar-custom { background-color: #0F172A; }
        .btn-teal { background-color: #0D9488; color: #ffffff; }
        .btn-teal:hover { background-color: #0F766E; color: #ffffff; }
    </style>
</head>
<body>
    <!-- Navbar Shell Utama -->
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">OSITARA</a>
        </div>
    </nav>

    <main class="py-4">
        <div class="container">
            @yield('content')
        </div>
    </main>
</body>
</html>
