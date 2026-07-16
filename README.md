

# iboot-http-client

中文简介：

iCMS-http-client 是一个轻量的 HTTP 客户端库，旨在帮助开发者快速接入并使用 iCMS 系统的 API。它封装了常见的请求/响应处理、鉴权与类型声明，适用于 TypeScript 在浏览器或 Node.js 环境中的调用场景。

English Summary:

iboot-http-client is a lightweight HTTP client library designed to help developers quickly integrate with the iCMS system API. It wraps common request/response handling, authentication and TypeScript typings for both browser and Node.js usage.

## 主要目标 / Goals

- 简化调用 iCMS API 的流程 / Simplify calling iCMS APIs
- 提供 TypeScript 类型支持 / Provide TypeScript typings
- 支持全局配置、拦截器与鉴权扩展 / Support global config, interceptors and auth

## 特性 / Features

- 基于 Fetch 封装，兼容浏览器与 Node（可按需替换实现） / Built on Fetch, compatible with browser and Node (swapable)
- 全局 `baseURL`、默认 `headers`、自动注入 `token` / Global `baseURL`, default `headers`, automatic `token` injection
- 请求/响应拦截器支持 / Request/response interceptor support
- 类型声明文件位于 `index.d.ts` / Type declarations available in `index.d.ts`

## 安装 / Install

使用 npm:

```bash
npm install "@rock.chen/icms-http-client"
```

或使用 pnpm / yarn:

```bash
pnpm add "@rock.chen/icms-http-client"
yarn add "@rock.chen/icms-http-client"
```

## 快速开始 / Quick Start

示例（TypeScript）：

```ts
import { HttpClient } from '@rock.chen/icms-http-client'

const client = new HttpClient()

// GET example
const list = await client.get('/articles', { data: { page: 1, pageSize: 10 } })

// POST example
const created = await client.post('/articles', { data:title: 'Example', body: 'Content' })

console.log(list, created)
```

更多方法签名与配置请参阅 `src/HttpClient.ts` 与 `index.d.ts`。

## 配置项 / Options

- `deviceId`：客户端设备id(可选),不填会缓存一个随机数
- `lang`：语言(可选),不填默认zh-CN
- `websiteId`:websiteId(网站ID,icms系统调用时可用,不填为icms设置的默认网站)
- `websiteNo`:websiteNo(网站编号,icms系统调用时可用, 不填为icms设置的默认网站),
- `userType`:客户端用户类型0:营运用户,1:C端用户,2.B端用户

## 错误处理 / Error Handling

客户端在网络错误或非 2xx 响应时会抛出异常。请使用 try/catch 处理：

```ts
try {
	await client.get('/protected')
} catch (err) {
	// handle auth failure, network error or business errors
}
```

## 环境变量
.env.development / .env.production 
```
APP_NAME=iCMS
APP_ENV=production
APP_APIKEY=
APP_BASEURL=http://localhost:8081
#用户来源
#1.PCweb
#2.PC桌面应用
#3.微信小程序
#4.微信公众号
#5.企业微信
#6.手机APP
APP_USERFROM=1
```
#### 注意，如在生产环境不能获取以上环境变量，你可以在 shell 配置文件中设置环境变量，例如 .bashrc 或 .profile 导入环境变量
```
export APP_NAME="icms"
export APP_ENV="production"
export APP_APIKEY="xxx"
APP_BASEURL=http://localhost:8081
```

## 开发与贡献 / Contributing

- 欢迎提交 issue 或 PR。请在 issue 中描述重现步骤与期望行为。
- 新特性建议请先在 issue 中讨论。

本项目遵循仓库根目录的 LICENSE 文件。

---

如需我将 README 中的中文或英文内容扩展为更详细的使用示例（例如：鉴权流程、拦截器实现、错误码映射），或把 README 同步到包的 `package.json` 的 `homepage`、`repository` 字段，请告诉我。

