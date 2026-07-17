import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  define: {
    __dirname: 'import.meta.dirname',
  },
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/client-entry.ts'),
      name: 'icms-http-client-client',
      fileName: (format) => `icms-http-client.client.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [],  // 客户端无外部依赖，全打包
    },
    outDir: 'dist',
    emptyOutDir: false  // 不删主构建产物
  },
  plugins: [
    dts({
      insertTypesEntry: false,
      outDir: 'dist/types',
      include: ['src/client-entry.ts', 'src/web-client.ts', 'src/types/**/*.ts', 'src/constants.ts'],
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.d.ts']
  }
})
