// utils
import { TBody, scrapContent } from './utils';

// types
import type { Request, Response } from 'express';

export async function crawl(req: Request, res: Response) {
  const body = req.body as TBody;

  console.log('body:', body);
  scrapContent(body);

  return res.json({ msg: 'Done' });
}
