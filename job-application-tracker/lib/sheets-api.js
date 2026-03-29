export async function appendRow(spreadsheetId, row) {
  const response = await chrome.runtime.sendMessage({
    action: 'appendToSheet',
    spreadsheetId,
    row
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to append row');
  }
  return response.result;
}

export async function ensureHeaders(spreadsheetId, sheetName) {
  const response = await chrome.runtime.sendMessage({
    action: 'ensureHeaders',
    spreadsheetId,
    sheetName
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to create headers');
  }
}
