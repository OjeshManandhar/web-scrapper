const selectedElements: HTMLElement[] = [];

// listen for click events on the page
// save the clicked elements in selectedElements
document.addEventListener('click', event => {
  event.preventDefault();
  const elem = event.target as HTMLElement;
  if (elem.tagName.toLowerCase() !== 'div') {
    const isSelected = isElementSelected(elem);
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

    console.log('selectedElements', selectedElements);
    console.log('ancestor', findNearestCommonAncestor());
  }
});

function isElementSelected(elem: HTMLElement) {
  return selectedElements.includes(elem);
}

function findNearestCommonAncestor() {
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
