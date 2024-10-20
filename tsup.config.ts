import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'], //  entry points
  outDir: 'dist', // output directory
  format: ['esm', 'cjs'], // CommonJS and ESM
  // Exclude certain files and directories
  external: ['docs', 'test', 'node_modules', 'src/**/*.test.ts'],
  sourcemap: true, // for easier debugging
  dts: true, // Generate declaration files
  clean: true, // Clean output directory before build
  tsconfig: './tsconfig.json',
});
