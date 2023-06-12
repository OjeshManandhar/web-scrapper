import puppeteer from 'puppeteer';

export type TElement = {
  tagName: string;
  classNames: string;
  id?: string;
};

export type TBody = {
  url: string;
  projectName: string;
  selectedElements: TElement[];
  ancestor: TElement;
};

function createSelector(element: TElement) {
  const { tagName, classNames, id } = element;

  if (id) {
    return `${tagName}#${id}`;
  }

  if (classNames) {
    return `${tagName}.${classNames
      .split(' ')
      .filter(t => t.length)
      .join('.')}`;
  }

  return tagName;
}

export async function scrapContent(data: TBody) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(data.url);

  const ancestorSelector = createSelector(data.ancestor);
  await page.waitForSelector(ancestorSelector);

  await page.exposeFunction('createSelector', createSelector);

  const scrappedContent = await page.evaluate(
    (data: TBody, ancestorSelector: string) => {
      const ancestors = document.querySelectorAll(ancestorSelector);

      const contents: string[][] = [];
      ancestors.forEach(ancestor => {
        const content = data.selectedElements.map(element => {
          const { tagName, classNames, id } = element;

          let selector = tagName;
          if (id) {
            selector = `${tagName}#${id}`;
          } else if (classNames) {
            selector = `${tagName}.${classNames
              .split(' ')
              .filter(t => t.length)
              .join('.')}`;
          }

          const selectedElement = ancestor.querySelector(selector);

          if (element.tagName === 'img') {
            return selectedElement?.getAttribute('src');
          } else {
            return selectedElement?.textContent;
          }
        });

        contents.push(content as string[]);
      });

      return contents;
    },
    data,
    ancestorSelector,
  );

  console.log('contents:', scrappedContent);

  await browser.close();

  return scrappedContent;
}
