document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. LOAD HEADER ---
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                initializeHeader(); 
            })
            .catch(err => console.error('Error loading header:', err));
    }

    // --- 2. LOAD FOOTER ---
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                const yearSpan = document.getElementById('year');
                if(yearSpan) yearSpan.textContent = new Date().getFullYear();
            });
    }

    // --- 3. RUN PAGE LOGIC ---
    initializePageSpecifics();
});

// ==========================================
// A. HEADER LOGIC
// ==========================================
function initializeHeader() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.color = "var(--primary-color)"; 
            link.style.fontWeight = "bold";
        }
    });

    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if(mobileBtn && mobileMenu){
        mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('active'));
    }

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

    const header = document.querySelector('header'); 
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
    }
}

// ==========================================
// B. PAGE SPECIFIC LOGIC
// ==========================================
function initializePageSpecifics() {

    // --- 1. FAQ ACCORDION ---
    const faqButtons = document.querySelectorAll('.faq-btn');
    if (faqButtons.length > 0) {
        faqButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                btn.classList.toggle('active');
                if (btn.classList.contains('active')) content.classList.add('open');
                else content.classList.remove('open');
            });
        });
    }

    // --- 2. EXPLORE PAGE LOGIC ---
    const recipesGrid = document.querySelector('.recipes-grid');
    const searchInput = document.getElementById('search-input');
    
    // Only run if we are on the Explore page
    if (recipesGrid && searchInput) {
        
        // Convert NodeList to Array for sorting
        let recipeCards = Array.from(document.querySelectorAll('.recipe-card'));

        // >>> DROPDOWN LOGIC (This was missing!) <<<
        const selectWrapper = document.querySelector('.custom-select-wrapper');
        const selectTrigger = document.querySelector('.custom-select-trigger');
        const selectOptions = document.querySelectorAll('.custom-option');
        const selectTriggerText = selectTrigger ? selectTrigger.querySelector('span') : null;

        if (selectWrapper && selectTrigger) {
            selectTrigger.addEventListener('click', () => {
                selectWrapper.classList.toggle('open');
            });

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
                if (!selectWrapper.contains(e.target)) {
                    selectWrapper.classList.remove('open');
                }
            });
        }

        // >>> FILTER & SORT VARIABLES <<<
        let currentCategory = 'All';
        let currentDifficulty = null;
        let currentTime = null;

        function filterRecipes() {
            // Re-query needed if DOM order changed by sort
            const currentCards = document.querySelectorAll('.recipe-card');

            currentCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                const cardDifficulty = card.getAttribute('data-difficulty');
                const cardTime = parseInt(card.getAttribute('data-time'));
                const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
                const searchText = searchInput.value.toLowerCase();

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

        // >>> EVENT LISTENERS <<<
        searchInput.addEventListener('input', filterRecipes);

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

        const diffContainer = document.getElementById('difficulty-filters');
        if(diffContainer) {
            diffContainer.querySelectorAll('.filter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-value');
                    if (currentDifficulty === val) {
                        currentDifficulty = null; btn.classList.remove('active');
                    } else {
                        currentDifficulty = val;
                        diffContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    filterRecipes();
                });
            });
        }

        const timeContainer = document.getElementById('time-filters');
        if(timeContainer) {
            timeContainer.querySelectorAll('.filter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const val = btn.getAttribute('data-value');
                    if (currentTime === val) {
                        currentTime = null; btn.classList.remove('active');
                    } else {
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