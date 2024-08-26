export interface Integrations {
    key: string;
    avatarSrc: string;
    title: string;
    subtitle: string;
    type: string;
}

export interface UserProfile {
    profilePicture: string;
    username: string;
    first_name: string;
    last_name: string;
    birthdate: string; // Format: YYYY-MM-DD
    civil_status: "single" | "married" | "widowed" | "separated" | "divorced" | "others" // Add other statuses as needed
    email: string;
    phone_no: string;
    street_or_purok: string;
    barangay: string;
    city: string;
    province: string;
}
