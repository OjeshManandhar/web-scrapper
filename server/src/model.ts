// packages
import { model, Schema } from 'mongoose';

// utils
import { TElement } from './utils';

const elementSchema = new Schema<TElement>({
  tagName: String,
  classNames: String,
  id: { type: String, required: false },
});

const projectSchema = new Schema(
  {
    name: String,
    url: String,
    params: {
      ancestor: { type: elementSchema, required: true },
      selectedElements: { type: [elementSchema], required: true },
    },
    records: { type: [[String]], required: true },
  },
  { timestamps: true },
);

export const Project = model('Project', projectSchema);
