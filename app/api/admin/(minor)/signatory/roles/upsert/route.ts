import { NextRequest, NextResponse } from "next/server";
import { hasContentType } from "@/helper/content-type/content-type-check";
import prisma from "@/prisma/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {toGMT8} from "@/lib/utils/toGMT8";

export async function POST(req: NextRequest) {
    try {
        // Check if the request has the required content type
        hasContentType(req);

        // Parse the incoming request data
        const data = await req.json();

        if(data.id){
            await prisma.ref_signatory_roles.update({
                where: { id: data.id },
                data: { signatory_role_name: data.role, updated_at: toGMT8().toISOString() },
            });
        } else{
            await prisma.ref_signatory_roles.create({
                data: { signatory_role_name: data.role, created_at: toGMT8().toISOString(), updated_at: toGMT8().toISOString() },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        // Check for specific database-related errors

        console.log("Error: ", error)
        if (error instanceof PrismaClientKnownRequestError) {
            return NextResponse.json({
                success: false,
                message: "Database error occurred",
                code: error.code,
            }, {status: 500});
        }

        // Handle generic errors
        return NextResponse.json({
            success: false,
            message: "An unexpected error occurred",
        }, {status: 500});
    }
}
