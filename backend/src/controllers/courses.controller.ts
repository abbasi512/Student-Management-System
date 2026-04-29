import { Request, Response } from "express";

import * as courseService from "../services/course.service";

export const getCourses = async (_req: Request, res: Response) => {
  const courses = await courseService.getCourses();
  res.json(courses);
};

export const getCourseById = async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(String(req.params.id));
  res.json(course);
};

export const createCourse = async (req: Request, res: Response) => {
  const course = await courseService.createCourse(req.user!.id, req.body);
  res.status(201).json(course);
};

export const updateCourse = async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(String(req.params.id), req.body);
  res.json(course);
};

export const deleteCourse = async (req: Request, res: Response) => {
  const result = await courseService.deleteCourse(String(req.params.id));
  res.json(result);
};

export const enroll = async (req: Request, res: Response) => {
  const enrollment = await courseService.enrollInCourse(req.body.courseId, req.user!.id);
  res.status(201).json(enrollment);
};

export const assignTeacher = async (req: Request, res: Response) => {
  const course = await courseService.assignTeacher(String(req.params.id), req.body.teacherId);
  res.json(course);
};

export const getTeacherCourses = async (req: Request, res: Response) => {
  const courses = await courseService.getTeacherCourses(req.user!.id);
  res.json(courses);
};

export const getStudentCourses = async (req: Request, res: Response) => {
  const courses = await courseService.getStudentCourses(req.user!.id);
  res.json(courses);
};
