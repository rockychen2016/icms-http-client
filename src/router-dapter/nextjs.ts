//NextJs路由处理 适配器
import { NextRequest, NextResponse } from 'next/server';
import { FrameworkAdapter, RequestContext, RequestFormData, ResponseContext } from '../types/router';
import { logger } from '../logger';
import { CONTENT_TYPE_KEY, CONTENT_TYPE_MAP } from '../router';
import { ICookies } from '../types/http';

export class NextJsAdapter implements FrameworkAdapter {
    async parseRequest(request: NextRequest): Promise<RequestContext> {
        const url = new URL(request.url);
        const method = request.method;
        const contentType = request.headers.get(CONTENT_TYPE_KEY) ?? '';

        const cookies: Record<string, string> = {};
        request.cookies.getAll().forEach(cookie => {
            cookies[cookie.name] = cookie.value;
        });

        let body: Record<string, any> | undefined;
        let requestFormData: RequestFormData | undefined;
        if (method !== 'GET') {
            if (contentType.includes(CONTENT_TYPE_MAP.applicationJson)) {
                try {
                    body = await request.json();
                } catch {
                    logger.warn("request body is null!")
                }
            } else if (contentType.includes(CONTENT_TYPE_MAP.multipartFormData)) {
                const copyRequest = request.clone();
                const formData = await request.formData();
                const buffer = await copyRequest.arrayBuffer();
                requestFormData = { formData, buffer }
            } else if (contentType.includes(CONTENT_TYPE_MAP.applicationXwwwFormUrlencoded)) {
                const params = await request.text();
                const p = new URLSearchParams(params);
                p.delete('m');
                body = p;
            }
        }
        return {
            url,
            method,
            contentType,
            body,
            requestFormData,
            cookies
        };
    }

    createResponse(context: ResponseContext) {
        const response = NextResponse.json(context.body);
        Object.entries(context.cookies).forEach(([name, cookie]) => {
            if (typeof cookie === 'object' && cookie.value) {
                response.cookies.set(name, cookie.value, cookie.options);
            } else if (typeof cookie === 'string') {
                response.cookies.set(name, cookie);
            }
        });

        if (context.cleanCookies) {
            const cookies: ICookies = {
                set(key, value, opts) {
                    response.cookies.set(key, value, opts);
                },
                delete(key, opts) {
                    response.cookies.delete({ ...opts, name: key })
                },
            }
            context.cleanCookies(cookies)
        }
        return response;
    }

    setCookie(response: ResponseContext, name: string, value: string, options?: any): void {
        response.cookies[name] = { value, options };
    }
}