// ===================================================
// 1. GLOBAL VARIABLES & CORE CONFIGURATIONS
// ===================================================

// Your live project keys
const firebaseConfig = {
    apiKey: "AIzaSyCpcBc3X0PZVDmbfad9bDzZeH646Bemr6g",
    authDomain: "startravels-824e5.firebaseapp.com",
    projectId: "startravels-824e5",
    storageBucket: "startravels-824e5.firebasestorage.app",
    messagingSenderId: "513513270106",
    appId: "1:513513270106:web:745391a6462b590b372163",
    measurementId: "G-HDV3JG0S0H"
};

// Start Cloud Services using compat layers
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let iti = null; // Global reference for international phone input

// Helper function to turn 24-hour database time (18:45) into a beautiful 12-hour card format (06:45 PM)
function formatTimeTo12Hour(timeString) {
    if (!timeString) return "";
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
        return timeString;
    }
    
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // The hour '0' should be '12'
    const strShares = hour.toString().padStart(2, '0');
    
    return `${strShares}:${minutes} ${ampm}`;
}

// ===================================================
// 2. MAIN APPLICATION INITIALIZATION
// ===================================================
document.addEventListener('DOMContentLoaded', function () {

    // Initialize AOS Animations safely
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    // International Phone Input Setup
    const phoneInput = document.querySelector("#phone");
    if (phoneInput && window.intlTelInput) {
        iti = window.intlTelInput(phoneInput, {
            initialCountry: "ae",
            preferredCountries: ["ae", "pk", "sa", "qa", "bh"],
            separateDialCode: true,
            nationalMode: false,
            autoPlaceholder: "aggressive"
        });
    }

    // Limit Booking and Administrative Date Inputs to Today or Future
    const departureDate = document.querySelector('[name="travel_date"]');
    const adminNewDate = document.getElementById('offerDate');
    const adminEditDate = document.getElementById('editOfferDate');
    const todayISO = new Date().toISOString().split("T")[0];
    
    if (departureDate) departureDate.min = todayISO;
    if (adminNewDate) adminNewDate.min = todayISO;
    if (adminEditDate) adminEditDate.min = todayISO;

    // Return Date Show/Hide Logic
    const tripType = document.getElementById("tripType");
    const returnBox = document.getElementById("returnDateBox");

    if (tripType && returnBox) {
        tripType.addEventListener("change", function () {
            if (this.value === "Return") {
                returnBox.classList.remove("d-none");
            } else {
                returnBox.classList.add("d-none");
            }
        });
    }

    // Return Date Chronological Validation
    const returnDate = document.querySelector('[name="return_date"]');
    if (returnDate && departureDate) {
        returnDate.addEventListener("change", function () {
            const depDate = new Date(departureDate.value);
            const retDate = new Date(this.value);

            if (retDate <= depDate) {
                alert("Return date must be after departure date.");
                this.value = "";
            }
        });
    }

    // Premium Smooth Page Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dynamic Header Navbar Transition on Scroll
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.background = 'rgba(10,31,68,0.95)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.background = '#0A1F44';
        }
    });

    // Flight Inquiry Booking Email Submission Form (EmailJS)
    const flightForm = document.getElementById('flightForm');
    if (flightForm) {
        flightForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!phoneInput || !phoneInput.value.trim()) {
                alert("Please enter phone number.");
                return;
            }

            let cleanValue = phoneInput.value.trim().replace(/[\s\-\(\)]/g, "");
            if (cleanValue.startsWith('0')) {
                cleanValue = cleanValue.substring(1);
            }

            if (cleanValue.length < 7 || cleanValue.length > 15) {
                alert("Please enter a valid phone number length without the country code.");
                return;
            }

            if (iti) {
                const fullNumber = iti.getSelectedCountryData().dialCode + cleanValue;
                phoneInput.value = fullNumber;
            }

            emailjs.sendForm('service_csyas49', 'template_opswoyq', this)
            .then(() => {
                alert("✅ Flight inquiry sent successfully!");
                flightForm.reset();
            })
            .catch((error) => {
                alert("❌ Failed to send inquiry.");
                console.log(error);
            });
        });
    }

    // Standard Contact Inquiry Message Form (EmailJS)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            emailjs.sendForm('service_csyas49', 'template_3bghzhs', this)
            .then(() => {
                alert("Message sent successfully!");
                contactForm.reset();
            })
            .catch((error) => {
                alert("Failed to send message.");
                console.log(error);
            });
        });
    }

    // Automatic Exchange Currency Conversion Listener for EDIT FORM
    const editPkrInput = document.getElementById('editOfferPkr');
    if (editPkrInput) {
        editPkrInput.addEventListener('input', function() {
            const editAedInput = document.getElementById('editOfferAed');
            if (editAedInput && this.value) {
                editAedInput.value = Math.round(Number(this.value) / 77);
            }
        });
    }

    // ===================================================
    // INBOUND FIREBASE PASSWORD RESET CONTROLLER
    // ===================================================
    const homepageParams = new URLSearchParams(window.location.search);
    const urlActionCode = homepageParams.get('oobCode');

    if (urlActionCode) {
        const resetPopupElement = document.getElementById('passwordResetModal');
        if (resetPopupElement && typeof bootstrap !== 'undefined') {
            const resetModalInstance = new bootstrap.Modal(resetPopupElement);
            resetModalInstance.show();
        }

        const popResetForm = document.getElementById('popNewPasswordForm');
        if (popResetForm) {
            popResetForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const updatedPasswordValue = document.getElementById('popNewPasswordInput').value;

                auth.confirmPasswordReset(urlActionCode, updatedPasswordValue)
                    .then(() => {
                        alert("✅ Success: Account password rewritten safely inside cloud nodes.");
                        const instance = bootstrap.Modal.getInstance(resetPopupElement);
                        if (instance) instance.hide();
                        cleanUrlParameters();
                    })
                    .catch((error) => {
                        alert("System Exception Error: " + error.message);
                    });
            });
        }
    }

    window.cleanUrlParameters = function() {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    };

    // Bind Core Forms Engine Listeners
    setupEditFormListener();
});

