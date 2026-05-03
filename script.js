// --- DATABASE SIMULATION ---
const dummyPdf = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

// --- DATABASE SIMULATION USING ONLINE LINKS ---

const libraryDB = {
    Academic: [
        { title: "Calculus Vol 1", pdf: "https://ia800401.us.archive.org/13/items/CalculusVolume1LR/CalculusVolume1-LR.pdf" },
        { title: "University Physics", pdf: "https://archive.org/details/cnx-org-col12031" },
        // You can use standard PDF links ending in .pdf
        { title: "Data Structures", pdf: "https://mrcet.com/downloads/digital_notes/CSE/II%20Year/DATA%20STRUCTURES%20DIGITAL%20NOTES.pdf" },
        // Or you can use public Google Drive sharing links!
        { title: "Machine Learning", pdf: "https://ai.stanford.edu/~nilsson/MLBOOK.pdf" },
        { title: "Software Engineering", pdf: "https://mrcet.com/downloads/digital_notes/CSE/III%20Year/Software%20Engineering.pdf" }
        // Add up to 20...
    ],

    Fiction: [
        { title: "Harry Potter 1", pdf: "https://dn721506.ca.archive.org/0/items/the_library_17062025/The%20Library/Harry%20Potter-%20Complete%20Collection.pdf" },
        { title: "The Hobbit", pdf: "https://dn721606.ca.archive.org/0/items/ultimatetolkiencollection/eBooks/The%20Hobbit.pdf" },
        { title: "Frankenstein", pdf: "https://dn720004.ca.archive.org/0/items/english-collections-1/Frankenstein%20-%20Mary%20Wollstonecraft%20Shelley.pdf" },
        { title: "The War of the Worlds", pdf: "https://archive.org/details/the-war-of-the-worlds-h.-g.-wells" },
        { title: "Alice in Wonderland", pdf: "https://dn790000.ca.archive.org/0/items/AlicesAdventuresInWonderland/alice-in-wonderland.pdf" }
        // Add up to 20...
    ],

    Novels: [
        { title: "1984", pdf: "https://dn790002.ca.archive.org/0/items/NineteenEightyFour-Novel-GeorgeOrwell/orwell1984.pdf" },
        { title: "To Kill a Mockingbird", pdf: "https://archive.org/details/dli.bengal.10689.12863" },
        { title: "Pride and Prejudice", pdf: "https://archive.org/details/austen-pride-and-prejudice" },
        { title: "A Tale of Two Cities", pdf: "https://archive.org/details/bwb_KV-317-013" },
        { title: "The Great Gatsby", pdf: "https://ia801801.us.archive.org/15/items/the-great-gatsby_202101/TheGreatGatsby.pdf" }
        // Add up to 20...
    ]
};

let currentMode = 'login'; // For auth page

// --- INITIALIZATION ON PAGE LOAD ---
document.addEventListener("DOMContentLoaded", () => {
    // Initialize DB if empty
    if (!localStorage.getItem("users")) {
        localStorage.setItem("users", JSON.stringify({}));
    }

    // Check which page we are currently on and run the required setup
    if (document.getElementById("admin-table")) loadAdminDashboard();
    if (document.getElementById("book-dropdown")) loadBooksForCategory();
    if (document.getElementById("issue-book-name")) loadIssueDetails();

    // THIS WAS PART OF CHANGE 3: It tells the page to load issued books if the user is on the dashboard
    if (document.getElementById("my-issued-books")) loadMyIssuedBooks();

    // Creative 3D Tilt for Login
    const loginCard = document.getElementById('login-card');
    if (loginCard) {
        document.addEventListener('mousemove', (e) => {
            let xAxis = (window.innerWidth / 2 - e.pageX) / 40;
            let yAxis = (window.innerHeight / 2 - e.pageY) / 40;
            loginCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });
        document.addEventListener('mouseleave', () => {
            loginCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
            loginCard.style.transition = `transform 0.5s ease`;
        });
    }
});

function showToast(msg) {
    alert(msg);
}

// --- NAVIGATION LOGIC ---
function goHome() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser === "ADMIN_07") {
        window.location.href = "admin.html";
    } else if (currentUser) {
        window.location.href = "user.html";
    } else {
        window.location.href = "index.html";
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function goBack() {
    window.history.back();
}

// --- AUTHENTICATION (index.html) ---
function switchTab(mode) {
    currentMode = mode;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('auth-submit-btn').textContent = mode === 'login' ? 'Login' : 'Sign Up';
}

function handleAuth(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value.trim();
    const pass = document.getElementById('password').value;

    if (id === "ADMIN_07") {
        if (pass === "AlgoX_07") {
            localStorage.setItem("currentUser", id);
            window.location.href = "admin.html"; // Open Admin Page
            return;
        } else {
            showToast("Incorrect Admin Password!");
            return;
        }
    }

    let users = JSON.parse(localStorage.getItem("users"));

    if (currentMode === 'signup') {
        if (users[id]) {
            showToast("User ID already exists! Please login.");
        } else {
            users[id] = { password: pass, issuedBooks: [] };
            localStorage.setItem("users", JSON.stringify(users));
            showToast("Sign up successful! Please login.");
            switchTab('login');
        }
    } else {
        if (users[id] && users[id].password === pass) {
            localStorage.setItem("currentUser", id);
            window.location.href = "user.html"; // Open User Page
        } else {
            showToast("Invalid User ID or Password!");
        }
    }
}

// --- ADMIN DASHBOARD (admin.html) ---
function loadAdminDashboard() {
    const tbody = document.getElementById('admin-tbody');
    let users = JSON.parse(localStorage.getItem("users"));

    for (const [userId, data] of Object.entries(users)) {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${userId}</td><td>${data.issuedBooks.length > 0 ? data.issuedBooks.join(", ") : "No books issued"}</td>`;
        tbody.appendChild(tr);
    }
}

// --- USER DASHBOARD (user.html) ---
function selectCategory(catName) {
    localStorage.setItem("selectedCategory", catName);
    window.location.href = "books.html"; // Open Books Page
}

// --- BOOK SELECTION (books.html) ---
function loadBooksForCategory() {
    const catName = localStorage.getItem("selectedCategory");
    document.getElementById('selected-cat-title').textContent = `${catName} Books`;

    const dropdown = document.getElementById('book-dropdown');
    libraryDB[catName].forEach(book => {
        let option = document.createElement("option");
        option.value = JSON.stringify(book);
        option.textContent = book.title;
        dropdown.appendChild(option);
    });
}

function promptIssue() {
    const dropdown = document.getElementById('book-dropdown');
    localStorage.setItem("selectedBook", dropdown.value);
    window.location.href = "issue.html"; // Open Issue Page
}

// --- ISSUE CONFIRMATION (issue.html) ---
function loadIssueDetails() {
    const book = JSON.parse(localStorage.getItem("selectedBook"));
    document.getElementById('issue-book-name').textContent = `Book: ${book.title}`;
}

function confirmIssue() {
    const enteredPass = document.getElementById('issue-password').value;
    const currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users"));

    if (users[currentUser].password === enteredPass) {
        const book = JSON.parse(localStorage.getItem("selectedBook"));

        if (!users[currentUser].issuedBooks.includes(book.title)) {
            users[currentUser].issuedBooks.push(book.title);
            localStorage.setItem("users", JSON.stringify(users));
        }

        showToast("Book Issued! Opening PDF...");
        window.open(book.pdf, '_blank'); // Open PDF in new tab
        window.location.href = "user.html"; // Send user back to home
    } else {
        showToast("Incorrect Password! Cannot issue book.");
    }
}

// --- THIS WAS THE REST OF CHANGE 3: RETURN BOOK LOGIC (user.html) ---
function loadMyIssuedBooks() {
    const container = document.getElementById("my-issued-books");
    if (!container) return;

    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users"));

    if (!currentUser || !users[currentUser]) return;

    const myBooks = users[currentUser].issuedBooks;
    container.innerHTML = "";

    if (myBooks.length === 0) {
        container.innerHTML = "<p style='text-align: center; color: rgba(255,255,255,0.5); font-style: italic;'>You haven't issued any books yet.</p>";
        return;
    }

    myBooks.forEach(bookTitle => {
        const div = document.createElement("div");
        div.className = "issued-book-item";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = bookTitle;

        const returnBtn = document.createElement("button");
        returnBtn.className = "return-btn";
        returnBtn.textContent = "Return";
        returnBtn.onclick = () => returnBook(bookTitle);

        div.appendChild(titleSpan);
        div.appendChild(returnBtn);
        container.appendChild(div);
    });
}

function returnBook(bookTitle) {
    const currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users"));

    // Filter out the book that is being returned
    users[currentUser].issuedBooks = users[currentUser].issuedBooks.filter(title => title !== bookTitle);

    // Save the updated list back to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    showToast(`You have successfully returned "${bookTitle}".`);

    // Refresh the UI to remove the book from the screen
    loadMyIssuedBooks();
}