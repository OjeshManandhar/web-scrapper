# Web Scraper

This is a testing project for scraping data from e-commerce websites.

## Description

### Server

- Built using [Node.js](https://nodejs.org/en) and [Express.js](https://expressjs.com/) with [TypeScript](https://www.typescriptlang.org/).
- Runs on port 3000, which is hardcoded in the [index.ts](./server/src/index.ts) file.
- Connects to [MongoDB](https://www.mongodb.com/). The connection string is hardcoded in the [index.ts](./server/src/index.ts) file, so make sure to change it as needed.
- Uses [puppeteer](https://pptr.dev/) to load the website and scrape the data.
- The scraped data is stored in the MongoDB database named **scraper**, in the **projects** collection.

### Extension

- Built using vanilla HTML/CSS/JS with [TypeScript](https://www.typescriptlang.org/).
- Currently, the extension only works for the search result page on [Daraz](https://www.daraz.com.np/) and can scrape data across all the pages.
- The user can select different elements on the page, which will be passed to the server for scraping and storage.
- The selected elements are highlighted on the page, along with all similar elements.
- The user can provide a name under which the selected data will be saved.

## Installation

### Server

- Navigate to the server directory:

  `$ cd server`

- Install dependencies:

  `$ pnpm install`

- To run in **development** mode:

  `$ pnpm run dev`

- To build:

  `$ pnpm run build`

- To run in **production** mode (after building):

  `$ pnpm run start`

### Extension

- Navigate to the extension directory:

  `$ cd extension`

- Install dependencies:

  `$ pnpm install`

- To run in **development** mode:

  `$ pnpm run dev`

- To build:

  `$ pnpm run build`

- To install the extension in Chrome, load the [dist](./extension/dist) directory as an unpacked extension.

## Attribution

- [Edit icons](https://www.flaticon.com/free-icons/edit) created by Pixel perfect - Flaticon
- [Delete icons](https://www.flaticon.com/free-icons/delete) created by Ilham Fitrotul Hayat - Flaticon
