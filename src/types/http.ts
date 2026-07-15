import { USER_TYPE } from "./user";

export type UIFormEntities<T = any> = { [k: string]: T; }
export type CSRFToken = {
    csrfToken: string,
    csrfHeader: string,
}

/**
 * 服务端HttpClient构造函数形参
 */
export type ServerHttpOpts = {
    /**
     * 客户端设备号(浏览器可以生成一个随机数暂存在内存(Cookies)中,保特对客户端的追综)
     */
    "deviceId"?: string,
    /**
     * 国际化语言
     */
    "lang"?: string,
    /**
     * ICMS产品使用
     */
    "websiteId"?: string,
    "websiteNo"?: string,
    /**
     * 用户类型
     */
    "userType"?: USER_TYPE,
    /**
     * 获取服务端API-KEY的URL,如果本地服务端APIKEY与服务端APIKEY一至，则不用设置
     * 使用场影：服务端开放第三方API时，第三方需要申请APIKEY，这时第三方需要使用申请的APIKEY换取服务器真实的APIKEY,通过真实的APIKEY访问接口
     */
    "helloURL"?: string
}

export type ServerHttpOptsMin = Omit<ServerHttpOpts, 'userType' | 'helloURL'>

/**
 * 客户端HTTP请求请求头
 */
export type ClientHttpHeaders = {
    "Device-Id"?: string,
    "Website-Id"?: string,
    "Website-No"?: string,
    "Lang"?: string
}

export type HttpToken = { username: string, token: string, utype: USER_TYPE, xcsrf?: CSRFToken };
export type ResultStream = ReadableStream<Uint8Array>

/**
 * 当前访问网站形参
 */
export type CurWebsite = {
    websiteId?: string,
    websiteNo?: string,
    language: string,
}

/**
 * HTTP请求出参
 */
export interface ResultModel<T> {
    code: number,
    success: boolean,
    msg?: string,
    data?: T,
    host?: string,
    errorCode?: string,
    headers?: Record<string, string>
}

/**
 * 客户端GET入参
 */
export interface ClientGetParams {
    data?: Record<string, string>,
    useCache?: boolean,
    headers?: Record<string, string>,
    showError?: (error: string) => void,
    storage?: IStorage
}

/**
 * 客户端POST入参
 */
export interface ClientPostParams {
    data?: Record<string, string> | FormData | UIFormEntities,
    headers?: Record<string, string>,
    storage?: IStorage
    showError?: (error: string) => void,
    showSuccess?: (msg: string) => void
}

/**
 * 服务端HttpClient GET/POST 请求形参
 */
export type ServerRequestOptions = {
    url: string,
    data?: URLSearchParams | Record<string, any>,
    token?: Readonly<HttpToken>,
    cache?: RequestCache
}

/**
 * ICookies存，取，删
 */
export interface ICookies {
    get?: (key: string) => string | null | undefined,
    set?: (key: string, value: string, opts?: { [k: string]: any }) => void,
    delete?: (key: string, opts?: { [k: string]: any }) => void
}

/**
 * 存贮器
 */
export interface IStorage {
    get?: (key: string) => string | null | undefined,
    set?: (key: string, value: string) => void
}
