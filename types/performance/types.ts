// Define the structure for the Rating object
export interface Rating {
    rate: number;
    description: string;
}

// Define the structure for TableRating object
export interface TableRating {
    name: string;
    weight: number;
    type: "multiple-choices" | "table";
    ratings: Rating[];
}

// Define the main interface for the given data
export interface CriteriaDetail {
    is_active: boolean;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
    deleted_at: string | null; // Nullable ISO date string
    weight: number;
    type: "multiple-choices" | "table";
    id: number;
    name: string;
    description: string;
    ratings_json: Rating[] | TableRating[];
}

export interface SurveyData {
    [key: string]: {
        total: number;
        details: {
            [key: string]: number;
        };
    };
}

export interface SurveyFormType {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    total_rating: string;
    max_rate: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    evaluated_by: number;
    criteria_json: CriteriaDetail[];
    ratings_json: SurveyData;
    employment_status: number;
}
