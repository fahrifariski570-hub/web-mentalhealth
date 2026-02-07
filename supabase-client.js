

// ================================================
// KONFIGURASI SUPABASE
// ================================================


const SUPABASE_URL = 'https://friwvfvdjdzouuxlrfta.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aNbhbn3fdboIhS0S-RKm0Q_b_76Eej1';

// Inisialisasi Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ================================================
// MANAJEMEN STATE AUTENTIKASI
// ================================================

let currentUser = null;

/**
 * Cek apakah user sudah login
 * @returns {Promise<Object|null>} Objek user atau null
 */
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        currentUser = user;
        return user;
    } catch (error) {
        console.error('Check auth error:', error);
        currentUser = null;
        return null;
    }
}

/**
 * Ambil session yang sedang berjalan
 * @returns {Promise<Object|null>} Objek session atau null
 */
async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

// ================================================
// FUNGSI AUTENTIKASI
// ================================================

/**
 * Registrasi user baru dengan email dan password
 * @param {string} email - Email user
 * @param {string} password - Password user
 * @param {string} fullName - Nama lengkap user
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function signUp(email, password, fullName) {
    try {
        // 1. Buat user autentikasi
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (authError) throw authError;

        // 2. Buat profil user di tabel users
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('users')
                .insert([
                    {
                        user_id: authData.user.id,
                        email: email,
                        full_name: fullName,
                    }
                ]);

            // Abaikan error duplikasi (user mungkin sudah ada)
            if (profileError && !profileError.message.includes('duplicate')) {
                console.error('Profile creation error:', profileError);
            }
        }

        return { 
            success: true, 
            user: authData.user,
            message: 'Account created successfully!' 
        };
        
    } catch (error) {
        console.error('Sign up error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Login user yang sudah ada dengan email dan password
 * @param {string} email - Email user
 * @param {string} password - Password user
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        currentUser = data.user;
        
        return { 
            success: true, 
            user: data.user,
            session: data.session 
        };
        
    } catch (error) {
        console.error('Sign in error:', error);
        
        // Provide user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
        }
        
        return { 
            success: false, 
            error: errorMessage 
        };
    }
}

/**
 * Logout user saat ini
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        currentUser = null;

        return {
            success: true,
            message: 'Logout berhasil'
        };
        
    } catch (error) {
        console.error('Sign out error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Login dengan OAuth provider (Google, GitHub, etc.)
 * @param {string} provider - Nama OAuth provider
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function signInWithOAuth(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) throw error;

        return { success: true, data };
        
    } catch (error) {
        console.error('OAuth sign in error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// ================================================
// FUNGSI PROFIL USER
// ================================================

/**
 * Ambil data profil user
 * @param {string} userId - ID user
 * @returns {Promise<Object>} Objek hasil dengan data profil
 */
async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        
        return { 
            success: true, 
            profile: data 
        };
        
    } catch (error) {
        console.error('Get profile error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Update profil user
 * @param {string} userId - ID user
 * @param {Object} updates - Objek update profil
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('user_id', userId)
            .select();

        if (error) throw error;

        return { 
            success: true, 
            profile: data[0] 
        };
        
    } catch (error) {
        console.error('Update profile error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// ================================================
// FUNGSI KUESIONER
// ================================================

/**
 * Simpan hasil kuesioner ke Supabase
 * @param {number} score - Total skor
 * @param {number} percentage - Skor persentase
 * @param {string} category - Kategori hasil
 * @param {Array} answers - Array jawaban
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function saveQuizResult(score, percentage, category, answers) {
    try {
        const user = await checkAuth();

        if (!user) {
            throw new Error('User belum autentikasi. Silakan login terlebih dahulu.');
        }

        const { data, error } = await supabase
            .from('quiz_results')
            .insert([
                {
                    user_id: user.id,
                    score: score,
                    percentage: percentage,
                    category: category,
                    answers: answers,
                }
            ])
            .select();

        if (error) throw error;

        console.log('Hasil kuesioner berhasil disimpan:', data[0]);

        return {
            success: true,
            data: data[0],
            message: 'Hasil kuesioner berhasil disimpan!'
        };
        
    } catch (error) {
        console.error('Save quiz error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

/**
 * Ambil history kuesioner user
 * @param {number} limit - Jumlah maksimal hasil untuk diambil
 * @returns {Promise<Object>} Objek hasil dengan array hasil kuesioner
 */
async function getUserQuizHistory(limit = 10) {
    try {
        const user = await checkAuth();
        
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('quiz_results')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { 
            success: true, 
            results: data,
            count: data.length 
        };
        
    } catch (error) {
        console.error('Get quiz history error:', error);
        return { 
            success: false, 
            error: error.message,
            results: [] 
        };
    }
}

/**
 * Ambil statistik user
 * @returns {Promise<Object>} Objek hasil dengan statistik user
 */
async function getUserStats() {
    try {
        const user = await checkAuth();
        
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .rpc('get_user_stats', { p_user_id: user.id });

        if (error) throw error;

        return { 
            success: true, 
            stats: data[0] || {} 
        };
        
    } catch (error) {
        console.error('Get user stats error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// ================================================
// FUNGSI FEEDBACK
// ================================================

/**
 * Kirim feedback user
 * @param {string} name - Nama user
 * @param {string} email - Email user
 * @param {string} message - Pesan feedback
 * @returns {Promise<Object>} Objek hasil dengan status keberhasilan
 */
async function submitFeedback(name, email, message) {
    try {
        const user = await checkAuth();

        const { data, error } = await supabase
            .from('user_feedback')
            .insert([
                {
                    user_id: user?.id || null,
                    name: name,
                    email: email,
                    message: message,
                }
            ])
            .select();

        if (error) throw error;

        return {
            success: true,
            data: data[0],
            message: 'Feedback berhasil dikirim!'
        };
        
    } catch (error) {
        console.error('Submit feedback error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// ================================================
// PENDENGAR STATE AUTENTIKASI
// ================================================

/**
 * Dengarkan perubahan state autentikasi
 */
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Event autentikasi:', event);

    currentUser = session?.user || null;

    // Update UI berdasarkan state autentikasi
    updateUIForAuthState();

    // Handle event spesifik
    switch(event) {
        case 'SIGNED_IN':
            console.log('User signed in:', session.user.email);
            break;
        case 'SIGNED_OUT':
            console.log('User signed out');
            break;
        case 'USER_UPDATED':
            console.log('User updated:', session.user.email);
            break;
        case 'PASSWORD_RECOVERY':
            console.log('Password recovery initiated');
            break;
    }
});

// ================================================
// FUNGSI UPDATE UI
// ================================================

/**
 * Update elemen UI berdasarkan state autentikasi
 */
function updateUIForAuthState() {
    const user = currentUser;

    // Elemen yang memerlukan autentikasi
    const authRequired = document.querySelectorAll('.auth-required');
    const authHidden = document.querySelectorAll('.auth-hidden');

    if (user) {
        // User sudah login
        authRequired.forEach(el => el.style.display = '');
        authHidden.forEach(el => el.style.display = 'none');

        // Update tampilan nama user
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.user_metadata?.full_name || user.email;
        });

        // Update tampilan email user
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });

        // Tampilkan avatar user
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        userAvatarElements.forEach(el => {
            const name = user.user_metadata?.full_name || user.email;
            el.textContent = name.charAt(0).toUpperCase();
        });

    } else {
        // User sudah logout
        authRequired.forEach(el => el.style.display = 'none');
        authHidden.forEach(el => el.style.display = '');
    }
}

// ================================================
// FUNGSI UTILITY
// ================================================

/**
 * Cek apakah user autentikasi, redirect ke login jika tidak
 * @param {string} redirectUrl - URL untuk redirect setelah login
 */
async function requireAuth(redirectUrl = '/login.html') {
    const user = await checkAuth();

    if (!user) {
        // Simpan URL saat ini untuk redirect setelah login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = redirectUrl;
    }
}

/**
 * Redirect ke URL yang disimpan setelah login
 */
function redirectAfterLogin() {
    const savedUrl = sessionStorage.getItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');

    if (savedUrl && savedUrl !== '/login.html') {
        window.location.href = savedUrl;
    } else {
        window.location.href = '/index.html';
    }
}

// ================================================
// INISIALISASI SAAT HALAMAN LOAD
// ================================================

document.addEventListener('DOMContentLoaded', async () => {
    // Cek status autentikasi
    await checkAuth();

    // Update UI
    updateUIForAuthState();

    // Log status auth saat ini (untuk debugging)
    console.log('Current user:', currentUser ? currentUser.email : 'Not logged in');
});

// ================================================
// EXPORT (jika menggunakan modules)
// ================================================

// Uncomment jika menggunakan ES6 modules
/*
export {
    supabase,
    checkAuth,
    getSession,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    getUserProfile,
    updateUserProfile,
    saveQuizResult,
    getUserQuizHistory,
    getUserStats,
    submitFeedback,
    requireAuth,
    redirectAfterLogin
};
*/