/**
 * MindCare - Quiz Functionality
 * File: quiz.js
 * 
 * JavaScript untuk kuesioner kesehatan mental
 */

// ================================================
// QUIZ DATA - Questions & Options
// ================================================

const questions = [
    {
        // Pertanyaan 1 tentang depresi
        question: "Seberapa sering Anda merasa sedih atau tertekan dalam 2 minggu terakhir?",
        // Array opsi jawaban dengan text dan nilai score
        options: [
            { text: "Tidak pernah", value: 0 }, // Skor 0 = kondisi terbaik
            { text: "Beberapa hari", value: 1 }, // Skor 1 = ringan
            { text: "Lebih dari seminggu", value: 2 }, // Skor 2 = sedang
            { text: "Hampir setiap hari", value: 3 } // Skor 3 = berat
        ]
    },
    {
        question: "Apakah Anda kehilangan minat atau kesenangan dalam melakukan aktivitas?",
        options: [
            { text: "Tidak sama sekali", value: 0 },
            { text: "Sedikit", value: 1 },
            { text: "Cukup banyak", value: 2 },
            { text: "Sangat banyak", value: 3 }
        ]
    },
    {
        question: "Bagaimana kualitas tidur Anda akhir-akhir ini?",
        options: [
            { text: "Sangat baik", value: 0 },
            { text: "Baik", value: 1 },
            { text: "Kurang baik", value: 2 },
            { text: "Sangat buruk", value: 3 }
        ]
    },
    {
        question: "Seberapa sering Anda merasa lelah atau kekurangan energi?",
        options: [
            { text: "Jarang", value: 0 },
            { text: "Kadang-kadang", value: 1 },
            { text: "Sering", value: 2 },
            { text: "Hampir setiap hari", value: 3 }
        ]
    },
    {
        question: "Apakah Anda mengalami kesulitan berkonsentrasi?",
        options: [
            { text: "Tidak", value: 0 },
            { text: "Sedikit kesulitan", value: 1 },
            { text: "Cukup sulit", value: 2 },
            { text: "Sangat sulit", value: 3 }
        ]
    },
    {
        question: "Bagaimana perasaan Anda tentang diri sendiri?",
        options: [
            { text: "Positif", value: 0 },
            { text: "Netral", value: 1 },
            { text: "Agak negatif", value: 2 },
            { text: "Sangat negatif", value: 3 }
        ]
    },
    {
        question: "Seberapa sering Anda merasa cemas atau khawatir berlebihan?",
        options: [
            { text: "Tidak pernah", value: 0 },
            { text: "Sesekali", value: 1 },
            { text: "Sering", value: 2 },
            { text: "Hampir selalu", value: 3 }
        ]
    },
    {
        question: "Apakah Anda merasa terisolasi atau kesepian?",
        options: [
            { text: "Tidak", value: 0 },
            { text: "Kadang-kadang", value: 1 },
            { text: "Sering", value: 2 },
            { text: "Sangat sering", value: 3 }
        ]
    }
];

// ================================================
// QUIZ STATE VARIABLES - Menyimpan status quiz
// ================================================

let currentQuestion = 0; // Index pertanyaan yang sedang ditampilkan (mulai dari 0)
let answers = []; // Array untuk menyimpan jawaban user (index = question index, value = score)

// ================================================
// QUIZ FUNCTIONS
// ================================================

/**
 * Mulai kuesioner - Sembunyikan layar awal dan tampilkan form
 * User bisa mulai kuesioner tanpa login, login hanya diperlukan saat submit/simpan hasil
 */
function startQuiz() {
    try {
        // Sembunyikan elemen dengan class 'hide' (tampilan awal)
        document.getElementById('quizStart').classList.add('hide');
        // Tampilkan form kuesioner (hapus class hide)
        document.getElementById('quizForm').classList.remove('hide');
        // Render semua pertanyaan ke dalam DOM
        renderQuestions();
        // Tampilkan pertanyaan pertama (index 0)
        showQuestion(0);
    } catch (error) {
        // Log error untuk debugging
        console.error('Error in startQuiz:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
}

/**
 * Render semua pertanyaan ke dalam DOM
 * Membuat struktur HTML untuk setiap pertanyaan dan opsinya
 */
function renderQuestions() {
    // Ambil container untuk menempatkan pertanyaan
    const container = document.getElementById('questionsContainer');
    // Kosongkan container (hapus isi sebelumnya)
    container.innerHTML = '';

    // Loop setiap pertanyaan dalam array
    questions.forEach((q, index) => {
        // Buat div baru untuk card pertanyaan
        const questionCard = document.createElement('div');
        // Berikan class untuk styling (CSS)
        questionCard.className = 'question-card';
        // Berikan ID unik untuk setiap pertanyaan (question-0, question-1, dst)
        questionCard.id = `question-${index}`;

        // Inisialisasi string kosong untuk HTML opsi
        let optionsHTML = '';
        // Loop setiap opsi dalam pertanyaan
        q.options.forEach((option, optIndex) => {
            // Tambahkan HTML button untuk setiap opsi
            optionsHTML += `
                <button type="button" class="option-btn" onclick="selectOption(${index}, ${option.value}, this)">
                    ${option.text}
                </button>
            `;
        });

        // Set innerHTML dengan pertanyaan dan opsinya
        questionCard.innerHTML = `
            <h4>Pertanyaan ${index + 1} dari ${questions.length}</h4>
            <p style="font-size: 1.1rem; margin-bottom: 20px;">${q.question}</p>
            ${optionsHTML}
        `;

        // Tambahkan card ke container
        container.appendChild(questionCard);
    });
}

/**
 * Tampilkan pertanyaan tertentu dan update UI
 * @param {number} index - Index pertanyaan yang ingin ditampilkan
 */
function showQuestion(index) {
    // Ambil semua elemen dengan class 'question-card'
    const allQuestions = document.querySelectorAll('.question-card');
    // Hapus class 'active' dari semua pertanyaan (sembunyikan semua)
    allQuestions.forEach(q => q.classList.remove('active'));

    // Jika index valid, tambahkan class 'active' ke pertanyaan yang dipilih (tampilkan)
    if (allQuestions[index]) {
        allQuestions[index].classList.add('active');
    }

    // Hitung progress bar (persentase pertanyaan yang sudah dijawab)
    // Rumus: (pertanyaan saat ini + 1) / total pertanyaan * 100
    const progress = ((index + 1) / questions.length) * 100;
    // Update lebar progress bar dengan persentase
    document.getElementById('progressBar').style.width = progress + '%';

    // Update status button Previous
    // Disable tombol jika pertanyaan pertama (index === 0)
    document.getElementById('prevBtn').disabled = index === 0;
    // Tampilkan/sembunyikan tombol Next
    // Sembunyikan jika pertanyaan terakhir, tampilkan jika belum terakhir
    document.getElementById('nextBtn').style.display = index === questions.length - 1 ? 'none' : 'inline-block';
    // Tampilkan/sembunyikan tombol Submit
    // Tampilkan jika pertanyaan terakhir, sembunyikan jika belum terakhir
    document.getElementById('submitBtn').style.display = index === questions.length - 1 ? 'inline-block' : 'none';
}

/**
 * Simpan pilihan jawaban dan tandai button yang dipilih
 * @param {number} questionIndex - Index pertanyaan yang dijawab
 * @param {number} value - Nilai score dari opsi yang dipilih
 * @param {HTMLElement} button - Element button yang diklik
 */
function selectOption(questionIndex, value, button) {
    // Simpan jawaban ke array answers pada index pertanyaan yang sesuai
    answers[questionIndex] = value;

    // Ambil container pertanyaan berdasarkan index
    const questionCard = document.getElementById(`question-${questionIndex}`);
    // Ambil semua button dengan class 'option-btn' dalam pertanyaan ini
    questionCard.querySelectorAll('.option-btn').forEach(btn => {
        // Hapus class 'selected' dari semua button (deselect semua)
        btn.classList.remove('selected');
    });

    // Tambahkan class 'selected' ke button yang diklik
    button.classList.add('selected');
}

/**
 * Navigasi ke pertanyaan sebelumnya atau selanjutnya
 * @param {number} direction - Arah perubahan: -1 (previous) atau 1 (next)
 */
function changeQuestion(direction) {
    // Tambahkan direction ke currentQuestion (next=+1, prev=-1)
    currentQuestion += direction;
    // Boundary check: jangan kurang dari 0
    if (currentQuestion < 0) currentQuestion = 0;
    // Boundary check: jangan lebih dari jumlah pertanyaan
    if (currentQuestion >= questions.length) currentQuestion = questions.length - 1;
    // Tampilkan pertanyaan yang baru
    showQuestion(currentQuestion);
}

/**
 * Submit kuesioner dan tampilkan hasil
 */
function submitQuiz() {
    // Check if all questions are answered
    if (answers.length < questions.length) {
        alert('Mohon jawab semua pertanyaan terlebih dahulu.');
        return;
    }

    // Calculate score
    const totalScore = answers.reduce((sum, val) => sum + val, 0);
    const maxScore = questions.length * 3;
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Show result
    document.getElementById('quizForm').classList.add('hide');
    document.getElementById('resultContainer').classList.add('show');
    document.getElementById('resultScore').textContent = percentage + '%';

    let message = '';
    let recommendation = '';
    let category = '';

    if (percentage <= 25) {
        category = 'Kesehatan Mental Baik';
        message = 'Kesehatan Mental Baik';
        recommendation = 'Kondisi mental Anda saat ini dalam keadaan baik. Terus jaga kesehatan mental Anda dengan pola hidup sehat, istirahat cukup, dan aktivitas yang menyenangkan.';
    } else if (percentage <= 50) {
        category = 'Perlu Perhatian';
        message = 'Perlu Perhatian';
        recommendation = 'Anda mengalami beberapa gejala yang perlu diperhatikan. Cobalah untuk lebih memperhatikan kesehatan mental Anda. Pertimbangkan untuk berbicara dengan teman dekat atau keluarga.';
    } else if (percentage <= 75) {
        category = 'Butuh Dukungan';
        message = 'Butuh Dukungan';
        recommendation = 'Anda menunjukkan tanda-tanda yang cukup signifikan. Sangat disarankan untuk berbicara dengan profesional kesehatan mental seperti psikolog atau konselor.';
    } else {
        category = 'Segera Cari Bantuan';
        message = 'Segera Cari Bantuan';
        recommendation = 'Kondisi Anda memerlukan perhatian serius. Sangat penting untuk segera menghubungi profesional kesehatan mental atau hotline kesehatan mental: 119 ext 8.';
    }

    document.getElementById('resultMessage').innerHTML = `
        <strong>${message}</strong><br><br>
        ${recommendation}
    `;

    // Send data to backend
    sendResultToBackend(totalScore, percentage, category);
}

/**
 * Kirim hasil ke backend untuk disimpan
 * Coba simpan ke Supabase jika user sudah login, jika tidak simpan ke localStorage
 * @param {number} score - Total skor
 * @param {number} percentage - Persentase
 * @param {string} category - Kategori hasil
 */
async function sendResultToBackend(score, percentage, category) {
    try {
        // Cek apakah user sudah login
        const user = await checkAuth();

        if (user) {
            // Jika sudah login, simpan ke Supabase
            const result = await saveQuizResult(score, percentage, category, answers);
            if (result.success) {
                console.log('Hasil kuesioner berhasil disimpan ke database:', result.data);
            } else {
                console.warn('Gagal menyimpan ke database:', result.error);
                // Simpan ke localStorage sebagai backup
                saveToLocalStorage(score, percentage, category);
            }
        } else {
            // Jika belum login, simpan ke localStorage
            console.log('User belum login. Hasil disimpan ke localStorage.');
            saveToLocalStorage(score, percentage, category);
        }
    } catch (error) {
        console.error('Error sending result to backend:', error);
        // Simpan ke localStorage sebagai fallback
        saveToLocalStorage(score, percentage, category);
    }
}

/**
 * Simpan hasil ke localStorage sebagai backup/offline storage
 * @param {number} score - Total skor
 * @param {number} percentage - Persentase
 * @param {string} category - Kategori hasil
 */
function saveToLocalStorage(score, percentage, category) {
    try {
        const result = {
            score: score,
            percentage: percentage,
            category: category,
            answers: answers,
            timestamp: new Date().toISOString()
        };

        // Ambil hasil sebelumnya dari localStorage
        let quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];

        // Tambahkan hasil baru
        quizHistory.push(result);

        // Simpan kembali ke localStorage (simpan max 10 hasil terakhir)
        if (quizHistory.length > 10) {
            quizHistory = quizHistory.slice(-10);
        }
        localStorage.setItem('quizHistory', JSON.stringify(quizHistory));

        console.log('Hasil disimpan ke localStorage:', result);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Reset kuesioner ke awal
 */
function resetQuiz() {
    currentQuestion = 0;
    answers = [];
    document.getElementById('resultContainer').classList.remove('show');
    document.getElementById('quizStart').classList.remove('hide');
    document.getElementById('progressBar').style.width = '0%';
    
    // Clear all selected options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// ================================================
// SMOOTH SCROLL FOR NAVIGATION
// ================================================

/**
 * Smooth scroll ke section tertentu
 */
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll untuk semua anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ================================================
// UTILITIES
// ================================================

/**
 * Log quiz statistics (for debugging)
 */
function logQuizStats() {
    console.log('Quiz Statistics:');
    console.log('Total Questions:', questions.length);
    console.log('Current Question:', currentQuestion + 1);
    console.log('Answers:', answers);
    console.log('Completion:', Math.round((answers.length / questions.length) * 100) + '%');
}

// Export functions for external use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        startQuiz,
        resetQuiz,
        submitQuiz,
        selectOption,
        changeQuestion
    };
}
