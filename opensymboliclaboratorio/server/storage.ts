import { type User, type InsertUser, type Experiment, type InsertExperiment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllExperiments(): Promise<Experiment[]>;
  getExperiment(id: string): Promise<Experiment | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  deleteExperiment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private experiments: Map<string, Experiment>;

  constructor() {
    this.users = new Map();
    this.experiments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllExperiments(): Promise<Experiment[]> {
    return Array.from(this.experiments.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getExperiment(id: string): Promise<Experiment | undefined> {
    return this.experiments.get(id);
  }

  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const id = randomUUID();
    const experiment: Experiment = {
      id,
      name: insertExperiment.name,
      description: insertExperiment.description || null,
      conceptrons: insertExperiment.conceptrons,
      chains: insertExperiment.chains,
      tags: insertExperiment.tags || null,
      createdAt: new Date(),
    };
    this.experiments.set(id, experiment);
    return experiment;
  }

  async deleteExperiment(id: string): Promise<boolean> {
    return this.experiments.delete(id);
  }
}

export const storage = new MemStorage();
