import {
  TGlobalState,
  TMessage,
  MessageType,
  isElementCaptured,
  TCapturedElements,
  TDisplayElementFormat,
  findNearestCommonAncestor,
  formatAnElementForRequest,
  formatSelectedElementsForRequest,
  formatCapturedElementsForDisplay,
} from './utils';

const globalState: TGlobalState = {
  sending: false,
  isCapturing: false,
};

let capturedElementId = 0;
let prevAncestors: HTMLElement[] | null = null;
const capturedElements: TCapturedElements = [];

function highlightAncestors() {
  if (prevAncestors) {
    prevAncestors.forEach(ancestor => {
      ancestor.style.outline = 'none';
    });
  }

  const mainAncestor = findNearestCommonAncestor(capturedElements);
  if (mainAncestor) {
    const { tagName, className, id } = mainAncestor;

    let selector = tagName;
    if (id) {
      selector = `${tagName}#${id}`;
    } else if (className) {
      selector = `${tagName}.${className
        .split(' ')
        .filter(t => t.length)
        .join('.')}`;
    }

    const ancestors = Array.from(
      document.querySelectorAll(selector),
    ) as HTMLElement[];
    prevAncestors = ancestors;

    ancestors.forEach(ancestor => {
      if (ancestor === mainAncestor) {
        ancestor.style.outline = '2px solid rgb(198 229 60)';
      } else {
        ancestor.style.outline = '2px solid rgb(118 88 219)';
      }
    });
  }
}

const captureHandler = (event: MouseEvent) => {
  event.preventDefault();
  let elem = event.target as HTMLElement;

  if (elem.tagName.toLowerCase() !== 'div') {
    while (1) {
      const { id, className, parentElement } = elem;

      if (id || className) break;

      if (parentElement == null) return;
      elem = parentElement;
    }

    const isCaptured = isElementCaptured(elem, capturedElements);
    if (isCaptured) {
      elem.style.outline = 'none';
      elem.style.background = 'none';

      const index = capturedElements.findIndex(e => e.element === elem);
      if (index !== -1) {
        capturedElements.splice(index, 1);
      }
    } else {
      elem.style.background = 'rgb(255, 0, 0, 0.25)';
      elem.style.outline = '2px solid rgb(255, 0, 0, 0.5)';

      capturedElementId += 1;
      capturedElements.push({
        id: '' + capturedElementId,
        name: `field-${capturedElementId}`,
        element: elem,
      });
    }

    if (capturedElements.length !== 0) {
      highlightAncestors();
    }
  }
};

chrome.runtime.onMessage.addListener(
  async (
    message: TMessage,
    sender,
    sendResponse: (data: {
      state: TGlobalState;
      capturedElements: TDisplayElementFormat[];
    }) => void,
  ) => {
    const { type, value } = message;

    switch (type) {
      case MessageType.SYNC:
        sendResponse({
          state: globalState,
          capturedElements: formatCapturedElementsForDisplay(capturedElements),
        });

        break;
      case MessageType.CAPTURE:
        document.addEventListener('click', captureHandler);

        globalState.sending = false;
        globalState.isCapturing = true;

        sendResponse({
          state: globalState,
          capturedElements: formatCapturedElementsForDisplay(capturedElements),
        });

        break;
      case MessageType.STOP_CAPTURE:
        document.removeEventListener('click', captureHandler);

        globalState.sending = false;
        globalState.isCapturing = false;

        sendResponse({
          state: globalState,
          capturedElements: formatCapturedElementsForDisplay(capturedElements),
        });

        break;
      case MessageType.SEND:
        const ancestor = findNearestCommonAncestor(capturedElements);
        const data = {
          url: location.href,
          projectName: value,
          selectedElements: formatSelectedElementsForRequest(capturedElements),
          ancestor: ancestor ? formatAnElementForRequest(ancestor) : null,
        };

        fetch('http://localhost:3000/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(res => res.json())
          .then(res => console.log('res:', res))
          .catch(err => console.log('err:', err));

        globalState.sending = true;
        globalState.isCapturing = false;
        sendResponse({
          state: globalState,
          capturedElements: formatCapturedElementsForDisplay(capturedElements),
        });
        break;
      case MessageType.UPDATE_FIELD:
        const index = capturedElements.findIndex(e => e.id === value.id);
        if (index !== -1) {
          capturedElements[index].name = value.name;
        }

        globalState.sending = false;
        globalState.isCapturing = false;

        sendResponse({
          state: globalState,
          capturedElements: formatCapturedElementsForDisplay(capturedElements),
        });

        break;
      case MessageType.DELETE_FIELD:
        const idx = capturedElements.findIndex(e => e.id === value.id);
        if (idx !== -1) {
          const elem = capturedElements[idx].element;
          elem.style.outline = 'none';
          elem.style.background = 'none';

          capturedElements.splice(idx, 1);

          highlightAncestors();
        }

        globalState.sending = false;
        globalState.isCapturing = false;

        sendResponse({
          state: globalState,
          capturedElements: formatCapturedElementsForDisplay(capturedElements),
        });

        break;
    }
  },
);
