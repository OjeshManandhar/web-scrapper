import { MessageType, TMessage, TState, getActiveTab } from './utils';

let state: TState = {
  canSend: false,
  isCapturing: false,
  noOfItemsSelected: 0,
};

const button = document.getElementById('btn');
const input = document.getElementById('project-name');
const selectedCount = document.getElementById('selected-count');

async function updateUI(sync = false) {
  const activeTab = await getActiveTab();

  if (!activeTab.id) return;

  const type: MessageType = sync
    ? MessageType.SYNC
    : state.canSend
    ? MessageType.SEND
    : state.isCapturing
    ? MessageType.STOP
    : MessageType.START;

  if (type === MessageType.SEND) {
    if (!input) {
      alert('Some thing went wrong.');
      return;
    }

    const value = (input as HTMLInputElement).value;
    if (!value) {
      alert('Please enter project name.');
      return;
    }
  }

  chrome.tabs.sendMessage(
    activeTab.id,
    { type } as TMessage,
    (data: TState) => {
      state = data;

      if (input) {
        (input as HTMLInputElement).hidden = !data.canSend;
      }

      const btnText = data.canSend
        ? 'Crawl'
        : data.isCapturing
        ? 'Stop'
        : 'Start';

      if (button) {
        button.innerText = btnText;
      }

      const selectedText =
        data.noOfItemsSelected === 0
          ? 'No item selected'
          : data.noOfItemsSelected === 1
          ? '1 item selected'
          : `${data.noOfItemsSelected} items selected`;

      if (selectedCount) {
        selectedCount.innerText = selectedText;
      }
    },
  );
}

if (button) {
  button.addEventListener('click', () => {
    updateUI();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateUI(true);
});
