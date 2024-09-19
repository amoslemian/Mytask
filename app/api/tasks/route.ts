import prisma from "@/app/utils/connect";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create a new task
export async function POST(req: Request) {
  try {
    console.log("Received request at /api/tasks"); // Log request start

    const { userId } = auth();
    console.log("User ID:", userId); // Log user authentication status

    if (!userId) {
      console.log("User not authenticated"); // Log authentication failure
      return NextResponse.json({ error: "Unauthorized", status: 401 });
    }

    const { title, description, date, completed, important } = await req.json();
    console.log("Received data:", { title, description, date }); // Log received data

    if (!title || !description || !date) {
      console.log("Missing required fields"); // Log missing data
      return NextResponse.json({
        error: "Missing required fields",
        status: 400,
      });
    }

    if (title.length < 3) {
      console.log("Title is too short"); // Log title validation failure
      return NextResponse.json({
        error: "Title must be at least 3 characters long",
        status: 400,
      });
    }

    // Log before the database operation
    console.log("Attempting to create task in the database...");
    const task = await prisma.task.create({
      data: {
        title,
        description,
        date,
        isCompleted: completed || false,
        isImportant: important || false,
        userId,
      },
    });
    console.log("Task created successfully:", task); // Log successful task creation

    return NextResponse.json(task);
  } catch (error) {
    console.error("ERROR CREATING TASK:", error); // Log error details
    return NextResponse.json({ error: "Error creating task", status: 500 });
  }
}

// Get all tasks
export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("ERROR GETTING TASKS: ", error);
    return NextResponse.json({ error: "Error getting tasks", status: 500 });
  }
}

// Update a task
export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    const { id, title, description, date, isCompleted, isImportant } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", status: 401 });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        date,
        isCompleted,
        isImportant,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("ERROR UPDATING TASK: ", error);
    return NextResponse.json({ error: "Error updating task", status: 500 });
  }
}

// Delete a task
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    const { id } = params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", status: 401 });
    }

    const task = await prisma.task.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("ERROR DELETING TASK: ", error);
    return NextResponse.json({ error: "Error deleting task", status: 500 });
  }
}
