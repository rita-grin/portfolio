// 🖼️ Modal Logic (unchanged)
const posters = document.querySelectorAll(".poster-item");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalClose = document.getElementById("modal-close");

posters.forEach(poster => {
  poster.addEventListener("click", () => {
    modal.style.display = "flex";
    modalImg.src = poster.src;
  });
});

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// 🔍 Filter + Pagination Combined Logic
document.addEventListener('DOMContentLoaded', function() {
  // Constants and state
  const filterBtns = document.querySelectorAll('.filter-btn');
  const allCards = Array.from(document.querySelectorAll('.project-card'));
  const projectContainer = document.getElementById('projectContainer');
  const pagination = document.getElementById('pagination');
  
  let currentPage = 1;
  let currentFilter = 'all';
  let projectsPerPage = calculateInitialPageSize();
  let filteredCards = [];

  // Calculate initial page size
  function calculateInitialPageSize() {
    const sampleCard = document.querySelector('.project-card');
    if (!sampleCard) return 6;
    
    const gridStyle = window.getComputedStyle(projectContainer);
    const gap = parseInt(gridStyle.gap) || 0;
    const cardWidth = sampleCard.offsetWidth + gap;
    const containerWidth = projectContainer.clientWidth;
    
    const cardsPerRow = Math.floor(containerWidth / cardWidth);
    return cardsPerRow * 2; // Show 2 rows by default
  }

  // Update page size on resize (with debounce)
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      projectsPerPage = calculateInitialPageSize();
      renderProjects();
    }, 250);
  });

  // Improved filtering function
  function filterCards(filter) {
    if (filter === 'all') return allCards.slice();

    return allCards.filter(card => {
      // Get all relevant tags (excluding special classes)
      const tags = Array.from(card.querySelectorAll('.tag:not(.tag-source):not(.tag-results):not(.confidential):not(.active-project)'))
        .map(tag => tag.textContent.trim().toLowerCase());
      
      // Special handling for skills section
      const skillsSection = card.querySelector('.skills');
      if (skillsSection) {
        const skillTags = Array.from(skillsSection.querySelectorAll('.tag'))
          .map(tag => tag.textContent.trim().toLowerCase());
        tags.push(...skillTags);
      }

      return tags.includes(filter);
    });
  }

  // Render pagination controls - UPDATED TO CENTER PAGINATION
  function renderPagination() {
    const totalPages = Math.ceil(filteredCards.length / projectsPerPage);
    pagination.innerHTML = '';

    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    // Create a container div for centered pagination
    const paginationContainer = document.createElement('div');
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.width = '100%';

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === currentPage ? 'active' : '';
      btn.style.margin = '0 5px'; // Add some spacing between buttons
      btn.addEventListener('click', () => {
        currentPage = i;
        renderProjects();
      });
      paginationContainer.appendChild(btn);
    }

    pagination.appendChild(paginationContainer);
    pagination.style.display = 'block';
  }

  // Main render function
  function renderProjects() {
    // Get filtered cards
    filteredCards = filterCards(currentFilter);
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredCards.length / projectsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);

    // Hide all cards
    allCards.forEach(card => card.style.display = 'none');

    // Show current page cards
    const start = (currentPage - 1) * projectsPerPage;
    const end = start + projectsPerPage;
    
    filteredCards.slice(start, end).forEach(card => {
      card.style.display = 'block';
    });

    // Update pagination
    renderPagination();

    // Scroll to top of project section after rendering
    window.scrollTo({
      top: projectContainer.offsetTop - 80,
      behavior: 'smooth'
    });
  }

  // Filter button event handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Update filter and reset page
      currentFilter = this.dataset.filter.toLowerCase();
      currentPage = 1;

      // Force synchronous layout update
      void projectContainer.offsetHeight;

      // Render with new filter
      renderProjects();
    });
  });

  // Initial render
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  renderProjects();
});