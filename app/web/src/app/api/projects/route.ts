import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { v4 as uuidv4 } from "uuid";

import { ProjectRepository } from "db";

import { logger } from "shared/config/logger";



const CreateProjectInputSchema = z.object({

  name: z.string().min(1, "Name is required").max(255),

  databaseUrl: z.string().url("Invalid database URL format"),

});


export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const validated = CreateProjectInputSchema.safeParse(body);


    
    if (!validated.success) {
    
      return NextResponse.json(
    
        { success: false, error: "Validation failed", details: validated.error },
    
        { status: 400 }
    
      );
    
    }

    
    const { name, databaseUrl } = validated.data;
    
    const id = `proj-${uuidv4().substring(0, 12)}`;


    const project = await ProjectRepository.createProject({

      id,

      name,

      databaseUrl,

    });


    return NextResponse.json(
    
      {
    
        success: true,
    
        project,
    
        message: "Project created successfully",
    
      },
    
      { status: 201 }
    
    );
  
  } catch (error) {
  
    logger.error("Failed to create project:", error);
  
    return NextResponse.json(
  
      {
  
        success: false,
  
        message: "Internal server error",
  
        details: error instanceof Error ? error.message : String(error),
  
      },
  
      { status: 500 }
  
    );
  
  }

}


export async function GET() {

  try {

    const projects = await ProjectRepository.getAllProjects();

    return NextResponse.json({

      success: true,

      projects,

    });

  } catch (error) {

    logger.error("Failed to fetch projects:", error);

    return NextResponse.json(

      {

        success: false,

        message: "Internal server error",

        details: error instanceof Error ? error.message : String(error),

      },

      { status: 500 }

    );

  }

}
