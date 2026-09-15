document.addEventListener('DOMContentLoaded', () => {
  // Default values when no localStorage exists
  const defaultProfile = {
    name: "Dwayne Delos Santos",
    course: "BS Information Technology",
    year: "3rd Year",
    about: "Passionate about full-stack web development and mobile hybrid applications.",
    skills: "HTML5 & CSS3, Java, SQL, Git, Apache Cordova"
  };

  // DOM Elements
  const profileView = document.getElementById('profile-view');
  const editView = document.getElementById('edit-view');
  const errorMsg = document.getElementById('error-message');

  const displayName = document.getElementById('display-name');
  const displayCourse = document.getElementById('display-course');
  const displayYear = document.getElementById('display-year');
  const displayAbout = document.getElementById('display-about');
  const displaySkills = document.getElementById('display-skills');

  const inputName = document.getElementById('input-name');
  const inputCourse = document.getElementById('input-course');
  const inputYear = document.getElementById('input-year');
  const inputAbout = document.getElementById('input-about');
  const inputSkills = document.getElementById('input-skills');

  const btnEdit = document.getElementById('btn-edit');
  const btnSave = document.getElementById('btn-save');
  const btnCancel = document.getElementById('btn-cancel');

  // 1. Load Profile Data from localStorage or Fallback Defaults
  function loadProfile() {
    const savedProfile = localStorage.getItem('studentProfile');
    const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;

    displayName.textContent = profile.name;
    displayCourse.textContent = profile.course;
    displayYear.textContent = profile.year;
    displayAbout.textContent = profile.about;
    displaySkills.textContent = profile.skills;
  }

  // 2. Open Edit Mode & Populate Inputs
  btnEdit.addEventListener('click', () => {
    inputName.value = displayName.textContent;
    inputCourse.value = displayCourse.textContent;
    inputYear.value = displayYear.textContent;
    inputAbout.value = displayAbout.textContent;
    inputSkills.value = displaySkills.textContent;

    errorMsg.textContent = ""; // Clear errors
    profileView.style.display = 'none';
    editView.style.display = 'block';
  });

  // 3. Cancel Edit
  btnCancel.addEventListener('click', () => {
    errorMsg.textContent = "";
    editView.style.display = 'none';
    profileView.style.display = 'block';
  });

  // 4. Validate & Save Data
  btnSave.addEventListener('click', () => {
    const valName = inputName.value.trim();
    const valCourse = inputCourse.value.trim();
    const valYear = inputYear.value.trim();
    const valAbout = inputAbout.value.trim();
    const valSkills = inputSkills.value.trim();

    // Validation Rules
    if (!valName || !valCourse || !valYear || !valAbout) {
      errorMsg.textContent = "Please complete all required fields (Name, Course, Year, About Me).";
      return;
    }

    const updatedProfile = {
      name: valName,
      course: valCourse,
      year: valYear,
      about: valAbout,
      skills: valSkills || "None listed"
    };

    // Store in localStorage
    localStorage.setItem('studentProfile', JSON.stringify(updatedProfile));

    // Update UI dynamically
    loadProfile();

    // Switch back to profile display
    editView.style.display = 'none';
    profileView.style.display = 'block';
  });

  // Initial Load
  loadProfile();
});