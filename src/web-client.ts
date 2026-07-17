import { CONTENT_TYPE_KEY, CONTENT_TYPE_MAP, COOKIE_NAMES } from "./constants";
import { ClientGetParams, ClientPostParams, ICookies, ResultModel } from "./types/http";
import { User } from "./types/user";

const _GET_ERROR = "Get request error!"
const _POST_ERROR = "Post request error!";

const logger ={
    info:(msg:any, tag:string)=>{
        console.info(tag, JSON.stringify(msg))
    },
    debug:(msg:any, tag:string)=>{
        console.debug(tag, JSON.stringify(msg))
    },
    error:(msg:any)=>{
        console.error(JSON.stringify(msg))
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
