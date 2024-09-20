// /pages/api/batch-schedule.ts
import prisma from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

export async function POST(req: NextRequest) {
  try {
    const { id, name, clock_in, clock_out, is_active, break_min } = await req.json();

    // Extract hours and minutes from clock_in and clock_out
    const [clockInHour, clockInMinute] = clock_in.split(":").map(Number);
    const [clockOutHour, clockOutMinute] = clock_out.split(":").map(Number);

    // Get the current date using Day.js
    const currentDate = dayjs();

    // Set the time for clock_in and clock_out using the extracted hours and minutes
    const clockInDateTime = currentDate
      .set("hour", clockInHour + 8)
      .set("minute", clockInMinute)
      .set("second", 0)
      .set("millisecond", 0);
    const clockOutDateTime = currentDate
      .set("hour", clockOutHour + 8)
      .set("minute", clockOutMinute)
      .set("second", 0)
      .set("millisecond", 0);

    console.log("Update");
    console.log("Clock In:", clockInDateTime.toDate());
    console.log("Clock Out:", clockOutDateTime.toDate());
    const batchSchedule = await prisma.ref_batch_schedules.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        clock_in: clockInDateTime.toDate(),
        clock_out: clockOutDateTime.toDate(),
        break_min: parseInt(break_min),
        is_active: is_active,
        updated_at: new Date(new Date().setHours(new Date().getHours() + 8)),
      },
    });
    console.log(batchSchedule);

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
  }
}
