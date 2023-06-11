import { Request, Response } from 'express';

export function crawl(req: Request, res: Response) {
  const body = req.body;
  console.log('body:', body);

  return res.json({ msg: 'Done' });
}
