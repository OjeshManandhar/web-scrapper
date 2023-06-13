export enum MessageType {
  CAPTURE = 'CAPTURE',
  STOP_CAPTURE = 'STOP_CAPTURE',
  SEND = 'SEND',
  SYNC = 'SYNC',

  UPDATE_FIELD = 'UPDATE_FIELD',
  DELETE_FIELD = 'DELETE_FIELD',
}

export type TMessage = {
  type: MessageType;
  value?: any;
};

export type TGlobalState = {
  sending: boolean;
  isCapturing: boolean;
};

export type TCapturedElements = Array<{
  id: string;
  name: string;
  element: HTMLElement;
}>;

export type TDisplayElementFormat = {
  id: string;
  name: string;
  content: string | null;
};

export type TReqElementFormat = {
  tagName: string;
  classNames: string;
  id?: string;
};

export async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

export function isElementCaptured(
  elem: HTMLElement,
  selectedElements: TCapturedElements,
) {
  const index = selectedElements.findIndex(
    selectedElement => selectedElement.element === elem,
  );

  return index !== -1;
}

export function findNearestCommonAncestor(selectedElements: TCapturedElements) {
  if (selectedElements.length === 0) return null;
  if (selectedElements.length === 1) return selectedElements[0].element;

  let ancestor: HTMLElement | null = selectedElements[0].element;

  while (1) {
    let foundAncestor = true;
    if (ancestor === null) return null;

    for (let i = 1; i < selectedElements.length; i++) {
      const containsNode = ancestor.contains(selectedElements[i].element);

      if (!containsNode) {
        foundAncestor = false;
        break;
      }
    }

    if (foundAncestor) break;

    ancestor = ancestor.parentElement;
  }

  return ancestor;
}

export function formatCapturedElementsForDisplay(
  capturedElements: TCapturedElements,
): Array<TDisplayElementFormat> {
  const formattedElements: Array<TDisplayElementFormat> = [];

  capturedElements.forEach(elem => {
    let content = elem.element.textContent;

    if (elem.element.tagName.toLowerCase() === 'img') {
      content = 'Image';
    } else if (elem.element.tagName.toLowerCase() === 'video') {
      content = 'Video';
    }

    formattedElements.push({
      id: elem.id,
      name: elem.name,
      content,
    });
  });

  return formattedElements;
}

export function formatAnElementForRequest(
  elem: HTMLElement,
): TReqElementFormat {
  const element: TReqElementFormat = {
    tagName: elem.tagName.toLowerCase(),
    classNames: elem.className,
    id: elem.id,
  };

  return element;
}

export function formatSelectedElementsForRequest(
  selectedElements: TCapturedElements,
): Array<{ name: string; element: TReqElementFormat }> {
  const formattedElements: Array<{ name: string; element: TReqElementFormat }> =
    [];

  selectedElements.forEach(elem => {
    formattedElements.push({
      name: elem.name,
      element: formatAnElementForRequest(elem.element),
    });
  });

  return formattedElements;
}
