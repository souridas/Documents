export async function getAuthToken(interactive = false) {
  const result = await chrome.identity.getAuthToken({ interactive });
  return result.token;
}

export async function isAuthenticated() {
  try {
    const token = await getAuthToken(false);
    return !!token;
  } catch {
    return false;
  }
}

export async function signOut() {
  try {
    const token = await getAuthToken(false);
    if (token) {
      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
      await chrome.identity.removeCachedAuthToken({ token });
    }
  } catch {
    // Already signed out
  }
}
