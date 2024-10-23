import {NextResponse} from "next/server";
import prisma from "@/prisma/prisma";
import {getEmpFullName} from "@/lib/utils/nameFormatter";
import {toDecimals} from "@/helper/numbers/toDecimals";
import dayjs from "dayjs";
import {getPaginatedData} from "@/server/pagination/paginate";
import {EmployeeLeaveCredits, LeaveCredits, LeaveEarning, UsedLeave} from "@/types/leaves/leave-credits-types";

export const dynamic = "force-dynamic";


export async function GET(request: Request): Promise<NextResponse> {
    try {
        const {searchParams} = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1'); // Default to page 1
        const perPage = parseInt(searchParams.get('limit') || '5'); // Default to 5 results per page

        const {
            data: allEmployees,
            totalItems
        } = await getPaginatedData<any>(prisma.trans_employees, page, perPage, {
            deleted_at: null, dim_leave_balances: {
                some: {
                    allocated_days: {
                        gt: 0,
                    }, deleted_at: null
                },

            }
        }, {
            dim_leave_balances: true,
        }, {id: "desc"})

        // Group leave earnings
        const groupedLeaveEarnings = await prisma.fact_leave_earnings.groupBy({
            by: ['employee_id'], orderBy: {
                employee_id: 'desc',
            }, _count: {
                id: true,
            },
        });

        // Create a mapping of earned leave credits
        const leaveCreditsMap: Record<string, any> = {};
        for (const earning of groupedLeaveEarnings) {
            leaveCreditsMap[earning.employee_id] = earning;
        }

        // Map through all employees and gather their leave data
        const leave_credits: LeaveCredits[] = await Promise.all(allEmployees.map(async (employee) => {
            const employee_id = leaveCreditsMap[employee.id] ? employee.id : employee.dim_leave_balances?.find((id: any) => id.employee_id)?.employee_id; // Fallback to dim_leave_balances if no earnings

            const employeeData = await prisma.trans_employees.findUnique({
                where: {
                    id: employee_id
                }, include: {
                    ref_departments: true,
                    fact_leave_earnings_fact_leave_earnings_employee_idTotrans_employees: {
                        include: {
                            ref_leave_types: true,
                        },
                    }, dim_leave_balances: true, trans_leaves_trans_leaves_employee_idTotrans_employees: true,
                },
            });

            const leaveTypes = employeeData?.fact_leave_earnings_fact_leave_earnings_employee_idTotrans_employees.map(leaveType => leaveType.ref_leave_types);

            const emp = getEmpFullName(employeeData);

            // Create a mapping of leave_type_id to their respective earned_days
            const earningsMap: Record<string, LeaveEarning> = {};
            employeeData?.fact_leave_earnings_fact_leave_earnings_employee_idTotrans_employees.forEach(item => {
                const leaveTypeId = item.leave_type_id;
                const leaveTypeName = item.ref_leave_types?.name;
                const earnedDays = toDecimals(item.earned_days);

                if (earningsMap[leaveTypeId]) {
                    earningsMap[leaveTypeId].earned_days += earnedDays;
                } else {
                    earningsMap[leaveTypeId] = {
                        leave_type_name: leaveTypeName,
                        leave_type_code: item.ref_leave_types?.code,
                        earned_days: earnedDays,
                        date_earned: item.earning_date,
                    };
                }
            });

            // Same logic for used leaves
            const usedLeavesMap: Record<string, UsedLeave> = {};
            employeeData?.trans_leaves_trans_leaves_employee_idTotrans_employees.forEach(item => {
                const daysOfLeave = dayjs(item.end_date).diff(dayjs(item.start_date), 'day') + 1; // Include start date
                const leaveTypeId = item.type_id!;
                const leaveTypeName = leaveTypes?.find(leaveType => leaveType?.id === leaveTypeId);

                if (usedLeavesMap[leaveTypeId]) {
                    usedLeavesMap[leaveTypeId].used_days += daysOfLeave; // Use daysOfLeave instead of earnedDays
                } else {
                    usedLeavesMap[leaveTypeId] = {
                        leave_type_name: leaveTypeName?.name || '',
                        leave_type_code: leaveTypeName?.code || '',
                        used_days: daysOfLeave,
                        approval_date: item.approval_at!,
                        created_at: item.created_at,
                        status: item.status!,
                    };
                }
            });

            // Convert the earningsMap to an array
            const leave_earnings = Object.values(earningsMap);
            const used_leaves = Object.values(usedLeavesMap);
            const leave_balances = employeeData?.dim_leave_balances.map(({
                                                                             total_earned_days,
                                                                             allocated_days,
                                                                             remaining_days,
                                                                             used_days,
                                                                             carry_forward_days,
                                                                             ...balance
                                                                         }) => ({
                allocated_days: toDecimals(allocated_days),
                remaining_days: toDecimals(remaining_days),
                carry_forward_days: toDecimals(carry_forward_days),
                used_days: toDecimals(used_days),
                total_earned_days: toDecimals(total_earned_days), ...balance,
            }));

            return {
                id: leave_balances?.find(id => id.id)?.id!,
                name: emp,
                picture: employeeData?.picture!,
                department: employeeData?.ref_departments?.name!,
                leave_balance: leave_balances!,
                used_leaves: {
                    leave_type: used_leaves,
                },
                earnings: {
                    leave_type: leave_earnings,
                },
            };
        }));

        return NextResponse.json({
            data: leave_credits, totalItems
        } as EmployeeLeaveCredits);
    } catch (err) {
        console.error("Error: ", err);
        return NextResponse.json({
            message: `Error: ${err}`,
        });
    }
}
