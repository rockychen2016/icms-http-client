import { cleanToken, getServerHttpCookies, getServerHttpOpts, getToken, HttpClient, setToken } from "./http-client";
import { logger } from "./logger";
import { HttpToken, ResultModel } from "./types/http";
import { FrameworkAdapter, RequestContext, ResponseContext, ResponseCookies, RouteConfig, RouteStorage } from "./types/router";
enum API {
    login,
    logout
}
const APIMAP: Record<string, string> = {
    "login": "login",
    "logout": "logout",
    "unknown": ""
}
export const CONTENT_TYPE_KEY = 'Content-Type';
export const CONTENT_TYPE_MAP = {
    "applicationJson": "application/json",
    "multipartFormData": "multipart/form-data",
    "applicationXwwwFormUrlencoded": "application/x-www-form-urlencoded"
}
export class HTTPRouter {
    private config: RouteConfig;
    private http: HttpClient;
    private adapter: FrameworkAdapter;
    constructor({
        config,
        adapter,
        storage
    }: Readonly<{
        config: RouteConfig,
        /**
         * 框架适配路由处理器
         */
        adapter: FrameworkAdapter,
        /**
         * 这里的存取器应该使用Request.headers.get
         */
        storage: RouteStorage
    }>) {
        this.config = config;
        let httpOpts = getServerHttpOpts(storage.headers);
        if (!httpOpts.deviceId || httpOpts.deviceId.trim().length === 0) {
            httpOpts = getServerHttpCookies(storage.cookies);
        }
        this.http = new HttpClient({ ...httpOpts, userType: config.userType, helloURL: config.helloURL })
        this.adapter = adapter;
    }

    async handleRequest<T, R>(rawRequest: T): Promise<R> {

        try {
            // 解析请求
            const request = await this.adapter.parseRequest(rawRequest);
            // 处理请求
            const responseContext = await this.processRequest(request);
            // 框架响应
            return this.adapter.createResponse(responseContext);
        } catch (e) {
            logger.error({ "error": e?.toString() || "Internal server error" }, "ROUTE ERROR");
            const response = this.createErrorResponse(500, e?.toString() || 'Internal server error');
            return this.adapter.createResponse(response);
        }
    }
    private async processRequest(request: RequestContext): Promise<ResponseContext> {
        const searchParams = request.url.searchParams
        const m = searchParams.get('m') ?? 'unknown';
        const apiMap: Record<string, string> = { ...APIMAP, ...this.config.APIMAP }
        const url = apiMap[m];
        const cookies = request.cookies;
        //将客户端设备ID存入Cookies中,以跟踪客户端
        this.http.setHttpOptsToCookies(cookies);
        if (!url || url.length === 0) {
            return this.createErrorResponse(404, 'API not found', cookies);
        }
        let token: HttpToken | undefined;
        // 检查权限
        if (url.startsWith("admin/") || url.startsWith("api/")) {
            token = getToken(cookies)
            logger.debug(token, "token")
            if (!token || token.username.length === 0 || token.token.length === 0) {
                return this.createErrorResponse(409, 'Authentication required', cookies);
            }
        }
        logger.debug({ "content-type": request.contentType }, 'Content-Type')
        logger.debug({ "hostUrl": url, "token": token ? { ...token } : '' }, "processRequest")
        const method = request.method;
        if (method === 'GET') {
            const params = {...searchParams}
            params.delete('m');
            const result = await this.http.get({
                url,
                data: params,
                token
            });
            return this.createResponse({ "url": url, "result": result, "config": this.config, "req": request });
        } else if (method === 'POST') {
            let data: Record<string, any> | undefined;
            const contentType = request.contentType;
            if (contentType.includes(CONTENT_TYPE_MAP.applicationJson) || contentType.includes(CONTENT_TYPE_MAP.applicationXwwwFormUrlencoded)) {
                if (request.body) {
                    data = { ...request.body }
                }
            } else if (contentType.includes(CONTENT_TYPE_MAP.multipartFormData)) {
                //处理文件上传表单
                const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
                if (!boundaryMatch || !request.requestFormData) {
                    return this.createErrorResponse(411, 'Missing boundary in form data', cookies);
                }
                const buffer = request.requestFormData.buffer;
                const boundary = boundaryMatch[1];
                data = {
                    "boundary": boundary,
                    "buffer": Buffer.from(buffer!)
                }
                //文件上传柔合表单字段
                const formData = request.requestFormData.formData;
                if (formData) {
                    for (const [key, value] of Object.entries(formData)) {
                        if (key !== 'file') {
                            data[key] = value;
                        }
                    }
                }
            } else {
                return this.createErrorResponse(410, 'Unsupported content type', cookies);
            }
            const result = await this.http.post({
                url,
                data,
                token,
            });
            return this.createResponse({ "url": url, "result": result, "config": this.config, "req": request })
        }
        return this.createErrorResponse(405, 'Method not allowed, only supported GET or POST', cookies);
    }

    private createResponse({ url, result, config, req }: Readonly<{ url: string, result: ResultModel<any>, config: RouteConfig, req: RequestContext }>) {
        // 创建响应
        const h: Record<string, string> = {};
        h[CONTENT_TYPE_KEY] = CONTENT_TYPE_MAP.applicationJson;
        const response: ResponseContext = {
            status: result.success ? 200 : result.code,
            headers: h,
            cookies: this.setCookies(req.cookies),
            body: result,
            context: req.context
        };

        if (result.success) {
            switch (url) {
                case APIMAP[API[API.login]]:
                    const data = result.data;
                    setToken(data, response);
                    break;
                case APIMAP[API[API.logout]]:
                    response.cleanCookies = (cookies) => cleanToken(cookies)
                    break;
                default:
                    break;
            }

            if (config.onHandlerSuccess) {
                config.onHandlerSuccess({
                    url: url,
                    data: result.data,
                    req: req,
                    res: response
                })
            }
        }
        return response;
    }

    private createErrorResponse(code: number, message: string, cookies?: Record<string, string>): ResponseContext {
        const h: Record<string, string> = {};
        h[CONTENT_TYPE_KEY] = CONTENT_TYPE_MAP.applicationJson;
        return {
            status: code,
            headers: h,
            cookies: cookies ? this.setCookies(cookies) : {},
            body: {
                code: code,
                success: false,
                msg: message
            }
        };
    }

    private setCookies(cookies: Record<string, string>): ResponseCookies {
        const responseCookies: ResponseCookies = {}
        Object.entries(cookies).forEach(([name, cookie]) => {
            responseCookies[name] = { value: cookie }
        });
        return responseCookies;
    }
}
export { NextJsAdapter } from './router-dapter/nextjs'
export { NuxtJsAdapter } from './router-dapter/nuxtjs';
export type { RequestContext, ResponseContext, RouteConfig, RouteStorage, FrameworkAdapter }
