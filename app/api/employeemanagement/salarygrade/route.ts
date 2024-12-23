import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Updated salary schema for validation
const salarySchema = z.object({
  name: z.string().min(1).max(45),
  amount: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => new Prisma.Decimal(val)),
  rate_per_hour: z
    .string()
    .regex(/^\d*\.?\d{0,2}$/, "Invalid decimal format")
    .transform((val) => new Prisma.Decimal(val)),
});

async function checkDuplicateName(name: string, excludeId?: number) {
  const existingBranch = await prisma.ref_salary_grades.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
      deleted_at: null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
  return existingBranch;
}

// Error handling function
function handleError(error: unknown, operation: string) {
  console.error(`Error during ${operation} operation:`, error);
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: "Invalid data", details: error.errors },
      { status: 400 }
    );
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json(
      { error: `Database error: ${error.message}` },
      { status: 400 }
    );
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { error: `Failed to ${operation} salary` },
    { status: 500 }
  );
}

// GET - Fetch all salary classes or a single salary by ID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    let result;
    if (id) {
      result = await getSalaryById(parseInt(id));
    } else {
      result = await getAllSalary();
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "fetch");
  }
}

async function getSalaryById(id: number) {
  const salary = await prisma.ref_salary_grades.findFirstOrThrow({
    where: {
      id,
      deleted_at: null,
    },
  });

  return salary;
}

async function getAllSalary() {
  return await prisma.ref_salary_grades.findMany({
    where: { deleted_at: null },
  });
}

// POST - Create a new salary class
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = salarySchema.parse(data);

    const salary = await prisma.ref_salary_grades.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        rate_per_hour: validatedData.rate_per_hour,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(salary, { status: 201 });
  } catch (error) {
    return handleError(error, "create");
  }
}

// PUT - Update an existing salary class
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "salary ID is required" },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();
    const validatedData = salarySchema.partial().parse(data);
    if (validatedData.name) {
      const existingSalgrade = await checkDuplicateName(
        validatedData.name,
        parseInt(id)
      );
      if (existingSalgrade) {
        return NextResponse.json(
          { error: "A Branch with this name already exists" },
          { status: 400 }
        );
      }
    }
    const salary = await prisma.ref_salary_grades.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(salary);
  } catch (error) {
    return handleError(error, "update");
  }
}

// DELETE - Soft delete a salary class
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    if (!id) {
      // return NextResponse.json({ error: 'Salary Grade ID is required' }, { status: 400 });
      throw new Error("Salary Grade ID is required");
    }
    const salarygrade = await prisma.ref_salary_grades.findFirst({
      where: { id: parseInt(id), trans_employees: { none: {} } },
    });

    if (!salarygrade) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete salary grade that has been use by employees",
        },
        { status: 400 }
      );
    }

    await prisma.ref_salary_grades.update({
      where: { id: salarygrade.id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Salary Grade marked as deleted",
      salarygrade,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
