import {getSignatory} from "@/server/signatory";
import {NextRequest, NextResponse} from "next/server";
import {getPrismaErrorMessage} from "@/server/errors/server-errors";

export async function GET(req: NextRequest) {
    try{
        const { searchParams } = new URL(req.url);
        const path = Number(searchParams.get("id"));
        const signatory = await getSignatory("/leaves/leave-requests", path, true)
        return NextResponse.json(signatory)
    }catch (err){
        console.log("Error: ", err)
        return getPrismaErrorMessage(err)
    }
}