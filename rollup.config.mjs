import typescript from 'rollup-plugin-typescript2';
import terser from "@rollup/plugin-terser";

export default {
    input: './src/index.ts',
    output: [
        {
            file: "dist/index.cjs.js",
            format: "cjs",
            sourcemap: true
        },
        {
            file: "dist/index.esm.js",
            format: "esm",
            sourcemap: true
        }
    ],

    plugins: [
        typescript(),
        terser()
    ],
};