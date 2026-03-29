import { getAuthToken } from '../lib/auth.js';
import { getSettings, saveSettings } from '../lib/storage.js';

function extractSpreadsheetId(input) {
  const urlPattern = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = input.match(urlPattern);
  return match ? match[1] : input.trim();
}

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await getSettings();
  document.getElementById('spreadsheetId').value = settings.spreadsheetId;
  document.getElementById('sheetName').value = settings.sheetName || 'Sheet1';

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawInput = document.getElementById('spreadsheetId').value.trim();
    const spreadsheetId = extractSpreadsheetId(rawInput);
    const sheetName = document.getElementById('sheetName').value.trim() || 'Sheet1';

    try {
      const token = await getAuthToken(true);
      const resp = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!resp.ok) {
        throw new Error('Cannot access this spreadsheet. Check the URL and sharing permissions.');
      }

      const data = await resp.json();
      await saveSettings({ spreadsheetId, sheetName });

      // Ensure headers exist
      await chrome.runtime.sendMessage({
        action: 'ensureHeaders',
        spreadsheetId,
        sheetName
      });

      showStatus(`Connected to "${data.properties.title}"`, 'success');
    } catch (err) {
      showStatus(err.message, 'error');
    }
  });
});

function showStatus(message, type) {
  const el = document.getElementById('status');
  el.textContent = message;
  el.className = `status status--${type}`;
}
