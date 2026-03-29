import { getAuthToken, isAuthenticated } from '../lib/auth.js';
import { appendRow } from '../lib/sheets-api.js';
import { getSettings } from '../lib/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const authSection = document.getElementById('auth-section');
  const noSheetSection = document.getElementById('no-sheet-section');
  const formSection = document.getElementById('form-section');
  const form = document.getElementById('job-form');

  // Check auth state
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    show(authSection);
    document.getElementById('btn-auth').addEventListener('click', handleAuth);
    setupSettings();
    return;
  }

  // Check if sheet is configured
  const settings = await getSettings();
  if (!settings.spreadsheetId) {
    show(noSheetSection);
    document.getElementById('btn-go-settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    setupSettings();
    return;
  }

  // Show form
  show(formSection);
  setupSettings();

  // Set default dates
  document.getElementById('dateApplied').valueAsDate = new Date();
  const followUp = new Date();
  followUp.setDate(followUp.getDate() + 7);
  document.getElementById('followUpDate').valueAsDate = followUp;

  // Auto-fill from current page
  await autoFillForm();

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSubmit(settings.spreadsheetId);
  });
});

function setupSettings() {
  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

async function autoFillForm() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    document.getElementById('jobUrl').value = tab.url || '';

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' });
    if (response?.success && response.data) {
      const d = response.data;
      if (d.company) document.getElementById('company').value = d.company;
      if (d.jobRole) document.getElementById('jobRole').value = d.jobRole;
      if (d.location) document.getElementById('location').value = d.location;
      if (d.salaryRange) document.getElementById('salaryRange').value = d.salaryRange;
      if (d.description) document.getElementById('description').value = d.description;
    }
  } catch {
    // Content script not available -- not on a supported job site
  }
}

async function handleSubmit(spreadsheetId) {
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    const formData = new FormData(document.getElementById('job-form'));
    const row = [
      formData.get('dateApplied'),
      formData.get('company'),
      formData.get('jobRole'),
      formData.get('status'),
      formData.get('jobUrl'),
      formData.get('description'),
      formData.get('salaryRange'),
      formData.get('location'),
      formData.get('notes'),
      formData.get('followUpDate')
    ];

    await appendRow(spreadsheetId, row);
    showNotification('Application saved!', 'success');

    setTimeout(() => {
      document.getElementById('job-form').reset();
      document.getElementById('dateApplied').valueAsDate = new Date();
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + 7);
      document.getElementById('followUpDate').valueAsDate = followUp;
    }, 1500);
  } catch (err) {
    showNotification(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save to Google Sheets';
  }
}

async function handleAuth() {
  try {
    await getAuthToken(true);
    window.location.reload();
  } catch {
    showNotification('Authentication failed. Please try again.', 'error');
  }
}

function show(element) {
  element.classList.remove('hidden');
}

function showNotification(message, type) {
  const el = document.getElementById('notification');
  const msgEl = document.getElementById('notification-message');
  msgEl.textContent = message;
  el.className = `notification notification--${type} notification--show`;
  setTimeout(() => {
    el.classList.remove('notification--show');
  }, 3000);
}
