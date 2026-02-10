
// Show/Hide Forms
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    clearErrors();
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    clearErrors();
}

function clearErrors() {
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('registerError').classList.remove('show');
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitBtn.disabled = true;
    
    try {
        const result = await signIn(email, password);
        
        if (result.success) {
            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            // Show error
            errorEl.textContent = result.error || 'Login failed. Please try again.';
            errorEl.classList.add('show');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        errorEl.textContent = 'An error occurred. Please try again.';
        errorEl.classList.add('show');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');
    
    // Validate password
    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        errorEl.classList.add('show');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    try {
        const result = await signUp(email, password, name);
        
        if (result.success) {
            // Show success message
            alert('Account created successfully! Redirecting to login...');
            showLogin();
            
            // Pre-fill login form
            document.getElementById('loginEmail').value = email;
        } else {
            // Show error
            errorEl.textContent = result.error || 'Registration failed. Please try again.';
            errorEl.classList.add('show');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        errorEl.textContent = 'An error occurred. Please try again.';
        errorEl.classList.add('show');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Handle Logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        const result = await signOut();
        if (result.success) {
            window.location.href = 'index.html';
        }
    }
}
