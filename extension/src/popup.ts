import { Events, TMessage, getActiveTab } from './utils';

const startBtn = document.getElementById('start-btn');

async function startCapture() {
  const activeTab = await getActiveTab();

  if (activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, {
      type: Events.START,
    } as TMessage);
  }
}

if (startBtn) {
  startBtn.addEventListener('click', () => {
    startCapture();
  });
}
