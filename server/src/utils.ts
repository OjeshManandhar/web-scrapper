import puppeteer, { Page } from 'puppeteer';

const MAX_PAGE = 15;
const DARAZ_NEXT_PAGE_QUERY = 'li.ant-pagination-next';
const DARAZ_PAGINATION_DISABLED_CLASS = 'ant-pagination-disabled';

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

async function scrapContentFromSinglePage(
  page: Page,
  data: TBody,
): Promise<string[][]> {
  const ancestorSelector = createSelector(data.ancestor);
  await page.waitForSelector(ancestorSelector);

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

  return scrappedContent;
}

export async function scrapContent(data: TBody) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(data.url);

  const scrappedContent: string[][] = [];
  for (let i = 0; i < MAX_PAGE; i++) {
    const content = await scrapContentFromSinglePage(page, data);
    scrappedContent.push(...content);

    const nextPageAvailable = await page.evaluate(
      (selector: string, disabledClass: string) => {
        const nextPage = document.querySelector(selector);

        if (!nextPage) return false;

        return ![...nextPage.classList].includes(disabledClass);
      },
      DARAZ_NEXT_PAGE_QUERY,
      DARAZ_PAGINATION_DISABLED_CLASS,
    );

    if (!nextPageAvailable) break;

    const nextPage = await page.waitForSelector(DARAZ_NEXT_PAGE_QUERY);
    await nextPage?.click();
  }

  console.log('finalResult:', scrappedContent.length);

  await browser.close();

  return scrappedContent;
}
