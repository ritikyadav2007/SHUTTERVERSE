import { REALMS, ALL_CATEGORIES, MODERN_CATEGORIES, SACRED_ART_CATEGORIES } from './data/categories.js';
import { PHOTOS } from './data/photos.js';
import { HERITAGE_ITEMS } from './data/heritage.js';
import { SACRED_ART_ITEMS } from './data/sacredArt.js';
import { COLLECTIONS, TRENDING_STYLES } from './data/collections.js';
import { JOURNAL_ENTRIES } from './data/journal.js';

class Shutterverse {
  constructor() {
    this.currentDesign = 'design1'; // 'design1' (Editorial Collage) or 'design2' (Minimalist Masonry)
    this.activeRealm = 'all';       // 'all', 'photography', 'heritage', 'sacred-art'
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.favorites = this.loadFavorites();
    this.activeLightboxIndex = -1;
    this.isZoomed = false;

    // Master Archive combining Modern Photography, World History & Sacred Art
    this.masterArchive = this.buildMasterArchive();
    this.filteredItems = [...this.masterArchive];

    this.init();
  }

  buildMasterArchive() {
    // Tag each modern photo with collection 'photography' if not set
    const photosTagged = PHOTOS.map(p => ({
      ...p,
      collection: 'photography',
      section: 'Modern Photography',
      classification: p.classification || 'Authentic Photographic Masterwork',
      medium: `${p.exif?.camera || 'Medium Format'} • ${p.exif?.lens || 'Prime Lens'}`
    }));

    return [...photosTagged, ...HERITAGE_ITEMS, ...SACRED_ART_ITEMS];
  }

  init() {
    this.renderRealmTabs();
    this.renderCategoryBar();
    this.renderCollections();
    this.renderTrendingStyles();
    this.renderJournal();
    this.renderHeritageShowcase();
    this.renderSacredArtShowcase();
    this.updateGallery();
    this.updateFavoritesBadge();
    this.setupEventListeners();
    this.setupKeyboardNavigation();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- LOCAL STORAGE FAVORITES ---
  loadFavorites() {
    try {
      const stored = localStorage.getItem('shutterverse_favs_v2');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem('shutterverse_favs_v2', JSON.stringify(this.favorites));
      this.updateFavoritesBadge();
    } catch (e) {
      console.error(e);
    }
  }

  toggleFavorite(itemId, event) {
    if (event) event.stopPropagation();
    const index = this.favorites.indexOf(itemId);
    if (index === -1) {
      this.favorites.push(itemId);
    } else {
      this.favorites.splice(index, 1);
    }
    this.saveFavorites();
    this.updateGallery();
    this.renderFavoritesModalList();
    if (this.currentDetailItemId === itemId) {
      this.updateDetailModalFavState();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  clearFavorites() {
    this.favorites = [];
    this.saveFavorites();
    this.updateGallery();
    this.renderFavoritesModalList();
    if (window.lucide) window.lucide.createIcons();
  }

  updateFavoritesBadge() {
    const badge = document.getElementById('fav-count-badge');
    if (!badge) return;
    const count = this.favorites.length;
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // --- REALM SWITCHER (ALL, PHOTOGRAPHY, HERITAGE, SACRED ART) ---
  renderRealmTabs() {
    const container = document.getElementById('realm-tabs-bar');
    if (!container) return;

    container.innerHTML = REALMS.map(r => `
      <button 
        class="realm-tab ${r.id === this.activeRealm ? 'active' : ''}" 
        onclick="window.ShutterverseApp.setRealm('${r.id}')"
      >
        <span>${r.name}</span>
      </button>
    `).join('');
  }

  setRealm(realmId) {
    this.activeRealm = realmId;
    this.activeCategory = 'all';

    // Update active tab buttons
    document.querySelectorAll('.realm-tab').forEach((btn, idx) => {
      const r = REALMS[idx];
      if (r && r.id === realmId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCategoryBar();
    this.updateGallery();
  }

  // --- DESIGN SWITCHER (DESIGN A: EDITORIAL vs DESIGN B: MINIMALIST) ---
  setDesign(design) {
    this.currentDesign = design;
    const btn1 = document.getElementById('btn-design-1');
    const btn2 = document.getElementById('btn-design-2');
    const mbtn1 = document.getElementById('mobile-btn-design-1');
    const mbtn2 = document.getElementById('mobile-btn-design-2');
    const viewBtn1 = document.getElementById('view-mode-editorial');
    const viewBtn2 = document.getElementById('view-mode-minimal');
    const modeLabel = document.getElementById('gallery-mode-label');

    if (design === 'design1') {
      btn1?.classList.add('active');
      btn2?.classList.remove('active');
      mbtn1?.classList.add('active');
      mbtn2?.classList.remove('active');
      viewBtn1?.classList.add('active');
      viewBtn2?.classList.remove('active');
      if (modeLabel) modeLabel.textContent = 'Design A • Editorial Collage & Asymmetric Gallery';
    } else {
      btn1?.classList.remove('active');
      btn2?.classList.add('active');
      mbtn1?.classList.remove('active');
      mbtn2?.classList.add('active');
      viewBtn1?.classList.remove('active');
      viewBtn2?.classList.add('active');
      if (modeLabel) modeLabel.textContent = 'Design B • Minimalist Ivory Four-Column Portfolio';
    }

    this.renderGallery();
  }

  // --- CATEGORIES BAR ---
  renderCategoryBar() {
    const container = document.getElementById('category-filter-bar');
    if (!container) return;

    let availableCategories = ALL_CATEGORIES;
    if (this.activeRealm === 'photography') {
      availableCategories = [{ id: 'all', name: 'All Photography', realm: 'photography' }, ...MODERN_CATEGORIES];
    } else if (this.activeRealm === 'heritage') {
      availableCategories = [
        { id: 'all', name: 'All History & Heritage', realm: 'heritage' },
        { id: 'indus-valley', name: 'Indus Valley', realm: 'heritage' },
        { id: 'maurya-empire', name: 'Maurya Empire', realm: 'heritage' },
        { id: 'gupta-empire', name: 'Gupta Golden Age', realm: 'heritage' },
        { id: 'mughal-empire', name: 'Mughal Empire', realm: 'heritage' },
        { id: 'maratha-history', name: 'Maratha History', realm: 'heritage' },
        { id: 'indian-kings', name: 'Kings & Maharajas', realm: 'heritage' },
        { id: 'indian-queens', name: 'Queens & Maharanis', realm: 'heritage' },
        { id: 'freedom-movement', name: 'Freedom Movement', realm: 'heritage' },
        { id: 'egypt', name: 'Ancient Egypt', realm: 'heritage' },
        { id: 'greece', name: 'Ancient Greece', realm: 'heritage' },
        { id: 'rome', name: 'Ancient Rome', realm: 'heritage' },
        { id: 'china', name: 'Ancient China', realm: 'heritage' }
      ];
    } else if (this.activeRealm === 'sacred-art') {
      availableCategories = [
        { id: 'all', name: 'All Sacred Art', realm: 'sacred-art' },
        ...SACRED_ART_CATEGORIES
      ];
    }

    container.innerHTML = availableCategories.map(cat => {
      const isActive = cat.id === this.activeCategory;
      return `
        <button 
          class="cat-pill ${isActive ? 'active' : ''}" 
          data-category="${cat.id}"
          onclick="window.ShutterverseApp.setCategory('${cat.id}')"
        >
          <span>${cat.name}</span>
        </button>
      `;
    }).join('');
  }

  setCategory(catId) {
    this.activeCategory = catId;
    const ind = document.getElementById('active-category-indicator');
    if (ind) {
      ind.textContent = catId === 'all' ? 'All Masterworks' : catId;
    }

    document.querySelectorAll('.cat-pill').forEach(btn => {
      if (btn.getAttribute('data-category') === catId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.updateGallery();
  }

  // --- FILTER ARCHIVE ---
  updateGallery() {
    let result = [...this.masterArchive];

    // Filter by Realm
    if (this.activeRealm !== 'all') {
      result = result.filter(item => item.collection === this.activeRealm);
    }

    // Filter by Category
    if (this.activeCategory !== 'all') {
      const catLower = this.activeCategory.toLowerCase().replace(/-/g, ' ');
      result = result.filter(item => {
        const itemCat = (item.category || '').toLowerCase();
        const itemSubCat = (item.subCategory || '').toLowerCase();
        const itemSec = (item.section || '').toLowerCase();
        return itemCat.includes(catLower) || itemSubCat.includes(catLower) || itemSec.includes(catLower);
      });
    }

    // Filter by Search (Period, Country/Region, Subject, Medium, Artist)
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.period && item.period.toLowerCase().includes(q)) ||
        (item.region && item.region.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.medium && item.medium.toLowerCase().includes(q)) ||
        (item.artist && item.artist.toLowerCase().includes(q)) ||
        (item.photographer && item.photographer.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.story && item.story.toLowerCase().includes(q))
      );
    }

    this.filteredItems = result;

    const countDisplay = document.getElementById('items-count-display');
    if (countDisplay) {
      countDisplay.textContent = `Displaying ${result.length} curated masterwork${result.length === 1 ? '' : 's'}`;
    }

    const resetBtn = document.getElementById('filter-reset-btn');
    if (resetBtn) {
      if (this.activeCategory !== 'all' || this.activeRealm !== 'all' || this.searchQuery !== '') {
        resetBtn.classList.remove('hidden');
      } else {
        resetBtn.classList.add('hidden');
      }
    }

    const emptyState = document.getElementById('gallery-empty-state');
    const galleryContainer = document.getElementById('gallery-container');

    if (result.length === 0) {
      emptyState?.classList.remove('hidden');
      if (galleryContainer) galleryContainer.innerHTML = '';
    } else {
      emptyState?.classList.add('hidden');
      this.renderGallery();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --- RENDER GALLERY (DESIGN A vs DESIGN B) ---
  renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    if (this.currentDesign === 'design1') {
      this.renderDesignAEditorial(container);
    } else {
      this.renderDesignBMinimalist(container);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // DESIGN A: Large Editorial Collage & Asymmetric Masonry
  renderDesignAEditorial(container) {
    container.className = 'editorial-grid';

    const itemsHtml = this.filteredItems.map((item, idx) => {
      const isFav = this.favorites.includes(item.id);
      
      // Asymmetric layout logic
      let spanClass = 'col-span-12 md:col-span-4 min-h-[400px]';
      if (idx === 0) {
        spanClass = 'col-span-12 md:col-span-8 min-h-[580px]';
      } else if (idx === 3 || idx === 7 || idx === 11) {
        spanClass = 'col-span-12 md:col-span-8 min-h-[440px]';
      } else if (idx % 5 === 0) {
        spanClass = 'col-span-12 md:col-span-6 min-h-[460px]';
      }

      // Badge style based on collection
      let badgeClass = 'badge-classification';
      if (item.collection === 'heritage') badgeClass += ' badge-heritage';
      if (item.collection === 'sacred-art') badgeClass += ' badge-sacred';

      const tagText = item.classification || item.category;
      const subtitle = item.period || item.location || item.year || '';
      const creator = item.artist || item.photographer || 'Imperial Guild Masters';

      return `
        <div 
          class="editorial-card ${spanClass} group"
          onclick="window.ShutterverseApp.openDetail('${item.id}')"
        >
          <img 
            src="${item.imageUrl}" 
            alt="${item.title}" 
            loading="lazy"
            class="transition-transform duration-700 ease-out group-hover:scale-105"
          >
          
          <!-- Category / Classification Badge -->
          <div class="${badgeClass}">${tagText}</div>

          <!-- Quick Bookmark Heart Button -->
          <button 
            class="fav-btn ${isFav ? 'favorited' : ''}" 
            title="${isFav ? 'Remove from Saved' : 'Save to Favorites'}"
            onclick="window.ShutterverseApp.toggleFavorite('${item.id}', event)"
          >
            <i data-lucide="bookmark" class="w-4 h-4 ${isFav ? 'fill-current' : ''}"></i>
          </button>

          <!-- Small Elegant Text Overlay on Hover / Active -->
          <div class="editorial-overlay">
            <div class="text-[10px] tracking-widest uppercase text-[#B08D57] mb-1 flex items-center gap-2 font-sans font-semibold">
              <span>${item.category}</span>
              ${subtitle ? `<span>&bull;</span><span>${subtitle}</span>` : ''}
            </div>
            <h3 class="font-serif text-2xl lg:text-3xl font-light text-white leading-tight">
              ${item.title}
            </h3>
            <p class="text-xs text-white/80 font-sans mt-1">
              ${creator} &bull; ${item.region || item.location || ''}
            </p>
            <div class="mt-3 flex items-center gap-3">
              <button 
                class="text-[10px] uppercase tracking-widest text-white/90 border-b border-[#B08D57] pb-0.5 hover:text-[#B08D57] transition-colors"
                onclick="window.ShutterverseApp.openLightboxById('${item.id}', event)"
              >
                Inspect High Resolution &rarr;
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = itemsHtml;
  }

  // DESIGN B: Pure Minimalist Four-Column Ivory Portfolio
  renderDesignBMinimalist(container) {
    container.className = 'minimalist-masonry py-4';

    const itemsHtml = this.filteredItems.map((item) => {
      const isFav = this.favorites.includes(item.id);
      const creator = item.artist || item.photographer || 'Historical Master';
      const locOrPeriod = item.period || item.location || item.region || '';

      return `
        <div 
          class="minimal-item group"
          onclick="window.ShutterverseApp.openDetail('${item.id}')"
        >
          <div class="minimal-img-wrap">
            <img 
              src="${item.imageUrl}" 
              alt="${item.title}" 
              loading="lazy"
              class="transition-opacity duration-500 hover:opacity-95"
            >
            
            <!-- Bookmark Button -->
            <button 
              class="fav-btn ${isFav ? 'favorited' : ''}" 
              title="${isFav ? 'Remove from Saved' : 'Save to Favorites'}"
              onclick="window.ShutterverseApp.toggleFavorite('${item.id}', event)"
            >
              <i data-lucide="bookmark" class="w-4 h-4 ${isFav ? 'fill-current' : ''}"></i>
            </button>
          </div>

          <!-- Minimal Elegant Caption Below Image -->
          <div class="minimal-caption">
            <div class="flex items-baseline justify-between">
              <span class="minimal-meta">${item.category}</span>
              <span class="text-[9px] uppercase tracking-wider text-[#8E887E]">${item.date || item.year || ''}</span>
            </div>
            <h3 class="minimal-title mt-1">${item.title}</h3>
            <div class="text-[11px] text-[#5A5650] mt-0.5 font-sans flex items-center justify-between">
              <span>${creator}</span>
              <span class="text-[10px] text-[#8E887E] italic">${locOrPeriod}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = itemsHtml;
  }

  // --- HISTORY & HERITAGE DEDICATED SHOWCASE SECTION ---
  renderHeritageShowcase() {
    const container = document.getElementById('heritage-showcase-container');
    if (!container) return;

    const highlights = HERITAGE_ITEMS.slice(0, 4);
    container.innerHTML = highlights.map(item => `
      <div class="group bg-white border border-[#DFD8CC] p-4 flex flex-col justify-between cursor-pointer hover:border-[#B08D57] transition-all" onclick="window.ShutterverseApp.openDetail('${item.id}')">
        <div class="overflow-hidden aspect-[4/3] bg-[#E7E1D6] relative mb-4">
          <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          <div class="absolute top-2 left-2 bg-[#202020]/80 text-[#E7E1D6] text-[9px] uppercase tracking-widest px-2 py-0.5 backdrop-blur-sm">
            ${item.classification}
          </div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-widest text-[#6B2737] font-semibold block">${item.period}</span>
          <h4 class="font-serif text-lg text-[#202020] font-medium mt-1 group-hover:text-[#6B2737] transition-colors">${item.title}</h4>
          <p class="text-xs text-[#5A5650] font-sans mt-2 line-clamp-2">${item.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-[#ECE7DD] flex items-center justify-between text-[11px] text-[#8E887E]">
          <span>${item.region} &bull; ${item.date}</span>
          <span class="text-[#B08D57] font-semibold group-hover:translate-x-1 transition-transform">&rarr;</span>
        </div>
      </div>
    `).join('');
  }

  // --- SACRED ART DEDICATED SHOWCASE SECTION ---
  renderSacredArtShowcase() {
    const container = document.getElementById('sacred-art-showcase-container');
    if (!container) return;

    const highlights = SACRED_ART_ITEMS.slice(0, 4);
    container.innerHTML = highlights.map(item => `
      <div class="group bg-[#FFFFFF] border border-[#DFD8CC] p-5 flex flex-col justify-between cursor-pointer hover:border-[#6B2737] transition-all shadow-sm" onclick="window.ShutterverseApp.openDetail('${item.id}')">
        <div class="overflow-hidden aspect-[3/4] bg-[#E7E1D6] relative mb-4">
          <img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
          <div class="absolute top-2 left-2 bg-[#6B2737]/90 text-white text-[9px] uppercase tracking-widest px-2.5 py-0.5 backdrop-blur-sm">
            ${item.category}
          </div>
        </div>
        <div>
          <span class="text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold block">${item.subCategory}</span>
          <h4 class="font-serif text-xl text-[#202020] font-normal mt-1 leading-snug group-hover:text-[#6B2737] transition-colors">${item.title}</h4>
          <p class="text-xs text-[#5A5650] font-sans mt-2 line-clamp-3">${item.description}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-[#ECE7DD] flex items-center justify-between text-[11px] text-[#8E887E]">
          <span>${item.period} &bull; ${item.date}</span>
          <span class="text-[#6B2737] font-semibold group-hover:translate-x-1 transition-transform">Explore Iconography &rarr;</span>
        </div>
      </div>
    `).join('');
  }

  // --- SECTION 4: FEATURED COLLECTIONS ---
  renderCollections() {
    const container = document.getElementById('collections-container');
    if (!container) return;

    container.innerHTML = COLLECTIONS.map(col => `
      <div class="group cursor-pointer bg-white border border-[#DFD8CC] overflow-hidden" onclick="window.ShutterverseApp.filterByTitle('${col.category}')">
        <div class="overflow-hidden aspect-[4/3] bg-[#E7E1D6] relative">
          <img 
            src="${col.coverImage}" 
            alt="${col.title}" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          >
          <div class="absolute top-3 right-3 bg-[#202020]/75 text-[#F7F5F0] text-[9px] uppercase tracking-widest px-2 py-0.5 rounded">
            ${col.itemCount}
          </div>
        </div>
        <div class="p-5">
          <span class="text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold block mb-1">${col.category}</span>
          <h3 class="font-serif text-xl font-medium text-[#202020] group-hover:text-[#6B2737] transition-colors">${col.title}</h3>
          <p class="text-xs text-[#5A5650] font-sans mt-2 line-clamp-2">${col.description}</p>
          <div class="mt-4 pt-3 border-t border-[#ECE7DD] flex justify-between items-center text-[11px] text-[#8E887E]">
            <span>Curated by ${col.curator}</span>
            <span class="text-[#6B2737] font-semibold">&rarr;</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // --- SECTION 7: TRENDING STYLES ---
  renderTrendingStyles() {
    const container = document.getElementById('trending-styles-container');
    if (!container) return;

    container.innerHTML = TRENDING_STYLES.map(trend => `
      <div class="p-6 bg-white border border-[#DFD8CC] hover:border-[#B08D57] transition-colors cursor-pointer group" onclick="window.ShutterverseApp.searchFor('${trend.name}')">
        <div class="flex items-center justify-between text-xs text-[#5A5650] pb-3 border-b border-[#ECE7DD]">
          <span class="uppercase tracking-widest text-[#B08D57] font-semibold">${trend.genre}</span>
          <span class="text-[#6B2737] font-semibold font-mono">${trend.stat}</span>
        </div>
        <div class="my-4 overflow-hidden aspect-[16/10] bg-[#E7E1D6]">
          <img src="${trend.preview}" alt="${trend.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <h3 class="font-serif text-xl text-[#202020] font-normal group-hover:text-[#6B2737] transition-colors">${trend.name}</h3>
        <p class="text-xs text-[#5A5650] font-sans mt-2">${trend.description}</p>
      </div>
    `).join('');
  }

  // --- SECTION 8: JOURNAL ---
  renderJournal() {
    const container = document.getElementById('journal-container');
    if (!container) return;

    container.innerHTML = JOURNAL_ENTRIES.map(entry => `
      <article class="journal-card group">
        <div class="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8E887E] mb-3 font-sans font-semibold">
          <span class="text-[#B08D57]">${entry.issue} &bull; ${entry.category}</span>
          <span>${entry.readTime}</span>
        </div>
        <div class="overflow-hidden aspect-[16/10] bg-[#E7E1D6] mb-4">
          <img src="${entry.coverImage}" alt="${entry.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
        </div>
        <h3 class="font-serif text-2xl sm:text-3xl font-light text-[#202020] group-hover:text-[#6B2737] transition-colors leading-snug">
          ${entry.title}
        </h3>
        <p class="font-sans text-xs text-[#5A5650] leading-relaxed mt-2 line-clamp-3">
          ${entry.excerpt}
        </p>
        <div class="mt-4 pt-3 border-t border-[#ECE7DD] flex items-center justify-between text-xs text-[#8E887E]">
          <span>${entry.date}</span>
          <span class="font-semibold text-[#6B2737] group-hover:translate-x-1 transition-transform">Read Critical Essay &rarr;</span>
        </div>
      </article>
    `).join('');
  }

  // --- COMPREHENSIVE DETAIL MODAL / DRAWER ---
  openDetail(itemId) {
    const item = this.masterArchive.find(p => p.id === itemId);
    if (!item) return;

    this.currentDetailItemId = itemId;

    document.getElementById('dt-category').textContent = `${item.section || item.collection.toUpperCase()} • ${item.category}`;
    document.getElementById('dt-title').textContent = item.title;
    document.getElementById('dt-creator-name').textContent = item.artist || item.photographer || 'Historical Master';
    document.getElementById('dt-creator-role').textContent = item.collection === 'photography' ? 'Photographer' : 'Master Artist / Atelier';
    document.getElementById('dt-location').innerHTML = `<i data-lucide="map-pin" class="w-3.5 h-3.5 text-[#B08D57]"></i> ${item.region || item.location || 'Unknown'}`;
    document.getElementById('dt-story').textContent = `"${item.description || item.story || ''}"`;
    document.getElementById('dt-img').src = item.imageUrl;

    // Classification Badge
    const badgeEl = document.getElementById('dt-classification-badge');
    badgeEl.textContent = item.classification || 'Masterwork';

    // Toggle Metadata Matrices: Photography EXIF vs Historical Provenance
    const exifBlock = document.getElementById('dt-exif-block');
    const heritageBlock = document.getElementById('dt-heritage-block');

    if (item.collection === 'photography' && item.exif) {
      exifBlock?.classList.remove('hidden');
      heritageBlock?.classList.add('hidden');

      document.getElementById('dt-camera').textContent = item.exif.camera || 'Leica SL2';
      document.getElementById('dt-lens').textContent = item.exif.lens || '50mm f/1.4';
      document.getElementById('dt-aperture').textContent = item.exif.aperture || 'f/1.8';
      document.getElementById('dt-shutter').textContent = item.exif.shutter || '1/250s';
      document.getElementById('dt-iso').textContent = `ISO ${item.exif.iso || '100'}`;
      document.getElementById('dt-year').textContent = item.year || '2026';
    } else {
      exifBlock?.classList.add('hidden');
      heritageBlock?.classList.remove('hidden');

      document.getElementById('dt-period').textContent = item.period || 'Ancient Civilizations';
      document.getElementById('dt-date').textContent = item.date || 'Historical Epoch';
      document.getElementById('dt-medium').textContent = item.medium || 'Sculpture / Painting';
      document.getElementById('dt-source').textContent = item.source || 'Public Domain Museum Archive';
      document.getElementById('dt-license').textContent = item.license || 'Public Domain / Open Access';
      document.getElementById('dt-classification-detail').textContent = item.classification || 'Authentic Historical Artefact';
    }

    this.updateDetailModalFavState();

    const favBtn = document.getElementById('dt-fav-btn');
    favBtn.onclick = () => this.toggleFavorite(item.id);

    const fullBtn = document.getElementById('dt-fullscreen-btn');
    fullBtn.onclick = () => this.openLightboxById(item.id);

    const imgWrap = document.getElementById('dt-image-wrap');
    imgWrap.onclick = () => this.openLightboxById(item.id);

    document.getElementById('detail-modal')?.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  }

  updateDetailModalFavState() {
    const isFav = this.favorites.includes(this.currentDetailItemId);
    const textEl = document.getElementById('dt-fav-text');
    if (textEl) {
      textEl.textContent = isFav ? 'Remove from Curated Salon' : 'Save to Curated Salon';
    }
  }

  closeDetail() {
    document.getElementById('detail-modal')?.classList.remove('open');
  }

  // --- FULLSCREEN LIGHTBOX WITH CINEMATIC CHARCOAL HUD ---
  openLightboxById(itemId, event) {
    if (event) event.stopPropagation();
    const index = this.filteredItems.findIndex(p => p.id === itemId);
    if (index !== -1) {
      this.openLightbox(index);
    }
  }

  openLightbox(index) {
    if (index < 0 || index >= this.filteredItems.length) return;
    this.activeLightboxIndex = index;
    this.isZoomed = false;
    const item = this.filteredItems[index];

    const modal = document.getElementById('lightbox-modal');
    const imgWrap = document.querySelector('.lightbox-img-wrap');
    const img = document.getElementById('lightbox-img');
    const tagEl = document.getElementById('lb-tag');
    const titleEl = document.getElementById('lb-title');
    const metaEl = document.getElementById('lb-meta');
    const favBtn = document.getElementById('lb-fav-toggle');
    const storyBtn = document.getElementById('lb-view-story-btn');

    if (imgWrap) imgWrap.classList.remove('zoomed');
    if (img) img.src = item.imageUrl;
    if (tagEl) tagEl.textContent = item.classification || item.category;
    if (titleEl) titleEl.textContent = item.title;

    if (metaEl) {
      if (item.collection === 'photography' && item.exif) {
        metaEl.textContent = `${item.exif.camera} • ${item.exif.shutter} • ${item.exif.aperture} • ISO ${item.exif.iso} • ${item.location}`;
      } else {
        metaEl.textContent = `${item.period || ''} • ${item.date || ''} • ${item.region || item.location || ''} • ${item.source || ''}`;
      }
    }

    if (favBtn) {
      favBtn.onclick = () => {
        this.toggleFavorite(item.id);
        this.updateLightboxFavBtn();
      };
      this.updateLightboxFavBtn();
    }

    if (storyBtn) {
      storyBtn.onclick = () => {
        this.closeLightbox();
        this.openDetail(item.id);
      };
    }

    modal?.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  }

  toggleLightboxZoom() {
    this.isZoomed = !this.isZoomed;
    const imgWrap = document.querySelector('.lightbox-img-wrap');
    if (imgWrap) {
      imgWrap.classList.toggle('zoomed', this.isZoomed);
    }
    const zoomBtn = document.getElementById('lb-zoom-toggle-btn');
    if (zoomBtn) {
      zoomBtn.innerHTML = this.isZoomed ? '<i data-lucide="zoom-out" class="w-4 h-4"></i>' : '<i data-lucide="zoom-in" class="w-4 h-4"></i>';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  updateLightboxFavBtn() {
    const item = this.filteredItems[this.activeLightboxIndex];
    if (!item) return;
    const isFav = this.favorites.includes(item.id);
    const favBtn = document.getElementById('lb-fav-toggle');
    if (favBtn) {
      favBtn.innerHTML = `
        <i data-lucide="bookmark" class="w-4 h-4 ${isFav ? 'text-[#B08D57] fill-current' : ''}"></i>
        <span>${isFav ? 'Saved' : 'Save'}</span>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  nextLightbox() {
    if (this.activeLightboxIndex < this.filteredItems.length - 1) {
      this.openLightbox(this.activeLightboxIndex + 1);
    } else {
      this.openLightbox(0);
    }
  }

  prevLightbox() {
    if (this.activeLightboxIndex > 0) {
      this.openLightbox(this.activeLightboxIndex - 1);
    } else {
      this.openLightbox(this.filteredItems.length - 1);
    }
  }

  closeLightbox() {
    document.getElementById('lightbox-modal')?.classList.remove('open');
    const imgWrap = document.querySelector('.lightbox-img-wrap');
    if (imgWrap) imgWrap.classList.remove('zoomed');
    this.isZoomed = false;
  }

  // --- FAVORITES DRAWER MODAL ---
  openFavoritesModal() {
    this.renderFavoritesModalList();
    document.getElementById('favorites-modal')?.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  }

  closeFavoritesModal() {
    document.getElementById('favorites-modal')?.classList.remove('open');
  }

  renderFavoritesModalList() {
    const container = document.getElementById('favorites-list-container');
    const subtitle = document.getElementById('fav-modal-subtitle');
    if (!container) return;

    if (subtitle) {
      subtitle.textContent = `${this.favorites.length} curated masterwork${this.favorites.length === 1 ? '' : 's'} in your private collection`;
    }

    if (this.favorites.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center text-[#8E887E]">
          <i data-lucide="bookmark" class="w-10 h-10 mx-auto text-[#DFD8CC] mb-3"></i>
          <p class="font-serif text-xl text-[#202020]">Your curated salon is empty.</p>
          <p class="text-xs text-[#8E887E] mt-1 font-sans">Save modern photographs, historic artefacts, or sacred art to your personal collection.</p>
        </div>
      `;
      return;
    }

    const favItems = this.masterArchive.filter(p => this.favorites.includes(p.id));

    container.innerHTML = favItems.map(item => `
      <div class="flex items-center gap-4 p-3 bg-white border border-[#DFD8CC] group hover:border-[#B08D57] transition-colors">
        <div class="w-20 h-20 bg-[#E7E1D6] overflow-hidden shrink-0 cursor-pointer" onclick="window.ShutterverseApp.openDetail('${item.id}')">
          <img src="${item.thumbUrl || item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-[9px] uppercase tracking-widest text-[#6B2737] font-semibold block">${item.category}</span>
          <h4 class="font-serif text-lg font-medium text-[#202020] truncate cursor-pointer hover:text-[#6B2737]" onclick="window.ShutterverseApp.openDetail('${item.id}')">${item.title}</h4>
          <span class="text-xs text-[#5A5650] font-sans">${item.artist || item.photographer || 'Historical Master'} &bull; ${item.region || item.location || ''}</span>
        </div>
        <button 
          class="p-2 text-[#8E887E] hover:text-[#6B2737] transition-colors"
          title="Remove from Salon"
          onclick="window.ShutterverseApp.toggleFavorite('${item.id}')"
        >
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `).join('');
  }

  // --- SEARCH MODAL ---
  openSearch() {
    const modal = document.getElementById('search-modal');
    modal?.classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('search-input')?.focus();
  }

  closeSearch() {
    const modal = document.getElementById('search-modal');
    modal?.classList.add('opacity-0', 'pointer-events-none');
  }

  searchFor(query) {
    this.searchQuery = query;
    const input = document.getElementById('search-input');
    if (input) input.value = query;
    this.closeSearch();
    this.updateGallery();
    document.getElementById('photography')?.scrollIntoView({ behavior: 'smooth' });
  }

  filterByTitle(categoryName) {
    this.searchFor(categoryName);
  }

  handleContactSubmit() {
    const email = document.getElementById('contact-email')?.value;
    if (email) {
      document.getElementById('contact-success-msg')?.classList.remove('hidden');
      document.getElementById('contact-email').value = '';
    }
  }

  // --- EVENT LISTENERS ---
  setupEventListeners() {
    // Design Switchers
    document.getElementById('btn-design-1')?.addEventListener('click', () => this.setDesign('design1'));
    document.getElementById('btn-design-2')?.addEventListener('click', () => this.setDesign('design2'));
    document.getElementById('mobile-btn-design-1')?.addEventListener('click', () => this.setDesign('design1'));
    document.getElementById('mobile-btn-design-2')?.addEventListener('click', () => this.setDesign('design2'));
    document.getElementById('view-mode-editorial')?.addEventListener('click', () => this.setDesign('design1'));
    document.getElementById('view-mode-minimal')?.addEventListener('click', () => this.setDesign('design2'));

    // Search Triggers
    document.getElementById('search-trigger-btn')?.addEventListener('click', () => this.openSearch());
    document.getElementById('search-close-btn')?.addEventListener('click', () => this.closeSearch());
    document.getElementById('search-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'search-modal') this.closeSearch();
    });

    const searchInput = document.getElementById('search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateGallery();

      const summary = document.getElementById('search-results-summary');
      const countEl = document.getElementById('search-results-count');
      if (summary && countEl) {
        if (this.searchQuery.trim() !== '') {
          summary.classList.remove('hidden');
          countEl.textContent = this.filteredItems.length;
        } else {
          summary.classList.add('hidden');
        }
      }
    });

    document.querySelectorAll('.search-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        this.searchFor(e.target.textContent.trim());
      });
    });

    // Reset Filters
    document.getElementById('filter-reset-btn')?.addEventListener('click', () => {
      this.activeRealm = 'all';
      this.activeCategory = 'all';
      this.searchQuery = '';
      if (searchInput) searchInput.value = '';
      this.renderRealmTabs();
      this.renderCategoryBar();
      this.updateGallery();
    });

    // Favorites Drawer
    document.getElementById('favorites-trigger-btn')?.addEventListener('click', () => this.openFavoritesModal());
    document.getElementById('favorites-close-btn')?.addEventListener('click', () => this.closeFavoritesModal());
    document.getElementById('favorites-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'favorites-modal') this.closeFavoritesModal();
    });

    // Detail Drawer
    document.getElementById('detail-close-btn')?.addEventListener('click', () => this.closeDetail());
    document.getElementById('detail-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'detail-modal') this.closeDetail();
    });

    // Lightbox Controls
    document.getElementById('lightbox-close-btn')?.addEventListener('click', () => this.closeLightbox());
    document.getElementById('lightbox-next-btn')?.addEventListener('click', () => this.nextLightbox());
    document.getElementById('lightbox-prev-btn')?.addEventListener('click', () => this.prevLightbox());
    document.getElementById('lb-zoom-toggle-btn')?.addEventListener('click', () => this.toggleLightboxZoom());
    document.querySelector('.lightbox-img-wrap')?.addEventListener('click', () => this.toggleLightboxZoom());
    document.getElementById('lightbox-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox-modal') this.closeLightbox();
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn?.addEventListener('click', () => {
      mobileMenu?.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu?.classList.add('hidden');
      });
    });

    // Active Navigation Highlighting on scroll
    window.addEventListener('scroll', () => {
      const sections = ['home', 'photography', 'history', 'sacred-art', 'collections', 'journal', 'about', 'contact'];
      let current = '';
      sections.forEach(secId => {
        const el = document.getElementById(secId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            current = secId;
          }
        }
      });

      if (current) {
        document.querySelectorAll('.nav-link').forEach(link => {
          if (link.getAttribute('data-nav') === current) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  // --- KEYBOARD SHORTCUTS ---
  setupKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeLightbox();
        this.closeDetail();
        this.closeFavoritesModal();
        this.closeSearch();
      }

      const lightboxOpen = document.getElementById('lightbox-modal')?.classList.contains('open');
      if (lightboxOpen) {
        if (e.key === 'ArrowRight') this.nextLightbox();
        if (e.key === 'ArrowLeft') this.prevLightbox();
        if (e.key === 'z' || e.key === 'Z') this.toggleLightboxZoom();
      }
    });
  }
}

// Instantiate and attach globally
window.ShutterverseApp = new Shutterverse();
