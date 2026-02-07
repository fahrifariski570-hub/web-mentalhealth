
/**
 * Toggle visibilitas password (show/hide password)
 * @param {string} inputId - ID dari input password field
 * @param {string} iconId - ID dari icon yang menampilkan status (eye/eye-slash)
 */
function togglePassword(inputId, iconId) {
    // Ambil elemen input password berdasarkan ID
    const input = document.getElementById(inputId);
    // Ambil elemen icon berdasarkan ID
    const icon = document.getElementById(iconId);

    // Cek tipe input saat ini
    if (input.type === 'password') {
        // Jika password, ubah menjadi text (tampilkan password)
        input.type = 'text';
        // Hapus class 'fa-eye' dari icon (mata membuka)
        icon.classList.remove('fa-eye');
        // Tambahkan class 'fa-eye-slash' ke icon (mata tertutup)
        icon.classList.add('fa-eye-slash');
    } else {
        // Jika text, ubah menjadi password (sembunyikan password)
        input.type = 'password';
        // Hapus class 'fa-eye-slash' dari icon
        icon.classList.remove('fa-eye-slash');
        // Tambahkan class 'fa-eye' ke icon
        icon.classList.add('fa-eye');
    }
}

/**
 * Cek kekuatan password dan update visual indicator
 * Menganistrasi strength bar berdasarkan kriteria kompleksitas password
 * @param {string} password - String password yang akan dicek
 */
function checkPasswordStrength(password) {
    // Ambil elemen container strength indicator
    const strengthIndicator = document.getElementById('passwordStrength');
    // Ambil elemen bar yang menunjukkan level strength
    const strengthBar = document.getElementById('passwordStrengthBar');

    // Jika password kosong, sembunyikan strength indicator
    if (password.length === 0) {
        // Hapus class 'show' (sembunyikan)
        strengthIndicator.classList.remove('show');
        // Keluar dari fungsi
        return;
    }

    // Tampilkan strength indicator
    strengthIndicator.classList.add('show');

    // Inisialisasi score strength (semakin tinggi = lebih kuat)
    let strength = 0;

    // ===== LENGTH CHECKS =====
    // Tambah skor jika panjang >= 6 karakter
    if (password.length >= 6) strength++;
    // Tambah skor jika panjang >= 10 karakter
    if (password.length >= 10) strength++;

    // ===== CHARACTER VARIETY CHECKS =====
    // Tambah skor jika ada huruf lowercase DAN uppercase (mix case)
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    // Tambah skor jika ada angka (digit)
    if (/\d/.test(password)) strength++;
    // Tambah skor jika ada character khusus (bukan huruf atau angka)
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    // Set ulang class strength bar
    strengthBar.className = 'password-strength-bar';

    // Tentukan level strength berdasarkan score
    if (strength <= 2) {
        // Score 0-2 = weak (merah)
        strengthBar.classList.add('weak');
    } else if (strength <= 4) {
        // Score 3-4 = medium (orange)
        strengthBar.classList.add('medium');
    } else {
        // Score 5+ = strong (hijau)
        strengthBar.classList.add('strong');
    }
}

/**
 * Tampilkan form forgot password dan sembunyikan form lainnya
 */
function showForgotPassword() {
    // Sembunyikan login form
    document.getElementById('loginForm').style.display = 'none';
    // Sembunyikan register form
    document.getElementById('registerForm').style.display = 'none';
    // Tampilkan forgot password form
    document.getElementById('forgotPasswordForm').style.display = 'block';
    // Bersihkan semua pesan error/success sebelumnya
    clearAllErrors();
}

/**
 * Bersihkan semua pesan error dan success di halaman
 */
function clearAllErrors() {
    // Ambil semua elemen dengan class 'error-message' atau 'success-message'
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        // Hapus class 'show' (sembunyikan elemen)
        el.classList.remove('show');
        // Kosongkan text isi (hapus pesan)
        el.textContent = '';
    });
}

/**
 * Handle proses forgot password - kirim email reset ke user
 * Fungsi async karena menggunakan Supabase API (request HTTP)
 * @param {Event} e - Event dari form submission
 */
async function handleForgotPassword(e) {
    // Prevent default form submission behavior
    e.preventDefault();

    // Ambil email dari input field
    const email = document.getElementById('forgotEmail').value;
    // Ambil elemen untuk menampilkan error message
    const errorEl = document.getElementById('forgotError');
    // Ambil elemen untuk menampilkan success message
    const successEl = document.getElementById('forgotSuccess');
    // Ambil button submit
    const submitBtn = document.getElementById('forgotBtn');

    // Bersihkan pesan error/success sebelumnya
    errorEl.classList.remove('show');
    successEl.classList.remove('show');

    // Simpan text button original
    const originalText = submitBtn.innerHTML;
    // Update button dengan loading spinner
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    // Disable button saat proses berlangsung
    submitBtn.disabled = true;

    try {
        // Kirim request reset password ke Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // URL yang akan user klik dari email reset
            redirectTo: window.location.origin + '/reset-password.html',
        });

        // Jika ada error, throw untuk catch block
        if (error) throw error;

        // Jika berhasil, tampilkan success message
        successEl.textContent = '✅ Reset link sent! Check your email.';
        successEl.classList.add('show');

        // Bersihkan input email
        document.getElementById('forgotEmail').value = '';

        // Redirect ke login form setelah 3 detik (3000ms)
        setTimeout(() => {
            showLogin();
        }, 3000);

    } catch (error) {
        // Tampilkan error message jika terjadi error
        errorEl.textContent = error.message || 'Failed to send reset link. Please try again.';
        errorEl.classList.add('show');
    } finally {
        // Kembalikan button ke state normal (after try/catch selesai)
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Login dengan Google OAuth
 * Placeholder - perlu konfigurasi OAuth di Supabase
 */
async function signInWithGoogle() {
    try {
        // Panggil Supabase OAuth dengan provider Google
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // URL untuk redirect setelah login berhasil
                redirectTo: window.location.origin + '/index.html'
            }
        });

        // Jika ada error, throw
        if (error) throw error;
    } catch (error) {
        // Alert user jika belum dikonfigurasi
        alert('Google sign in not configured yet. Please use email/password.');
        // Log error ke console untuk debugging
        console.error('Google sign in error:', error);
    }
}

/**
 * Login dengan GitHub OAuth
 * Placeholder - perlu konfigurasi OAuth di Supabase
 */
async function signInWithGithub() {
    try {
        // Panggil Supabase OAuth dengan provider GitHub
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                // URL untuk redirect setelah login berhasil
                redirectTo: window.location.origin + '/index.html'
            }
        });

        // Jika ada error, throw
        if (error) throw error;
    } catch (error) {
        // Alert user jika belum dikonfigurasi
        alert('GitHub sign in not configured yet. Please use email/password.');
        // Log error ke console untuk debugging
        console.error('GitHub sign in error:', error);
    }
}

/**
 * Check apakah user sudah logged in saat halaman dimuat
 * Jika sudah logged in, redirect ke home page
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ambil data user yang sedang logged in dari Supabase
        const { data: { user } } = await supabase.auth.getUser();

        // Jika ada user (sudah login)
        if (user) {
            // Redirect ke halaman utama (index.html)
            window.location.href = 'index.html';
        }
    } catch (error) {
        // Log error jika ada (tidak fatal, user bisa lanjut)
        console.error('Error checking auth status:', error);
    }
});

