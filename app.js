document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  /* ==========================================================================
     Day/Night Theme Toggle
     ========================================================================== */
  const themeToggle = document.getElementById('theme-toggle');
  
  // Set theme from local storage or system preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (currentTheme === 'light') {
    document.body.classList.remove('dark-mode');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // Toggle dark-mode class on body
      document.body.classList.toggle('dark-mode');
      
      // Save theme settings to local storage
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    });
  }

  /* ==========================================================================
     Header Scroll Effect
     ========================================================================== */
  const header = document.getElementById('main-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger on load

  /* ==========================================================================
     Mobile Navigation Menu Toggle
     ========================================================================== */
  const menuToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpened = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isOpened);
      navMenu.classList.toggle('open');
    });

    // Close menu when a navigation link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     Floating Magical Particles (Canvas-based, mouse-reactive)
     ========================================================================== */
  const particlesContainer = document.getElementById('magic-particles');
  if (particlesContainer) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    particlesContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, active: false };

    // Function to resize canvas to fit viewport
    const resizeCanvas = () => {
      canvas.width = particlesContainer.clientWidth;
      canvas.height = particlesContainer.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse events
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Define spore particle class
    class Spore {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.size = Math.random() * 8 + 3; // Spores sizes: 3px to 11px
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 20;
        this.speedY = -(Math.random() * 0.5 + 0.2); // Gentle rise speed
        this.speedX = Math.sin(Math.random() * Math.PI) * 0.15; // Gentle sway
        this.alpha = Math.random() * 0.5 + 0.3; // Transparency
        this.baseAlpha = this.alpha;
        this.swayFreq = Math.random() * 0.02 + 0.005;
        this.swayTime = Math.random() * 100;
      }

      update() {
        this.y += this.speedY;
        this.swayTime += this.swayFreq;
        this.x += Math.sin(this.swayTime) * 0.25 + this.speedX;

        // Mouse repulsion logic
        if (mouse.active && mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pushRadius = 120;
          if (dist < pushRadius) {
            const force = (pushRadius - dist) / pushRadius;
            const angle = Math.atan2(dy, dx);
            // Push gently away from cursor
            this.x += Math.cos(angle) * force * 3;
            this.y += Math.sin(angle) * force * 1.5;
            this.alpha = Math.min(1.0, this.baseAlpha + force * 0.45);
          } else {
            // Smoothly decay transparency back to base
            if (this.alpha > this.baseAlpha) this.alpha -= 0.01;
          }
        }

        // Reset if offscreen
        if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
          this.reset(false);
        }
      }

      draw() {
        const isDark = document.body.classList.contains('dark-mode');
        // Warm glowing firefly spores using radial gradient
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        if (isDark) {
          // Night Mode: Warm amber/orange campfire fireflies
          gradient.addColorStop(0, `rgba(255, 180, 80, ${this.alpha})`);
          gradient.addColorStop(0.3, `rgba(255, 160, 60, ${this.alpha * 0.4})`);
          gradient.addColorStop(1, 'rgba(255, 140, 40, 0)');
        } else {
          // Day Mode: Soft golden pollen spores
          gradient.addColorStop(0, `rgba(218, 165, 72, ${this.alpha})`);
          gradient.addColorStop(0.3, `rgba(218, 165, 72, ${this.alpha * 0.4})`);
          gradient.addColorStop(1, 'rgba(218, 165, 72, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particle pool based on canvas width
    const initParticles = () => {
      particles = [];
      const count = Math.min(45, Math.floor(canvas.width / 25));
      for (let i = 0; i < count; i++) {
        particles.push(new Spore());
      }
    };
    initParticles();
    window.addEventListener('resize', initParticles);

    // Animation frame loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  /* ==========================================================================
     Interactive Virtual Tour
     ========================================================================== */
  const tourLocations = [
    {
      id: 'dorpsplein',
      title: 'Het Dorpsplein & De Grote Paddenstoel',
      text: 'Welkom op ons gezellige dorpsplein! Dit is het hart van ons smurfenrijk. In het midden staat de Grote Paddenstoel waar Papa Smurf woont en zijn toverdrankjes brouwt. Hier vieren we onze legendarische smurfenfeesten en komen we samen voor belangrijk overleg. Kijk eens rond, zie je hoe mooi de bloemen bloeien?',
      image: 'village_hero.png',
      avatarState: 'normal'
    },
    {
      id: 'jonas-huisje',
      title: "Jona's Gezellige Paddenstoel",
      text: 'Kom binnen! Mijn huisje is niet zo groot, maar het is heel comfortabel. Ik heb een zacht bed van dennentakken en mos, een kleine open haard om sarsaparillathee op te zetten, en een verzameling van zeldzame stenen die ik heb gevonden tijdens mijn reizen. Als je bij ons boekt, kun je in een vergelijkbaar knus huisje slapen!',
      image: 'cozy_interior.png',
      avatarState: 'happy'
    },
    {
      id: 'smurfenrivier',
      title: 'De Smurfenrivier & Brug',
      text: 'Dit is de Smurfenrivier. Het water is zo helder dat je de vissen kunt zien zwemmen! We hebben hier een stevige houten brug gebouwd om makkelijk over te steken. Let wel op: we gaan hier vaak vissen met Smulsmurf, maar we moeten altijd alert zijn op Gargamel\'s valstrikken langs de oever!',
      image: 'village_hero.png',
      avatarState: 'alert'
    },
    {
      id: 'bessenveld',
      title: 'Het Smurfenbessenveld',
      text: 'Kijk eens naar al die heerlijke blauwe bessen! Dit is het favoriete plekje van Smulsmurf en Bakker Smurf. Elke ochtend oogsten we hier de sappigste bessen voor onze smurfenbessentaart en het smurfenbessen ontbijt. Proef er gerust een paar, ze zijn heerlijk zoet!',
      image: 'cozy_interior.png',
      avatarState: 'excited'
    },
    {
      id: 'sarsaparilla',
      title: 'Het Sarsaparillabos',
      text: 'Ah, de heerlijke geur van sarsaparilla! Dit is onze absolute lievelingsplant. We eten de blaadjes rauw, maken er soep van en trekken er geurige thee van. Papa Smurf zegt altijd dat sarsaparilla ons kracht en gezondheid geeft. Wees voorzichtig waar je loopt, zodat we de jonge plantjes niet beschadigen!',
      image: 'village_hero.png',
      avatarState: 'normal'
    }
  ];

  let currentTourIndex = 0;
  const tourTitleEl = document.getElementById('tour-location-title');
  const tourTextEl = document.getElementById('tour-location-text');
  const tourProgressEl = document.getElementById('tour-progress');
  const mapNodes = document.querySelectorAll('.map-node');
  const prevTourBtn = document.getElementById('prev-tour-btn');
  const nextTourBtn = document.getElementById('next-tour-btn');
  const mapBgEl = document.querySelector('.map-bg');
  const guideAvatarImg = document.getElementById('guide-avatar-img');

  function updateTourUI(index) {
    currentTourIndex = index;
    const location = tourLocations[index];

    // Fade out speech bubble contents smoothly before update
    tourTitleEl.style.opacity = 0;
    tourTextEl.style.opacity = 0;

    setTimeout(() => {
      tourTitleEl.textContent = location.title;
      tourTextEl.textContent = location.text;
      tourProgressEl.textContent = `${index + 1} / ${tourLocations.length}`;

      // Fade contents back in
      tourTitleEl.style.opacity = 1;
      tourTextEl.style.opacity = 1;
    }, 150);

    // Sync active state on interactive map buttons
    mapNodes.forEach(node => {
      if (node.getAttribute('data-location') === location.id) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // Update the background image of the map dynamically
    if (location.image && mapBgEl) {
      mapBgEl.style.backgroundImage = `url('${location.image}')`;
    }

    // Avatar visual indicator - soft rotate and bounce
    if (guideAvatarImg) {
      guideAvatarImg.style.transform = 'scale(0.9) rotate(-6deg)';
      setTimeout(() => {
        guideAvatarImg.style.transform = 'scale(1) rotate(0)';
      }, 200);
    }
  }

  // Bind click handlers to interactive nodes on the map
  mapNodes.forEach((node) => {
    node.addEventListener('click', () => {
      const locationId = node.getAttribute('data-location');
      const targetIndex = tourLocations.findIndex(loc => loc.id === locationId);
      if (targetIndex !== -1) {
        updateTourUI(targetIndex);
      }
    });
  });

  // Next and Previous buttons for the Tour Carousel
  if (prevTourBtn && nextTourBtn) {
    prevTourBtn.addEventListener('click', () => {
      let index = currentTourIndex - 1;
      if (index < 0) index = tourLocations.length - 1;
      updateTourUI(index);
    });

    nextTourBtn.addEventListener('click', () => {
      let index = currentTourIndex + 1;
      if (index >= tourLocations.length) index = 0;
      updateTourUI(index);
    });
  }

  /* ==========================================================================
     Cabin Booking Engine
     ========================================================================== */
  const cabinCards = document.querySelectorAll('.cabin-card');
  const cabinSelect = document.getElementById('cabin-select');
  const checkinInput = document.getElementById('checkin-date');
  const checkoutInput = document.getElementById('checkout-date');
  const guestsInput = document.getElementById('guests-count');
  const btnDecreaseGuests = document.getElementById('btn-decrease-guests');
  const btnIncreaseGuests = document.getElementById('btn-increase-guests');
  const addonCheckboxes = document.querySelectorAll('input[name="addons"]');
  const bookingForm = document.getElementById('booking-form');

  // Breakdown fields
  const breakdownCabinLabel = document.getElementById('breakdown-cabin-label');
  const breakdownCabinCost = document.getElementById('breakdown-cabin-cost');
  const breakdownAddonsRow = document.getElementById('breakdown-addons-row');
  const breakdownAddonsCost = document.getElementById('breakdown-addons-cost');
  const breakdownTotal = document.getElementById('breakdown-total');

  // Initialize booking dates logic
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  if (checkinInput && checkoutInput) {
    checkinInput.min = formatDateForInput(today);
    checkinInput.value = formatDateForInput(tomorrow);
    
    checkoutInput.min = formatDateForInput(tomorrow);
    checkoutInput.value = formatDateForInput(dayAfterTomorrow);

    // Sync checkout date validation bounds when checkin changes
    checkinInput.addEventListener('change', () => {
      const checkinDate = new Date(checkinInput.value);
      const checkoutDate = new Date(checkoutInput.value);
      
      const minCheckout = new Date(checkinDate);
      minCheckout.setDate(minCheckout.getDate() + 1);
      checkoutInput.min = formatDateForInput(minCheckout);

      if (checkoutDate <= checkinDate) {
        checkoutInput.value = formatDateForInput(minCheckout);
      }
      calculatePrice();
    });

    checkoutInput.addEventListener('change', () => {
      const checkinDate = new Date(checkinInput.value);
      const checkoutDate = new Date(checkoutInput.value);

      if (checkoutDate <= checkinDate) {
        const newCheckin = new Date(checkoutDate);
        newCheckin.setDate(newCheckin.getDate() - 1);
        checkinInput.value = formatDateForInput(newCheckin);
      }
      calculatePrice();
    });
  }

  // Guests counter inputs bounds limits (1-4 guests)
  if (btnDecreaseGuests && btnIncreaseGuests && guestsInput) {
    btnDecreaseGuests.addEventListener('click', () => {
      let currentVal = parseInt(guestsInput.value, 10);
      if (currentVal > 1) {
        guestsInput.value = currentVal - 1;
        calculatePrice();
      }
    });

    btnIncreaseGuests.addEventListener('click', () => {
      let currentVal = parseInt(guestsInput.value, 10);
      const maxVal = parseInt(guestsInput.max, 10) || 4;
      if (currentVal < maxVal) {
        guestsInput.value = currentVal + 1;
        calculatePrice();
      }
    });
  }

  // Synchronize cabin selection between clickable cards and drop-down selection
  cabinCards.forEach(card => {
    card.addEventListener('click', () => {
      const cabinType = card.getAttribute('data-cabin');
      
      cabinCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      if (cabinSelect) {
        cabinSelect.value = cabinType;
      }
      calculatePrice();
    });
  });

  if (cabinSelect) {
    cabinSelect.addEventListener('change', () => {
      const selectedCabin = cabinSelect.value;
      
      cabinCards.forEach(card => {
        if (card.getAttribute('data-cabin') === selectedCabin) {
          card.classList.add('active');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          card.classList.remove('active');
        }
      });
      calculatePrice();
    });
  }

  addonCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', calculatePrice);
  });

  // Calculate pricing function
  function calculatePrice() {
    if (!checkinInput || !checkoutInput || !cabinSelect || !guestsInput) return;

    const checkinDate = new Date(checkinInput.value);
    const checkoutDate = new Date(checkoutInput.value);
    const guests = parseInt(guestsInput.value, 10) || 1;

    // Check dates validity
    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime()) || checkoutDate <= checkinDate) {
      breakdownCabinLabel.textContent = "Huisje (0 nachten)";
      breakdownCabinCost.textContent = "€0";
      breakdownAddonsRow.style.display = "none";
      breakdownTotal.textContent = "€0";
      return;
    }

    // Calculate nights difference
    const diffTime = Math.abs(checkoutDate - checkinDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get cabin pricing info
    const selectedOption = cabinSelect.options[cabinSelect.selectedIndex];
    const cabinPrice = parseFloat(selectedOption.getAttribute('data-price')) || 45;
    const cabinTotal = cabinPrice * nights;

    // Update breakdown UI details
    breakdownCabinLabel.textContent = `${selectedOption.text.split(' (')[0]} (${nights} ${nights === 1 ? 'nacht' : 'nachten'})`;
    breakdownCabinCost.textContent = `€${cabinTotal}`;

    // Calculate addons pricing
    let addonsTotal = 0;
    addonCheckboxes.forEach(cb => {
      if (cb.checked) {
        const adPrice = parseFloat(cb.getAttribute('data-price'));
        const adType = cb.value;

        if (adType === 'breakfast') {
          // €10 per person per night
          addonsTotal += adPrice * guests * nights;
        } else if (adType === 'papas-tour') {
          // €25 flat fee
          addonsTotal += adPrice;
        } else if (adType === 'woodcarving') {
          // €15 per person flat fee
          addonsTotal += adPrice * guests;
        }
      }
    });

    // Update UI display for addons
    if (addonsTotal > 0) {
      breakdownAddonsRow.style.display = 'flex';
      breakdownAddonsCost.textContent = `€${addonsTotal}`;
    } else {
      breakdownAddonsRow.style.display = 'none';
    }

    // Update grand total
    const grandTotal = cabinTotal + addonsTotal;
    breakdownTotal.textContent = `€${grandTotal}`;
  }

  // Initial pricing calculate run on load
  calculatePrice();

  /* ==========================================================================
     Modal Checkout Flow
     ========================================================================== */
  const bookingModal = document.getElementById('booking-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnDoneModal = document.getElementById('btn-done-modal');
  const btnPrintTicket = document.getElementById('btn-print-ticket');

  // Booking details confirmation elements
  const ticketCodeEl = document.getElementById('ticket-code');
  const ticketCabinEl = document.getElementById('ticket-cabin');
  const ticketDatesEl = document.getElementById('ticket-dates');
  const ticketGuestsEl = document.getElementById('ticket-guests');
  const ticketAddonsEl = document.getElementById('ticket-addons');
  const ticketTotalEl = document.getElementById('ticket-total');

  if (bookingForm && bookingModal) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Ensure valid booking window
      const checkinDate = new Date(checkinInput.value);
      const checkoutDate = new Date(checkoutInput.value);

      if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime()) || checkoutDate <= checkinDate) {
        alert("Selecteer alstublieft een geldige aankomst- en vertrekdatum.");
        return;
      }

      // Gather form inputs details
      const selectedOption = cabinSelect.options[cabinSelect.selectedIndex];
      const cabinName = selectedOption.text.split(' (')[0];
      const guests = guestsInput.value;
      const grandTotalText = breakdownTotal.textContent;

      // Format date fields in Dutch locales
      const formatDateNL = (date) => {
        return date.toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      };
      const dateString = `${formatDateNL(checkinDate)} t/m ${formatDateNL(checkoutDate)}`;

      // Generate arbitrary tickets reference ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const bookingCode = `SMURF-${randomNum}-${randomLetter}`;

      // Aggregate checklist addon titles
      const activeAddonsList = [];
      addonCheckboxes.forEach(cb => {
        if (cb.checked) {
          const label = cb.closest('label').querySelector('.label-text').textContent.split(' (')[0];
          activeAddonsList.push(label);
        }
      });
      const addonsString = activeAddonsList.length > 0 ? activeAddonsList.join(', ') : 'Geen extra\'s';

      // Assign confirmation values to modal ticket
      ticketCodeEl.textContent = bookingCode;
      ticketCabinEl.textContent = cabinName;
      ticketDatesEl.textContent = dateString;
      ticketGuestsEl.textContent = `${guests} ${guests === '1' ? 'smurf' : 'smurfen'}`;
      ticketAddonsEl.textContent = addonsString;
      ticketTotalEl.textContent = grandTotalText;

      // Show native dialog modal
      bookingModal.showModal();
    });
  }

  // Modal actions handlers
  if (bookingModal) {
    const closeModal = () => {
      bookingModal.close();
      bookingForm.reset();
      
      // Reset cabin selection to classic rood-witte paddenstoel
      cabinCards.forEach(c => c.classList.remove('active'));
      const classicCard = document.querySelector('.cabin-card[data-cabin="classic"]');
      if (classicCard) classicCard.classList.add('active');
      
      // Set default calendar inputs bounds
      const tomorrowStr = formatDateForInput(tomorrow);
      const dayAfterTomorrowStr = formatDateForInput(dayAfterTomorrow);
      if (checkinInput) checkinInput.value = tomorrowStr;
      if (checkoutInput) checkoutInput.value = dayAfterTomorrowStr;
      if (guestsInput) guestsInput.value = 1;
      
      calculatePrice();
    };

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnDoneModal) btnDoneModal.addEventListener('click', closeModal);
    
    // Close modal when user clicks backdrop overlay region
    bookingModal.addEventListener('click', (e) => {
      const rect = bookingModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        closeModal();
      }
    });
  }

  // Print ticket functionality
  if (btnPrintTicket) {
    btnPrintTicket.addEventListener('click', () => {
      window.print();
    });
  }
});
