
export const COOKIE_NAMES = {
    "IBOOT_DEVICE_ID": "dvid",
    "IBOOT_LANG": "lang",
    "IBOOT_WEBSITE_ID": "wid",
    "IBOOT_WEBSITE_NO": "wno",
    "IBOOT_TOKEN": "token",
    "IBOOT_USER": "user"
} as const

export const CONTENT_TYPE_KEY = 'Content-Type';
export const CONTENT_TYPE_MAP = {
    "applicationJson": "application/json",
    "multipartFormData": "multipart/form-data",
    "applicationXwwwFormUrlencoded": "application/x-www-form-urlencoded"
}