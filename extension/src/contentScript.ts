import {
  MessageType,
  TMessage,
  TState,
  isElementSelected,
  findNearestCommonAncestor,
} from './utils';

const state: TState = {
  canSend: false,
  sending: false,
  isCapturing: false,
  noOfItemsSelected: 0,
};
const selectedElements: HTMLElement[] = [];

const clickHandler = (event: MouseEvent) => {
  event.preventDefault();
  const elem = event.target as HTMLElement;
  if (elem.tagName.toLowerCase() !== 'div') {
    const isSelected = isElementSelected(elem, selectedElements);
    if (isSelected) {
      elem.style.outline = 'none';
      elem.style.background = 'none';

      const index = selectedElements.indexOf(elem);
      selectedElements.splice(index, 1);
    } else {
      elem.style.background = 'rgb(255, 0, 0, 0.25)';
      elem.style.outline = '2px solid rgb(255, 0, 0, 0.5)';

      selectedElements.push(elem);
    }
  }
};

chrome.runtime.onMessage.addListener(
  // (message: TMessage, sender, sendResponse) => {
  (message: TMessage, sender, sendResponse: (data: TState) => void) => {
    const { type, value } = message;
    console.log('message', message);

    switch (type) {
      case MessageType.SYNC:
        sendResponse(state);
        break;
      case MessageType.START:
        document.addEventListener('click', clickHandler);
        state.canSend = false;
        state.sending = false;
        state.isCapturing = true;
        state.noOfItemsSelected = selectedElements.length;
        sendResponse(state);
        break;
      case MessageType.STOP:
        document.removeEventListener('click', clickHandler);
        state.canSend = selectedElements.length > 0;
        state.sending = false;
        state.isCapturing = false;
        state.noOfItemsSelected = selectedElements.length;
        sendResponse(state);
        break;
      case MessageType.SEND:
        const data = {
          url: location.href,
          projectName: value,
          selectedElements: selectedElements,
          ancestor: findNearestCommonAncestor(selectedElements),
        };

        console.log('data:', data);

        state.canSend = false;
        state.sending = true;
        state.isCapturing = false;
        state.noOfItemsSelected = selectedElements.length;
        sendResponse(state);
        break;
    }
  },
);
