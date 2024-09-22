import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/prisma';
import { number } from 'zod';
import { toGMT8 } from '@/lib/utils/toGMT8';

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
//   const { id } = await req.json();
  const id = 2;
  try {
    const affected = await prisma.dim_payhead_affecteds.findMany({
        where : {
            payhead_id : id,
        }
    })
    const employees = await prisma.trans_employees.findMany({
        select : {
            id: true,
            last_name : true,
            first_name : true,
            middle_name : true,
            ref_departments : {
                select : {
                    name : true
                }
            },
            ref_job_classes : {
                select : {
                    name : true
                }
            }
        },
    })
    return NextResponse.json({affected,employees});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const { data, affected } = await req.json();
  
    try {
      console.log(data);
      console.log(affected);
  
      // Create the payhead record
      const payhead = await prisma.ref_payheads.create({
        data: {
          name: data.name,
          calculation: data.calculation,
          is_mandatory: data.is_mandatory,
          is_active: data.is_active,
          type: "earning",
          created_at: toGMT8(new Date()),
          updated_at: toGMT8(new Date()),
        },
      });
  
      // Use Promise.all to handle multiple asynchronous operations
      const createAffectedPromises = affected.map(async (item: number) => {
        return prisma.dim_payhead_affecteds.create({
          data: {
            payhead_id: payhead.id,
            employee_id: item,
            created_at: toGMT8(new Date()),
            updated_at: toGMT8(new Date()),
          },
        });
      });
  
      // Wait for all affected records to be created
      await Promise.all(createAffectedPromises);
  
      return NextResponse.json({ status: 200 });
    } catch (error) {
      console.error('Error:', error); // Log the error for debugging
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
  }