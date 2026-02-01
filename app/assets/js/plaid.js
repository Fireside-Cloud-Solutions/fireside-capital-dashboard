
let plaidLinkHandler;

// Initialize Plaid
function initializePlaid() {
  fetch('/create_link_token')
    .then(response => response.json())
    .then(data => {
      if (data.link_token) {
        createPlaidLinkHandler(data.link_token);
      } else {
        console.error('Failed to fetch link token');
      }
    })
    .catch(error => {
      console.error('Error fetching link token:', error);
    });
}

// Create Plaid Link handler
function createPlaidLinkHandler(linkToken) {
  plaidLinkHandler = Plaid.create({
    token: linkToken,
    onSuccess: (public_token, metadata) => {
      // Send public_token to your server
      exchangePublicToken(public_token);
    },
    onExit: (err, metadata) => {
      if (err != null) {
        // Handle error
      }
    },
    onEvent: (eventName, metadata) => {
      // Optional: track events
    }
  });
}

// Exchange public token for access token
function exchangePublicToken(publicToken) {
  // This should be done on your server for security reasons
  fetch('/exchange_public_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_token: publicToken }),
  })
  .then(response => response.json())
  .then(data => {
    // Server stores the token; we just confirm success
    if (data.success) {
      // Token exchanged successfully — server stored it
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Open Plaid Link
function openPlaidLink() {
  // Rate limiting
  if (window.rateLimiters && !window.rateLimiters.plaid.allow('openPlaidLink')) {
    const remainingMs = window.rateLimiters.plaid.getRemainingTime('openPlaidLink');
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    alert(`Too many Plaid connection attempts. Please wait ${remainingSeconds} seconds.`);
    return;
  }

  if (plaidLinkHandler) {
    plaidLinkHandler.open();
  } else {
    console.error('Plaid Link handler not initialized');
  }
}

// Expose functions globally so sidebar onclick works
window.initializePlaid = initializePlaid;
window.openPlaidLink = openPlaidLink;