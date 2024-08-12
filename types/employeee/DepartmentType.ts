interface EmployeeAssociate {
    employee_id: number;
    fullName: string;
    job_title: string | null;
    picture: string | null;
}

export interface DepartmentInfo {
    id: number;
    department: string;
    department_status: string;
    heads: {
        job: string | null;
        fullName: string | null;
        picture: string | null;
    } | null;
    assistants: {
        job: string | null;
        fullName: string | null;
        picture: string | null;
    }[] | null;
    associated_employees: EmployeeAssociate[];
    total_employees: number;
}