// script.js - সম্পূর্ণ আপডেটেড ভার্সন (ব্রেকিং নিউজ ফিক্স সহ)

console.log('🔴 script.js লোড হচ্ছে...');
console.log('📅 সময়:', new Date().toLocaleString());

// ========================
// GLOBAL VARIABLES
// ========================
let newsData = [];
let filteredNews = [];
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentFontSize = localStorage.getItem('fontSize') || 16;
let currentCategory = 'সর্বশেষ';
let searchTimeout;

console.log('✅ গ্লোবাল ভেরিয়েবল তৈরি হয়েছে');

// ========================
// DOM ELEMENTS
// ========================
console.log('🔍 DOM এলিমেন্টস খুঁজছি...');

const body = document.body;
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const darkModeToggle = document.getElementById('darkmode-toggle');
const fontIncrease = document.getElementById('font-increase');
const fontDecrease = document.getElementById('font-decrease');
const searchToggle = document.getElementById('search-toggle');
const searchContainer = document.getElementById('search-container');
const searchInput = document.getElementById('search-input');
const searchClose = document.getElementById('search-close');
const suggestionsBox = document.getElementById('suggestions-box');
const loginBtn = document.getElementById('login-btn');
const categoryBar = document.getElementById('categoryBar');
const categoryItems = document.querySelectorAll('.cat-item');
const tickerContent = document.getElementById('ticker-content');
const mainContent = document.getElementById('main-content');
const backBtn = document.getElementById('back-to-top');
const newsletterForm = document.getElementById('newsletter-form');
const homeLink = document.getElementById('home-link');

console.log('📌 navMenu:', navMenu ? 'পাওয়া গেছে' : 'পাওয়া যায়নি');
console.log('📌 hamburger:', hamburger ? 'পাওয়া গেছে' : 'পাওয়া যায়নি');
console.log('📌 mainContent:', mainContent ? 'পাওয়া গেছে' : 'পাওয়া যায়নি');
console.log('📌 tickerContent:', tickerContent ? 'পাওয়া গেছে' : 'পাওয়া যায়নি');

// ========================
// INITIALIZATION
// ========================
console.log('🚀 DOM কন্টেন্ট লোড হওয়ার অপেক্ষায়...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM সম্পূর্ণ লোড হয়েছে');
    console.log('📊 ডেটা লোড করা শুরু...');
    
    loadNewsData();
    setupEventListeners();
    applyFontSize(currentFontSize);
    checkDarkModePreference();
    setupPWA();
    startBreakingTickerUpdate(); // Start periodic updates
    
    console.log('🎯 ইনিশিয়ালাইজেশন সম্পূর্ণ');
});

// ========================
// LOAD JSON DATA
// ========================
async function loadNewsData() {
    console.log('⏳ JSON ডেটা লোড হচ্ছে...');
    
    showSkeletonLoader();
    
    try {
        console.log('📡 ফেচ করছি: data.json');
        const response = await fetch('data.json?' + new Date().getTime()); // Cache busting
        
        console.log('📨 রেসপন্স স্ট্যাটাস:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 JSON ডেটা পাওয়া গেছে:', data);
        
        // Check data structure
        if (Array.isArray(data)) {
            newsData = data;
            console.log('✅ ডেটা অ্যারে ফরম্যাটে আছে, আইটেম সংখ্যা:', newsData.length);
        } else if (data.news && Array.isArray(data.news)) {
            newsData = data.news;
            console.log('✅ ডেটা অবজেক্ট ফরম্যাটে আছে, news অ্যারে:', newsData.length);
        } else {
            console.error('❌ অজানা ডেটা ফরম্যাট:', data);
            throw new Error('Invalid data format');
        }
        
        if (newsData.length === 0) {
            throw new Error('No data found');
        }
        
        // Add default values if missing
        newsData = newsData.map((item, index) => {
            return {
                ...item,
                id: item.id || index + 1,
                views: item.views || Math.floor(Math.random() * 5000) + 100,
                date: item.date || new Date().toISOString().split('T')[0],
                type: item.type || 'article',
                breaking: item.breaking || false
            };
        });
        
        console.log('🔄 ডেটা প্রসেস করা হয়েছে:', newsData);
        console.log('📊 প্রথম আইটেম:', newsData[0]);
        
        // Count breaking news
        const breakingCount = newsData.filter(item => item.breaking).length;
        console.log(`📢 ব্রেকিং নিউজ: ${breakingCount}টি`);
        
        // Test render
        console.log('🎨 হোম পেজ রেন্ডার করা শুরু...');
        renderHomePage();
        
        console.log('📰 ব্রেকিং টিকার সেটআপ...');
        setupBreakingTicker();
        
        console.log('🔍 সার্চ সাজেশন সেটআপ...');
        setupSearchSuggestions();
        
        console.log('✅ সবকিছু সফলভাবে লোড হয়েছে!');
        
    } catch (error) {
        console.error('❌ এরর লোডিং নিউজ:', error);
        console.error('🔍 এরর ডিটেলস:', error.message);
        
        // Show more helpful error message
        let errorMessage = 'সংবাদ লোড করতে সমস্যা হচ্ছে। ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'data.json ফাইলটি খুঁজে পাওয়া যাচ্ছে না। নিশ্চিত করুন ফাইলটি একই ফোল্ডারে আছে।';
        } else if (error.message.includes('JSON')) {
            errorMessage += 'JSON ফরম্যাট সঠিক নয়।';
        } else {
            errorMessage += error.message;
        }
        
        showError(errorMessage);
        
        // Try to load sample data as fallback
        console.log('⚠️ ফallback ডেটা লোড করার চেষ্টা...');
        loadSampleData();
    }
}

// Fallback sample data
function loadSampleData() {
    console.log('📊 স্যাম্পল ডেটা লোড করা হচ্ছে...');
    
    newsData = [
        {
            id: 1,
            title: "বাংলাদেশের অর্থনীতি চাঙ্গা করতে নতুন উদ্যোগ, বিশেষ অর্থনৈতিক অঞ্চল ঘোষণা",
            summary: "সরকার দেশের অর্থনীতি পুনরুদ্ধারে পাঁচটি বিশেষ প্রকল্প হাতে নিয়েছে। এসব প্রকল্পে প্রায় ৫০০০ কোটি টাকা বরাদ্দ দেওয়া হবে।",
            content: "ঢাকা, ১৫ মার্চ: সরকার দেশের অর্থনীতি পুনরুদ্ধারে পাঁচটি বিশেষ প্রকল্প হাতে নিয়েছে। প্রধানমন্ত্রীর কার্যালয় থেকে জানানো হয়, এসব প্রকল্পে প্রায় ৫০০০ কোটি টাকা বরাদ্দ দেওয়া হবে। প্রধান অর্থনৈতিক উপদেষ্টা বলেন, 'আমরা আশাবাদী যে এই প্রকল্পগুলো বাস্তবায়িত হলে দেশের অর্থনীতি আবারও ঘুরে দাঁড়াবে।' নতুন অর্থনৈতিক অঞ্চল তৈরি হবে চট্টগ্রাম ও সিলেটে। এতে কর্মসংস্থান তৈরি হবে প্রায় ৫ লক্ষ লোকের।",
            image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=500",
            category: "জাতীয়",
            date: "২০২৫-০৩-১৫",
            views: 1250,
            breaking: true,
            type: "article"
        },
        {
            id: 2,
            title: "চ্যাম্পিয়ন্স ট্রফি: বাংলাদেশের পরবর্তী ম্যাচ আজ ভারতের মুখোমুখি",
            summary: "বাংলাদেশ দল আজ মুখোমুখি হবে ভারতের। টস হবে বিকেল ৩টায়।",
            content: "দুবাই, ১৫ মার্চ: চ্যাম্পিয়ন্স ট্রফিতে বাংলাদেশ দল আজ মুখোমুখি হবে ভারতের। টস হবে বিকেল ৩টায় এবং ম্যাচ শুরু হবে ৩:৩০টায়। অধিনায়ক নাজমুল হোসেন শান্ত বলেন, 'আমরা ভালো অবস্থায় আছি এবং জয়ের জন্য প্রস্তুত।' ভারতীয় অধিনায়ক রোহিত শর্মা বলেন, 'বাংলাদেশ সবসময় কঠিন প্রতিপক্ষ, আমরা সিরিয়াস আছি।'",
            image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500",
            category: "খেলাধুলা",
            date: "২০২৫-০৩-১৫",
            views: 3450,
            breaking: true,
            type: "article"
        },
        {
            id: 3,
            title: "ঈদ উল ফিতর কবে? তারিখ ঘোষণা",
            summary: "জাতীয় চাঁদ দেখা কমিটি জানিয়েছে, ঈদের সম্ভাব্য তারিখ ২ এপ্রিল।",
            content: "ঢাকা, ১৪ মার্চ: জাতীয় চাঁদ দেখা কমিটি জানিয়েছে, ঈদ উল ফিতরের সম্ভাব্য তারিখ ২ এপ্রিল। ইসলামিক ফাউন্ডেশনের চেয়ারম্যান বলেন, 'চাঁদ দেখার ওপর নির্ভর করে তারিখ পরিবর্তন হতে পারে। আমরা সবাইকে চাঁদ দেখার অনুরোধ জানাচ্ছি।' ৩০ দিন রোজা রাখার পর পালিত হবে এই ধর্মীয় উৎসব।",
            image: "https://images.unsplash.com/photo-1584278860047-22db9ff82e5f?w=500",
            category: "জাতীয়",
            date: "২০২৫-০৩-১৪",
            views: 2100,
            breaking: true,
            type: "article"
        },
        {
            id: 4,
            title: "ঢাকায় ফ্লাইওভার নির্মাণ শুরু",
            summary: "যানজট নিরসনে মহাখালীতে নতুন ফ্লাইওভারের কাজ শুরু।",
            content: "ঢাকা, ১৩ মার্চ: রাজধানীর মহাখালীতে নতুন ফ্লাইওভারের নির্মাণ কাজ শুরু হয়েছে। এই প্রকল্প বাস্তবায়নে ৮০০ কোটি টাকা ব্যয় হবে বলে জানিয়েছে সেতু বিভাগ। প্রকল্প পরিচালক বলেন, '২০২৬ সালের মধ্যে কাজ শেষ হবে। এতে মহাখালী এলাকায় যানজট কমবে।'",
            image: "https://images.unsplash.com/photo-1574085975022-7a2e7d10e5a2?w=500",
            category: "শহর",
            date: "২০২৫-০৩-১৩",
            views: 890,
            breaking: false,
            type: "article"
        },
        {
            id: 5,
            title: "ভারতে বাংলাদেশী হাইকমিশনারের সংবাদ সম্মেলন",
            summary: "দিল্লিতে বাংলাদেশী হাইকমিশনার সংবাদ সম্মেলনে দেশের অগ্রগতি তুলে ধরেছেন।",
            content: "দিল্লি: ভারতের হাইকমিশনার মোস্তাফিজুর রহমান দিল্লিতে এক সংবাদ সম্মেলনে বাংলাদেশের উন্নয়ন তুলে ধরেন। তিনি বলেন, 'বাংলাদেশ-ভারত সম্পর্ক নতুন উচ্চতায় পৌঁছেছে। দ্বিপাক্ষিক বাণিজ্য ১৫ বিলিয়ন ডলার ছাড়িয়েছে।'",
            image: "https://images.unsplash.com/photo-1577495508048-b635879837f2?w=500",
            category: "আন্তর্জাতিক",
            date: "২০২৫-০৩-১২",
            views: 760,
            breaking: false,
            type: "video"
        }
    ];
    
    console.log('✅ স্যাম্পল ডেটা লোড হয়েছে:', newsData);
    renderHomePage();
    setupBreakingTicker();
}

// Show Skeleton Loader
function showSkeletonLoader() {
    console.log('🦴 স্কেলিটন লোডার দেখানো হচ্ছে');
    
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="skeleton-loader">
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
                <div class="skeleton-card"></div>
            </div>
        `;
    } else {
        console.error('❌ mainContent এলিমেন্ট পাওয়া যায়নি');
    }
}

// Show Error
function showError(message) {
    console.error('❌ এরর দেখানো হচ্ছে:', message);
    
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="error-container" style="text-align: center; padding: 3rem; background: var(--card-bg); border-radius: 8px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h2 style="color: var(--primary); margin-bottom: 1rem;">ওহ! কিছু সমস্যা হয়েছে</h2>
                <p style="margin-bottom: 1.5rem;">${message}</p>
                <p style="margin-bottom: 2rem; font-size: 0.9rem;">কনসোল চেক করুন (F12) আরও বিস্তারিত জানতে</p>
                <button onclick="location.reload()" style="background: var(--primary); color: white; border: none; padding: 0.8rem 2rem; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-redo"></i> পুনরায় চেষ্টা করুন
                </button>
            </div>
        `;
    }
}

// ========================
// BREAKING NEWS TICKER - আপডেটেড ভার্সন
// ========================
function setupBreakingTicker() {
    console.log('📰 ব্রেকিং টিকার সেটআপ করা হচ্ছে...');
    
    if (!tickerContent) {
        console.error('❌ tickerContent এলিমেন্ট পাওয়া যায়নি');
        return;
    }
    
    // Get breaking news
    const breakingNews = newsData.filter(item => item.breaking === true);
    
    console.log('📢 ব্রেকিং নিউজ পাওয়া গেছে:', breakingNews.length);
    
    if (breakingNews.length > 0) {
        // Display multiple breaking news
        let tickerHtml = '';
        
        breakingNews.forEach((news, index) => {
            tickerHtml += `<span class="ticker-item" data-id="${news.id}">${news.title}</span>`;
            
            // Add separator if not last item
            if (index < breakingNews.length - 1) {
                tickerHtml += `<span class="ticker-separator">●</span>`;
            }
        });
        
        tickerContent.innerHTML = tickerHtml;
        
        // Add click handlers to ticker items
        document.querySelectorAll('.ticker-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const newsId = item.dataset.id;
                console.log('🔔 টিকার আইটেম ক্লিক করা হয়েছে:', newsId);
                
                const news = newsData.find(n => n.id == newsId);
                if (news) {
                    showNewsDetail(newsId);
                }
            });
        });
        
        // Add hover pause functionality
        const tickerWrapper = document.querySelector('.ticker-wrapper');
        if (tickerWrapper) {
            tickerWrapper.addEventListener('mouseenter', () => {
                tickerContent.style.animationPlayState = 'paused';
            });
            
            tickerWrapper.addEventListener('mouseleave', () => {
                tickerContent.style.animationPlayState = 'running';
            });
        }
        
        console.log(`✅ ${breakingNews.length}টি ব্রেকিং নিউজ টিকারে যোগ করা হয়েছে`);
    } else {
        // If no breaking news, show latest news
        console.log('⚠️ কোন ব্রেকিং নিউজ নেই, সর্বশেষ সংবাদ দেখানো হচ্ছে');
        
        const latestNews = newsData.slice(0, 5);
        let tickerHtml = '';
        
        latestNews.forEach((news, index) => {
            tickerHtml += `<span class="ticker-item" data-id="${news.id}">${news.title}</span>`;
            
            if (index < latestNews.length - 1) {
                tickerHtml += `<span class="ticker-separator">●</span>`;
            }
        });
        
        tickerContent.innerHTML = tickerHtml;
        
        // Add click handlers
        document.querySelectorAll('.ticker-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const newsId = item.dataset.id;
                showNewsDetail(newsId);
            });
        });
    }
    
    // Adjust animation speed based on content length
    adjustTickerSpeed();
}

// Adjust ticker animation speed
function adjustTickerSpeed() {
    if (!tickerContent) return;
    
    const contentWidth = tickerContent.scrollWidth;
    const containerWidth = tickerContent.parentElement?.clientWidth || 1000;
    
    // Calculate animation duration based on content length
    // Longer content = longer duration
    const baseDuration = 25; // seconds
    const contentRatio = contentWidth / containerWidth;
    const duration = Math.max(20, Math.min(45, Math.floor(contentRatio * 15)));
    
    tickerContent.style.animation = `ticker ${duration}s linear infinite`;
    console.log(`⏱️ টিকার অ্যানিমেশন সময়: ${duration} সেকেন্ড`);
}

// Start periodic ticker updates
function startBreakingTickerUpdate() {
    // Update ticker every 5 minutes to check for new breaking news
    setInterval(() => {
        console.log('⏰ ব্রেকিং নিউজ আপডেট চেক করা হচ্ছে...');
        setupBreakingTicker();
    }, 5 * 60 * 1000); // 5 minutes
}

// ========================
// RENDER HOME PAGE
// ========================
function renderHomePage() {
    console.log('🏠 হোম পেজ রেন্ডার করা শুরু...');
    
    if (!newsData || newsData.length === 0) {
        console.warn('⚠️ কোনো ডেটা নেই');
        return;
    }

    // Sort by date (latest first)
    const sortedByDate = [...newsData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // Most viewed
    const mostViewed = [...newsData].sort((a, b) => b.views - a.views).slice(0, 6);

    // Latest news (take 6 for the layout)
    const latestNews = sortedByDate.slice(0, 6);

    // Get unique categories
    const categories = [...new Set(newsData
        .filter(item => item.type === 'article')
        .map(item => item.category)
    )].slice(0, 4);

    console.log('📊 রেন্ডার ডেটা:', {
        totalNews: newsData.length,
        latestCount: latestNews.length,
        mostViewedCount: mostViewed.length,
        categories: categories
    });

    let html = `
        <!-- Latest News Section with 3-column layout -->
        <section class="latest-news-section">
            <h2 class="category-title">
                <i class="fas fa-clock" style="color: var(--primary);"></i> সর্বশেষ সংবাদ
            </h2>
            
            <!-- 3-Column Grid Layout -->
            <div class="latest-news-grid">
                ${renderLatestNewsLayout(latestNews)}
            </div>
        </section>

        <!-- Most Popular Section - Grid Layout -->
        <section class="popular-section">
            <h2 class="category-title">
                <i class="fas fa-fire" style="color: var(--primary);"></i> সবচেয়ে পঠিত
            </h2>
            <div class="popular-grid">
                ${renderPopularLayout(mostViewed)}
            </div>
        </section>
    `;

    // Add category sections
    categories.forEach(category => {
        const categoryNews = newsData
            .filter(item => item.category === category && item.type === 'article')
            .slice(0, 5); // Take 5 for category layout
        
        if (categoryNews.length > 0) {
            html += `
                <section class="category-section" data-category="${category}">
                    <h2 class="category-title">
                        <i class="fas fa-folder" style="color: var(--primary);"></i> ${category}
                    </h2>
                    <div class="category-layout">
                        ${renderCategoryLayout(categoryNews)}
                    </div>
                    <div class="see-more-container">
                        <button class="see-more-btn" onclick="filterByCategory('${category}')">
                            আরও ${category} সংবাদ <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </section>
            `;
        }
    });

    // Add video section if any
    const videos = newsData.filter(item => item.type === 'video').slice(0, 4);
    if (videos.length > 0) {
        html += `
            <section class="video-section">
                <h2 class="category-title">
                    <i class="fas fa-video" style="color: var(--primary);"></i> ভিডিও
                </h2>
                <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                    ${videos.map(renderVideoCard).join('')}
                </div>
            </section>
        `;
    }

    // Add gallery section if any
    const galleries = newsData.filter(item => item.type === 'gallery').slice(0, 6);
    if (galleries.length > 0) {
        html += `
            <section class="gallery-section">
                <h2 class="category-title">
                    <i class="fas fa-images" style="color: var(--primary);"></i> ফটো গ্যালারি
                </h2>
                <div class="gallery-slider" style="display: flex; overflow-x: auto; gap: 1rem; padding: 1rem 0;">
                    ${galleries.map(renderGalleryItem).join('')}
                </div>
            </section>
        `;
    }

    mainContent.innerHTML = html;
    console.log('✅ হোম পেজ রেন্ডার সম্পূর্ণ');
}

// Render Latest News Layout - 3 Column Grid
function renderLatestNewsLayout(news) {
    if (!news || news.length === 0) return '<p>কোনো সংবাদ নেই</p>';
    
    // Take first 6 news
    const newsItems = news.slice(0, 6);
    
    let html = '<div class="grid-container">';
    
    newsItems.forEach((item, index) => {
        if (index === 0) {
            // First item - Large (2 columns)
            html += `
                <div class="grid-item grid-item-large" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-large">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <div class="news-card-content">
                            <span class="category-badge">${item.category}</span>
                            <h3>${item.title}</h3>
                            <p class="summary">${item.summary || item.title.substring(0, 120)}</p>
                            <div class="meta">
                                <i class="far fa-calendar"></i> ${formatDate(item.date)} | 
                                <i class="far fa-eye"></i> ${item.views}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } 
        else if (index === 1 || index === 2) {
            // Second and Third items - Medium (1 column each, side by side)
            html += `
                <div class="grid-item" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-medium">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <div class="news-card-content">
                            <span class="category-badge">${item.category}</span>
                            <h4>${item.title}</h4>
                            <div class="meta">
                                <i class="far fa-eye"></i> ${item.views}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        else {
            // Fourth and Fifth items - Text only (1 column each)
            html += `
                <div class="grid-item" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-text">
                        <div class="news-card-content">
                            <span class="category-badge">${item.category}</span>
                            <h4>${item.title}</h4>
                            <p class="summary">${(item.summary || item.title).substring(0, 80)}...</p>
                            <div class="meta">
                                <i class="far fa-calendar"></i> ${formatDate(item.date)} | 
                                <i class="far fa-eye"></i> ${item.views}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    // Add "See More" button at the end
    html += `
        <div class="grid-item see-more-item" onclick="filterByCategory('সর্বশেষ')">
            <div class="see-more-card">
                <i class="fas fa-arrow-right"></i>
                <span>আরও সংবাদ</span>
            </div>
        </div>
    `;
    
    html += '</div>';
    return html;
}

// Render Popular Layout
function renderPopularLayout(news) {
    if (!news || news.length === 0) return '<p>কোনো সংবাদ নেই</p>';
    
    let html = '<div class="popular-grid-container">';
    
    news.slice(0, 4).forEach((item, index) => {
        if (index === 0) {
            // First popular - Large
            html += `
                <div class="popular-item popular-item-large" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-large">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <div class="news-card-content">
                            <span class="category-badge">${item.category}</span>
                            <h3>${item.title}</h3>
                            <div class="meta">
                                <i class="far fa-eye"></i> ${item.views} বার পঠিত
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Other popular - Small
            html += `
                <div class="popular-item" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-small">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <div class="news-card-content">
                            <h4>${item.title}</h4>
                            <div class="meta">
                                <i class="far fa-eye"></i> ${item.views}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

// Render Category Layout
function renderCategoryLayout(news) {
    if (!news || news.length === 0) return '<p>কোনো সংবাদ নেই</p>';
    
    let html = '<div class="category-grid-container">';
    
    news.slice(0, 3).forEach((item, index) => {
        if (index === 0) {
            // First category news - Large
            html += `
                <div class="category-item category-item-large" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-large">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <div class="news-card-content">
                            <h3>${item.title}</h3>
                            <p class="summary">${item.summary || item.title.substring(0, 100)}</p>
                            <div class="meta">
                                <i class="far fa-calendar"></i> ${formatDate(item.date)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Other category news - Medium
            html += `
                <div class="category-item" onclick="showNewsDetail(${item.id})">
                    <div class="news-card-medium">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <div class="news-card-content">
                            <h4>${item.title}</h4>
                            <div class="meta">
                                <i class="far fa-eye"></i> ${item.views}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    return html;
}

// Render Card (for other sections)
function renderCard(item, size = 'medium') {
    return `
        <article class="card news-card" data-id="${item.id}" style="background: var(--card-bg); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow); cursor: pointer;">
            <img src="${item.image}" alt="${item.title}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;">
            <div class="card-content" style="padding: 1rem;">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${item.title}</h3>
                <p class="meta" style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">
                    <i class="far fa-calendar"></i> ${formatDate(item.date)} | 
                    <i class="far fa-eye"></i> ${item.views} | 
                    <i class="far fa-folder"></i> ${item.category}
                </p>
                <p class="summary" style="margin-bottom: 0.5rem;">${item.summary || item.title.substring(0, 100)}</p>
                <button class="bookmark-btn ${bookmarks.includes(item.id) ? 'active' : ''}" data-id="${item.id}" onclick="event.stopPropagation(); toggleBookmark(${item.id})" style="background: none; border: none; color: ${bookmarks.includes(item.id) ? '#ffd700' : '#999'}; cursor: pointer; font-size: 1.2rem;">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </article>
    `;
}

// Render Video Card
function renderVideoCard(video) {
    return `
        <div class="video-card card" data-id="${video.id}" onclick="showNewsDetail(${video.id})" style="background: var(--card-bg); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow); cursor: pointer;">
            <div class="video-thumb" style="position: relative;">
                <img src="${video.image}" alt="${video.title}" loading="lazy" style="width: 100%; height: 180px; object-fit: cover;">
                <div class="play-icon" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(155, 9, 13, 0.9); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="card-content" style="padding: 1rem;">
                <h4>${video.title}</h4>
                <p class="meta" style="font-size: 0.85rem; color: #666;">${formatDate(video.date)}</p>
            </div>
        </div>
    `;
}

// Render Gallery Item
function renderGalleryItem(item) {
    return `
        <div class="gallery-item" onclick="showNewsDetail(${item.id})" style="flex: 0 0 300px; scroll-snap-align: start; border-radius: 8px; overflow: hidden; position: relative; cursor: pointer; height: 200px;">
            <img src="${item.image}" alt="${item.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;">
            <div class="gallery-caption" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 1rem;">
                ${item.title}
            </div>
        </div>
    `;
}

// Format Date
function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('bn-BD', options);
    } catch (e) {
        return dateString;
    }
}

// Show News Detail
function showNewsDetail(id) {
    console.log('📖 নিউজ ডিটেইল দেখানো হচ্ছে:', id);
    
    const news = newsData.find(item => item.id == id);
    if (!news) {
        console.error('❌ নিউজ খুঁজে পাওয়া যায়নি:', id);
        return;
    }

    // Increase view count
    news.views = (news.views || 0) + 1;

    // Get related news
    const relatedNews = newsData
        .filter(item => item.category === news.category && item.id != news.id)
        .slice(0, 3);

    const html = `
        <article class="news-detail" style="background: var(--card-bg); border-radius: 8px; padding: 2rem; box-shadow: var(--shadow);">
            <h1 style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary);">${news.title}</h1>
            <div class="meta" style="color: #666; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #ddd;">
                <i class="far fa-calendar"></i> ${formatDate(news.date)} | 
                <i class="far fa-folder"></i> ${news.category} | 
                <i class="far fa-eye"></i> ${news.views} বার পঠিত
            </div>
            <img src="${news.image}" alt="${news.title}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px; margin:1rem 0;">
            <div class="content" style="font-size: 1.1rem; line-height: 1.8; margin: 2rem 0;">
                ${news.content || news.summary || news.title}
            </div>
            
            <!-- Rating System -->
            <div class="rating-section" style="background: var(--bg); padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
                <h3>রেটিং দিন</h3>
                <div class="stars" style="display: flex; gap: 0.5rem; margin: 1rem 0; font-size: 1.5rem;">
                    ${[1,2,3,4,5].map(i => `<i class="fas fa-star" data-rating="${i}" style="color: #ddd; cursor: pointer;"></i>`).join('')}
                </div>
                <p>গড় রেটিং: ${news.rating || 0}/5 (${news.ratingCount || 0} ভোট)</p>
            </div>
            
            <!-- Related News -->
            ${relatedNews.length > 0 ? `
                <div class="related-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--secondary);">
                    <h3>আরও পড়ুন</h3>
                    <div class="news-grid-small" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                        ${relatedNews.map(item => renderCard(item, 'small')).join('')}
                    </div>
                </div>
            ` : ''}
        </article>
    `;

    mainContent.innerHTML = html;
    setupRatingStars(news);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState({ id }, '', `#news-${id}`);
}

// Toggle Bookmark
function toggleBookmark(id) {
    console.log('🔖 বুকমার্ক টগল:', id);
    
    const index = bookmarks.indexOf(id);
    if (index === -1) {
        bookmarks.push(id);
        showNotification('বুকমার্কে যোগ করা হয়েছে');
    } else {
        bookmarks.splice(index, 1);
        showNotification('বুকমার্ক থেকে সরানো হয়েছে');
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkButtons();
}

// Update Bookmark Buttons
function updateBookmarkButtons() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        const id = parseInt(btn.dataset.id);
        btn.style.color = bookmarks.includes(id) ? '#ffd700' : '#999';
    });
}

// Show Notification
function showNotification(message) {
    console.log('🔔 নোটিফিকেশন:', message);
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #9b090d;
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 30px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Setup Event Listeners
function setupEventListeners() {
    console.log('🎧 ইভেন্ট লিসেনার সেটআপ করা হচ্ছে...');

    // Hamburger Menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            console.log('🍔 হ্যামবার্গার ক্লিক করা হয়েছে');
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    } else {
        console.error('❌ hamburger এলিমেন্ট পাওয়া যায়নি');
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });

    // Home link
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 হোম লিঙ্ক ক্লিক করা হয়েছে');
            renderHomePage();
            // Update active category
            document.querySelectorAll('.cat-item').forEach(item => {
                item.classList.toggle('active', item.dataset.category === 'সর্বশেষ');
            });
            // Close mobile menu if open
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    }

    // Dark Mode
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Font Size
    if (fontIncrease) {
        fontIncrease.addEventListener('click', () => {
            currentFontSize = Math.min(24, parseInt(currentFontSize) + 2);
            applyFontSize(currentFontSize);
        });
    }
    
    if (fontDecrease) {
        fontDecrease.addEventListener('click', () => {
            currentFontSize = Math.max(12, parseInt(currentFontSize) - 2);
            applyFontSize(currentFontSize);
        });
    }

    // Search
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            console.log('🔍 সার্চ টগল ক্লিক করা হয়েছে');
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', () => {
            searchContainer.classList.remove('active');
            suggestionsBox.classList.remove('active');
        });
    }

    // Close search on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchContainer.classList.remove('active');
            suggestionsBox.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Login/Logout
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (currentUser) {
                currentUser = null;
                loginBtn.innerHTML = '<i class="fas fa-user"></i>';
                showNotification('লগআউট করা হয়েছে');
            } else {
                const name = prompt('আপনার নাম দিন:');
                if (name) {
                    currentUser = { name: name };
                    loginBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
                    showNotification(`স্বাগতম, ${name}`);
                }
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        });
    }

    // Category clicks
    document.querySelectorAll('.cat-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = item.dataset.category;
            console.log('📁 ক্যাটাগরি ক্লিক:', category);
            filterByCategory(category);
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Nav menu links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            if (category) {
                filterByCategory(category);
                
                // Update active class in nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
            
            // Close mobile menu
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Scroll hide for category bar
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            categoryBar.classList.add('hide');
        } else {
            categoryBar.classList.remove('hide');
        }
        
        lastScrollTop = scrollTop;
        backBtn.classList.toggle('show', scrollTop > 300);
    });

    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Newsletter
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input').value;
            console.log('📧 নিউজলেটার সাবস্ক্রাইব:', email);
            showNotification('নিউজলেটারে সাবস্ক্রাইব করার জন্য ধন্যবাদ!');
            e.target.reset();
        });
    }

    // Handle browser back button
    window.addEventListener('popstate', () => {
        if (!location.hash) {
            renderHomePage();
        }
    });

    console.log('✅ ইভেন্ট লিসেনার সেটআপ সম্পূর্ণ');
}

// Filter by Category
function filterByCategory(category) {
    console.log('📁 ফিল্টার করছি:', category);
    
    currentCategory = category;
    
    // Update active class in category bar
    document.querySelectorAll('.cat-item').forEach(item => {
        item.classList.toggle('active', item.dataset.category === category);
    });
    
    // Update active class in nav menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.category === category);
    });

    if (category === 'সর্বশেষ') {
        renderHomePage();
        return;
    }

    const filtered = newsData.filter(item => 
        item.category === category
    );

    console.log(`📊 ${category} ক্যাটাগরিতে ${filtered.length}টি আইটেম পাওয়া গেছে`);

    if (filtered.length === 0) {
        mainContent.innerHTML = `<p style="text-align: center; padding: 2rem;">এই ক্যাটাগরিতে কোনো সংবাদ নেই।</p>`;
        return;
    }

    let html = `
        <section class="category-section">
            <h2 class="category-title" style="color: var(--primary); border-bottom: 3px solid var(--secondary); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
                <i class="fas fa-folder"></i> ${category}
            </h2>
            <div class="category-news-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${filtered.map(item => renderCard(item, 'medium')).join('')}
            </div>
        </section>
    `;

    mainContent.innerHTML = html;
}

// Setup Search Suggestions
function setupSearchSuggestions() {
    console.log('🔍 সার্চ সাজেশন সেটআপ...');
    
    if (!searchInput || !suggestionsBox) return;

    searchInput.addEventListener('input', debounce(function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            suggestionsBox.classList.remove('active');
            return;
        }

        const suggestions = newsData
            .filter(item => 
                item.title.toLowerCase().includes(query) || 
                (item.summary && item.summary.toLowerCase().includes(query))
            )
            .slice(0, 5);

        if (suggestions.length > 0) {
            suggestionsBox.innerHTML = suggestions.map(item => `
                <div class="suggestion-item" data-id="${item.id}" style="padding: 0.8rem 1rem; cursor: pointer; border-bottom: 1px solid #eee;">
                    <strong>${item.title}</strong><br>
                    <small>${item.category} | ${formatDate(item.date)}</small>
                </div>
            `).join('');
            suggestionsBox.classList.add('active');
        } else {
            suggestionsBox.innerHTML = '<div class="suggestion-item" style="padding: 0.8rem 1rem;">কিছু পাওয়া যায়নি</div>';
            suggestionsBox.classList.add('active');
        }
    }, 300));

    suggestionsBox.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem && suggestionItem.dataset.id) {
            const id = suggestionItem.dataset.id;
            console.log('📌 সাজেশন সিলেক্ট করা হয়েছে:', id);
            showNewsDetail(id);
            searchContainer.classList.remove('active');
            searchInput.value = '';
            suggestionsBox.classList.remove('active');
        }
    });
}

// Setup Rating Stars
function setupRatingStars(news) {
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            news.rating = ((news.rating || 0) * (news.ratingCount || 0) + rating) / ((news.ratingCount || 0) + 1);
            news.ratingCount = (news.ratingCount || 0) + 1;
            document.querySelector('.rating-section p').textContent = 
                `গড় রেটিং: ${news.rating.toFixed(1)}/5 (${news.ratingCount} ভোট)`;
            showNotification('আপনার রেটিং দেওয়া হয়েছে');
        });
    });
}

// Dark Mode
function toggleDarkMode() {
    console.log('🌙 ডার্ক মোড টগল');
    
    body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'disabled');
    }
}

function checkDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        console.log('🌙 ডার্ক মোড এনাবল করা আছে');
    }
}

// Font Size
function applyFontSize(size) {
    body.style.fontSize = size + 'px';
    localStorage.setItem('fontSize', size);
    console.log('🔤 ফন্ট সাইজ:', size);
}

// PWA Setup
function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('❌ Service Worker registration failed:', err));
    }
}

// Utility: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions global for onclick events
window.showNewsDetail = showNewsDetail;
window.toggleBookmark = toggleBookmark;
window.filterByCategory = filterByCategory;

console.log('🎉 script.js লোডিং সম্পূর্ণ!');