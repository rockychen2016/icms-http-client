import { ICookies, IStorage, ResultModel } from "./http";
import { USER_TYPE } from "./user";

export type ContentType = 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded'
export type Method = 'GET' | 'POST'
export type RequestFormData = {
    formData: FormData;
    buffer: ArrayBuffer;
}
export type ResponseCookies = Record<string, { value: string; options?: any }>;
export interface RequestContext {
    url: URL;
    method: Method | string,
    contentType: ContentType | string,
    body?: Record<string, any>;
    requestFormData?: RequestFormData;
    cookies: Record<string, string>;
    context?: any
}

export interface ResponseContext {
    status: number;
    headers: Record<string, string>;
    cookies: ResponseCookies;
    body: ResultModel<any>;
    context?: any;
    cleanCookies?: (cookies: ICookies) => void
}

/**
 * 路由处理适配器
 * 不同框架集成请实成该适配器
 * 注：本组件已实现NextJs、NuxtJs框架的路由处理
 */
export interface FrameworkAdapter<T, R> {
    /**
     * 解析请求
     * @param request 
     */
    parseRequest(request: T): Promise<RequestContext>;
    /**
     * 创建响应
     * @param context 
     */
    createResponse(context: ResponseContext): R;
    /**
     * 
     * @param response 设置cookies
     * @param name 
     * @param value 
     * @param options 
     */
    setCookie(response: ResponseContext, name: string, value: string, options?: any): void;
}
export interface RouteConfig {
    /**
     * 指定访问服务端的用户类型
     */
    userType: USER_TYPE,
    /**
     * 设置API影射
     */
    APIMAP: Record<string, string>,
    /**
     * 获取服务端API-KEY的URL,如果本地服务端APIKEY与服务端APIKEY一至，则不用设置
     * 使用场影：服务端开放第三方API时，第三方需要申请APIKEY，这时第三方需要使用申请的APIKEY换取服务器真实的APIKEY,通过真实的APIKEY访问接口
     */
    helloURL?: string,

    /**
     * 自定义处理成功输出
     * @param param0 
     * @returns 
     */
    onHandlerSuccess?: ({ url, data, req, res }: Readonly<{ url: string, data: any, req: RequestContext, res: ResponseContext }>) => void
}

export type RouteStorage = {
    headers: IStorage,
    cookies: ICookies
}