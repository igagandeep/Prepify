import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.jobApplication.findMany({
      orderBy: { appliedAt: 'desc' },
    });
    res.json(jobs);
  } catch {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { company, role, status, notes } = req.body;
    const job = await prisma.jobApplication.create({
      data: {
        company,
        role,
        status: status || 'Applied',
        notes: notes || '',
      },
    });
    res.status(201).json(job);
  } catch {
    res.status(500).json({ error: 'Failed to create job' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { company, role, status, notes } = req.body;
    const job = await prisma.jobApplication.update({
      where: { id },
      data: { company, role, status, notes },
    });
    res.json(job);
  } catch {
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.jobApplication.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
