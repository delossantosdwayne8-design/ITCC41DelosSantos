# Student Profile Application — Activity 7: Database & Authentication Integration

## 1. Project Description
This application is a hybrid mobile Student Profile system built with HTML5, CSS3, JavaScript, Apache Cordova, Node.js, Express, and SQLite. Originally developed as a client-side web application, it has evolved into a full-stack, database-driven system featuring user authentication, session persistence, RESTful API communication, and dynamic server-side data storage.

## 2. Application Pages
- **Profile (`index.html`):** Displays student profile information, avatar, about bio, and skill tags retrieved dynamically from the database.
- **About (`about.html`):** Outlines educational background, academic goals, and institutional affiliations.
- **Skills (`skills.html`):** Highlights technical proficiencies including programming languages, frameworks, and tools.
- **Projects (`projects.html`):** Features software development projects, design achievements, and portfolio items.
- **Contact (`contact.html`):** Contains contact information, links to professional repositories, and inquiry options.
- **Login Functionality:** Protects student profile access by authenticating credentials prior to revealing profile data.

## 3. Authentication
Authentication utilizes a secure JWT-based workflow:

## 4. Student Profile Management
Authenticated students can perform the following actions within the app:
- **View Profile:** Fetch and view personalized student records from the SQLite database.
- **Edit Information:** Modify name, course, year level, bio, and skills list.
- **Save Changes:** Submit updated data directly to the server database via HTTP `PUT` requests.
- **Update Profile Picture:** Capture a new photo using the device camera API and save it to the backend.
- **Log Out:** Clear stored authentication tokens and reset the app interface back to the login screen.

## 5. Database Integration
The system uses **SQLite** (`better-sqlite3`) as its relational database engine on the backend server.
- **Stored Information:**
  - `student_id` (PRIMARY KEY)
  - `full_name`
  - `course`
  - `year_level`
  - `about_me`
  - `skills`
  - `profile_picture` (Base64 string data)
  - `password_hash` (Secured authentication hash)

## 6. API/Backend
Communication relies on standard JSON HTTP requests over Express endpoints:

## 7. CRUD Operations
- **Create:** Seeded user/profile record generation on backend initialization (`INSERT INTO students`).
- **Read:** Fetching student profile records upon authentication (`GET /api/profile`).
- **Update:** Saving updated profile details and base64 avatar images (`PUT /api/profile`).
- **Delete:** Session clearance on logout, or deleting student records from SQLite when administrative removal is invoked (`DELETE /api/profile`).

## 8. Camera Integration
The application retains full `cordova-plugin-camera` integration. When the student clicks "Change Photo", the native camera interface captures an image, converts it into a JPEG Base64 string, and uploads it via `PUT /api/profile` to update the user record in SQLite.

## 9. Data Persistence
Data persistence is preserved across sessions through dual-layer persistence:
1. **Client-Side:** JWT authentication token in `localStorage` persists user authorization across app restarts.
2. **Server-Side:** SQLite database stores profile records permanently on disk, ensuring data remains intact through app restarts, device reboots, logouts, and re-logins.

## 10. Responsive Design
The UI utilizes flexible CSS layout rules (Flexbox and CSS Grid) and viewport meta configurations to adapt dynamically across:
- **Desktop:** Multi-column layout with centered containers.
- **Tablet:** Scaled card view with adjusted padding.
- **Mobile:** Single-column layout with touch-friendly targets.

## 11. Security
- Passwords are encrypted using bcrypt hashing; plain text passwords are never stored.
- Database paths, JWT secrets, and port configurations are managed securely via environment configurations (`.env`).
- Secrets and raw database files are excluded from public source control through `.gitignore`.
- Direct database connections are restricted to the Express server, ensuring database credentials are never exposed to the Cordova application client.

## 12. How to Run
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/delossantosdwayne8-design/ITCC41DelosSantos.git](https://github.com/delossantosdwayne8-design/ITCC41DelosSantos.git)
   cd ITCC41DelosSantos

## Testing Session

Test 1 — Valid Login
Enter valid test credentials.

Expected Result:
The student's profile is displayed.
![ACT 7 Test 1 screenshot](<./Screenshots/ACT 7 TEST 1,3.jpg>)

Test 2 — Invalid Login
Enter incorrect credentials.

Expected Result:
Access is denied and an error message is displayed.
![ACT 7 Test 2 screenshot](<./Screenshots/ACT 7 TEST 2.jpg>)

Test 3 — Profile Retrieval
Log in successfully.

Expected Result:
Profile information is retrieved from the database.
![ACT 7 Test 3 screenshot](<./Screenshots/ACT 7 TEST 1,3.jpg>)

Test 4 — Edit Profile
Modify profile information and save.

Expected Result:
The database record is updated.
![ACT 7 Test 4 screenshot](<./Screenshots/ACT 7 TEST 4,6.jpg>)

Test 5 — Verify Update
Log out and log back in.

Expected Result:
The updated information remains.
![ACT 7 Test 5 screenshot](<./Screenshots/ACT 7 TEST 5.jpg>)

Test 6 — Camera
Capture a new profile picture.

Expected Result:
The profile picture is updated.
![ACT 7 Test 6 screenshot](<./Screenshots/ACT 7 TEST 4,6.jpg>)

Test 7 — Logout
Select Logout.

Expected Result:
The user returns to the Login page and protected functionality is no longer accessible.
![ACT 7 Test 7 screenshot](<./Screenshots/ACT 7 TEST 7.jpg>)

Test 8 — Data Persistence
Restart the application and log in again.

Expected Result:
Previously saved database information is retrieved.
IMG:
