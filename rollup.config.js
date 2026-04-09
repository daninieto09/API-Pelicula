import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config(); // lee el .env

export default {
	input: 'src/index.js',
	output: {
		file: 'public/bundle.js',
		format: 'cjs',
	},
	plugins: [
        replace({
            preventAssignment: true,
            'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
            'process.env.URL_BASE': JSON.stringify(process.env.URL_BASE),
        })
    ]
};
