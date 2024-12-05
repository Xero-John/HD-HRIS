// app/employeemanagement/employee/addemployees/schema.ts
import { z } from "zod";

// Single Certificate type definition
export type Certificate = {
  name?: string;
  url: string | File;
  fileName?: string;
};

export interface EmployeeFormData {
  picture: File | string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  extension: string;
  gender: string;
  email: string;
  contact_no: string;
  birthdate: string;
  addr_region: string;
  addr_province: string;
  addr_municipal: string;
  addr_baranggay: string;
  fathers_first_name: string;
  fathers_middle_name: string;
  fathers_last_name: string;
  mothers_first_name: string;
  mothers_middle_name: string;
  mothers_last_name: string;
  guardian_first_name: string;
  guardian_middle_name: string;
  guardian_last_name: string;
  elementary: string;
  highSchool: string;
  seniorHighSchool: string;
  seniorHighStrand: string;
  tvlCourse: string;
  universityCollege: string;
  course: string;
  masters?: string;
  mastersCourse?: string;
  mastersYear?: string;
  mastersCertificates?: Certificate[];
  doctorate?: string;
  doctorateCourse?: string;
  doctorateYear?: string;
  doctorateCertificates?: Certificate[];
  highestDegree: string;
  certificates: Certificate[];
  hired_at: string;
  department_id: string;
  job_id: string;
  branch_id: string;
  salary_grade_id: string;
  batch_id: string;
  employement_status_id: string;
  days_json: string[];
}

export const employeeSchema = z.object({
  picture: z.union([z.instanceof(File), z.string()]).optional(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .regex(/^[a-zA-Z\s]*$/, "First name should only contain letters"),
  middle_name: z
    .string()
    .regex(/^[a-zA-Z\s]*$/, "Middle name should only contain letters")
    .optional(),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[a-zA-Z\s]*$/, "Last name should only contain letters"),
  suffix: z.string().optional().nullable(),
  extension: z.string().optional().nullable(),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email address"),
  contact_no: z
    .string()
    .min(1, "Contact number is required")
    .regex(
      /^(09|\+639|9)\d{9}$/,
      "Contact number should start with 09, +639, or 9 followed by 9 digits"
    )
    .transform((val) => {
      if (val.startsWith("09")) return val.substring(1);
      if (val.startsWith("+639")) return val.substring(3);
      return val;
    })
    .refine(
      (val) => val.length === 10,
      "Contact number must be exactly 10 digits"
    ),
  birthdate: z.string().min(1, "Birthdate is required"),
  addr_region: z.string().min(1, "Region is required"),
  addr_province: z.string().min(1, "Province is required"),
  addr_municipal: z.string().min(1, "Municipal is required"),
  addr_baranggay: z.string().min(1, "Baranggay is required"),
  fathers_first_name: z.string().optional(),
  fathers_middle_name: z.string().optional(),
  fathers_last_name: z.string().optional(),
  mothers_first_name: z.string().optional(),
  mothers_middle_name: z.string().optional(),
  mothers_last_name: z.string().optional(),
  guardian_first_name: z.string().optional(),
  guardian_middle_name: z.string().optional(),
  guardian_last_name: z.string().optional(),
  elementary: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  highSchool: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  seniorHighSchool: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  seniorHighStrand: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Strand should only contain letters and numbers")
    .optional(),
  tvlCourse: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Course should only contain letters and numbers")
    .optional(),
  universityCollege: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "School name should only contain letters and numbers"
    )
    .optional(),
  course: z
    .string()
    .regex(/^[a-zA-Z0-9\s]*$/, "Course should only contain letters and numbers")
    .optional(),
  highestDegree: z.string().optional(),
  certificates: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.union([z.string(), z.instanceof(File), z.undefined()]),
        fileName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  masters: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Masters institution should only contain letters and numbers"
    )
    .optional(),
  mastersCourse: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Masters course should only contain letters and numbers"
    )
    .optional(),
  mastersYear: z
    .union([
      z.string().regex(/^\d{4}-\d{4}$/, "Year should be in format YYYY-YYYY"),
      z.string().length(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  mastersCertificates: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.union([z.string(), z.instanceof(File), z.undefined()]),
        fileName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  doctorate: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Doctorate institution should only contain letters and numbers"
    )
    .optional(),
  doctorateCourse: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      "Doctorate course should only contain letters and numbers"
    )
    .optional(),
  doctorateYear: z
    .union([
      z.string().regex(/^\d{4}-\d{4}$/, "Year should be in format YYYY-YYYY"),
      z.string().length(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  doctorateCertificates: z
    .array(
      z.object({
        name: z.string().optional(),
        url: z.union([z.string(), z.instanceof(File), z.undefined()]),
        fileName: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  hired_at: z.string().min(1, "Hire date is required"),
  department_id: z.string().min(1, "Department is required"),
  job_id: z.string().min(1, "Job is required"),
  branch_id: z.string().min(1, "Branch is required"),
  employement_status_id: z.string().min(1, "Employement status is required"),
  batch_id: z.string().min(1, "Batch is required"),
  days_json: z.array(z.string()),
});
