export const ACCOUNT_TYPE_MAP = {
    GENERAL : 0,
    PHONE : 1,
    EMAIL : 2
}

export const USER_TYPE_MAP = {
    TYPE_MGT : 0,
    TYPE_C : 1,
    TYPE_B : 2
}

export const USER_FORM_MAP = {
    FROM_WEB : 1,
    FROM_PC : 2,
    FROM_WX_MINI_PRO : 3,
    FROM_WX_PLU : 4,
    FROM_WX_E : 5,
    FROM_APP : 6,
    FROM_DEVICE : 7
}

export const USER_SEX_MAP = {
    unknown:0,
    male:1,
    female:2,
}

export type ACCOUNT_TYPE = typeof ACCOUNT_TYPE_MAP[keyof typeof ACCOUNT_TYPE_MAP];
export type USER_TYPE = typeof USER_TYPE_MAP[keyof typeof USER_TYPE_MAP];
export type USER_FORM = typeof USER_FORM_MAP[keyof typeof USER_FORM_MAP];
export type USER_SEX = typeof USER_SEX_MAP[keyof typeof USER_SEX_MAP];

// User interface
export interface User {
    id: string;
    name: string;
    userType: USER_TYPE;
    username?: string;
    nickname?: string;
    sex?: USER_SEX;
    headImg?: string;
    lastLoginTime?: string;
    tokenExpired?: string;
    deviceId?: string;
    status?: number;
    accountType?: number;
    enabled?: boolean;
    userFrom?: USER_FORM;
    needToReview?: boolean;
    socketOnline?: boolean;
    createTime?: string;
    mustChangePwd?: boolean;
}