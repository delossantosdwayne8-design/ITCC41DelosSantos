document.addEventListener('deviceready', () => {
  // Default profile fallback values
  const defaultProfile = {
    name: "Dwayne Delos Santos",
    course: "BS Information Technology",
    year: "3rd Year",
    about: "Passionate about full-stack web development and mobile hybrid applications.",
    skills: "HTML5 & CSS3, Java, SQL, Git, Apache Cordova",
    image: "img/Dwayneprofile.jpg"
  };

  // DOM Elements
  const profileView = document.getElementById('profile-view');
  const editView = document.getElementById('edit-view');
  const errorMsg = document.getElementById('error-message');
  const cameraErrorMsg = document.getElementById('camera-error-message');

  const displayImg = document.getElementById('display-img');
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

  const btnChangePhoto = document.getElementById('btn-change-photo');
  const btnResetPhoto = document.getElementById('btn-reset-photo');
  const btnEdit = document.getElementById('btn-edit');
  const btnSave = document.getElementById('btn-save');
  const btnCancel = document.getElementById('btn-cancel');

  // 1. Load Profile Data & Image from localStorage or Fallback Defaults
  function loadProfile() {
    const savedProfile = localStorage.getItem('studentProfile');
    const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;

    displayName.textContent = profile.name;
    displayCourse.textContent = profile.course;
    displayYear.textContent = profile.year;
    displayAbout.textContent = profile.about;
    displaySkills.textContent = profile.skills;

    if (displayImg) {
      displayImg.src = profile.image || defaultProfile.image;
    }
  }

  // 2. Camera Trigger Actions (Clicking Image or Change Photo Button)
  if (displayImg) {
    displayImg.addEventListener('click', takePicture);
  }

  if (btnChangePhoto) {
    btnChangePhoto.addEventListener('click', takePicture);
  }

  function takePicture() {
    if (cameraErrorMsg) cameraErrorMsg.style.display = 'none';

    if (!navigator.camera) {
      if (cameraErrorMsg) {
        cameraErrorMsg.textContent = "Camera plugin unavailable on this platform/emulator.";
        cameraErrorMsg.style.display = 'block';
      } else {
        alert("Camera plugin is not available on this platform or emulator.");
      }
      return;
    }

    const options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      correctOrientation: true
    };

    navigator.camera.getPicture(onSuccess, onFail, options);
  }

  function onSuccess(imageData) {
    const base64Image = "data:image/jpeg;base64," + imageData;
    if (displayImg) displayImg.src = base64Image;

    // Save updated image to localStorage
    const savedProfile = localStorage.getItem('studentProfile');
    const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    profile.image = base64Image;
    localStorage.setItem('studentProfile', JSON.stringify(profile));
  }

  function onFail(message) {
    console.log('Camera failed or canceled: ' + message);
  }

  // 3. Reset Photo Action
  if (btnResetPhoto) {
    btnResetPhoto.addEventListener('click', () => {
      const savedProfile = localStorage.getItem('studentProfile');
      const profile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;

      // Revert image back to standard default
      profile.image = defaultProfile.image;
      localStorage.setItem('studentProfile', JSON.stringify(profile));

      if (displayImg) displayImg.src = defaultProfile.image;
      if (cameraErrorMsg) cameraErrorMsg.style.display = 'none';
    });
  }

  // 4. Open Edit Mode & Populate Inputs
  btnEdit.addEventListener('click', () => {
    inputName.value = displayName.textContent;
    inputCourse.value = displayCourse.textContent;
    inputYear.value = displayYear.textContent;
    inputAbout.value = displayAbout.textContent;
    inputSkills.value = displaySkills.textContent;

    errorMsg.textContent = "";
    profileView.style.display = 'none';
    editView.style.display = 'block';
  });

  // 5. Cancel Edit
  btnCancel.addEventListener('click', () => {
    errorMsg.textContent = "";
    editView.style.display = 'none';
    profileView.style.display = 'block';
  });

  // 6. Validate & Save Profile Text Data
  btnSave.addEventListener('click', () => {
    const valName = inputName.value.trim();
    const valCourse = inputCourse.value.trim();
    const valYear = inputYear.value.trim();
    const valAbout = inputAbout.value.trim();
    const valSkills = inputSkills.value.trim();

    if (!valName || !valCourse || !valYear || !valAbout) {
      errorMsg.textContent = "Please complete all required fields (Name, Course, Year, About Me).";
      return;
    }

    const savedProfile = localStorage.getItem('studentProfile');
    const existingProfile = savedProfile ? JSON.parse(savedProfile) : defaultProfile;

    const updatedProfile = {
      ...existingProfile,
      name: valName,
      course: valCourse,
      year: valYear,
      about: valAbout,
      skills: valSkills || "None listed"
    };

    localStorage.setItem('studentProfile', JSON.stringify(updatedProfile));
    loadProfile();

    editView.style.display = 'none';
    profileView.style.display = 'block';
  });

  // Initial Load
  loadProfile();
}, false);