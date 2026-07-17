// adapters/nuxtjs.adapter.ts - Nuxt.js 适配器

import { deleteCookie, getRequestURL, H3Event, MultiPartData, parseCookies, readBody, readMultipartFormData, setCookie, setHeader, setResponseStatus } from "h3";
import { FrameworkAdapter, RequestContext, RequestFormData, ResponseContext } from "../types/router";
import { logger } from "../logger";
import { ICookies } from "../types/http";
import { CONTENT_TYPE_KEY, CONTENT_TYPE_MAP } from "../constants";

export class NuxtJsAdapter implements FrameworkAdapter<H3Event, any> {
    async parseRequest(event: H3Event): Promise<RequestContext> {
        const url = getRequestURL(event);
        const method = event.method;
        const contentType = event.headers.get(CONTENT_TYPE_KEY) || '';
        const cookies = parseCookies(event);

        // 解析请求体
        let body: Record<string, any> | undefined;
        let requestFormData: RequestFormData | undefined;
        if (method !== 'GET') {
            if (contentType.includes(CONTENT_TYPE_MAP.applicationJson)) {
                try {
                    body = await readBody(event);
                } catch (e) {
                    logger.warn("request body is null!")
                }
            } else if (contentType.includes(CONTENT_TYPE_MAP.multipartFormData)) {
                const multipartData: Array<MultiPartData> = await readMultipartFormData(event) ?? [];
                // 构建 FormData 对象
                const formData = new FormData();
                const buffers: Uint8Array[] = [];
                for (const field of multipartData) {
                    if (field.type === 'file' && field.data) {
                        const file = new File([field.data as BlobPart], field.filename || 'unknown', {
                            type: field.type
                        });
                        formData.append("file", file);
                        // 收集 buffer 数据
                        buffers.push(field.data);
                    } else if (field.name) {
                        const value = field.data ? field.data.toString() : '';
                        formData.append(field.name, value);
                    }
                }

                // 可以合并所有的文件 buffer
                const totalBuffer = Buffer.concat(buffers.map(buf => Buffer.from(buf)));
                const arrayBuffer = totalBuffer.buffer.slice(
                    totalBuffer.byteOffset,
                    totalBuffer.byteOffset + totalBuffer.byteLength
                );

                requestFormData = { formData, buffer: arrayBuffer };

            } else if (contentType.includes(CONTENT_TYPE_MAP.applicationXwwwFormUrlencoded)) {
                try {
                    body = await readBody(event);
                } catch (e) {
                    logger.warn("request body is null!")
                }
            }
        }

        return {
            url,
            method,
            contentType,
            body,
            requestFormData,
            cookies,
            context: event
        };
    }

    createResponse(ctx: ResponseContext): any {
        const { status, headers, body, cookies, cleanCookies, context } = ctx;
        const event: H3Event = context;
        setResponseStatus(event, status);
        Object.entries(headers).forEach(([key, value]) => {
            setHeader(event, key, value)
        });
        Object.entries(cookies).forEach(([name, cookie]) => {
            if (typeof cookie === 'object' && cookie.value) {
                setCookie(event, name, cookie.value, cookie.options);
            } else if (typeof cookie === 'string') {
                setCookie(event, name, cookie);
            }
        });
        if (cleanCookies) {
            const c: ICookies = {
                set(key, value, opts) {
                    setCookie(event, key, value, opts);
                },
                delete(key, opts) {
                    deleteCookie(event, key, opts);
                },
            }
            cleanCookies(c);
        }
        return body;
    }

    setCookie(response: ResponseContext, name: string, value: string, options?: any): void {
        response.cookies[name] = { value, options };
    }

}
