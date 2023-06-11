export enum MessageType {
  START = 'START',
  STOP = 'STOP',
  SEND = 'SEND',
  SYNC = 'SYNC',
}

export type TMessage = {
  type: MessageType;
  value?: any;
};

export type TState = {
  canSend: boolean;
  sending: boolean;
  isCapturing: boolean;
  noOfItemsSelected: number;
};

export async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

export function isElementSelected(
  elem: HTMLElement,
  selectedElements: HTMLElement[],
) {
  return selectedElements.includes(elem);
}

export function findNearestCommonAncestor(selectedElements: HTMLElement[]) {
  if (selectedElements.length === 0) return null;
  if (selectedElements.length === 1) return selectedElements[0];

  let ancestor: HTMLElement | null = selectedElements[0];

  while (1) {
    let foundAncestor = true;
    if (ancestor === null) return null;

    for (let i = 1; i < selectedElements.length; i++) {
      const containsNode = ancestor.contains(selectedElements[i]);

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
