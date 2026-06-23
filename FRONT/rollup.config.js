import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config();

const replacePlugin = replace({
    preventAssignment: true,
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.URL_BASE': JSON.stringify(process.env.URL_BASE),
});

export default [
    {
        input: 'src/index.js',
        output: { file: 'public/bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/login.js',
        output: { file: 'public/login-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/landing.js',
        output: { file: 'public/landing-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/perfil.js',
        output: { file: 'public/perfil-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/listas.js',
        output: { file: 'public/listas-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/miembros.js',
        output: { file: 'public/miembros-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/configuracion.js',
        output: { file: 'public/config-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/peliculas.js',
        output: { file: 'public/peliculas-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/pelicula.js',
        output: { file: 'public/pelicula-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/lista.js',
        output: { file: 'public/lista-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/dashboard.js',
        output: { file: 'public/dashboard-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
    {
        input: 'src/pages/admin.js',
        output: { file: 'public/admin-bundle.js', format: 'cjs' },
        plugins: [replacePlugin],
    },
];
