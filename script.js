document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. GLOBAL: HEADER & FOOTER LOADING
    // ==========================================
    
    // Load Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                initializeHeader(); // Initialize logic after HTML loads
            })
            .catch(err => console.error('Error loading header:', err));
    }

    // Load Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                // Auto-update Copyright Year
                const yearSpan = document.getElementById('year');
                if(yearSpan) yearSpan.textContent = new Date().getFullYear();
            })
            .catch(err => console.error('Error loading footer:', err));
    }

    // ==========================================
    // 2. PAGE SPECIFIC INITIALIZATION
    // ==========================================
    
    // Check which page we are on and run relevant logic
    initializeExplorePage();   // For Explore.html
    initializeRecipePage();    // For Recipe-Detail.html
    initializeCommunityPage(); // For Community.html (FAQ)
});


// ==========================================
// SECTION A: HEADER LOGIC (Mobile Menu, Dark Mode)
// ==========================================
function initializeHeader() {
    
    // 1. Highlight Active Link (Green Text)
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

    navLinks.forEach(link => {
        // If href matches current filename, make it active
        if (link.getAttribute('href') === currentPage) {
            link.style.color = "var(--primary-color)"; 
            link.style.fontWeight = "bold";
        }
    });

    // 2. Mobile Menu Toggle (Hamburger)
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if(mobileBtn && mobileMenu){
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // 3. Theme Toggle (Dark/Light Mode)
    const themeBtn = document.querySelector('.theme-toggle-btn');
    const body = document.body;
    
    // Check Local Storage on load
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if(themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Switch Icon & Save to Storage
            themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // 4. Sticky Header on Scroll
    const header = document.querySelector('header'); 
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }
}


// ==========================================
// SECTION B: EXPLORE PAGE (Filters & Sorting)
// ==========================================
function initializeExplorePage() {
    const recipesGrid = document.querySelector('.recipes-grid');
    const searchInput = document.getElementById('search-input');
    
    // Only run if we are on the Explore Page
    if (recipesGrid && searchInput) {
        
        let recipeCards = Array.from(document.querySelectorAll('.recipe-card'));

        // --- 1. Custom Dropdown Logic ---
        const selectWrapper = document.querySelector('.custom-select-wrapper');
        const selectTrigger = document.querySelector('.custom-select-trigger');
        const selectOptions = document.querySelectorAll('.custom-option');
        const selectTriggerText = selectTrigger ? selectTrigger.querySelector('span') : null;

        if (selectWrapper && selectTrigger) {
            // Open/Close Dropdown
            selectTrigger.addEventListener('click', () => selectWrapper.classList.toggle('open'));

            // Option Selection
            selectOptions.forEach(option => {
                option.addEventListener('click', function() {
                    selectWrapper.classList.remove('open');
                    selectOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    if(selectTriggerText) selectTriggerText.textContent = this.textContent;
                    
                    // Trigger Sort
                    const sortValue = this.getAttribute('data-value');
                    sortRecipes(sortValue);
                });
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!selectWrapper.contains(e.target)) selectWrapper.classList.remove('open');
            });
        }

        // --- 2. Filtering State ---
        let currentCategory = 'All';
        let currentDifficulty = null;
        let currentTime = null;

        // Filter Logic
        function filterRecipes() {
            const currentCards = document.querySelectorAll('.recipe-card');
            const searchText = searchInput.value.toLowerCase();

            currentCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardDifficulty = card.getAttribute('data-difficulty');
                const cardTime = parseInt(card.getAttribute('data-time'));
                const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();

                // Match Checks
                const matchesSearch = cardTitle.includes(searchText);
                const matchesCategory = currentCategory === 'All' || cardCategory === currentCategory;
                const matchesDifficulty = !currentDifficulty || cardDifficulty === currentDifficulty;

                let matchesTime = true;
                if (currentTime === 'under-15') matchesTime = cardTime < 15;
                else if (currentTime === '15-30') matchesTime = cardTime >= 15 && cardTime <= 30;
                else if (currentTime === 'over-60') matchesTime = cardTime >= 60;

                // Toggle Display
                if (matchesSearch && matchesCategory && matchesDifficulty && matchesTime) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        }

        // Sort Logic
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
            // Re-append sorted cards
            recipeCards.forEach(card => recipesGrid.appendChild(card));
            filterRecipes(); // Re-apply filters
        }

        // --- 3. Event Listeners ---
        searchInput.addEventListener('input', filterRecipes);

        // Category Chips
        const catContainer = document.getElementById('category-filters');
        if(catContainer) {
            catContainer.querySelectorAll('.filter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    catContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentCategory = btn.getAttribute('data-value');
                    filterRecipes();
                });
            });
        }

        // Difficulty Chips
        const diffContainer = document.getElementById('difficulty-filters');
        if(diffContainer) {
            diffContainer.querySelectorAll('.filter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-value');
                    if (currentDifficulty === val) { // Toggle off
                        currentDifficulty = null; btn.classList.remove('active');
                    } else { // Toggle on
                        currentDifficulty = val;
                        diffContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    filterRecipes();
                });
            });
        }

                    // --- NEW: URL PARAMETER HANDLING ---
            // Check if the URL has a category filter (e.g., ?category=Breakfast)
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');

            if (categoryParam) {
                // 1. Find the button that matches the URL parameter
                // We look for a button inside #category-filters with the matching data-value
                const targetBtn = document.querySelector(`#category-filters .filter-chip[data-value="${categoryParam}"]`);

                if (targetBtn) {
                    // 2. Simulate a click on that button
                    // This triggers all your existing logic (highlighting the button, filtering the grid)
                    targetBtn.click();
                }
            }

        // Time Chips
        const timeContainer = document.getElementById('time-filters');
        if(timeContainer) {
            timeContainer.querySelectorAll('.filter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-value');
                    if (currentTime === val) { // Toggle off
                        currentTime = null; btn.classList.remove('active');
                    } else { // Toggle on
                        currentTime = val;
                        timeContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    filterRecipes();
                });
            });
        }
    }
}


// ==========================================
// SECTION C: RECIPE DETAIL PAGE (Gallery, Print, Share)
// ==========================================
function initializeRecipePage() {
    
    // Check if we are on a recipe detail page (look for mainImage)
    const mainImg = document.getElementById('mainImage');
    if (!mainImg) return; // Exit if not on recipe page

    // 1. Image Gallery Logic (Click thumbnail -> Change Main Image)
    const thumbs = document.querySelectorAll('.thumb');
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Replace main image source
            mainImg.src = this.src.replace('&w=200', '&w=1200'); // Assuming unsplash logic, works for regular images too if consistent
            
            // Fade Effect
            mainImg.style.opacity = 0.5;
            setTimeout(() => { mainImg.style.opacity = 1; }, 100);
            
            // Update Active Class
            thumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 2. Save/Favorite Button (Toggle Heart Icon)
    const saveBtn = document.querySelector('.love-btn');
    if(saveBtn) {
        saveBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            // Check if active (red color)
            if (this.style.color === 'rgb(239, 68, 68)' || this.style.color === '#ef4444') {
                // Deactivate
                this.style.color = ''; this.style.borderColor = ''; this.style.background = '';
                icon.classList.replace('fa-solid', 'fa-regular');
            } else {
                // Activate
                this.style.color = '#ef4444'; this.style.borderColor = '#ef4444'; this.style.background = 'rgba(239, 68, 68, 0.05)';
                icon.classList.replace('fa-regular', 'fa-solid');
            }
        });
    }

    // 3. Share Button (Web Share API)
    const shareBtn = document.getElementById('shareBtn');
    if(shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Check out this amazing recipe on NutriChef!',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                }
            } else {
                // Fallback for desktop browsers
                alert('Link copied to clipboard: ' + window.location.href);
            }
        });
    }

    // 4. Print Button
    const printBtn = document.getElementById('printBtn');
    if(printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // 5. Shopping List Button
    const listBtn = document.getElementById('listBtn');
    if(listBtn) {
        listBtn.addEventListener('click', function() {
            if (this.classList.contains('active-list')) {
                // Remove from list
                this.classList.remove('active-list');
                this.innerHTML = '<i class="fa-solid fa-plus"></i> List';
                alert('Ingredients removed from your Shopping List.');
            } else {
                // Add to list
                this.classList.add('active-list');
                this.innerHTML = '<i class="fa-solid fa-check"></i> Added';
                alert('All ingredients added to your Shopping List!');
            }
        });
    }
}


// ==========================================
// SECTION D: COMMUNITY PAGE (FAQ)
// ==========================================
function initializeCommunityPage() {
    const faqButtons = document.querySelectorAll('.faq-btn');
    
    // Only run if FAQs exist
    if (faqButtons.length > 0) {
        faqButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                btn.classList.toggle('active');
                
                // Toggle Accordion
                if (btn.classList.contains('active')) {
                    content.classList.add('open');
                } else {
                    content.classList.remove('open');
                }
            });
        });
    }
}