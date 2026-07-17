import md5 from "js-md5";
import CryptoJS from 'crypto-js';
import {generateDeviceId, randomString } from "./utils";
import {
    ClientGetParams,
    ClientPostParams,
    CSRFToken,
    ServerHttpOpts,
    HttpToken,
    ResultModel,
    ServerRequestOptions,
    ICookies,
    IStorage,
    ServerHttpOptsMin
} from "./types/http";
import { User, USER_TYPE, USER_TYPE_MAP } from "./types/user";
import { logger } from "./logger";
import { CONTENT_TYPE_KEY, CONTENT_TYPE_MAP, ResponseContext } from "./router";


const DEFAULT_LOCALE = 'zh-CN';

const _GET_ERROR = "Get request error!"
const _POST_ERROR = "Post request error!";

export const COOKIE_NAMES = {
    "IBOOT_DEVICE_ID": "dvid",
    "IBOOT_LANG": "lang",
    "IBOOT_WEBSITE_ID": "wid",
    "IBOOT_WEBSITE_NO": "wno",
    "IBOOT_TOKEN": "token",
    "IBOOT_USER": "user"
} as const

const HEADER_NAMES = {
    "DEVICE_ID": "Device-Id",
    "LANG": "Lang",
    "WEBSITE_ID": "Website-Id",
    "WEBSITE_NO": "Website-No",
} as const

const getBaseUrl = (urlName: string) => {
    const baseUrl = process.env.BASE_URL || '/api/services';
    return `${baseUrl}?m=${urlName}`
}

export const get = async <T>(urlName: string, opts?: ClientGetParams): Promise<ResultModel<T>> => {
    let url = getBaseUrl(urlName);
    if (opts?.data) {
        const params = new URLSearchParams(opts.data);
        url += `&${params}`
    }
    const heads = opts?.headers;
    logger.info({
        "url": url,
        "headers": heads,
    }, "GET")
    const res = await fetch(url, {
        method: 'GET',
        headers: heads,
        cache: opts?.useCache ? 'force-cache' : 'default'
    });

    if (res.ok) {
        const headersMap = Object.fromEntries(res.headers.entries());
        const result = { ...await res.json(), headers: headersMap };
        logger.debug(result, "GET_RESULT")
        return result
    }
    const msg = {
        code: res.status,
        success: false,
        msg: res.statusText
    }
    logger.error(msg);
    return msg;
}

export const post = async <T>(url: string, opts?: ClientPostParams): Promise<ResultModel<T>> => {
    const data = opts?.data ?? {};
    const heads = opts?.headers;
    let body: string | FormData;
    const defaultHeads = opts?.headers
    const proxyHeaders = new Headers(defaultHeads);
    if (!(data instanceof FormData)) {
        body = JSON.stringify(data);
        proxyHeaders.set(CONTENT_TYPE_KEY, CONTENT_TYPE_MAP.applicationJson);
    } else {
        body = data;
    }
    if (heads) {
        for (let field in heads) {
            const value = heads[field];
            if (value) {
                proxyHeaders.set(field, value);
            }
        }
    }
    logger.info({
        "url": url,
        "headers": proxyHeaders,
    }, "POST")
    const res = await fetch(url, {
        method: 'POST',
        headers: proxyHeaders,
        body: body,
    });
    if (res.ok) {
        const headersMap = Object.fromEntries(res.headers.entries());
        const result = { ...await res.json(), headers: headersMap };
        logger.debug(result, "POST_RESULT")
        return result
    }
    const msg = {
        code: res.status,
        success: false,
        msg: res.statusText,
    }
    logger.error(msg);
    return msg;
}

export const iGet = async <T>(url: string, opts?: ClientGetParams): Promise<T | undefined> => {
    const res = await get<T>(url, opts);
    if (res.success) {
        return res.data as T;
    }
    if (opts?.showError) {
        opts.showError(res.msg ?? _GET_ERROR);
        return;
    }
    throw Error(res.msg ?? _GET_ERROR)
}

export const iPost = async <T>(url: string, opts?: ClientPostParams): Promise<T | undefined> => {
    const res = await post<T>(url, opts);
    if (res.success) {
        return res.data;
    }
    if (opts?.showError) {
        opts.showError(res.msg ?? _POST_ERROR);
        return;
    }
    throw Error(res.msg ?? _POST_ERROR)
}

export const iPostSuccess = async (url: string, opts?: ClientPostParams): Promise<boolean> => {
    const res = await post(url, opts);
    if (res.success) {
        if (opts?.showSuccess) {
            opts.showSuccess(res.msg ?? 'SUCCESS')
        }
        return true;
    }
    if (opts?.showError) {
        opts.showError(res.msg ?? _POST_ERROR);
    }
    return false;
}

export const getServerHttpHeaders = (storage: IStorage): ServerHttpOptsMin => {
    if (storage.get) {
        const deviceId = storage.get(HEADER_NAMES.DEVICE_ID);
        const lang = storage.get(HEADER_NAMES.LANG);
        const websiteId = storage.get(HEADER_NAMES.WEBSITE_ID);
        const websiteNo = storage.get(HEADER_NAMES.WEBSITE_NO);
        const result: ServerHttpOpts = {}
        if (deviceId && deviceId.length > 0) {
            result.deviceId = deviceId;
        }
        if (lang && lang.length > 0) {
            result.lang = lang
        }
        if (websiteId && websiteId.length > 0) {
            result.websiteId = websiteId
        }
        if (websiteNo && websiteNo.length > 0) {
            result.websiteNo = websiteNo
        }
        return result;
    }
    throw new Error("The get method of IStorage has not been implemented.")
}

export const setServerHttpHeaders = (storage: IStorage, opts: ServerHttpOptsMin): void => {
    if (storage.set) {
        if (opts.deviceId) {
            storage.set(HEADER_NAMES.DEVICE_ID, opts.deviceId)
        }
        if (opts.lang) {
            storage.set(HEADER_NAMES.LANG, opts.lang);
        }
        if (opts.websiteId) {
            storage.set(HEADER_NAMES.WEBSITE_ID, opts.websiteId);
        }
        if (opts.websiteNo) {
            storage.set(HEADER_NAMES.WEBSITE_NO, opts.websiteNo)
        }
    } else {
        throw new Error("The set method of IStorage has not been implemented.")
    }
}

export const getServerHttpCookies = (cookies: ICookies): ServerHttpOptsMin => {
    if (cookies.get) {
        const deviceId = cookies.get(COOKIE_NAMES.IBOOT_DEVICE_ID);
        const lang = cookies.get(COOKIE_NAMES.IBOOT_LANG);
        const websiteId = cookies.get(COOKIE_NAMES.IBOOT_WEBSITE_ID);
        const websiteNo = cookies.get(COOKIE_NAMES.IBOOT_WEBSITE_NO);
        const result: ServerHttpOpts = {}
        if (deviceId && deviceId.length > 0) {
            result.deviceId = deviceId;
        }
        if (lang && lang.length > 0) {
            result.lang = lang
        }
        if (websiteId && websiteId.length > 0) {
            result.websiteId = websiteId
        }
        if (websiteNo && websiteNo.length > 0) {
            result.websiteNo = websiteNo
        }
        return result;
    }
    throw new Error("The get method of ICookies has not been implemented.")
}

export const setServerHttpCookies = (cookies: ICookies, opts: ServerHttpOptsMin): void => {
    if (cookies.set) {
        if (opts.deviceId) {
            cookies.set(COOKIE_NAMES.IBOOT_DEVICE_ID, opts.deviceId)
        }
        if (opts.lang) {
            cookies.set(COOKIE_NAMES.IBOOT_LANG, opts.lang);
        }
        if (opts.websiteId) {
            cookies.set(COOKIE_NAMES.IBOOT_WEBSITE_ID, opts.websiteId);
        }
        if (opts.websiteNo) {
            cookies.set(COOKIE_NAMES.IBOOT_WEBSITE_NO, opts.websiteNo)
        }
    } else {
        throw new Error("The set method of ICookies has not been implemented.")
    }
}

export const getLoginUser = (cookies: ICookies): User | undefined => {
    if (cookies.get) {
        const userjson = cookies.get(COOKIE_NAMES.IBOOT_USER)
        if (userjson && userjson.length > 0) {
            return JSON.parse(userjson);
        }
    }
    return undefined
}

export const getToken = (cookies: Record<string, string>): HttpToken | undefined => {
    if (cookies.get) {
        const userjson = cookies[COOKIE_NAMES.IBOOT_USER];
        if (userjson && userjson.length > 0) {
            const user = JSON.parse(userjson);
            const username = user.username;
            const utype = user.userType.toString();
            const token = cookies[COOKIE_NAMES.IBOOT_TOKEN];
            if (token) {
                return {
                    "username": username,
                    "utype": utype,
                    "token": token
                }
            }
        }
    }
}

const getCookieOpts = () => {
    return {
        path: '/',
        secure: process.env.APP_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}

const cleanCookieOpts = {
    maxAge: -1, //设置为 -1表示立即过期
    httpOnly: true,
    path: '/',
}


export const setToken = (data: User & { token: string }, res: ResponseContext): void => {
    const { id, name, username, nickname, headImg, token, lastLoginTime, deviceId, userType, mustChangePwd } = data;
    const loginUser: User = {
        id: id,
        name: name,
        username: username,
        nickname: nickname || name,
        headImg: headImg,
        lastLoginTime: lastLoginTime,
        deviceId: deviceId,
        userType: userType,
        accountType: 0,
        needToReview: false,
        socketOnline: false,
        mustChangePwd: mustChangePwd
    };
    res.cookies[COOKIE_NAMES.IBOOT_TOKEN] = {
        value: token,
        options: getCookieOpts()
    }
    res.cookies[COOKIE_NAMES.IBOOT_USER] = {
        value: JSON.stringify(loginUser),
        options: getCookieOpts()
    }
}

export const cleanToken = (cookies: ICookies): void => {
    if (!cookies.set) {
        throw new Error('cookies set function is undefined')
    }
    cookies.set(COOKIE_NAMES.IBOOT_TOKEN, '', cleanCookieOpts);
    cookies.set(COOKIE_NAMES.IBOOT_USER, '', cleanCookieOpts);
    if (!cookies.delete) {
        throw new Error('cookies delete function is undefined')
    }
    cookies.delete(COOKIE_NAMES.IBOOT_TOKEN, cleanCookieOpts);
    cookies.delete(COOKIE_NAMES.IBOOT_USER, cleanCookieOpts);
}

export class HttpClient {
    private readonly baseUrl: string;
    private readonly helloMethod: string;
    private readonly apiKey: string;
    private readonly userType: USER_TYPE;
    private readonly userFrom: string;
    private readonly deviceId: string;
    private readonly version: string = '1';
    private readonly lang: string;
    private readonly websiteId?: string;
    private readonly websiteNo?: string;
    constructor(opts: Readonly<ServerHttpOpts>) {
        const isProduction = process.env.APP_ENV === 'production';
        if (!isProduction) {
            logger.warn("This is currently a development environment!")
        }
        this.baseUrl = process.env.APP_BASEURL!;
        this.apiKey = process.env.APP_APIKEY!;
        this.userFrom = process.env.APP_USERFROM ?? '1';

        this.helloMethod = opts.helloURL ?? ''
        this.userType = opts.userType ?? USER_TYPE_MAP.TYPE_MGT;
        this.deviceId = opts.deviceId ?? generateDeviceId();
        this.lang = opts.lang ?? DEFAULT_LOCALE;
        this.websiteId = opts.websiteId
        this.websiteNo = opts.websiteNo
    }

    encrypt(data: string) {
        const key = CryptoJS.enc.Utf8.parse(this.apiKey);
        return CryptoJS.AES.encrypt(data, key).toString();
    }

    decrypt(data: string) {
        const key = CryptoJS.enc.Utf8.parse(this.apiKey);
        return CryptoJS.AES.decrypt(data, key, {
            mode: CryptoJS.mode.ECB,
        }).toString(CryptoJS.enc.Utf8);
    }
    
    setHttpOptsToCookies = (cookies: Record<string, string>) => {
        if (this.deviceId && this.deviceId.length > 0) {
            cookies[COOKIE_NAMES.IBOOT_DEVICE_ID] = this.deviceId
        }
        if (this.websiteId && this.websiteId.length > 0) {
            cookies[COOKIE_NAMES.IBOOT_WEBSITE_ID] = this.websiteId;
        }
        if (this.websiteNo && this.websiteNo.length > 0) {
            cookies[COOKIE_NAMES.IBOOT_WEBSITE_NO] = this.websiteNo;
        }
        if (this.lang && this.lang.length > 0) {
            cookies[COOKIE_NAMES.IBOOT_LANG] = this.lang
        }
    }


    private async sign(data: URLSearchParams): Promise<string> {
        //由后台分配
        const _apiKey = "&key=" + (await this.helloIboot());
        const arr: string[] = [];
        for(const key of data.keys()){
            arr.push(key);
        }
        arr.sort((a: string, b: string) => {
            // 提取数字进行比较
            const aMatch = a.match(/(\d+)/);
            const bMatch = b.match(/(\d+)/);

            if (aMatch && bMatch && a.replace(/\d+/, '') === b.replace(/\d+/, '')) {
                // 相同前缀，比较数字
                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            // 否则使用原来的比较方式
            return a.toLowerCase().localeCompare(b.toLowerCase(), undefined, {
                numeric: true,  // 启用数字识别
                sensitivity: 'base'
            });
        });

        const res: string[] = [];
        arr.forEach((v: string) => {
            const value = data.get(v);
            if(value){
                res.push(v + "=" + value);
            }
        });
        const paramsStr: string = res.join("&");
        const str = md5.md5((paramsStr + _apiKey).toLocaleUpperCase());
        const logInfo = {
            params: paramsStr,
            md5: str
        }
        logger.debug(logInfo, "API_SIGN")
        return str;
    }

    private assemblyParameter(data?: URLSearchParams, username?: string): URLSearchParams {
        const params = data ?? new URLSearchParams();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        params.set('timezone', timezone);
        params.set('timestamp', Date.now().toString());
        params.set('echostr', randomString(10));
        params.set('version', this.version);
        params.set('deviceId', this.deviceId);
        params.set('webid', this.websiteId ?? '');
        params.set('apiKey', this.apiKey);

        if (username && username.length > 0) {
            params.set('username', username);
        }
        return new URLSearchParams([...params].filter(([, v]) => v !== ''));
    }

    private async assemblyHeader({ urlParams, token }: Readonly<{ urlParams: URLSearchParams, token?: Readonly<HttpToken> }>) {
        const h: Record<string, string> = {
            'Res-Type': 'json',
            'Device-Id': this.deviceId,
            'User-Type': token?.utype.toString() ?? this.userType.toString(),
            'User-From': this.userFrom,
            'Api-Key': this.apiKey
        }
        h[CONTENT_TYPE_KEY] = CONTENT_TYPE_MAP.applicationXwwwFormUrlencoded;
        if (this.lang && this.lang.length > 0) {
            h['Lang'] = this.lang
        }
        if (this.websiteId && this.websiteId.length > 0) {
            h['Web-Id'] = this.websiteId
        }
        if (this.websiteNo && this.websiteNo.length > 0) {
            h['Web-No'] = this.websiteNo
        }
        if (token) {
            if (token.token && token.token.length > 0 && token.username && token.username.length > 0) {
                h['Authorization'] = token.token;
                h['Username'] = token.username;
            }
            if (token.xcsrf) {
                h[token.xcsrf.csrfHeader] = token.xcsrf.csrfToken;
            }
        }
        const sign = await this.sign(urlParams);
        h['Sign'] = sign
        return h;
    }

    private async helloIboot(): Promise<string> {
        if (this.helloMethod.length <= 0) {
            return this.apiKey;
        }
        const api = this.getApiUrl(this.helloMethod);
        const h: Record<string, string> = {
            'Res-Type': 'json',
            'Api-Key': this.apiKey
        }
        h[CONTENT_TYPE_KEY] = CONTENT_TYPE_MAP.applicationXwwwFormUrlencoded
        const logInfo = {
            "url": api,
            "headers": h
        }
        logger.debug(logInfo, "HELLO");
        const res = await fetch(api, {
            method: 'GET',
            headers: h,
            credentials: 'include',
            cache: 'force-cache'
        });
        if (res.ok) {
            const result = await res.json();
            logger.debug(result.data, 'HELLO RESULT')
            return result.data;
        }
        throw new Error('hello iBoot error!')
    }

    private getApiUrl(url: string): string {
        return `${this.baseUrl}/${url}`;
    }

    async csrf(): Promise<string | undefined> {
        const res = await this.get<CSRFToken>({
            url: 'guest/csrf'
        });
        if (res.success) {
            const data = res.data;
            if (data) {
                return data["csrfToken"].toString();
            }
        }
        return undefined;
    }

    async get<T>({ url, data, token, cache = 'default' }: Readonly<ServerRequestOptions>): Promise<ResultModel<T>> {
        const params = this.assemblyParameter(data ? new URLSearchParams(data) : undefined);
        const headers = await this.assemblyHeader({ "urlParams": params, "token": token });
        const api = `${this.getApiUrl(url)}?${params.toString()}`
        const logInfo = {
            "url": api,
            "headers": headers
        }
        logger.info(logInfo, "GET");
        const res = await fetch(api, {
            "method": 'GET',
            "headers": headers,
            "credentials": 'include',
            "cache": cache
        });
        if (res.ok) {
            const headersMap = Object.fromEntries(res.headers.entries());
            const result = { ...await res.json(), headers: headersMap };
            logger.debug(result, "GET_RESULT")
            return result;
        }
        const msg = {
            code: res.status,
            success: false,
            msg: res.statusText
        }
        logger.error(msg);
        return msg;
    }

    async post<T>({ url, data, token, cache = "default" }: Readonly<ServerRequestOptions>): Promise<ResultModel<T>> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const copyData = (data ? { ...data } : {}) as Record<string, any>
        const buffer = copyData.buffer ?? undefined;
        const boundary = copyData.boundary ?? undefined;
        if (buffer) {
            delete copyData.buffer;
        }
        if (boundary) {
            delete copyData.boundary;
        }
        const params = this.assemblyParameter(new URLSearchParams(copyData));
        const headers = await this.assemblyHeader({ "urlParams": params, "token": token });
        if (buffer && boundary) {
            headers[CONTENT_TYPE_KEY] = `multipart/form-data; boundary=${boundary}`;
        }
        const api = this.getApiUrl(url);
        const logInfo = {
            "url": api,
            "headers": headers,
            "params": params
        }
        logger.info(logInfo, "POST");
        const sUrl = buffer ? `${api}?${params}` : api;
        const res = await fetch(sUrl, {
            "method": 'POST',
            "headers": headers,
            "body": buffer ? buffer : params,
            "credentials": 'include',
            "cache": cache
        });
        if (res.ok) {
            const headersMap = Object.fromEntries(res.headers.entries());
            const result = { ...await res.json(), headers: headersMap };
            logger.debug(result, "POST_RESULT");
            return result;
        }
        const msg = {
            code: res.status,
            success: false,
            msg: res.statusText
        }
        logger.error(msg);
        return msg;
    }
}