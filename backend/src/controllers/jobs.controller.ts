import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
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

    if (!company?.trim() || !role?.trim()) {
      res.status(400).json({ error: 'Missing required fields: company and role' });
      return;
    }

    const job = await prisma.jobApplication.create({
      data: {
        company: company.trim(),
        role: role.trim(),
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

    const data: Prisma.JobApplicationUpdateInput = {};
    if (company !== undefined) data.company = company;
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const job = await prisma.jobApplication.update({
      where: { id },
      data,
    });
    res.json(job);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.jobApplication.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
