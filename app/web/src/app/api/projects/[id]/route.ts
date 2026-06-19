import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { ProjectRepository } from "db";

import { logger } from "shared/config/logger";


const UpdateProjectInputSchema = z.object({

  name: z.string().min(1, "Name is required").max(255).optional(),

  databaseUrl: z.string().url("Invalid database URL format").optional(),

});


export async function GET(

  req: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    const { id } = await params;


    if (!id) {

      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });

    }


    const project = await ProjectRepository.getProjectById(id);


    if (!project) {

      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    }


    return NextResponse.json({

      success: true,

      project,

    });

  } catch (error) {

    logger.error(error, "Failed to fetch project");

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


export async function PATCH(

  req: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    const { id } = await params;


    if (!id) {

      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });

    }


    const body = await req.json();


    const validated = UpdateProjectInputSchema.safeParse(body);


    if (!validated.success) {

      return NextResponse.json(

        { success: false, error: "Validation failed", details: validated.error },

        { status: 400 }

      );

    }


    // Check project existence
    const project = await ProjectRepository.getProjectById(id);


    if (!project) {

      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    }


    const updatedProject = await ProjectRepository.updateProject(id, validated.data);


    return NextResponse.json({

      success: true,

      project: updatedProject,

      message: "Project updated successfully",

    });

  } catch (error) {

    logger.error(error, "Failed to update project");


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


export async function DELETE(

  req: NextRequest,

  { params }: { params: Promise<{ id: string }> }

) {

  try {

    const { id } = await params;


    if (!id) {

      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });

    }


    // Check project existence
    const project = await ProjectRepository.getProjectById(id);


    if (!project) {

      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    }


    // Delete project (cascade will delete schedules)
    const deletedProject = await ProjectRepository.deleteProject(id);


    return NextResponse.json({

      success: true,

      project: deletedProject,

      message: "Project deleted successfully",

    });

  } catch (error) {

    logger.error(error, "Failed to delete project");


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
