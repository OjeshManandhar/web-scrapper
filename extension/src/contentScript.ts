import {
  Events,
  TMessage,
  isElementSelected,
  findNearestCommonAncestor,
} from './utils';

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
  (message: TMessage) => {
    const { type, value } = message;

    switch (type) {
      case Events.START:
        document.addEventListener('click', clickHandler);
        break;
      case Events.STOP:
        document.removeEventListener('click', clickHandler);
        break;
      case Events.SEND:
        console.log('selectedElements', selectedElements);

        const ancestor = findNearestCommonAncestor(selectedElements);
        console.log('ancestor', ancestor);
        break;
    }
  },
);
