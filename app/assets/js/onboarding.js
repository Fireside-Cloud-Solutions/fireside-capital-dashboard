// ===== FIRESIDE CAPITAL - ONBOARDING WIZARD =====
// Multi-step onboarding flow for new users
// Steps: Welcome → Profile → Quick Start → Tour → Success

let currentOnboardingStep = 1;
const TOTAL_ONBOARDING_STEPS = 4; // Progress steps (excluding welcome)

// ===== STEP NAVIGATION =====
function showOnboardingStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.onboarding-step').forEach(step => {
    step.classList.remove('active');
  });
  
  // Show requested step
  const stepElement = document.getElementById(`onboardingStep${stepNumber}`);
  if (stepElement) {
    stepElement.classList.add('active');
    currentOnboardingStep = stepNumber;
    
    // Show/hide progress bar
    const progressBar = document.getElementById('onboardingProgress');
    if (progressBar) {
      if (stepNumber > 1 && stepNumber <= 4) {
        progressBar.style.display = 'block';
        updateOnboardingProgress(stepNumber - 1); // Adjust for 0-indexed progress
      } else {
        progressBar.style.display = 'none';
      }
    }
  }
}

function updateOnboardingProgress(step) {
  const progressText = document.getElementById('onboardingProgressText');
  const progressBar = document.getElementById('onboardingProgressBar');
  
  if (progressText) {
    progressText.textContent = `Step ${step} of ${TOTAL_ONBOARDING_STEPS}`;
  }
  
  if (progressBar) {
    const percentage = (step / TOTAL_ONBOARDING_STEPS) * 100;
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
  }
}

// ===== STEP 1: WELCOME SCREEN =====
function onboardingGetStarted() {
  showOnboardingStep(2); // Move to Profile Setup
}

function onboardingSkipWelcome() {
  // Skip directly to success and mark as completed
  showOnboardingStep(5);
}

// ===== STEP 2: PROFILE SETUP =====
async function onboardingContinueProfile() {
  const firstName = document.getElementById('onboardingFirstName')?.value || '';
  const lastName = document.getElementById('onboardingLastName')?.value || '';
  const emergencyFundGoal = document.getElementById('onboardingEmergencyFund')?.value || 10000;
  
  // Save to settings table
  if (currentUser) {
    try {
      const { error } = await sb.from('settings').upsert({
        user_id: currentUser.id,
        emergency_fund_goal: parseFloat(emergencyFundGoal) || 10000
      });
      
      if (error) {
        console.error('Failed to save profile settings:', error);
      }
      
      // Update user metadata with name (if Supabase supports it)
      if (firstName || lastName) {
        const { error: metaError } = await sb.auth.updateUser({
          data: { 
            first_name: firstName,
            last_name: lastName
          }
        });
        
        if (metaError) {
          console.warn('Could not update user metadata:', metaError);
        }
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  }
  
  // Move to Quick Start
  showOnboardingStep(3);
}

function onboardingSkipProfile() {
  // Skip to Quick Start
  showOnboardingStep(3);
}

// ===== STEP 3: QUICK START OPTIONS =====
function onboardingQuickStartAction(action) {
  // Close onboarding modal temporarily
  const onboardingModal = bootstrap.Modal.getInstance(document.getElementById('onboardingModal'));
  if (onboardingModal) {
    onboardingModal.hide();
  }
  
  // Open the relevant modal based on action
  switch(action) {
    case 'connect-bank':
      // Trigger Plaid link
      if (typeof openPlaidLink === 'function') {
        openPlaidLink();
      } else {
        alert('Bank connection feature is not yet available.');
      }
      break;
    case 'add-asset':
      if (typeof openAssetModal === 'function') {
        openAssetModal();
      }
      break;
    case 'add-bill':
      if (typeof openBillModal === 'function') {
        openBillModal();
      }
      break;
    case 'add-income':
      if (typeof openIncomeModal === 'function') {
        openIncomeModal();
      }
      break;
  }
  
  // Set flag to continue onboarding after modal closes
  window.onboardingPendingStep = 4; // Will resume at Feature Tour step
}

function onboardingSkipQuickStart() {
  showOnboardingStep(4); // Move to Feature Tour
}

// ===== STEP 4: FEATURE TOUR =====
function onboardingStartTour() {
  // Close onboarding modal
  const onboardingModal = bootstrap.Modal.getInstance(document.getElementById('onboardingModal'));
  if (onboardingModal) {
    onboardingModal.hide();
  }
  
  // Launch tour
  if (typeof startFeatureTour === 'function') {
    startFeatureTour();
  } else {
    console.warn('Feature tour not yet implemented');
    onboardingComplete(); // Skip to completion
  }
}

function onboardingSkipTour() {
  showOnboardingStep(5); // Move to Success
}

// ===== STEP 5: SUCCESS & COMPLETE =====
async function onboardingComplete() {
  // Mark onboarding as completed in database
  if (currentUser) {
    try {
      const { error } = await sb.from('settings').upsert({
        user_id: currentUser.id,
        onboarding_completed: true
      });
      
      if (error) {
        console.error('Failed to save onboarding status:', error);
      }
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
  }
  
  // Close modal
  const onboardingModal = bootstrap.Modal.getInstance(document.getElementById('onboardingModal'));
  if (onboardingModal) {
    onboardingModal.hide();
  }
  
  // Refresh data and show dashboard
  if (typeof fetchAllDataFromSupabase === 'function') {
    await fetchAllDataFromSupabase(true);
  }
  if (typeof renderAll === 'function') {
    renderAll();
  }
}

// ===== MAIN ONBOARDING TRIGGER =====
function showOnboardingWizard() {
  // Reset to first step
  currentOnboardingStep = 1;
  showOnboardingStep(1);
  
  // Show the modal
  const onboardingModal = new bootstrap.Modal(document.getElementById('onboardingModal'), {
    backdrop: 'static', // Prevent clicking outside to close
    keyboard: false     // Prevent ESC key from closing
  });
  onboardingModal.show();
}

// ===== RESUME ONBOARDING AFTER EXTERNAL MODAL =====
// Called when user finishes adding an item during Quick Start
window.addEventListener('modalClosed', () => {
  if (window.onboardingPendingStep) {
    const stepToResume = window.onboardingPendingStep;
    window.onboardingPendingStep = null;
    
    // Re-open onboarding modal at the pending step
    setTimeout(() => {
      showOnboardingStep(stepToResume);
      const onboardingModal = new bootstrap.Modal(document.getElementById('onboardingModal'));
      onboardingModal.show();
    }, 300); // Small delay for smooth transition
  }
});
