import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

export const getAllJobs = async (_req: Request, res: Response) => {
  try {
    const jobs = await prisma.jobApplication.findMany({
      orderBy: { appliedAt: 'desc' },
    });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { company, role, status, location, salary, jobUrl, notes } = req.body;

    if (!company?.trim() || !role?.trim()) {
      res
        .status(400)
        .json({ error: 'Missing required fields: company and role' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = await (prisma.jobApplication as any).create({
      data: {
        company: company.trim(),
        role: role.trim(),
        status: status || 'Applied',
        location: location?.trim() || '',
        salary: salary?.trim() || '',
        jobUrl: jobUrl?.trim() || '',
        notes: notes?.trim() || '',
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      error: 'Failed to create job',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { company, role, status, location, salary, jobUrl, notes } = req.body;

    const data: Prisma.JobApplicationUpdateInput = {};
    if (company !== undefined) data.company = company;
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    if (location !== undefined) (data as Record<string, unknown>).location = location;
    if (salary !== undefined) (data as Record<string, unknown>).salary = salary;
    if (jobUrl !== undefined) (data as Record<string, unknown>).jobUrl = jobUrl;
    if (notes !== undefined) data.notes = notes;

    const job = await prisma.jobApplication.update({
      where: { id },
      data,
    });
    res.json(job);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
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
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete job' });
  }
};
