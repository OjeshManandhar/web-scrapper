// utils
import { Project } from './model';
import { TProject, scrapContent } from './utils';

// types
import type { Request, Response } from 'express';

export async function getProjects(req: Request, res: Response) {
  const projects = await Project.find({});

  return res.json(projects);
}

export async function crawl(req: Request, res: Response) {
  const body = req.body as TProject;

  const scrappedContent = await scrapContent(body);

  const project = new Project({
    name: body.projectName,
    url: body.url,
    params: {
      ancestor: body.ancestor,
      selectedElements: body.selectedElements,
    },
    records: scrappedContent,
  });

  project.save();

  return res.json({ scrapContent: scrappedContent.length });
}
