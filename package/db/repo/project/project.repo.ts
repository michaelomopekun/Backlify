import { db, eq } from "../../index";

import { projects } from "../../schema/project";

import { logger } from "shared/config/logger";


export interface CreateProjectParams {

  id: string;

  name: string;

  databaseUrl: string;

}


export interface UpdateProjectParams {

  name?: string;

  databaseUrl?: string;

  retentionCount?: number;

}


export class ProjectRepository {

  static async createProject(params: CreateProjectParams) {

    try {

      logger.info({ projectId: params.id, name: params.name }, "Creating project");

      const result = await db.insert(projects).values({

        id: params.id,

        name: params.name,

        databaseUrl: params.databaseUrl,

        createdAt: new Date(),

        updatedAt: new Date(),

      }).returning();

      
      logger.info({ projectId: params.id }, "Project created successfully");
      
      return result[0];
    
    } catch (error) {
    
      logger.error({ projectId: params.id, error }, "Failed to create project");
    
      throw error;
    
    }
  
  }

  static async getProjectById(id: string) {

    try {
    
      logger.info({ projectId: id }, "Fetching project by ID");
    
      const result = await db.select().from(projects).where(eq(projects.id, id));
    
      if (!result || result.length === 0) {
    
        return null;
    
      }
    
      return result[0];
    
    } catch (error) {
    
      logger.error({ projectId: id, error }, "Failed to fetch project");
    
      throw error;
    
    }
  
  }

  static async getAllProjects() {
  
    try {
  
      logger.info("Fetching all projects");
  
      const result = await db.select().from(projects);
  
      return result;
  
    } catch (error) {
  
      logger.error({ error }, "Failed to fetch projects");
  
      throw error;
  
    }
  
  }


  static async updateProject(id: string, params: UpdateProjectParams) {
  
    try {
  
      logger.info({ projectId: id }, "Updating project");
  
      const result = await db.update(projects)
  
        .set({
    
          ...params,
    
          updatedAt: new Date(),
    
        })
    
        .where(eq(projects.id, id))
    
        .returning();
  
      
      logger.info({ projectId: id }, "Project updated successfully");
      
      return result[0];
    
    } catch (error) {
    
      logger.error({ projectId: id, error }, "Failed to update project");
    
      throw error;
    
    }
  
  }


  static async deleteProject(id: string) {
  
    try {
  
      logger.info({ projectId: id }, "Deleting project");
  
      const result = await db.delete(projects)
  
        .where(eq(projects.id, id))
    
        .returning();
  
      
      logger.info({ projectId: id }, "Project deleted successfully");
      
      return result[0];
    
    } catch (error) {
    
      logger.error({ projectId: id, error }, "Failed to delete project");
    
      throw error;
   
    }
  
  }

}
