
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";


export async function GET() {
    const data = await prisma.ref_leave_types.findMany({
        where: {
            deleted_at: null
        }, select: {
            duration_days: true,
            id: true,
            name: true,
            code: true,
            is_active: true,
            is_carry_forward: true
        }
    });


    const employee_count_leaves_types = await prisma.trans_leaves.groupBy({
        by: ["type_id"],
        where: {
            employee_id: {
                not: null
            }
        },
        _count: {
            employee_id: true  // Counting distinct employee_id for each type
        }
    })
    const result = data.map(leaveType => {
        const countData = employee_count_leaves_types.find(
            (leave) => leave.type_id === leaveType.id
        );

        return {
            key: leaveType.id,
            ...leaveType,
            employee_count: countData ? countData._count.employee_id : 0  // Attach employee count
        };
    });

    return NextResponse.json(result)
}