import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'], //  entry points
  outDir: 'dist', // output directory
  format: ['esm', 'cjs'], // CommonJS and ESM
  // Exclude certain files and directories
  bundle: true,
  external: ['docs', 'test', 'src/**/*.test.ts'],
  sourcemap: true, // for easier debugging
  dts: true, // Generate declaration files
  clean: true, // Clean output directory before build
  tsconfig: './tsconfig.json',
});
