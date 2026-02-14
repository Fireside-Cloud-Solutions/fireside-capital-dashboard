/**
 * PurgeCSS Configuration
 * Fireside Capital Dashboard
 * 
 * Removes unused CSS for production builds.
 * Run: npm run build:css
 * 
 * Expected reduction: ~70% (200KB → 60KB)
 */

module.exports = {
  content: [
    'app/**/*.html',
    'app/**/*.js',
    'app/**/*.jsx',
    'app/**/*.vue',
  ],
  
  css: [
    'app/assets/css/**/*.css',
  ],
  
  output: 'app/assets/css/dist',
  
  // Safelist: Classes that should NEVER be purged
  safelist: {
    // Standard safelist (exact matches)
    standard: [
      // Chart.js dynamic classes
      /^chart-/,
      
      // Bootstrap JS-generated classes
      /^modal/,
      /^dropdown/,
      /^tooltip/,
      /^popover/,
      /^collapse/,
      /^offcanvas/,
      /^carousel/,
      
      // Financial UI states
      'amount-positive',
      'amount-negative',
      'amount-zero',
      'trend--up',
      'trend--down',
      'trend--neutral',
      
      // Notification states
      'notification--unread',
      'notification--read',
      
      // Loading states
      'skeleton-amount',
      'loading',
      'is-loading',
      
      // Active states (JS-toggled)
      'active',
      'show',
      'showing',
      'hiding',
      'hidden',
      'open',
      'closed',
      'expanded',
      'collapsed',
    ],
    
    // Deep safelist (includes children)
    deep: [
      // Bootstrap component trees
      /^btn-/,
      /^alert-/,
      /^badge-/,
      /^card-/,
      /^form-/,
      /^input-/,
      /^table-/,
      /^nav-/,
      /^navbar-/,
      /^breadcrumb/,
      
      // Financial components
      /^account-card/,
      /^transaction-/,
      /^budget-/,
      /^metric-/,
      /^category-/,
    ],
    
    // Greedy safelist (includes any class containing pattern)
    greedy: [
      // Bootstrap data attributes
      /data-bs-/,
      
      // Chart.js generated classes
      /chartjs/,
      
      // Custom data attributes
      /data-amount/,
      /data-category/,
      /data-status/,
    ],
  },
  
  // Custom extractor for class names in JavaScript
  defaultExtractor: (content) => {
    // Match class names in strings, template literals, and JSX
    const matches = content.match(/[A-Za-z0-9-_:/]+/g) || [];
    return matches;
  },
  
  // Variables (keep CSS custom properties)
  variables: true,
  
  // Keyframes (keep animation keyframes)
  keyframes: true,
  
  // Font faces (keep @font-face rules)
  fontFace: true,
  
  // Reject selectors (never include these)
  rejected: false, // Set to true to see what was removed
  
  // Source map
  sourceMap: true,
};
