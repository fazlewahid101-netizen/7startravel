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

    // Automatic Exchange Currency Conversion Listener for UPLOAD FORM
    const pkrInputEl = document.getElementById('offerPkr');
    if(pkrInputEl) {
        pkrInputEl.addEventListener('input', function() {
            const aedInputEl = document.getElementById('offerAed');
            if(aedInputEl && this.value) {
                aedInputEl.value = Math.round(Number(this.value) / 77);
            }
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
    // SECRET FOUNDER PORTAL TRIGGERS (KEYBOARD + MOBILE GESTURE)
    // ===================================================
    
    // Desktop Key Combo: Ctrl + Shift + L
    window.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            const modalElement = document.getElementById('loginModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                const loginModal = new bootstrap.Modal(modalElement);
                loginModal.show();
            }
        }
    });

    // Mobile Gesture: Triple Tap Logo
    const siteLogo = document.getElementById('siteLogo');
    let tapCount = 0;
    let tapTimeout;

    if (siteLogo) {
        const triggerSecret = function (e) {
            e.preventDefault();
            tapCount++;
            clearTimeout(tapTimeout);

            if (tapCount === 3) {
                tapCount = 0;
                const modalElement = document.getElementById('loginModal');
                if (modalElement && typeof bootstrap !== 'undefined') {
                    const loginModal = new bootstrap.Modal(modalElement);
                    loginModal.show();
                }
            } else {
                tapTimeout = setTimeout(() => {
                    tapCount = 0;
                }, 1000);
            }
        };
        siteLogo.addEventListener('touchstart', triggerSecret, { passive: false });
        siteLogo.addEventListener('click', triggerSecret);
    }

    // ===================================================
    // ADVANCED LIVE FILTER & EXPLICIT BUTTON SEARCH SYSTEM
    // ===================================================
    function runFlightSearchFilter() {
        const depQuery = document.getElementById('searchDeparture') ? document.getElementById('searchDeparture').value.toLowerCase().trim() : "";
        const destQuery = document.getElementById('searchArrival') ? document.getElementById('searchArrival').value.toLowerCase().trim() : "";
        const dateQuery = document.getElementById('searchDate') ? document.getElementById('searchDate').value.trim() : "";

        const flightCards = document.querySelectorAll('.flight-card-item');
        const categorySections = document.querySelectorAll('.route-category-section');
        let visibleCardsCount = 0;

        flightCards.forEach(card => {
            const cardDepCode = card.getAttribute('data-dep-code').toLowerCase();
            const cardDepCity = card.getAttribute('data-dep-city').toLowerCase();
            const cardDestCode = card.getAttribute('data-dest-code').toLowerCase();
            const cardDestCity = card.getAttribute('data-dest-city').toLowerCase();
            const cardDate = card.getAttribute('data-date'); // YYYY-MM-DD

            // Validate against each input if provided
            const matchDep = depQuery === "" || cardDepCode.includes(depQuery) || cardDepCity.includes(depQuery);
            const matchDest = destQuery === "" || cardDestCode.includes(destQuery) || cardDestCity.includes(destQuery);
            const matchDate = dateQuery === "" || cardDate === dateQuery;

            // Show card only if it satisfies all active criteria
            if (matchDep && matchDest && matchDate) {
                card.classList.remove('d-none');
                visibleCardsCount++;
            } else {
                card.classList.add('d-none');
            }
        });

        // Hide empty category containers cleanly
        categorySections.forEach(section => {
            const innerVisibleCards = section.querySelectorAll('.flight-card-item:not(.d-none)');
            if (innerVisibleCards.length === 0) {
                section.classList.add('d-none');
            } else {
                section.classList.remove('d-none');
            }
        });

        // Feedback handler for zero results
        const feedbackText = document.getElementById('searchFeedbackText');
        if (feedbackText) {
            if (visibleCardsCount === 0 && (depQuery !== "" || destQuery !== "" || dateQuery !== "")) {
                feedbackText.innerHTML = `No active flight offers match your specified search parameters.`;
                feedbackText.classList.remove('d-none');
            } else {
                feedbackText.classList.add('d-none');
            }
        }
    }

    // Run filter automatically while typing
    ['searchDeparture', 'searchArrival', 'searchDate'].forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('input', runFlightSearchFilter);
            if (inputElement.type === 'date') {
                inputElement.addEventListener('change', runFlightSearchFilter);
            }
        }
    });

    // Run filter when the explicit "Search Flights" action button is clicked
    const explicitSearchBtn = document.getElementById('submitFlightSearch');
    if (explicitSearchBtn) {
        explicitSearchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            runFlightSearchFilter();
            
            // Smoothly scroll down to the flights view section once search is clicked
            const offersTarget = document.getElementById('offersContainer');
            if (offersTarget) {
                window.scrollTo({
                    top: offersTarget.offsetTop - 120,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Clear Search Filters Button Functionality
    const clearSearchBtn = document.getElementById('clearSearchFilters');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (document.getElementById('searchDeparture')) document.getElementById('searchDeparture').value = "";
            if (document.getElementById('searchArrival')) document.getElementById('searchArrival').value = "";
            if (document.getElementById('searchDate')) document.getElementById('searchDate').value = "";
            runFlightSearchFilter();
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
    setupFormListeners();
    setupEditFormListener();
});

// ===================================================
// 3. FLIGHT GRID & DYNAMIC DATABASES ENGINE
// ===================================================

// Fetch and display flight lists categorized by route dynamically in a space-saving layout
function displayFlightOffers() {
    const container = document.getElementById('offersContainer');
    if (!container) return;

    db.collection("offers").orderBy("date", "asc").onSnapshot((snapshot) => {
        container.innerHTML = "";
        const currentUser = auth.currentUser;
        const todayStr = new Date().toISOString().split("T")[0]; 

        if (snapshot.empty) {
            container.innerHTML = `<div class="text-center text-muted my-5"><p>No active flight offers listed yet.</p></div>`;
            return;
        }

        const categorizedOffers = {};

        snapshot.forEach((doc) => {
            const offer = doc.data();
            const offerId = doc.id;

            // Automatic Database Expiration Cleanup
            if (offer.date && offer.date < todayStr) {
                db.collection("offers").doc(offerId).delete()
                    .then(() => {
                        addSystemLog('DELETE', 'SYSTEM', `Auto-expired flight removed: ${offer.depCode} → ${offer.destCode}`);
                    })
                    .catch(err => console.error("Auto-expiry cleanup exception error:", err));
                return; 
            }

            // Dynamic Category Mapping & Creation
            const routeKey = `${offer.depCode}-${offer.destCode}`;
            if (!categorizedOffers[routeKey]) {
                categorizedOffers[routeKey] = {
                    depCode: offer.depCode,
                    destCode: offer.destCode,
                    depCity: offer.depCity || "",
                    destCity: offer.destCity || "",
                    flights: []
                };
            }
            
            categorizedOffers[routeKey].flights.push({ id: offerId, ...offer });
        });

        // Loop over each dynamic category group and append compact layout elements
        for (const routeKey in categorizedOffers) {
            const group = categorizedOffers[routeKey];
            
            let categorySectionHTML = `
                <div class="col-12 mt-4 route-category-section" data-route="${routeKey.toLowerCase()}">
                    <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                        <div class="p-2 bg-primary text-white rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; background-color: #0A1F44 !important;">
                            <i class="fas fa-route fs-6 text-warning"></i>
                        </div>
                        <div>
                            <h4 class="fw-bold mb-0 text-uppercase" style="color: #0A1F44; font-size: 1.25rem;">${group.depCode} to ${group.destCode} </h4>
                            <small class="text-muted">${group.depCity} To ${group.destCity} </small>
                        </div>
                    </div>
                    <div class="d-flex flex-column gap-3 route-flights-list">`;

            group.flights.forEach((offer) => {
                const formattedPKR = Number(offer.pkr).toLocaleString();
                const formattedAED = Number(offer.aed).toLocaleString();
                const purchaseRateHTML = (currentUser && offer.purchaseRate) ? `<div class="text-danger fw-bold" style="font-size:0.9rem;">Rs ${Number(offer.purchaseRate).toLocaleString()}</div>` : ``;
                const flightStopsText = (offer.stops && offer.stops.trim() !== "") ? offer.stops.trim() : "Direct Flight";
                const stopsBadgeColor = (flightStopsText === "Direct Flight") ? "bg-success-subtle text-success border border-success-subtle" : "bg-warning-subtle text-warning-dark border border-warning-subtle";
                const messageString = encodeURIComponent(`Aslam o Alikum 7 Star Travel! I want to book the Hot Offer flight from ${offer.depCity} to ${offer.destCity} on ${offer.date} for PKR ${formattedPKR}.`);
                const whatsappUrl = `https://wa.me/971504847224?text=${messageString}`;

                let adminActionsHTML = "";
                let uploadedByTag = "";

               if (currentUser) {
                    uploadedByTag = `<div class="mt-1"><small class="badge bg-secondary" style="font-size:0.7rem;">Publisher: ${offer.uploadedBy || 'Admin'}</small></div>`;
                    adminActionsHTML = `
                        <div class="d-flex gap-1 justify-content-center mt-2 mt-md-0">
                            <button class="btn btn-success btn-sm px-2 py-1" style="font-size: 0.8rem;" onclick="duplicateOffer('${offer.id}')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button class="btn btn-primary btn-sm px-2 py-1" style="font-size: 0.8rem;" onclick="openEditOfferModal('${offer.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-sm px-2 py-1" style="font-size: 0.8rem;" onclick="removeFlightOffer('${offer.id}')">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>`;
                }

                // Fully Responsive Space-Saving Horizontal Row Layout
                categorySectionHTML += `
                    <div class="flight-card-item" 
                         data-dep-code="${offer.depCode}" 
                         data-dep-city="${offer.depCity}" 
                         data-dest-code="${offer.destCode}" 
                         data-dest-city="${offer.destCity}" 
                         data-date="${offer.date}">
                        <div class="card p-3 shadow-sm border border-light position-relative" style="border-radius: 12px; color: #333;">
                            <div class="row align-items-center text-center text-md-start g-3">
                                
                                <div class="col-md-2 text-md-start">
                                    <span class="badge bg-danger text-uppercase font-monospace mb-1" style="font-size:0.65rem;">Hot Deal</span>
                                    <div class="fw-bold text-dark" style="font-size: 1.05rem;">${offer.airline}</div>
                                    <small class="text-muted d-block">${offer.flightNum}</small>
                                    ${uploadedByTag}
                                </div>

                                <div class="col-md-3">
                                    <div class="d-flex justify-content-center justify-content-md-start align-items-center gap-2">
                                        <div><h5 class="mb-0 fw-bold" style="color: #0A1F44;">${offer.depCode}</h5></div>
                                        <div class="text-muted mx-1" style="font-size:0.8rem;"><i class="fas fa-long-arrow-alt-right text-warning"></i></div>
                                        <div><h5 class="mb-0 fw-bold" style="color: #0A1F44;">${offer.destCode}</h5></div>
                                    </div>
                                    <div class="mt-1">
                                        <span class="badge ${stopsBadgeColor} rounded-pill" style="font-size: 0.75rem;">${flightStopsText}</span>
                                    </div>
                                </div>

                                <div class="col-6 col-md-3 text-start">
                                    <div class="small mb-1"><i class="fas fa-calendar-alt text-warning me-1"></i> <span class="fw-medium">${offer.date}</span></div>
                                   <div class="small mb-1">
    <i class="fas fa-clock text-warning me-1"></i> 
    <span>${formatTimeTo12Hour(offer.time)}</span> 
    ${offer.arrivalTime ? `<span class="text-muted mx-1">→</span> <span class="fw-medium" style="color: #0A1F44;">${formatTimeTo12Hour(offer.arrivalTime)}</span>` : ''}
</div>
                                    <div class="small"><i class="fas fa-luggage-cart text-warning me-1"></i> Baggage: <span class="fw-bold">${offer.baggage}</span></div>
                                </div>

                                <div class="col-6 col-md-2 text-md-center">
                                    <div class="fw-bold text-success" style="font-size: 1.15rem;">Rs ${formattedPKR}</div>
                                    <div class="text-muted fw-medium" style="font-size: 0.85rem;">AED ${formattedAED}</div>
                                    ${purchaseRateHTML}
                                </div>

                                <div class="col-md-2 text-md-end d-flex flex-column gap-2">
                                    <a href="${whatsappUrl}" target="_blank" class="btn text-white btn-sm w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2" style="background-color: #25D366; border: none; border-radius: 8px;">
                                        <i class="fab fa-whatsapp fs-5"></i> <span>Book Now</span>
                                    </a>
                                    ${adminActionsHTML}
                                </div>

                            </div>
                        </div>
                    </div>`;
            });

            categorySectionHTML += `</div></div>`;
            container.insertAdjacentHTML('beforeend', categorySectionHTML);
        }
    });
}

// Secure core logging function pushes system records directly into Cloud Database
function addSystemLog(actionType, userSignature, actionDetails) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    db.collection("logs").add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        type: actionType, 
        user: userSignature,
        details: actionDetails
    });
}

// Live streams activity tracking records straight into your operations dashboard board
function listenToSystemLogs() {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;

    logContainer.className = "list-group list-group-flush rounded-3 overflow-hidden";
    logContainer.style.boxShadow = "inset 0 0 15px rgba(0,0,0,0.05)";

    db.collection("logs").orderBy("timestamp", "desc").limit(20).onSnapshot((snapshot) => {
        logContainer.innerHTML = "";
        
        if (snapshot.empty) {
            logContainer.innerHTML = `
                <div class="text-center p-5 text-muted">
                    <i class="fas fa-history fa-2x mb-3 text-secondary"></i>
                    <p class="mb-0">No active system logs recorded in the cloud yet.</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const log = doc.data();
            const timeString = log.timestamp ? log.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Syncing...";
            const dateString = log.timestamp ? log.timestamp.toDate().toLocaleDateString([], {month: 'short', day: 'numeric'}) : "";
            
            let typeBadge = "";
            let itemBackground = "rgba(255,255,255,0.8)";
            let iconClass = "fas fa-info-circle";

            switch(log.type) {
                case 'LOGIN':
                    typeBadge = `<span class="badge bg-success-subtle text-success px-2.5 py-1 border border-success-subtle rounded-pill fw-semibold"><i class="fas fa-sign-in-alt me-1"></i> ACCESS</span>`;
                    iconClass = "fas fa-shield-alt text-success";
                    break;
                case 'ADD':
                    typeBadge = `<span class="badge bg-primary-subtle text-primary px-2.5 py-1 border border-primary-subtle rounded-pill fw-semibold"><i class="fas fa-plus-circle me-1"></i> UPLOAD</span>`;
                    iconClass = "fas fa-cloud-upload-alt text-primary";
                    break;
                case 'DELETE':
                    typeBadge = `<span class="badge bg-danger-subtle text-danger px-2.5 py-1 border border-danger-subtle rounded-pill fw-semibold"><i class="fas fa-trash me-1"></i> REMOVE</span>`;
                    itemBackground = "rgba(253, 242, 242, 0.6)";
                    iconClass = "fas fa-exclamation-triangle text-danger";
                    break;
                case 'LOGOUT':
                    typeBadge = `<span class="badge bg-warning-subtle text-warning-dark px-2.5 py-1 border border-warning-subtle rounded-pill fw-semibold"><i class="fas fa-sign-out-alt me-1"></i> EXIT</span>`;
                    iconClass = "fas fa-door-open text-warning";
                    break;
                default:
                    typeBadge = `<span class="badge bg-secondary px-2.5 py-1 rounded-pill fw-semibold">SYSTEM</span>`;
            }

            const logItemHTML = `
                <div class="list-group-item d-flex align-items-center justify-content-between p-3 mb-2 border rounded-3" style="background: ${itemBackground}; border-color: rgba(0,0,0,0.06) !important;">
                    <div class="d-flex align-items-center me-3">
                        <div class="p-2.5 bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 42px; height: 42px;">
                            <i class="${iconClass} fs-5"></i>
                        </div>
                        <div>
                            <div class="text-dark fw-bold mb-0.5" style="font-size: 0.95rem;">${log.details}</div>
                            <div class="text-muted d-flex align-items-center gap-2" style="font-size: 0.8rem;">
                                <span class="fw-medium text-navy"><i class="far fa-user me-1"></i> Operator: ${log.user || 'SYSTEM'}</span>
                                <span>•</span>
                                <span><i class="far fa-clock me-1"></i> ${timeString} (${dateString})</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-end flex-shrink-0">
                        ${typeBadge}
                    </div>
                </div>`;
            logContainer.insertAdjacentHTML('beforeend', logItemHTML);
        });
    });
}

// Authentication dynamic state change watcher
auth.onAuthStateChanged((user) => {
    const controlPanel = document.getElementById('adminControlPanel');
    const logPanel = document.getElementById('chiefAdminLogPanel');
    const purchaseRateWrapper = document.getElementById('offerPurchaseRateWrapper');
    const purchaseRateInput = document.getElementById('offerPurchaseRate');
    const editPurchaseRateWrapper = document.getElementById('editOfferPurchaseRateWrapper');
    const editPurchaseRateInput = document.getElementById('editOfferPurchaseRate');

    if (user) {
        if (controlPanel) controlPanel.classList.remove('d-none');
        if (purchaseRateWrapper) purchaseRateWrapper.classList.remove('d-none');
        if (editPurchaseRateWrapper) editPurchaseRateWrapper.classList.remove('d-none');
        
        if (user.email === 'fazal0wahid@gmail.com') {
            if (logPanel) logPanel.classList.remove('d-none');
            listenToSystemLogs();
        } else {
            if (logPanel) logPanel.classList.add('d-none');
        }
    } else {
        if (controlPanel) controlPanel.classList.add('d-none');
        if (logPanel) logPanel.classList.add('d-none');
        if (purchaseRateWrapper) purchaseRateWrapper.classList.add('d-none');
        if (purchaseRateInput) purchaseRateInput.value = "";
        if (editPurchaseRateWrapper) editPurchaseRateWrapper.classList.add('d-none');
        if (editPurchaseRateInput) editPurchaseRateInput.value = "";
    }
    displayFlightOffers();
});

// ===================================================
// 4. ADMINISTRATIVE CONTROL OPERATORS
// ===================================================
function setupFormListeners() {
    // Secure Cloud Login Submit Processor
    const loginForm = document.getElementById('adminLoginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('adminUsername').value.trim();
            const pass = document.getElementById('adminPassword').value;

            auth.signInWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    const modalElement = document.getElementById('loginModal');
                    if (modalElement && typeof bootstrap !== 'undefined') {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                        modalInstance.hide();
                    }
                    loginForm.reset();
                    
                    const activeEmail = userCredential.user.email;
                    let nameSignature = activeEmail.split('@')[0].toUpperCase();
                    if (nameSignature === "FAZAL0WAHID") nameSignature = "FAZAL";

                    addSystemLog('LOGIN', nameSignature, `${nameSignature} opened a secure session.`);
                })
                .catch((error) => {
                    alert("Error: Wrong email or password.");
                    console.log(error);
                });
        });
    }

    // FIXED: Upload Form New Flight Offers Data Collector
    const addOfferForm = document.getElementById('addOfferForm');
    if (addOfferForm) {
        addOfferForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let nameSignature = auth.currentUser ? auth.currentUser.email.split('@')[0].toUpperCase() : "ADMIN";
            if (nameSignature === "FAZAL0WAHID") nameSignature = "FAZAL";

            const newOffer = {
                airline: document.getElementById('offerAirline').value.trim(),
                depCode: document.getElementById('offerDepCode').value.toUpperCase().trim(),
                destCode: document.getElementById('offerDestCode').value.toUpperCase().trim(),
                depCity: document.getElementById('offerDepCity').value.trim(),
                destCity: document.getElementById('offerDestCity').value.trim(),
                date: document.getElementById('offerDate').value,
                time: document.getElementById('offerTime').value, // Departure clock
                arrivalTime: document.getElementById('offerArrivalTime').value, // New Arrival clock
                flightNum: document.getElementById('offerFlightNum').value.toUpperCase().trim(),
                baggage: document.getElementById('offerBaggage').value.toUpperCase().trim(),
                stops: document.getElementById('offerStops') ? document.getElementById('offerStops').value.trim() : "",
                pkr: Math.round(Number(document.getElementById('offerPkr').value)).toString(),
                aed: Math.round(Number(document.getElementById('offerAed').value)).toString(),
                purchaseRate: document.getElementById('offerPurchaseRate') ? (document.getElementById('offerPurchaseRate').value ? Math.round(Number(document.getElementById('offerPurchaseRate').value)).toString() : "") : "",
                uploadedBy: auth.currentUser ? (auth.currentUser.displayName || nameSignature) : "Admin",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            db.collection("offers").add(newOffer)
                .then(() => {
                    addSystemLog('ADD', nameSignature, `Published flight deal: ${newOffer.depCode} → ${newOffer.destCode}`);
                    alert("✅ Flight Published Successfully!");
                    addOfferForm.reset();
                    
                    const modalEl = document.getElementById('addOfferModal');
                    if (modalEl && typeof bootstrap !== 'undefined') {
                        const instance = bootstrap.Modal.getInstance(modalEl);
                        if (instance) instance.hide();
                    }
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    alert("Error publishing. Check console for details.");
                });
        });
    }

    // Secure Administrative Session Logout Processor
    const logoutBtn = document.getElementById('logoutAdminBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const activeEmail = auth.currentUser ? auth.currentUser.email : "Admin@unknown.com";
            let nameSignature = activeEmail.split('@')[0].toUpperCase();
            if (nameSignature === "FAZAL0WAHID") nameSignature = "FAZAL";
            
            addSystemLog('LOGOUT', nameSignature, `Terminated active administrative session.`);
            auth.signOut().then(() => {
                alert("Secure session closed. Founder mode locked.");
            });
        });
    }
}

// Open the edit offer modal and populate it with cloud data
window.openEditOfferModal = function(cloudId) {
    const editOfferModalElement = document.getElementById('editOfferModal');
    const editOfferForm = document.getElementById('editOfferForm');

    db.collection('offers').doc(cloudId).get()
        .then((doc) => {
            if (!doc.exists) {
                alert('Offer not found. Please refresh and try again.');
                return;
            }

            const data = doc.data();
            document.getElementById('editOfferId').value = cloudId;
            document.getElementById('editOfferAirline').value = data.airline || '';
            document.getElementById('editOfferDepCode').value = data.depCode || '';
            document.getElementById('editOfferDestCode').value = data.destCode || '';
            document.getElementById('editOfferDepCity').value = data.depCity || '';
            document.getElementById('editOfferDestCity').value = data.destCity || '';
            document.getElementById('editOfferDate').value = data.date || '';
            document.getElementById('editOfferTime').value = data.time || '';
            document.getElementById('editOfferArrivalTime').value = data.arrivalTime || '';
            document.getElementById('editOfferFlightNum').value = data.flightNum || '';
            document.getElementById('editOfferBaggage').value = data.baggage || '';
            document.getElementById('editOfferStops').value = data.stops || '';
            document.getElementById('editOfferPkr').value = data.pkr || '';
            document.getElementById('editOfferAed').value = data.aed || '';
            if (document.getElementById('editOfferPurchaseRate')) {
                document.getElementById('editOfferPurchaseRate').value = data.purchaseRate || '';
            }

            if (editOfferModalElement && typeof bootstrap !== 'undefined') {
                let editModal = bootstrap.Modal.getInstance(editOfferModalElement);
                if (!editModal) {
                    editModal = new bootstrap.Modal(editOfferModalElement);
                }
                editModal.show();
            }
        })
        .catch((error) => {
            console.error('Unable to fetch offer for edit:', error);
            alert('Could not load offer details. Please try again.');
        });
};

// Global scope removal execution handler
window.removeFlightOffer = function(cloudId) {
    if(confirm("Are you sure you want to completely remove this flight offer from the website?")) {
        let nameSignature = auth.currentUser ? auth.currentUser.email.split('@')[0].toUpperCase() : "Admin";
        if (nameSignature === "FAZAL0WAHID") nameSignature = "FAZAL";
        
        db.collection("offers").doc(cloudId).get().then((doc) => {
            let offerInfo = "Flight Offer";
            if (doc.exists) {
                const data = doc.data();
                offerInfo = `${data.depCode} → ${data.destCode}`;
            }
            
            db.collection("offers").doc(cloudId).delete()
                .then(() => {
                    addSystemLog('DELETE', nameSignature, `Removed flight deal: ${offerInfo}`);
                });
        });
    }
};

// ===================================================
// 5. ADMINISTRATIVE LIVE CARD EDIT ENGINE
// ===================================================
function setupEditFormListener() {
    const editOfferForm = document.getElementById('editOfferForm');
    if (editOfferForm) {
        editOfferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cloudId = document.getElementById('editOfferId').value;
            let nameSignature = auth.currentUser ? auth.currentUser.email.split('@')[0].toUpperCase() : "ADMIN";
            if (nameSignature === "FAZAL0WAHID") nameSignature = "FAZAL";

            const modifiedPayload = {
                airline: document.getElementById('editOfferAirline').value || "Air Arabia",
                depCode: document.getElementById('editOfferDepCode').value.toUpperCase().trim(),
                destCode: document.getElementById('editOfferDestCode').value.toUpperCase().trim(),
                depCity: document.getElementById('editOfferDepCity').value.trim(),
                destCity: document.getElementById('editOfferDestCity').value.trim(),
                date: document.getElementById('editOfferDate').value,
                time: document.getElementById('editOfferTime').value, // Departure clock
                arrivalTime: document.getElementById('editOfferArrivalTime').value, // Arrival clock
                flightNum: document.getElementById('editOfferFlightNum').value.toUpperCase().trim(),
                baggage: document.getElementById('editOfferBaggage').value.toUpperCase().trim(),
                stops: document.getElementById('editOfferStops').value.trim(),
                pkr: Math.round(Number(document.getElementById('editOfferPkr').value)).toString(),
                aed: Math.round(Number(document.getElementById('editOfferAed').value)).toString(),
                purchaseRate: document.getElementById('editOfferPurchaseRate') ? (document.getElementById('editOfferPurchaseRate').value ? Math.round(Number(document.getElementById('editOfferPurchaseRate').value)).toString() : "") : ""
            };

            db.collection("offers").doc(cloudId).update(modifiedPayload)
                .then(() => {
                    addSystemLog('ADD', nameSignature, `Modified flight deal: ${modifiedPayload.depCode} → ${modifiedPayload.destCode}`);
                    
                    const modalElement = document.getElementById('editOfferModal');
                    if (modalElement && typeof bootstrap !== 'undefined') {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        if (modalInstance) modalInstance.hide();
                    }
                    
                    alert("Success: Changes written to database registry and updated instantly!");
                })
                .catch((err) => {
                    alert("Error: Core write transaction access authorization failure.");
                    console.error(err);
                });
        });
    }
}
// ===================================================
// EASY DUPLICATE (COPY) FEATURE
// ===================================================
window.duplicateOffer = function(cloudId) {
    // 1. Get the data of the flight you clicked "Copy" on
    db.collection("offers").doc(cloudId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            
            // 2. Automatically fill the "Add New Offer" form with that data
            document.getElementById('offerAirline').value = data.airline || "";
            document.getElementById('offerDepCode').value = data.depCode || "";
            document.getElementById('offerDestCode').value = data.destCode || "";
            document.getElementById('offerDepCity').value = data.depCity || "";
            document.getElementById('offerDestCity').value = data.destCity || "";
            document.getElementById('offerTime').value = data.time || "";
            document.getElementById('offerFlightNum').value = data.flightNum || "";
            document.getElementById('offerBaggage').value = data.baggage || "";
            document.getElementById('offerStops').value = data.stops || "";
            document.getElementById('offerPkr').value = data.pkr || "";
            document.getElementById('offerAed').value = data.aed || "";
            
            // 3. Clear the date so you don't accidentally publish on the same day
            document.getElementById('offerDate').value = ""; 

            // 4. Open the Add Offer Modal for you
            const addModalElement = document.getElementById('addOfferModal');
            if (addModalElement && typeof bootstrap !== 'undefined') {
                let addModal = bootstrap.Modal.getInstance(addModalElement);
                if (!addModal) {
                    addModal = new bootstrap.Modal(addModalElement);
                }
                addModal.show();
            }
        } else {
            alert("Error: Could not copy this flight.");
        }
    });
};

// ===================================================
// CUSTOM MULTI-LINE PASTE ENGINE
// ===================================================
// ===================================================
// CUSTOM MULTI-LINE PASTE ENGINE (FIXED)
// ===================================================
function applySmartPaste(prefix) {
    const rawTextElement = document.getElementById(`${prefix}SmartPasteBox`);
    if (!rawTextElement) return;

    const rawText = rawTextElement.value.trim();
    if (!rawText) {
        alert("Please paste the flight details first!");
        return;
    }

    const cityMap = {
        "PEW": "Peshawar",
        "SHJ": "Sharjah",
        "LHE": "Lahore",
        "DMM": "Dammam",
        "DXB": "Dubai",
        "JED": "Jeddah",
        "ISB": "Islamabad",
        "KHI": "Karachi",
        "MUX": "Multan",
        "SKT": "Sialkot"
    };

    const dateMatch = rawText.match(/(\d{2})-(\d{2})-(\d{4})/);
    if (dateMatch) {
        const dateInput = document.getElementById(`${prefix}Date`);
        if (dateInput) dateInput.value = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }

    const routeMatch = rawText.match(/\b([A-Z]{3})-([A-Z]{3})\b/i);
    if (routeMatch) {
        const dep = routeMatch[1].toUpperCase();
        const dest = routeMatch[2].toUpperCase();

        const depCodeInput = document.getElementById(`${prefix}DepCode`);
        const destCodeInput = document.getElementById(`${prefix}DestCode`);
        const depCityInput = document.getElementById(`${prefix}DepCity`);
        const destCityInput = document.getElementById(`${prefix}DestCity`);

        if (depCodeInput) depCodeInput.value = dep;
        if (destCodeInput) destCodeInput.value = dest;
        if (depCityInput && cityMap[dep]) depCityInput.value = cityMap[dep];
        if (destCityInput && cityMap[dest]) destCityInput.value = cityMap[dest];
    }

    const flightMatch = rawText.match(/\b([A-Z0-9]{2,3}\s*\d{3,4})\b/i);
    if (flightMatch) {
        const cleanFlightNum = flightMatch[1].toUpperCase().replace(/\s+/g, '');
        const flightNumInput = document.getElementById(`${prefix}FlightNum`);
        if (flightNumInput) flightNumInput.value = cleanFlightNum;

        if (cleanFlightNum.startsWith('G9')) {
            const airlineInput = document.getElementById(`${prefix}Airline`);
            if (airlineInput) airlineInput.value = "Air Arabia";
        }
    }

    const timeMatch = rawText.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (timeMatch) {
        const timeInput = document.getElementById(`${prefix}Time`);
        const arrivalInput = document.getElementById(`${prefix}ArrivalTime`);
        if (timeInput) timeInput.value = timeMatch[1];
        if (arrivalInput) arrivalInput.value = timeMatch[2];
    }

    const baggageMatch = rawText.match(/(\d+\+\d+\s*KG|\d+\s*KG)/i);
    if (baggageMatch) {
        const baggageInput = document.getElementById(`${prefix}Baggage`);
        if (baggageInput) baggageInput.value = baggageMatch[1].toUpperCase();
    }

    const priceMatch = rawText.match(/(?:PKR|PRICE)?\s*[:\s]*([\d,]+)/i);
    const lines = rawText.split('\n');
    let rawPrice = "";
    for (let i = lines.length - 1; i >= 0; i--) {
        const cleanLine = lines[i].replace(/,/g, '').trim();
        if (/^\d+$/.test(cleanLine)) {
            rawPrice = cleanLine;
            break;
        }
    }

    const pkrInput = document.getElementById(`${prefix}Pkr`);
    const aedInput = document.getElementById(`${prefix}Aed`);

    if (rawPrice) {
        if (pkrInput) pkrInput.value = rawPrice;
        if (aedInput) aedInput.value = Math.round(Number(rawPrice) / 77);
    } else if (priceMatch) {
        const cleanPrice = priceMatch[1].replace(/,/g, '');
        if (pkrInput) pkrInput.value = cleanPrice;
        if (aedInput) aedInput.value = Math.round(Number(cleanPrice) / 77);
    }
}

window.processMyFlight = function() {
    applySmartPaste('offer');
};

window.processEditFlight = function() {
    applySmartPaste('editOffer');
};