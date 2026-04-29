import { Request, Response } from "express";

import * as academicService from "../services/academic.service";

export const createAssignment = async (req: Request, res: Response) => {
  const assignment = await academicService.createAssignment(req.user!.id, req.body);
  res.status(201).json(assignment);
};

export const getAssignments = async (req: Request, res: Response) => {
  const assignments = await academicService.getAssignments(req.user!.id, req.user!.role);
  res.json(assignments);
};

export const submitAssignment = async (req: Request, res: Response) => {
  const submission = await academicService.submitAssignment(
    String(req.params.id),
    req.user!.id,
    req.body.content,
  );
  res.status(201).json(submission);
};

export const gradeSubmission = async (req: Request, res: Response) => {
  const grade = await academicService.gradeSubmission(req.user!.id, req.body);
  res.status(201).json(grade);
};
