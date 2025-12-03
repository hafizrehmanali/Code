
    <!-- JavaScript -->
    <script>
        // 1. Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });

        // 2. Sticky Header Effect
        const header = document.getElementById('main-header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // 3. FAQ Accordion Logic
        const faqButtons = document.querySelectorAll('.faq-btn');

        faqButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                
                // Toggle current item
                btn.classList.toggle('active');
                
                if (btn.classList.contains('active')) {
                    content.classList.add('open');
                } else {
                    content.classList.remove('open');
                }
            });
        });

        // 4. Dark Mode Toggle
        const themeBtn = document.getElementById('theme-toggle');
        const themeBtnMobile = document.getElementById('theme-toggle-mobile');
        const body = document.body;
        const icon = themeBtn.querySelector('i');
        const iconMobile = themeBtnMobile.querySelector('i');

        // Check Local Storage on load
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            body.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
            iconMobile.classList.replace('fa-moon', 'fa-sun');
        }

        // Toggle Function
        function toggleTheme() {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Update Icons
            if (isDark) {
                icon.classList.replace('fa-moon', 'fa-sun');
                iconMobile.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                iconMobile.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            }
        }

        themeBtn.addEventListener('click', toggleTheme);
        themeBtnMobile.addEventListener('click', toggleTheme);

    </script>