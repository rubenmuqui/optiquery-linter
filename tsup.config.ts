import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/index.ts', 'src/plugins/index.ts'],
  format: ['esm'],         
  dts: true,               
  splitting: false,
  sourcemap: true,
  clean: true,             
  minify: true,            
  target: 'node18',      
});