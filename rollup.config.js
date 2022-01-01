import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve'
// import {terser} from 'rollup-plugin-terser';

// use '--environment minify' with rollup
// to minify the input
const minify = process.env.minify || false;

export default {
  input: 'src/app.ts',
  output: { file: 'public/app.js', format: 'esm' },
  plugins:
      [
        nodeResolve(),
        typescript(),
        // minify ? terser() : {},
      ]
};