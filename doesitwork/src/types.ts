export type AdminUser = {
    user_id: string;
    name: string;
    email: string;
};

export type Location = {
    location_id: string;
    parent_id: string;
    name: string;
    icon: string;
};

export type Category = {
    category_id: string;
    name: string;
    icon: string;
    flags: string[];
};

export type Vote = {
    working: boolean;
    flags: string[];
    timestamp: number;
};

export type Service = {
    service_id: string;
    name: string;
    location: string;
    category: string;
    votes: Vote[];
};
