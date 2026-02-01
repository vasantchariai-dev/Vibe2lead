/**
 * vibe2lead.diy — Interactive functionality
 * Vanilla JavaScript, no dependencies
 */

(function() {
    'use strict';

    // ---- Constants ----
    const STORAGE_KEY = 'vibe2lead_audience';
    const AUDIENCES = ['public', 'commercial', 'startup'];

    // ---- DOM Elements ----
    const stickyNav = document.querySelector('.sticky-nav');
    const hero = document.querySelector('#hero');
    const stepLinks = document.querySelectorAll('.step-link');
    const stepSections = document.querySelectorAll('.step-section');

    // Step 3 slider
    const slider3 = document.querySelector('#step-3 .audience-slider');
    const sliderOptions3 = slider3?.querySelectorAll('.slider-option');
    const sliderHighlight3 = slider3?.querySelector('.slider-highlight');
    const audienceContent3 = document.querySelectorAll('#step-3 .audience-content');

    // Step 5 slider
    const slider5 = document.querySelector('#step-5 .audience-slider-step5');
    const sliderOptions5 = slider5?.querySelectorAll('.slider-option');
    const sliderHighlight5 = slider5?.querySelector('.slider-highlight');
    const audienceContent5 = document.querySelectorAll('.audience-content-step5');

    // ---- Utility Functions ----

    /**
     * Debounce function to limit how often a function runs
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get saved audience from localStorage
     */
    function getSavedAudience() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return AUDIENCES.includes(saved) ? saved : 'public';
        } catch (e) {
            return 'public';
        }
    }

    /**
     * Save audience to localStorage
     */
    function saveAudience(audience) {
        try {
            localStorage.setItem(STORAGE_KEY, audience);
        } catch (e) {
            // localStorage not available, fail silently
        }
    }

    // ---- Sticky Navigation ----

    /**
     * Show/hide sticky nav based on scroll position
     */
    function handleStickyNav() {
        if (!hero || !stickyNav) return;

        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > heroBottom - 100) {
            stickyNav.classList.add('visible');
        } else {
            stickyNav.classList.remove('visible');
        }
    }

    // ---- Active Step Tracking ----

    /**
     * Update active step indicator based on scroll position
     */
    function updateActiveStep() {
        if (!stepSections.length || !stepLinks.length) return;

        const scrollY = window.scrollY || window.pageYOffset;
        const windowHeight = window.innerHeight;
        const triggerPoint = scrollY + windowHeight * 0.3;

        let activeStep = null;

        stepSections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (triggerPoint >= sectionTop && triggerPoint < sectionBottom) {
                activeStep = index + 1;
            }
        });

        // Update step links
        stepLinks.forEach(link => {
            const step = parseInt(link.dataset.step, 10);
            if (step === activeStep) {
                link.classList.add('active');
                link.setAttribute('aria-selected', 'true');
            } else {
                link.classList.remove('active');
                link.setAttribute('aria-selected', 'false');
            }
        });
    }

    // ---- Audience Slider ----

    /**
     * Update slider UI and content for a specific step
     */
    function updateSlider(audience, step) {
        const isStep3 = step === 3;
        const options = isStep3 ? sliderOptions3 : sliderOptions5;
        const highlight = isStep3 ? sliderHighlight3 : sliderHighlight5;
        const content = isStep3 ? audienceContent3 : audienceContent5;

        if (!options || !highlight || !content) return;

        const position = AUDIENCES.indexOf(audience) + 1;

        // Update button states
        options.forEach(option => {
            const isActive = option.dataset.audience === audience;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Move highlight
        highlight.setAttribute('data-position', position.toString());

        // Show/hide content
        content.forEach(contentBlock => {
            const isMatch = contentBlock.dataset.audience === audience;
            contentBlock.classList.toggle('hidden', !isMatch);
            contentBlock.setAttribute('aria-hidden', !isMatch ? 'true' : 'false');
        });
    }

    /**
     * Handle slider option click
     */
    function handleSliderClick(event, step) {
        const audience = event.target.dataset.audience;
        if (!audience || !AUDIENCES.includes(audience)) return;

        // Update both sliders
        updateSlider(audience, 3);
        updateSlider(audience, 5);

        // Save to localStorage
        saveAudience(audience);
    }

    /**
     * Initialize sliders with saved audience
     */
    function initSliders() {
        const savedAudience = getSavedAudience();

        updateSlider(savedAudience, 3);
        updateSlider(savedAudience, 5);

        // Add click handlers for step 3 slider
        if (sliderOptions3) {
            sliderOptions3.forEach(option => {
                option.addEventListener('click', (e) => handleSliderClick(e, 3));
            });
        }

        // Add click handlers for step 5 slider
        if (sliderOptions5) {
            sliderOptions5.forEach(option => {
                option.addEventListener('click', (e) => handleSliderClick(e, 5));
            });
        }
    }

    // ---- Smooth Scroll for Navigation Links ----

    /**
     * Handle navigation link clicks with smooth scroll
     */
    function handleNavClick(event) {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            event.preventDefault();

            const navHeight = stickyNav?.classList.contains('visible') ? 60 : 0;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without scrolling
            if (history.pushState) {
                history.pushState(null, null, targetId);
            }
        }
    }

    // ---- Intersection Observer for Step Sections ----

    /**
     * Set up Intersection Observer for better scroll tracking
     */
    function setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            window.addEventListener('scroll', debounce(updateActiveStep, 100));
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stepId = entry.target.id;
                    const stepNumber = stepId.replace('step-', '');

                    stepLinks.forEach(link => {
                        const isActive = link.dataset.step === stepNumber;
                        link.classList.toggle('active', isActive);
                        link.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    });
                }
            });
        }, observerOptions);

        stepSections.forEach(section => observer.observe(section));
    }

    // ---- Book Animation Control ----

    /**
     * Toggle book open/close on click
     */
    function setupBookAnimationRestart() {
        const book = document.querySelector('.book');
        if (!book) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let isOpen = false;
        let isAnimating = false;

        // Mark as open after initial animation completes (~10s)
        setTimeout(() => {
            isOpen = true;
        }, 10000);

        book.style.cursor = 'pointer';

        book.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;

            const bookCover = book.querySelector('.book-cover');
            const pages = Array.from(book.querySelectorAll('.page'));

            if (isOpen) {
                // Close the book quickly - all pages snap back together
                book.classList.add('closing');

                // Reset all page transforms immediately then animate closed
                pages.forEach(page => {
                    page.style.transition = 'none';
                    page.style.animation = 'none';
                });
                bookCover.style.transition = 'none';
                bookCover.style.animation = 'none';

                // Force reflow
                void book.offsetWidth;

                // Now animate everything closed quickly
                pages.reverse().forEach((page, index) => {
                    page.style.transition = `transform 0.08s ease-in ${index * 0.02}s`;
                    page.style.transform = 'rotateY(0deg)';
                });

                // Close cover after pages (quick snap)
                const coverDelay = pages.length * 0.02 + 0.05;
                setTimeout(() => {
                    bookCover.style.transition = 'transform 0.25s ease-out';
                    bookCover.style.transform = 'rotateY(0deg)';
                }, coverDelay * 1000);

                // Animation complete
                setTimeout(() => {
                    isOpen = false;
                    isAnimating = false;
                    book.classList.remove('closing');
                    // Clear inline styles
                    pages.forEach(page => {
                        page.style.transition = '';
                        page.style.transform = '';
                    });
                    bookCover.style.transition = '';
                    bookCover.style.transform = '';
                }, (coverDelay + 0.3) * 1000);

            } else {
                // Open the book - restart animations
                bookCover.style.animation = 'none';
                bookCover.style.transition = '';
                bookCover.style.transform = '';
                pages.forEach(page => {
                    page.style.animation = 'none';
                    page.style.transition = '';
                    page.style.transform = '';
                });

                // Trigger reflow
                void book.offsetWidth;

                // Re-add animations
                bookCover.style.animation = '';
                pages.forEach(page => page.style.animation = '');

                // Mark as open after animation
                setTimeout(() => {
                    isOpen = true;
                    isAnimating = false;
                }, 10000);
            }
        });
    }

    // ---- Bluesky Feed ----

    /**
     * Fetch and display recent Bluesky posts
     */
    async function loadBlueskyFeed() {
        const feedContainer = document.getElementById('bluesky-feed');
        if (!feedContainer) return;

        const handle = 'vibe2lead.bsky.social';
        const apiUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${handle}&limit=3&filter=posts_no_replies`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const posts = data.feed || [];

            if (posts.length === 0) {
                feedContainer.innerHTML = '<p class="bluesky-empty">No posts yet — check back soon.</p>';
                return;
            }

            const postsHtml = posts.map(item => {
                const post = item.post;
                const text = post.record?.text || '';
                const createdAt = new Date(post.record?.createdAt);
                const timeAgo = getTimeAgo(createdAt);
                const postUrl = `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`;

                return `
                    <a href="${postUrl}" target="_blank" rel="noopener" class="bluesky-post">
                        <p class="bluesky-post-text">${escapeHtml(text)}</p>
                        <span class="bluesky-post-time">${timeAgo}</span>
                    </a>
                `;
            }).join('');

            feedContainer.innerHTML = postsHtml;
        } catch (error) {
            // Silently fail - just don't show the feed
            feedContainer.innerHTML = '';
        }
    }

    /**
     * Get human-readable time ago string
     */
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ---- Initialize ----

    function init() {
        // Sticky navigation
        window.addEventListener('scroll', debounce(handleStickyNav, 10));
        handleStickyNav();

        // Step tracking
        setupIntersectionObserver();

        // Navigation clicks
        document.addEventListener('click', handleNavClick);

        // Audience sliders
        initSliders();

        // Book animation
        setupBookAnimationRestart();

        // Bluesky feed
        loadBlueskyFeed();

        // Handle browser back/forward for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash) {
                const target = document.querySelector(hash);
                if (target) {
                    const navHeight = stickyNav?.classList.contains('visible') ? 60 : 0;
                    window.scrollTo({
                        top: target.offsetTop - navHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
