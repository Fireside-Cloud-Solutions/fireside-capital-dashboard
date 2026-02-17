// ===== FIRESIDE CAPITAL - FEATURE TOUR =====
// Interactive tooltip-based tour highlighting key features

let tourActive = false;
let currentTourStop = 0;
const TOUR_STOPS = [
  {
    target: '#sidebar',
    title: 'Sidebar Navigation',
    description: 'Navigate between different sections of your finances here.',
    position: 'right'
  },
  {
    target: '#openAssetModalBtn', // Target "Add Asset" button
    title: 'Quick Actions',
    description: 'Quickly add assets, bills, debts, and more from any page.',
    position: 'bottom'
  },
  {
    target: '#netWorthValue',
    title: 'Net Worth',
    description: 'Your net worth is calculated automatically from your assets, debts, and investments.',
    position: 'bottom'
  },
  {
    target: '#netWorthTimelineChart',
    title: 'Financial Charts',
    description: 'Track your financial progress over time with interactive charts.',
    position: 'top'
  },
  {
    target: '#userDropdown',
    title: 'User Menu',
    description: 'Access settings and log out from here.',
    position: 'bottom'
  }
];

// ===== TOUR CONTROL =====
function startFeatureTour() {
  tourActive = true;
  currentTourStop = 0;
  
  // Create tour overlay
  createTourOverlay();
  
  // Show first stop
  showTourStop(0);
}

function nextTourStop() {
  currentTourStop++;
  if (currentTourStop >= TOUR_STOPS.length) {
    finishTour();
  } else {
    showTourStop(currentTourStop);
  }
}

function skipTour() {
  tourActive = false;
  removeTourElements();
  
  // Return to onboarding completion
  if (typeof onboardingComplete === 'function') {
    onboardingComplete();
  }
}

function finishTour() {
  tourActive = false;
  removeTourElements();
  
  // Mark tour as completed
  if (currentUser) {
    sb.from('settings').upsert({
      user_id: currentUser.id,
      tour_completed: true
    }).then(() => {
      console.log('Tour completed and saved');
    }).catch(err => {
      console.error('Failed to save tour completion:', err);
    });
  }
  
  // Return to onboarding completion
  if (typeof onboardingComplete === 'function') {
    onboardingComplete();
  }
}

// ===== TOUR RENDERING =====
function createTourOverlay() {
  // Create dark overlay
  const overlay = document.createElement('div');
  overlay.id = 'tourOverlay';
  overlay.className = 'tour-overlay';
  document.body.appendChild(overlay);
}

function showTourStop(stopIndex) {
  // Remove existing tooltip
  const existingTooltip = document.getElementById('tourTooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Remove existing spotlight
  const existingSpotlight = document.getElementById('tourSpotlight');
  if (existingSpotlight) {
    existingSpotlight.remove();
  }
  
  const stop = TOUR_STOPS[stopIndex];
  const targetElement = document.querySelector(stop.target);
  
  if (!targetElement) {
    console.warn(`Tour target not found: ${stop.target}`);
    nextTourStop(); // Skip to next stop
    return;
  }
  
  // Highlight target element
  highlightElement(targetElement);
  
  // Create tooltip
  const tooltip = createTooltip(stop, stopIndex);
  document.body.appendChild(tooltip);
  
  // Position tooltip relative to target
  positionTooltip(tooltip, targetElement, stop.position);
}

function highlightElement(element) {
  // Create spotlight div
  const spotlight = document.createElement('div');
  spotlight.id = 'tourSpotlight';
  spotlight.className = 'tour-spotlight';
  
  // Get element position
  const rect = element.getBoundingClientRect();
  const padding = 8; // Padding around element
  
  spotlight.style.top = `${rect.top + window.scrollY - padding}px`;
  spotlight.style.left = `${rect.left + window.scrollX - padding}px`;
  spotlight.style.width = `${rect.width + (padding * 2)}px`;
  spotlight.style.height = `${rect.height + (padding * 2)}px`;
  
  document.body.appendChild(spotlight);
  
  // Scroll element into view smoothly
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createTooltip(stop, stopIndex) {
  const tooltip = document.createElement('div');
  tooltip.id = 'tourTooltip';
  tooltip.className = 'tour-tooltip';
  
  const isLastStop = stopIndex === TOUR_STOPS.length - 1;
  const progressText = `${stopIndex + 1} of ${TOUR_STOPS.length}`;
  
  tooltip.innerHTML = `
    <div class="tour-tooltip-header">
      <h3 class="tour-tooltip-title">${escapeHtml(stop.title)}</h3>
      <span class="tour-tooltip-progress">${progressText}</span>
    </div>
    <p class="tour-tooltip-description">${escapeHtml(stop.description)}</p>
    <div class="tour-tooltip-actions">
      ${!isLastStop ? `<button class="btn btn-sm btn-outline-secondary" onclick="skipTour()">Skip Tour</button>` : ''}
      <button class="btn btn-sm btn-primary" onclick="${isLastStop ? 'finishTour()' : 'nextTourStop()'}">
        ${isLastStop ? 'Finish Tour' : 'Next'}
      </button>
    </div>
  `;
  
  return tooltip;
}

function positionTooltip(tooltip, targetElement, position) {
  const rect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const offset = 16; // Distance from target element
  
  let top, left;
  
  switch(position) {
    case 'right':
      top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.right + window.scrollX + offset;
      break;
    case 'left':
      top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.left + window.scrollX - tooltipRect.width - offset;
      break;
    case 'top':
      top = rect.top + window.scrollY - tooltipRect.height - offset;
      left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'bottom':
    default:
      top = rect.bottom + window.scrollY + offset;
      left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
      break;
  }
  
  // Keep tooltip within viewport bounds
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (left < 10) left = 10;
  if (left + tooltipRect.width > viewportWidth - 10) {
    left = viewportWidth - tooltipRect.width - 10;
  }
  if (top < 10) top = 10;
  if (top + tooltipRect.height > window.scrollY + viewportHeight - 10) {
    top = window.scrollY + viewportHeight - tooltipRect.height - 10;
  }
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function removeTourElements() {
  const overlay = document.getElementById('tourOverlay');
  if (overlay) overlay.remove();
  
  const tooltip = document.getElementById('tourTooltip');
  if (tooltip) tooltip.remove();
  
  const spotlight = document.getElementById('tourSpotlight');
  if (spotlight) spotlight.remove();
}

// Helper function for escaping HTML (fallback if not defined globally)
if (typeof escapeHtml === 'undefined') {
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
}
