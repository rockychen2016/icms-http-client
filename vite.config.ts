import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  define: {
    __dirname: 'import.meta.dirname'  //替换构建时的所有 __dirname,解决ES模块兼容问题
  },
  build: {
    // 生成 sourcemap（将此放到 build 层级，避免在 rollupOptions.output 中使用）
    sourcemap: true,
    lib: {
      // 入口文件
      entry: resolve(__dirname, 'src/index.ts'),
      // 库名称
      name: 'icms-http-client',
      // 输出文件名
      fileName: (format) => `icms-http-client.${format}.js`,
      // 输出格式
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {

      // 确保外部化处理那些你不想打包进库的依赖
      external: ['js-md5', 'crypto-js', 'pino', 'pino-pretty', 'next-server-context', 'h3'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'js-md5': 'md5',
          'crypto-js': 'CryptoJS',
          'pino': 'pino',
          'pino-pretty': 'PinoPretty',
          'next-server-context': 'next-server-context',
          'h3': 'h3'
        },
      }
    },
    // 输出目录
    outDir: 'dist',
    // 清空输出目录
    emptyOutDir: true
  },
  plugins: [
    // 生成类型声明文件
    dts({
      insertTypesEntry: true,
      // 类型声明输出目录
      outDir: 'dist/types',
      // 是否包含私有成员
      include: ['src'],
      // 排除测试文件
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts']
    })
  ],
  // 添加解析选项
  resolve: {
    extensions: ['.ts', '.js', '.d.ts']
  }
})