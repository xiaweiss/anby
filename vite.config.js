import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    }
  },
  plugins: [
    dts({
      // 生成类型定义文件
      insertTypesEntry: true,
      // 输出目录
      outDirs: 'dist/types',
      // 包含的文件
      include: ['src/**/*'],
      // 排除的文件
      exclude: ['test/**/*.test.ts'],
    }),
  ],
})
