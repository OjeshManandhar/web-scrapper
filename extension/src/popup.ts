import {
  TMessage,
  MessageType,
  getActiveTab,
  TGlobalState,
  TDisplayElementFormat,
} from './utils';

const globalState: TGlobalState = {
  sending: false,
  isCapturing: false,
};
let capturedElements: TDisplayElementFormat[] = [];

const scrapeBtn = document.getElementById('scrape-btn') as HTMLButtonElement;
const projectName = document.getElementById('project-name') as HTMLInputElement;
const capturedFields = document.getElementById(
  'captured-fields',
) as HTMLDivElement;
const captureBtn = document.getElementById('capture-btn') as HTMLButtonElement;
const alert = document.getElementById('alert') as HTMLParagraphElement;

function updateState(newState: TGlobalState) {
  globalState.sending = newState.sending;
  globalState.isCapturing = newState.isCapturing;

  if (globalState.isCapturing) {
    captureBtn.textContent = 'Stop capturing';
  } else if (!globalState.isCapturing) {
    captureBtn.textContent = 'Start capturing';
  }
}

function updateCapturedElements(elements: TDisplayElementFormat[]) {
  // remove all children in captureFields
  while (capturedFields.firstChild) {
    capturedFields.removeChild(capturedFields.firstChild);
  }

  elements.forEach(element => {
    const li = document.createElement('li');
    li.classList.add('group');
    li.setAttribute('data-id', element.id);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Field name';
    input.classList.add('grow');
    input.value = element.name;
    input.setAttribute('data-id', element.id);
    li.appendChild(input);

    const content = document.createElement('span');
    input.classList.add('grow');
    content.textContent = element.content;
    content.setAttribute('data-id', element.id);
    li.appendChild(content);

    const editBtn = document.createElement('img');
    editBtn.src = '/assets/edit.png';
    editBtn.setAttribute('data-id', element.id);
    editBtn.addEventListener('click', () => {
      const value = input.value;
      if (!value) {
        setAlert('Field name is required.');
      }

      sendMessage(
        {
          type: MessageType.UPDATE_FIELD,
          value: { id: element.id, name: value },
        },
        updateUI,
      );
    });
    li.appendChild(editBtn);

    const deleteBtn = document.createElement('img');
    deleteBtn.src = '/assets/delete.png';
    deleteBtn.setAttribute('data-id', element.id);
    deleteBtn.addEventListener('click', () => {
      sendMessage(
        {
          type: MessageType.DELETE_FIELD,
          value: { id: element.id },
        },
        updateUI,
      );
    });
    li.appendChild(deleteBtn);

    capturedFields.appendChild(li);
  });
}

function updateUI(data: {
  state: TGlobalState;
  capturedElements: TDisplayElementFormat[];
}) {
  capturedElements = data.capturedElements;

  updateState(data.state);
  updateCapturedElements(data.capturedElements);
}

function setAlert(message?: string | null) {
  alert.textContent = message ? message : null;
}

async function sendMessage(
  msg: TMessage,
  callback?: (data: {
    state: TGlobalState;
    capturedElements: TDisplayElementFormat[];
  }) => void,
) {
  const activeTab = await getActiveTab();
  if (!activeTab.id) return;

  if (callback) {
    return chrome.tabs.sendMessage(activeTab.id, msg, callback);
  }

  return chrome.tabs.sendMessage(activeTab.id, msg);
}

async function addEventListeners() {
  captureBtn.addEventListener('click', async () => {
    const type = globalState.isCapturing
      ? MessageType.STOP_CAPTURE
      : MessageType.CAPTURE;

    sendMessage({ type }, updateUI);
  });

  scrapeBtn.addEventListener('click', async () => {
    if (globalState.sending) return;

    if (!projectName.value) {
      setAlert('Project name is required.');
      return;
    }

    if (capturedElements.length === 0) {
      setAlert('You need to capture at least one field.');
      return;
    }

    const uniqueNames = new Set(capturedElements.map(element => element.name));
    if (uniqueNames.size !== capturedElements.length) {
      setAlert('Field names must be unique.');
      return;
    }

    setAlert();

    sendMessage({ type: MessageType.SEND, value: projectName.value }, updateUI);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!scrapeBtn || !projectName || !capturedFields || !captureBtn || !alert) {
    setAlert('Some thing went wrong.');
  }

  sendMessage({ type: MessageType.SYNC }, data => {
    updateUI(data);
    setAlert();
    addEventListeners();
  });
});
