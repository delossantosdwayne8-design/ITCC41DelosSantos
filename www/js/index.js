// Base API URL pointing to Node.js backend
const API_URL = 'http://192.168.1.4:5000/api';

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova device is ready.');
    initApp();
}

// Fallback for browser testing when deviceready doesn't fire
if (!window.cordova) {
    document.addEventListener('DOMContentLoaded', initApp);
}

function initApp() {
    bindEvents();
    checkSession();
}

function bindEvents() {
    // Auth Forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('btn-logout').addEventListener('click', handleLogout);

    // Profile UI Controls
    document.getElementById('btn-edit-profile').addEventListener('click', showEditForm);
    document.getElementById('btn-cancel').addEventListener('click', hideEditForm);
    document.getElementById('btn-save').addEventListener('click', handleSaveProfile);
    document.getElementById('btn-change-photo').addEventListener('click', handleCameraPhoto);
}

// --- Session & Authentication ---

function getToken() {
    return localStorage.getItem('jwt_token');
}

function checkSession() {
    const token = getToken();
    if (token) {
        fetchProfile();
    } else {
        showLoginView();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const studentIdInput = document.getElementById('login-student-id').value.trim();
    const passwordInput = document.getElementById('login-password').value;
    const errorBox = document.getElementById('login-error');

    errorBox.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: studentIdInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('jwt_token', data.token);
            document.getElementById('login-form').reset();
            renderProfile(data.student);
            showProfileView();
            showAlert('Login successful!', 'success');
        } else {
            errorBox.textContent = data.message || 'Login failed.';
            errorBox.style.display = 'block';
        }
    } catch (err) {
        console.error('Login error:', err);
        errorBox.textContent = 'Unable to connect to backend server.';
        errorBox.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('jwt_token');
    showLoginView();
    showAlert('Logged out successfully.', 'info');
}

// --- API Calls ---

async function fetchProfile() {
    const token = getToken();
    if (!token) return showLoginView();

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            renderProfile(data.student);
            showProfileView();
        } else {
            // Token expired or invalid
            localStorage.removeItem('jwt_token');
            showLoginView();
            showAlert('Session expired. Please log in again.', 'error');
        }
    } catch (err) {
        console.error('Fetch profile error:', err);
        showAlert('Error loading profile data from server.', 'error');
    }
}

async function handleSaveProfile() {
    const token = getToken();
    if (!token) return showLoginView();

    const updatedProfile = {
        full_name: document.getElementById('input-name').value.trim(),
        course: document.getElementById('input-course').value.trim(),
        year_level: document.getElementById('input-year').value.trim(),
        about_me: document.getElementById('input-about').value.trim(),
        skills: document.getElementById('input-skills').value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedProfile)
        });

        const data = await response.json();

        if (data.success) {
            fetchProfile();
            hideEditForm();
            showAlert('Profile updated successfully!', 'success');
        } else {
            showAlert(data.message || 'Failed to update profile.', 'error');
        }
    } catch (err) {
        console.error('Save profile error:', err);
        showAlert('Network error while saving profile.', 'error');
    }
}

// --- Camera Integration ---

function handleCameraPhoto() {
    if (navigator.camera) {
        const cameraOptions = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true
        };

        navigator.camera.getPicture(
            (imageData) => {
                const base64Image = 'data:image/jpeg;base64,' + imageData;
                updateProfilePictureOnServer(base64Image);
            },
            (error) => {
                console.error('Camera error:', error);
            },
            cameraOptions
        );
    } else {
        // Fallback for browser testing
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    updateProfilePictureOnServer(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }
}

async function updateProfilePictureOnServer(base64Image) {
    const token = getToken();
    if (!token) return showLoginView();

    // Preserve existing fields while updating profile picture
    const updatedData = {
        full_name: document.getElementById('display-name').textContent,
        course: document.getElementById('display-course-year').textContent.split('-')[0].trim(),
        year_level: document.getElementById('display-course-year').textContent.split('-')[1]?.trim() || '',
        about_me: document.getElementById('display-about').textContent,
        skills: document.getElementById('input-skills').value,
        profile_picture: base64Image
    };

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('profile-pic').src = base64Image;
            showAlert('Profile picture updated!', 'success');
        } else {
            showAlert('Failed to update picture on server.', 'error');
        }
    } catch (err) {
        console.error('Update picture error:', err);
        showAlert('Error uploading profile picture.', 'error');
    }
}

// --- DOM Render & UI Controls ---

function renderProfile(student) {
    document.getElementById('display-name').textContent = student.full_name || '';
    document.getElementById('display-course-year').textContent = `${student.course || ''} - ${student.year_level || ''}`;
    document.getElementById('display-student-id').textContent = `ID: ${student.student_id || ''}`;
    document.getElementById('display-about').textContent = student.about_me || '';

    if (student.profile_picture) {
        document.getElementById('profile-pic').src = student.profile_picture;
    }

    // Populate skills list
    const skillsList = document.getElementById('display-skills-list');
    skillsList.innerHTML = '';
    const skillsArray = student.skills ? student.skills.split(',').map(s => s.trim()) : [];
    
    skillsArray.forEach(skill => {
        if (skill) {
            const li = document.createElement('li');
            li.textContent = skill;
            skillsList.appendChild(li);
        }
    });

    // Populate edit form input fields
    document.getElementById('input-name').value = student.full_name || '';
    document.getElementById('input-course').value = student.course || '';
    document.getElementById('input-year').value = student.year_level || '';
    document.getElementById('input-about').value = student.about_me || '';
    document.getElementById('input-skills').value = student.skills || '';
}

function showLoginView() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'none';
}

function showProfileView() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('profile-section').style.display = 'block';
    document.getElementById('btn-logout').style.display = 'inline-block';
}

function showEditForm() {
    document.getElementById('edit-view').style.display = 'block';
}

function hideEditForm() {
    document.getElementById('edit-view').style.display = 'none';
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alert-message');
    alertBox.textContent = message;
    alertBox.style.display = 'block';

    if (type === 'error') {
        alertBox.style.backgroundColor = '#f8d7da';
        alertBox.style.color = '#721c24';
    } else if (type === 'success') {
        alertBox.style.backgroundColor = '#d4edda';
        alertBox.style.color = '#155724';
    } else {
        alertBox.style.backgroundColor = '#d1ecf1';
        alertBox.style.color = '#0c5460';
    }

    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}