const HEADERS = [
  'Date Applied', 'Company', 'Job Role', 'Status',
  'Job URL', 'Description', 'Salary Range', 'Location',
  'Notes', 'Follow-up Date'
];

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      spreadsheetId: '',
      sheetName: 'Sheet1',
      headerRowCreated: false
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'appendToSheet') {
    handleAppend(request.spreadsheetId, request.row)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'ensureHeaders') {
    ensureHeaderRow(request.spreadsheetId, request.sheetName)
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'getAuthToken') {
    chrome.identity.getAuthToken({ interactive: request.interactive ?? false })
      .then(tokenResult => sendResponse({ success: true, token: tokenResult.token }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function getToken() {
  const { token } = await chrome.identity.getAuthToken({ interactive: false });
  return token;
}

async function handleAppend(spreadsheetId, row, retried = false) {
  const token = await getToken();
  const sheetName = (await chrome.storage.local.get('sheetName')).sheetName || 'Sheet1';
  const range = `${sheetName}!A1:J1`;

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [row]
      })
    }
  );

  if (!response.ok) {
    if (response.status === 401 && !retried) {
      await chrome.identity.removeCachedAuthToken({ token });
      return handleAppend(spreadsheetId, row, true);
    }
    const err = await response.json();
    throw new Error(err.error?.message || 'Sheets API error');
  }

  return response.json();
}

async function ensureHeaderRow(spreadsheetId, sheetName) {
  const token = await getToken();
  const range = `${sheetName}!A1:J1`;

  const getResp = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const getData = await getResp.json();

  if (getData.values && getData.values.length > 0 && getData.values[0].length > 0) {
    return;
  }

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [HEADERS]
      })
    }
  );

  await chrome.storage.local.set({ headerRowCreated: true });
}
