import type { Config } from 'tailwindcss';

export const breakpoints = {
    xs: 496,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1440
};

export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontSize: {
                t10: ['10px', { lineHeight: '20px' }],
                t12: ['12px', { lineHeight: '24px' }],
                t14: ['14px', { lineHeight: '28px' }],
                t16: ['16px', { lineHeight: '32px' }],
                t20: ['20px', { lineHeight: '30px' }],
                t32: ['32px', { lineHeight: '48px' }]
            }
        },
        screens: {
            xs: `${breakpoints.xs}px`,
            sm: `${breakpoints.sm}px`,
            md: `${breakpoints.md}px`,
            lg: `${breakpoints.lg}px`,
            xl: `${breakpoints.xl}px`,
            xxl: `${breakpoints.xxl}px`
        }
    },
    plugins: []
} satisfies Config;
