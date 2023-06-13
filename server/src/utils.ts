// packages
import puppeteer, { Page } from 'puppeteer';

const MAX_PAGE = 15;
const DARAZ_NEXT_PAGE_QUERY = 'li.ant-pagination-next';
const DARAZ_PAGINATION_DISABLED_CLASS = 'ant-pagination-disabled';

export type TElement = {
  tagName: string;
  classNames: string;
  id?: string;
};

export type TProject = {
  url: string;
  projectName: string;
  selectedElements: Array<{
    name: string;
    element: TElement;
  }>;
  ancestor: TElement;
};

export type TRecord = {
  [index: string]: string | null;
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
  data: TProject,
): Promise<TRecord[]> {
  const ancestorSelector = createSelector(data.ancestor);
  await page.waitForSelector(ancestorSelector);

  const scrappedContent = await page.evaluate(
    (data: TProject, ancestorSelector: string) => {
      const contents: TRecord[] = [];
      const ancestors = document.querySelectorAll(ancestorSelector);

      ancestors.forEach(ancestor => {
        const content: TRecord = {};

        data.selectedElements.forEach(elem => {
          const { tagName, classNames, id } = elem.element;

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

          if (elem.element.tagName === 'img') {
            content[elem.name] = selectedElement?.getAttribute('src') ?? null;
          } else {
            content[elem.name] = selectedElement?.textContent ?? null;
          }
        });

        contents.push(content);
      });

      return contents;
    },
    data,
    ancestorSelector,
  );

  return scrappedContent;
}

export async function scrapContent(data: TProject) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(data.url);

  const scrappedContent: TRecord[] = [];
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

  await browser.close();

  return scrappedContent;
}
