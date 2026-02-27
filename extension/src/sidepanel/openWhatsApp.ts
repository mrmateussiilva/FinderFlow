const WHATSAPP_URL = 'https://web.whatsapp.com/';

export interface OpenWhatsAppResult {
  opened: boolean;
  focused?: boolean;
}

/**
 * Find or create a WhatsApp Web tab and focus it.
 */
export async function openWhatsAppTab(): Promise<OpenWhatsAppResult> {
  const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
  if (tabs.length > 0 && tabs[0].id) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId!, { focused: true });
    return { opened: true, focused: true };
  }
  await chrome.tabs.create({ url: WHATSAPP_URL });
  return { opened: true, focused: false };
}
