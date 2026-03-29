const DEFAULTS = {
  spreadsheetId: '',
  sheetName: 'Sheet1',
  headerRowCreated: false
};

export async function getSettings() {
  const data = await chrome.storage.local.get(Object.keys(DEFAULTS));
  return { ...DEFAULTS, ...data };
}

export async function saveSettings(settings) {
  await chrome.storage.local.set(settings);
}
