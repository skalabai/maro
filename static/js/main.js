document.addEventListener('DOMContentLoaded', function () {
    // === Global Toast Notification ===
    window.showToast = function (message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `px-6 py-4 rounded-sm shadow-xl flex items-center gap-3 transform translate-y-full opacity-0 transition-all duration-300 pointer-events-auto`;

        // Colors
        if (type === 'success') {
            toast.classList.add('bg-brand-black', 'text-white');
        } else {
            toast.classList.add('bg-gray-100', 'text-brand-black', 'border', 'border-gray-200');
        }

        toast.innerHTML = `
            ${type === 'success' ? '<i data-lucide="check-circle" class="w-5 h-5"></i>' : '<i data-lucide="info" class="w-5 h-5"></i>'}
            <span class="text-sm font-medium tracking-wide">${message}</span>
        `;

        container.appendChild(toast);
        lucide.createIcons({ root: toast });

        // Animate In: Wait a tick, then slide up and fade in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-full', 'opacity-0');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // === Product Carousel Logic ===
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const imageContainer = card.querySelector('.product-image-container');
        if (!imageContainer) return;

        const mainImage = imageContainer.querySelector('.main-product-image');
        const extraImages = Array.from(imageContainer.querySelectorAll('.extra-image'));

        if (!mainImage || extraImages.length === 0) return;

        // === ORIGINAL LOGIC RESTORED ===
        // Simple slideshow on hover

        const allImages = [mainImage, ...extraImages];
        let currentIndex = 0;
        let interval;

        function showImage(index) {
            allImages.forEach(img => {
                img.style.opacity = '0';
                img.style.zIndex = '1';
            });
            const currentImg = allImages[index];
            if (currentImg) {
                currentImg.style.opacity = '1';
                currentImg.style.zIndex = '2';
            }
            currentIndex = index;
        }

        function nextImage() {
            let nextIndex = (currentIndex + 1) % allImages.length;
            showImage(nextIndex);
        }

        card.addEventListener('mouseenter', function () {
            showImage(0);
            // Faster interval for responsiveness
            interval = setInterval(nextImage, 1000);
        });

        card.addEventListener('mouseleave', function () {
            if (interval) clearInterval(interval);
            showImage(0);
        });
    });


    // === Product Detail Page Logic ===

    // Image Swap for Gallery
    const thumbnails = document.querySelectorAll('.thumbnail img');
    const mainDetailImage = document.getElementById('main-product-image');

    // Arrows
    const sliderPrev = document.getElementById('slider-prev');
    const sliderNext = document.getElementById('slider-next');

    if (thumbnails.length && mainDetailImage) {
        let currentImageIndex = 0;

        // Show arrows only if more than 1 image
        if (thumbnails.length > 1) {
            if (sliderPrev) sliderPrev.classList.remove('hidden');
            if (sliderNext) sliderNext.classList.remove('hidden');
        }

        function updateMainImage(index) {
            if (index < 0) index = thumbnails.length - 1;
            if (index >= thumbnails.length) index = 0;
            currentImageIndex = index;

            const targetThumb = thumbnails[currentImageIndex];
            if (targetThumb) {
                mainDetailImage.src = targetThumb.getAttribute('data-full');
                thumbnails.forEach(t => t.parentElement.classList.remove('border-brand-black'));
                targetThumb.parentElement.classList.add('border-brand-black');
            }
        }

        // Thumbnail Click Logic
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', function () {
                updateMainImage(index);
            });
        });

        // Arrow Click Logic
        if (sliderPrev) {
            sliderPrev.addEventListener('click', (e) => {
                e.preventDefault();
                updateMainImage(currentImageIndex - 1);
            });
        }

        if (sliderNext) {
            sliderNext.addEventListener('click', (e) => {
                e.preventDefault();
                updateMainImage(currentImageIndex + 1);
            });
        }

        // Set initial thumb border
        if (thumbnails[0]) {
            thumbnails[0].parentElement.classList.add('border-brand-black');
        }
    }

    // Quantity Selector (+/- Buttons) for Product Page AND Cart
    // Using delegation or specific selectors

    function updateQuantity(input, change) {
        let value = parseInt(input.value) || 1;
        const minValue = parseInt(input.getAttribute('min')) || 1;
        const maxValue = parseInt(input.getAttribute('max')) || 10;

        let newValue = value + change;

        if (newValue >= minValue && newValue <= maxValue) {
            input.value = newValue;
            // Trigger change event for auto-update in cart
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const input = this.parentElement.querySelector('.qty-input');
            if (!input) return; // Should be in the same container or found via ID?

            // If button has data-id, we might need to find input by ID (cart style)
            // If button is sibling (product page style)

            let targetInput = input;

            if (this.classList.contains('minus')) {
                updateQuantity(targetInput, -1);
            } else if (this.classList.contains('plus')) {
                updateQuantity(targetInput, 1);
            }
        });
    });

    // Wishlist Toggle
    const wishlistBtn = document.querySelector('.wishlist-toggle');
    if (wishlistBtn) {
        // Set initial style based on data attribute
        const isInWishlist = wishlistBtn.getAttribute('data-in-wishlist') === 'true';
        const icon = wishlistBtn.querySelector('.wishlist-icon');

        if (isInWishlist) {
            wishlistBtn.style.color = '#ff4757';
            wishlistBtn.style.borderColor = '#ff4757';
        }

        wishlistBtn.addEventListener('click', function () {
            const isCurrentlyIn = this.getAttribute('data-in-wishlist') === 'true';
            const url = isCurrentlyIn ? this.getAttribute('data-remove-url') : this.getAttribute('data-add-url');

            fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Toggle state
                        const newState = !isCurrentlyIn;
                        this.setAttribute('data-in-wishlist', newState);

                        if (newState) {
                            // icon.textContent = '💖'; // Don't replace SVG content
                            this.style.color = '#ff4757';
                            this.style.borderColor = '#ff4757';
                            icon.classList.add('fill-red-500', 'text-red-500');
                            if (window.showToast) window.showToast('Добавлено в избранное');
                        } else {
                            // icon.textContent = '❤';
                            this.style.color = '';
                            this.style.borderColor = '';
                            icon.classList.remove('fill-red-500', 'text-red-500');
                            if (window.showToast) window.showToast('Удалено из избранного', 'info');
                        }

                        // Update Header Badge
                        const wishlistBadge = document.querySelector('.wishlist-badge');
                        if (wishlistBadge) {
                            wishlistBadge.textContent = data.count;
                            if (data.count > 0) {
                                wishlistBadge.style.display = 'flex';
                            } else {
                                wishlistBadge.style.display = 'none';
                            }
                        }
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }

    // Helper to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // === Cart Auto-Update Logic (AJAX) ===

    // 1. Intercept "Add to Cart" forms for AJAX submission
    const ajaxCartForms = document.querySelectorAll('.ajax-cart-form');
    ajaxCartForms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const url = this.action;
            const formData = new FormData(this);

            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if (window.showToast) window.showToast('Добавлено в корзину');

                        // Update Cart Badge
                        const cartBadge = document.querySelector('.cart-badge');
                        if (cartBadge) {
                            cartBadge.textContent = data.cart_count;
                            cartBadge.classList.toggle('hidden', data.cart_count === 0);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart:', error);
                    if (window.showToast) window.showToast('Ошибка при добавлении', 'error');
                });
        });
    });

    // 2. Quantity auto-update (Cart cart_detail page)
    const cartQuantityInputs = document.querySelectorAll('.cart-item .qty-input');
    cartQuantityInputs.forEach(input => {
        input.addEventListener('change', function () {
            const form = this.closest('form');
            if (!form) return;

            const url = form.action;
            const formData = new FormData(form);

            // Add override flag if not present (usually handled by hidden input)
            // formData.append('override', 'True'); 

            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update Item Total Price
                        const productId = this.getAttribute('data-product-id');
                        const itemTotalEl = document.querySelector(`.item-total-price[data-product-id="${productId}"]`);
                        if (itemTotalEl) {
                            itemTotalEl.textContent = `${data.item_total_price} ₽`;
                        }

                        // Update Cart Badge
                        const cartBadge = document.querySelector('.cart-badge');
                        if (cartBadge) {
                            cartBadge.textContent = data.cart_count;
                            cartBadge.classList.toggle('hidden', data.cart_count === 0);
                        }

                        // Update Cart Summary Count
                        const cartCountSummary = document.getElementById('cart-count-summary');
                        if (cartCountSummary) {
                            cartCountSummary.textContent = `Товары (${data.cart_count})`;
                        }

                        // Update Cart Total Summary
                        const cartTotalSummary = document.getElementById('cart-total-summary');
                        if (cartTotalSummary) {
                            cartTotalSummary.textContent = `${data.cart_total_price} ₽`;
                        }

                        // Update Final Total
                        const cartFinalTotal = document.getElementById('cart-final-total');
                        if (cartFinalTotal) {
                            cartFinalTotal.textContent = `${data.cart_total_price} ₽`;
                        }
                    }
                })
                .catch(error => console.error('Error updating cart:', error));
        });
    });
    // === Wishlist Sidebar Logic ===
    const wishlistSidebar = document.getElementById('wishlistSidebar');
    const wishlistOverlay = document.getElementById('wishlistOverlay');
    const wishlistPanel = document.getElementById('wishlistPanel');
    const closeWishlistBtn = document.getElementById('closeWishlistBtn');
    const wishlistContent = document.getElementById('wishlistContent');
    const wishlistNavIcon = document.getElementById('wishlist-nav-link');

    function openWishlist() {
        if (!wishlistSidebar) return;

        // Show container
        wishlistSidebar.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Animate in
        // Small timeout to ensure display:block works before transition starts
        requestAnimationFrame(() => {
            wishlistOverlay.classList.remove('opacity-0');
            wishlistPanel.classList.remove('translate-x-full');
        });

        // Fetch content
        fetch('/wishlist/?modal=true', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.text())
            .then(html => {
                if (wishlistContent) {
                    wishlistContent.innerHTML = html;
                    lucide.createIcons(); // Re-init icons for new content
                    attachWishlistEvents(); // Re-attach events for new content
                }
            })
            .catch(error => {
                console.error('Error loading wishlist:', error);
                if (wishlistContent) wishlistContent.innerHTML = '<p class="text-center py-10 text-gray-400">Ошибка загрузки</p>';
            });
    }

    function closeWishlist() {
        if (!wishlistSidebar) return;

        // Animate out
        wishlistOverlay.classList.add('opacity-0');
        wishlistPanel.classList.add('translate-x-full');
        document.body.style.overflow = '';

        // Hide container after transition
        setTimeout(() => {
            wishlistSidebar.classList.add('hidden');
        }, 500); // Match duration-500
    }

    function attachWishlistEvents() {
        // Handle Remove Buttons inside Sidebar
        const removeButtons = wishlistContent.querySelectorAll('.remove-from-wishlist');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const url = this.getAttribute('data-remove-url');
                const productCard = this.closest('.cart-item');

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Remove item from DOM with animation
                            productCard.style.opacity = '0';
                            setTimeout(() => {
                                productCard.remove();
                                // Check if empty
                                if (wishlistContent.querySelectorAll('.cart-item').length === 0) {
                                    wishlistContent.innerHTML = `
                                        <div class="empty-wishlist">
                                            <h2 class="empty-wishlist-title">Список пуст</h2>
                                            <p class="empty-wishlist-text">Добавьте понравившиеся товары</p>
                                            <a href="/" class="continue-btn" onclick="closeWishlist()">Перейти в каталог</a>
                                        </div>`;
                                }
                            }, 300);

                            // Update Header Badge
                            const wishlistBadge = document.querySelector('.wishlist-badge');
                            if (wishlistBadge) {
                                wishlistBadge.textContent = data.count;
                                if (data.count > 0) {
                                    wishlistBadge.style.display = 'flex';
                                } else {
                                    wishlistBadge.style.display = 'none';
                                }
                            }

                            // Update Product Page Heart if open
                            const pageHeart = document.querySelector(`.wishlist-toggle[data-product-id="${this.getAttribute('data-product-id')}"]`);
                            if (pageHeart) {
                                pageHeart.setAttribute('data-in-wishlist', 'false');
                                pageHeart.querySelector('.wishlist-icon').textContent = '❤';
                                pageHeart.style.color = '';
                                pageHeart.style.borderColor = '';
                            }
                        }
                    })
                    .catch(error => console.error('Error removing item:', error));
            });
        });

        // Handle Add to Cart from Wishlist
        const addToCartButtons = wishlistContent.querySelectorAll('.add-to-cart-from-wishlist');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const url = this.getAttribute('data-add-url');
                const originalText = this.innerHTML; // Save icon + text

                // Show loading state?

                const formData = new FormData();
                formData.append('quantity', 1);
                formData.append('override', 'False'); // Add to existing

                fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Update Cart Badge
                            const cartBadge = document.querySelector('.cart-badge');
                            if (cartBadge) {
                                cartBadge.textContent = data.cart_count;
                                cartBadge.classList.toggle('hidden', data.cart_count === 0);
                            }

                            // Visual Feedback - Persistent
                            this.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i> В корзине`;
                            this.classList.remove('text-brand-black', 'hover:text-gray-600');
                            this.classList.add('text-green-600', 'cursor-default');
                            this.disabled = true;
                            lucide.createIcons(); // Re-init check icon
                        }
                    })
                    .catch(error => console.error('Error adding to cart:', error));
            });
        });
    }

    // Attach to Nav Icon
    if (wishlistNavIcon) {
        wishlistNavIcon.addEventListener('click', function (e) {
            e.preventDefault();
            openWishlist();
        });
    }

    // Close Events
    if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlist);
    if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlist);

    // Expose close function globally for the "Continue Shopping" button
    window.closeWishlist = closeWishlist;

    // === Scroll Animations (IntersectionObserver) ===
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    if (scrollElements.length > 0) {
        // Use IntersectionObserver for better performance
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, observerOptions);

        scrollElements.forEach(el => scrollObserver.observe(el));
    }

    // === Scroll to Top Button ===
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollToTopBtn.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            } else {
                scrollToTopBtn.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // === Photo Lightbox ===
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    window.openLightbox = function (src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            lightbox.classList.remove('opacity-0');
            lightboxImg.classList.remove('scale-95');
            lightboxImg.classList.add('scale-100');
        });
    };

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('opacity-0');
        lightboxImg.classList.remove('scale-100');
        lightboxImg.classList.add('scale-95');
        document.body.style.overflow = '';

        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
            lightboxImg.src = '';
        }, 300);
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });

    // === Category Filtering ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');

    if (filterBtns.length > 0 && productItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Update active state
                filterBtns.forEach(b => {
                    b.classList.remove('active', 'text-brand-black', 'border-brand-black');
                    b.classList.add('text-gray-400', 'border-transparent');
                });
                this.classList.add('active', 'text-brand-black', 'border-brand-black');
                this.classList.remove('text-gray-400', 'border-transparent');

                const filterValue = this.getAttribute('data-filter');

                productItems.forEach(item => {
                    item.classList.add('opacity-0', 'translate-y-10'); // trigger hide transition

                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        setTimeout(() => {
                            item.style.display = 'flex';
                            // small delay to let display block apply before transitioning opacity
                            requestAnimationFrame(() => {
                                item.classList.remove('opacity-0', 'translate-y-10');
                            });
                        }, 300); // match transition duration roughly
                    } else {
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
});
