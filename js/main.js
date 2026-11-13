(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();

    var scrollAnimationFrame = null;
    var originalScrollBehavior = '';
    var scrollBehaviorOverridden = false;
    var restoreScrollBehavior = function () {
        if (scrollBehaviorOverridden) {
            document.documentElement.style.scrollBehavior = originalScrollBehavior;
            scrollBehaviorOverridden = false;
        }
    };
    var cancelScrollAnimation = function () {
        if (scrollAnimationFrame !== null) {
            cancelAnimationFrame(scrollAnimationFrame);
            scrollAnimationFrame = null;
        }
        restoreScrollBehavior();
    };
    var scrollToPosition = function (targetPosition) {
        cancelScrollAnimation();

        originalScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        scrollBehaviorOverridden = true;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.scrollTo(0, targetPosition);
            restoreScrollBehavior();
            return;
        }

        var startPosition = window.scrollY;
        var startTime = null;
        var duration = 550;
        var animateScroll = function (timestamp) {
            if (startTime === null) {
                startTime = timestamp;
            }

            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easedProgress = 1 - Math.pow(1 - progress, 3);
            window.scrollTo(0, startPosition + (targetPosition - startPosition) * easedProgress);

            if (progress < 1) {
                scrollAnimationFrame = requestAnimationFrame(animateScroll);
            } else {
                scrollAnimationFrame = null;
                restoreScrollBehavior();
            }
        };

        scrollAnimationFrame = requestAnimationFrame(animateScroll);
    };
    window.addEventListener('wheel', cancelScrollAnimation, { passive: true });
    window.addEventListener('touchstart', cancelScrollAnimation, { passive: true });


    // Navbar on scrolling
    var $navbar = $('.navbar');
    var updateNavigation = function () {
        var scrollTop = $(window).scrollTop();
        var navbarOffset = window.matchMedia('(min-width: 992px)').matches ? 90 : 72;
        var $navLinks = $('.navbar-nav a[href^="#"]');
        var activeLink = null;

        $navbar.toggleClass('navbar-visible', scrollTop > 300);

        $navLinks.each(function () {
            var $target = $(this.hash);
            if ($target.length && $target[0].getBoundingClientRect().top <= navbarOffset + 1) {
                activeLink = this;
            }
        });

        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
            activeLink = $navLinks.last()[0];
        }

        $navLinks.removeClass('active');
        if (activeLink) {
            $(activeLink).addClass('active');
        }
    };
    $(window).on('scroll', updateNavigation);
    updateNavigation();


    // Smooth scrolling on the navbar links
    $(".navbar-nav a[href^='#']").on('click', function (event) {
        var $target = $(this.hash);
        if (!$target.length) {
            return;
        }

        event.preventDefault();

        var navbarCollapse = document.getElementById('navbarCollapse');
        if (navbarCollapse.classList.contains('show')) {
            var collapseInstance = bootstrap.Collapse.getInstance(navbarCollapse);
            if (collapseInstance) {
                collapseInstance.hide();
            }
        }

        var navbarOffset = window.matchMedia('(min-width: 992px)').matches ? 90 : 72;
        var targetScrollTop = Math.max(0, $target[0].getBoundingClientRect().top + window.scrollY - navbarOffset);
        scrollToPosition(targetScrollTop);

    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow').css('display', 'flex');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        scrollToPosition(0);
        return false;
    });
    

    $(".expertise-carousel").owlCarousel({
        autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        autoplayTimeout: 4500,
        autoplayHoverPause: true,
        smartSpeed: 700,
        margin: 24,
        dots: true,
        loop: true,
        responsive: {
            0: { items: 1 },
            768: { items: 2 },
            1200: { items: 3 }
        }
    });

    $(".portfolio-carousel").owlCarousel({
        autoplay: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        autoplayTimeout: 5500,
        autoplayHoverPause: true,
        smartSpeed: 700,
        margin: 24,
        dots: true,
        loop: true,
        responsive: {
            0: { items: 1 },
            768: { items: 2 },
            1200: { items: 3 }
        }
    });

    var projectCategories = [
        { key: 'all', label: 'All projects' },
        { key: 'sports', label: 'Sports' },
        { key: 'sports-tech', label: 'Sports Tech' },
        { key: 'travel', label: 'Travel & Booking' },
        { key: 'finance', label: 'Finance' },
        { key: 'commerce', label: 'Commerce' },
        { key: 'health', label: 'Health & Wellness' },
        { key: 'entertainment', label: 'Entertainment' },
        { key: 'productivity', label: 'Productivity' },
        { key: 'communication', label: 'Communication' }
    ];
    var $projectFilters = $('#projectCategoryFilters');
    var $projectGallery = $('#allProjectsGrid');
    var filterProjects = function (category) {
        $projectFilters.find('[data-project-filter]').each(function () {
            var isSelected = $(this).attr('data-project-filter') === category;
            $(this)
                .toggleClass('btn-primary active', isSelected)
                .toggleClass('btn-outline-primary', !isSelected)
                .attr('aria-pressed', isSelected ? 'true' : 'false');
        });

        $projectGallery.children('.project-gallery-card').each(function () {
            $(this).toggle(category === 'all' || $(this).attr('data-category') === category);
        });
    };
    var populateProjectGallery = function () {
        if ($projectGallery.children().length) {
            filterProjects('all');
            return;
        }

        projectCategories.forEach(function (category, index) {
            var $button = $('<button>', {
                type: 'button',
                class: 'btn btn-sm ' + (index === 0 ? 'btn-primary active' : 'btn-outline-primary'),
                'data-project-filter': category.key,
                'aria-pressed': index === 0 ? 'true' : 'false'
            }).text(category.label);
            $projectFilters.append($button);
        });

        $('.portfolio-carousel .owl-item:not(.cloned) .portfolio-item').each(function () {
            var $source = $(this);
            var category = $source.attr('data-category');
            var categoryLabel = projectCategories.find(function (item) {
                return item.key === category;
            });
            if (!categoryLabel) {
                throw new Error('Missing project category for ' + $source.find('.portfolio-content h4').text());
            }

            var $sourceImage = $source.find('.portfolio-image').first();
            var $sourceContent = $source.find('.portfolio-content').first();
            var $sourceLinks = $source.find('.portfolio-btn a');
            var title = $sourceContent.find('h4').text().trim();
            var $card = $('<article>', {
                class: 'project-gallery-card',
                'data-category': category
            });
            var $imageLink = $('<a>', {
                class: 'project-gallery-image',
                href: $sourceImage.attr('src'),
                'data-lightbox': 'all-projects',
                'aria-label': 'Preview ' + title + ' screenshot'
            });
            $('<img>', {
                src: $sourceImage.attr('src'),
                alt: $sourceImage.attr('alt'),
                loading: 'lazy',
                decoding: 'async'
            }).appendTo($imageLink);

            var $body = $('<div>', { class: 'project-gallery-body' });
            $('<span>', { class: 'project-gallery-category' }).text(categoryLabel.label).appendTo($body);
            $('<h3>').text(title).appendTo($body);
            $('<p>').text($sourceContent.find('p').text().trim()).appendTo($body);

            var $appStoreLink = $sourceLinks.eq(1);
            if ($appStoreLink.length) {
                var $action = $('<a>', {
                    class: 'btn btn-outline-primary btn-sm',
                    href: $appStoreLink.attr('href'),
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }).text(($appStoreLink.attr('data-action-label') || 'View on App Store') + ' ');
                $('<i>', { class: 'fa fa-external-link-alt', 'aria-hidden': 'true' }).appendTo($action);
                $body.append($action);
            }

            $card.append($imageLink, $body);
            $projectGallery.append($card);
        });

        $projectFilters.on('click', '[data-project-filter]', function () {
            filterProjects($(this).attr('data-project-filter'));
        });
        filterProjects('all');
    };
    $('#viewAllProjects').on('click', populateProjectGallery);


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: true,
        loop: true,
    });

    
})(jQuery);

