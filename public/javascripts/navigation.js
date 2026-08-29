document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id], .hero');

    // Map sections to their corresponding nav links
    const sectionMap = new Map();
    sectionMap.set('hero', 'Home');
    sectionMap.set('about', 'About');
    sectionMap.set('moods', 'Moods');

    function updateActiveNavLink() {
        let current = 'Home'; // Default to Home

        // Check which section is currently in view
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;

            // Consider a section active if it's in the top half of the viewport
            if (sectionTop <= window.innerHeight / 2 && sectionTop + sectionHeight > window.innerHeight / 2) {
                const sectionId = section.id || 'hero';
                if (sectionMap.has(sectionId)) {
                    current = sectionMap.get(sectionId);
                }
            }
        });

        // Update active states
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.textContent.trim() === current) {
                link.classList.add('active');
            }
        });
    }

    // Handle smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();

                let targetId = href.substring(1);
                let targetElement;

                if (targetId === '' || href === '#') {
                    // Home link - scroll to top
                    targetElement = document.querySelector('.hero');
                } else {
                    targetElement = document.getElementById(targetId);
                }

                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active state immediately
                    setTimeout(() => {
                        updateActiveNavLink();
                    }, 100);
                }
            }
        });
    });

    // Listen for scroll events
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll);

    // Mobile Navigation Toggle (Hamburger Menu)
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');

    if (hamburger && navLinksContainer) {
        // Toggle the visibility of the navigation links
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close the navigation menu when a link is clicked (useful on mobile)
        navLinksContainer.querySelectorAll('a').forEach(navLink => {
            navLink.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
        });
    }

    // Initial call to set correct active state
    updateActiveNavLink();
});