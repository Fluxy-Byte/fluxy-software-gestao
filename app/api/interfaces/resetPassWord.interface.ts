
export interface ResetPassWordBase {
    id: string;
    createdAt: Date;
    token: string;
    used: boolean;
    userId: string;
}

export interface ResetPassWordGet extends ResetPassWordBase { }

export interface ResetPassWordCreate {
    token: string;
    used?: boolean;
    userId: string;
}

export interface ResetPassWordUpdate {
    token?: string;
    used?: boolean;
}