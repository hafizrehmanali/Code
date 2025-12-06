document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // 1. GLOBAL: SMART PATH DETECTION
    // ==========================================

    /**
     * This calculates how many folders we need to go UP 
     * to reach the "assets" and "components" folders.
     */
    function getBasePath() {
        const path = window.location.pathname;
        
        // If we are deep inside the Nutrition Tracker (3 levels down)
        if (path.includes('/nutrition/')) {
            return "../../../";
        }
        // If we are inside any other View folder (2 levels down)
        // (checks for 'views' folder presence)
        else if (path.includes('/views/')) {
            return "../../";
        }
        
        // Otherwise, we are at the Root (index.html)
        return "./";
    }

    const basePath = getBasePath();
    console.log("Loading assets from:", basePath); // Check Console to see if this works!

    // ==========================================
    // 2. LOAD HEADER & FOOTER
    // ==========================================

    // Load Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        // NOTICE: We now add "components/" to the path
        fetch(basePath + "components/header.html")
            .then(response => {
                if (!response.ok) throw new Error("Header not found at " + basePath);
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
                
                // Fix the links inside the header (Home, Login, etc.)
                updateNavigationLinks(headerPlaceholder, basePath);
                
                // Run the header logic (Mobile menu, Dark mode)
                initializeHeader(); 
            })
            .catch(err => console.error('Error loading header:', err));
    }

    // Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch(basePath + "components/footer.html")
            .then(response => {
                if (!response.ok) throw new Error("Footer not found");
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
                
                // Fix the links inside the footer
                updateNavigationLinks(footerPlaceholder, basePath);

                // Auto-update copyright year
                const yearSpan = document.getElementById('year');
                if(yearSpan) yearSpan.textContent = new Date().getFullYear();
            })
            .catch(err => console.error('Error loading footer:', err));
    }

    // ==========================================
    // 3. DYNAMIC LINK FIXER (Updated)
    // ==========================================
    function updateNavigationLinks(container, basePath) {
        const links = container.querySelectorAll('a');

        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip hash links (#tracker), emails, or external sites
            if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;

            // If it is a link to the Root Index
            if (href === 'index.html' || href === './index.html') {
                link.href = basePath + "index.html";
            }
            // If it is a link to another View (like views/auth/login.html)
            else if (href.includes('views/')) {
                // If we are at root, leave it alone. 
                // If we are deep, add ../../ to front.
                link.href = basePath + href; 
            }
        });
    }

    // ==========================================
    // 4. PAGE SPECIFIC INITIALIZATION
    // ==========================================
    if (document.querySelector('.recipes-grid')) {
        initializeExplorePage();   
    }
    
    if (document.getElementById('mainImage')) {
        initializeRecipePage();    
    }
    
    initializeCommunityPage(); 
    initializeHomeFaq();
});

// ==========================================
// SECTION A: HEADER LOGIC
// ==========================================
function initializeHeader() {
    
    // 1. Highlight Active Link
    // We get the filename e.g., "about.html"
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "") currentPage = "index.html"; // Handle root /

    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

    navLinks.forEach(link => {
        // We check if the link's original href matches the current page name
        // (We check specific string to avoid full URL mismatch)
        if (link.href.includes(currentPage)) {
            link.style.color = "var(--primary-color)"; 
            link.style.fontWeight = "bold";
        }
    });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if(mobileBtn && mobileMenu){
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // 3. Theme Toggle
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const body = document.body;
    
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if(themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // 4. Sticky Header
    const header = document.querySelector('header'); 
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }
}

// ==========================================
// SECTION B: EXPLORE PAGE
// ==========================================
function initializeExplorePage() {
    const recipesGrid = document.querySelector('.recipes-grid');
    const searchInput = document.getElementById('search-input');
    
    if (!recipesGrid || !searchInput) return;

    let recipeCards = Array.from(document.querySelectorAll('.recipe-card'));

    function filterRecipes() {
        const searchText = searchInput.value.toLowerCase();
        const activeCategoryBtn = document.querySelector('#category-filters .filter-chip.active');
        const currentCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-value') : 'All';
        const activeDiffBtn = document.querySelector('#difficulty-filters .filter-chip.active');
        const currentDifficulty = activeDiffBtn ? activeDiffBtn.getAttribute('data-value') : null;
        const activeTimeBtn = document.querySelector('#time-filters .filter-chip.active');
        const currentTime = activeTimeBtn ? activeTimeBtn.getAttribute('data-value') : null;

        recipeCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardDifficulty = card.getAttribute('data-difficulty');
            const cardTime = parseInt(card.getAttribute('data-time'));
            const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();

            const matchesSearch = cardTitle.includes(searchText);
            const matchesCategory = currentCategory === 'All' || cardCategory === currentCategory;
            const matchesDifficulty = !currentDifficulty || cardDifficulty === currentDifficulty;

            let matchesTime = true;
            if (currentTime === 'under-15') matchesTime = cardTime < 15;
            else if (currentTime === '15-30') matchesTime = cardTime >= 15 && cardTime <= 30;
            else if (currentTime === 'over-60') matchesTime = cardTime >= 60;

            if (matchesSearch && matchesCategory && matchesDifficulty && matchesTime) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("search");

    if (searchQuery) {
        searchInput.value = searchQuery;
        filterRecipes();
    }

    // Custom Dropdown
    const selectWrapper = document.querySelector('.custom-select-wrapper');
    const selectTrigger = document.querySelector('.custom-select-trigger');
    const selectOptions = document.querySelectorAll('.custom-option');
    const selectTriggerText = selectTrigger ? selectTrigger.querySelector('span') : null;

    if (selectWrapper && selectTrigger) {
        selectTrigger.addEventListener('click', () => selectWrapper.classList.toggle('open'));

        selectOptions.forEach(option => {
            option.addEventListener('click', function() {
                selectWrapper.classList.remove('open');
                selectOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                if(selectTriggerText) selectTriggerText.textContent = this.textContent;
                
                const sortValue = this.getAttribute('data-value');
                sortRecipes(sortValue);
            });
        });

        document.addEventListener('click', (e) => {
            if (!selectWrapper.contains(e.target)) selectWrapper.classList.remove('open');
        });
    }

    function sortRecipes(criteria) {
        recipeCards.sort((a, b) => {
            switch (criteria) {
                case 'popular': return parseInt(b.getAttribute('data-reviews')||0) - parseInt(a.getAttribute('data-reviews')||0);
                case 'rating': return parseFloat(b.getAttribute('data-rating')||0) - parseFloat(a.getAttribute('data-rating')||0);
                case 'newest': return (b.getAttribute('data-date')||'').localeCompare(a.getAttribute('data-date')||'');
                case 'time-low': return parseInt(a.getAttribute('data-time')) - parseInt(b.getAttribute('data-time'));
                case 'time-high': return parseInt(b.getAttribute('data-time')) - parseInt(a.getAttribute('data-time'));
                default: return 0;
            }
        });
        recipeCards.forEach(card => recipesGrid.appendChild(card));
        filterRecipes();
    }

    searchInput.addEventListener('input', filterRecipes);

    function setupFilterButtons(containerId) {
        const container = document.getElementById(containerId);
        if(container) {
            container.querySelectorAll('.filter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const isActive = btn.classList.contains('active');
                    container.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                    
                    if (!isActive || containerId === 'category-filters') {
                        btn.classList.add('active');
                    }
                    filterRecipes();
                });
            });
        }
    }

    setupFilterButtons('category-filters');
    setupFilterButtons('difficulty-filters');
    setupFilterButtons('time-filters');

    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        const targetBtn = document.querySelector(`#category-filters .filter-chip[data-value="${categoryParam}"]`);
        if (targetBtn) targetBtn.click();
    }
}


// ==========================================
// SECTION C: RECIPE DETAIL PAGE
// ==========================================
function initializeRecipePage() {
    const mainImg = document.getElementById('mainImage');
    if (!mainImg) return;

    const thumbs = document.querySelectorAll('.thumb');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            mainImg.src = this.src.replace('&w=200', '&w=1200'); 
            mainImg.style.opacity = 0.5;
            setTimeout(() => { mainImg.style.opacity = 1; }, 100);
            thumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const saveBtn = document.querySelector('.love-btn');
    if(saveBtn) {
        saveBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (this.style.color === 'rgb(239, 68, 68)' || this.style.color === '#ef4444') {
                this.style.color = ''; this.style.borderColor = ''; this.style.background = '';
                icon.classList.replace('fa-solid', 'fa-regular');
            } else {
                this.style.color = '#ef4444'; this.style.borderColor = '#ef4444'; this.style.background = 'rgba(239, 68, 68, 0.05)';
                icon.classList.replace('fa-regular', 'fa-solid');
            }
        });
    }

    const shareBtn = document.getElementById('shareBtn');
    if(shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Check out this amazing recipe!',
                        url: window.location.href
                    });
                } catch (err) { console.log('Error sharing:', err); }
            } else {
                alert('Link copied: ' + window.location.href);
            }
        });
    }

    const printBtn = document.getElementById('printBtn');
    if(printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }

    const listBtn = document.getElementById('listBtn');
    if(listBtn) {
        listBtn.addEventListener('click', function() {
            this.classList.toggle('active-list');
            if (this.classList.contains('active-list')) {
                this.innerHTML = '<i class="fa-solid fa-check"></i> Added';
                alert('Added to Shopping List!');
            } else {
                this.innerHTML = '<i class="fa-solid fa-plus"></i> List';
                alert('Removed from Shopping List.');
            }
        });
    }
}

// =================================================
// CONTACT & FAQ PAGE LOGIC
// =================================================
function initializeCommunityPage() {
    // UPDATED: Changed selector from '.faq-btn' to '.faq-question' to match your CSS
    const faqButtons = document.querySelectorAll('.faq-question'); 
    
    if (faqButtons.length > 0) {
        faqButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Toggle the active class on the button (for the arrow rotation)
                btn.classList.toggle('active');
                
                // 2. Select the answer div (next sibling)
                const content = btn.nextElementSibling;
                
                // 3. Toggle the open class
                content.classList.toggle('open');

                // 4. KEY FIX: Manually handle max-height for smooth animation
                // This ensures it opens even if CSS specificities are tricky
                if (content.style.maxHeight) {
                    content.style.maxHeight = null; // Close
                } else {
                    content.style.maxHeight = content.scrollHeight + "px"; // Open
                }
            });
        });
    }
}

function initializeHomeFaq() {
    // Specific Home Page Accordion
    const homeFaqBtns = document.querySelectorAll('.home-faq-btn');
    homeFaqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const content = btn.nextElementSibling;
            content.classList.toggle('open');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

// Global Form Functions
function handleSubmit(event) {
    event.preventDefault(); 
    const btn = document.querySelector('.btn-submit');
    if(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sending...';
        btn.style.opacity = '0.7';

        setTimeout(() => {
            const successMsg = document.getElementById('successMessage');
            if(successMsg) successMsg.classList.add('active');
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            const form = document.getElementById('contactForm');
            if(form) form.reset();
        }, 1000);
    }
}

function resetForm() {
    const successMsg = document.getElementById('successMessage');
    if(successMsg) successMsg.classList.remove('active');
}




// =========================
// auth Page js 
// ========================

// --- Simulated Login Logic ---
        function handleLogin(event) {
            event.preventDefault(); // Stop page reload
            
            const btn = document.querySelector('.btn-login');
            const errorMsg = document.getElementById('loginError');
            
            // 1. Reset state
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...';
            btn.style.opacity = '0.8';
            errorMsg.style.display = 'none';

            // 2. Simulate Server Delay (1.5 seconds)
            setTimeout(() => {
                // For demo purposes, let's just pretend login failed first to show the error style
                // (In a real app, you would check credentials here)
                
                // Randomly succeed or fail for demo fun
                const isSuccess = Math.random() > 0.5;

                if (isSuccess) {
                    btn.innerHTML = 'Success!';
                    btn.style.backgroundColor = '#059669';
                    window.location.href = 'index.html'; // Redirect to home
                } else {
                    btn.innerHTML = 'Login';
                    btn.style.opacity = '1';
                    errorMsg.style.display = 'flex'; // Show error
                }
            }, 1500);
        }



        // --- Register Logic Simulation ---
        function handleRegister(event) {
            event.preventDefault();
            
            const pass = document.getElementById('password').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            const errorMsg = document.getElementById('registerError');
            const btn = document.querySelector('.btn-auth');

            // 1. Basic Validation
            if (pass !== confirmPass) {
                errorMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Passwords do not match.';
                errorMsg.style.display = 'flex';
                return; // Stop execution
            }

            // 2. Hide error if passes
            errorMsg.style.display = 'none';
            
            // 3. Simulate Loading
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...';
            btn.style.opacity = '0.8';

            // 4. Simulate Server Delay
            setTimeout(() => {
                btn.innerHTML = 'Success!';
                btn.style.backgroundColor = '#059669'; // Success color
                
                // Redirect after brief pause
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }, 1500);
        }






// ===================================================
//         forget passward logic
//         ==============================


// --- Logic to Simulate Sending Email ---
        function handleReset(event) {
            event.preventDefault(); // Stop reload
            
            const btn = document.querySelector('.btn-reset');
            const originalContent = btn.innerHTML;

            // 1. Loading State
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            // 2. Simulate Server Delay (1.5 seconds)
            setTimeout(() => {
                // Hide Form, Show Success
                document.getElementById('defaultState').style.display = 'none';
                document.getElementById('successState').style.display = 'flex';
                
                // Reset button for next time
                btn.innerHTML = originalContent;
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 1500);
        }

        // Helper to reset the view for demo purposes
        function retry() {
            document.getElementById('successState').style.display = 'none';
            document.getElementById('defaultState').style.display = 'block';
            document.getElementById('resetForm').reset();
        }