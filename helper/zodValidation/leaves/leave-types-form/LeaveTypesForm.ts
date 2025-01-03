import {z} from "zod";
import {toPascalCase} from "@/helper/strings/toPascalCase";

export const LeaveTypeSchema = z.object({
    //general information
    name: z.string().min(1, {message: "Name is required"}).transform(data => toPascalCase(data)),
    code: z.string().min(1, {message: "Code is required"}).transform((data) => data.toUpperCase()),
    description: z.string().min(1, {message: "Description is required"}), //accrual setting
    carryOver: z.boolean(), //Leave Duration
    // minDuration: z.number({
    //     required_error: "Min Duration is required",
    //     invalid_type_error: "Min Duration must be a number"
    // }),
    maxDuration: z.number({
        required_error: "Max Duration is required",
        invalid_type_error: "Max Duration must be a number"
    }),
    paidLeave: z.boolean(),
    isActive: z.boolean(),
    attachmentRequired: z.boolean(),
    applicableToEmployeeTypes: z.set(z.string()).default(new Set())
})
//     .refine(data => data.maxDuration >= data.minDuration, {
//     message: "Max Duration must be greater than or equal to Min Duration", path: ["maxDuration"],
// });

// .transform((data) => parseInt(data))