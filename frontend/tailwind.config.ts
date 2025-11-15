import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F7',
          100: '#FFE2EA',
          200: '#FFC3D0',
          300: '#FF9DB2',
          400: '#F57492',
          500: '#E9557B',
          600: '#D03369',
        },
        secondary: {
          50: '#F3FBF7',
          100: '#D8F5E5',
          200: '#B4ECCF',
          300: '#7FDBA9',
          400: '#44C179',
          500: '#22A45D',
          600: '#178048',
        },
        tertiary: {
          50: '#F6F2FF',
          100: '#E6DCFF',
          200: '#C9B5FF',
          300: '#AA8CFF',
          400: '#8B5DFF',
          500: '#6F3FFF',
        },
        neutral: {
          900: '#1A1A1F',
          800: '#26262B',
          700: '#3C3C44',
          600: '#555560',
          500: '#737380',
          400: '#9A9AAA',
          300: '#C0C0CC',
          200: '#E0E0E8',
          100: '#F5F5FA',
        },
        base: {
          background: '#F4F6F6',
          surface: '#FFFFFF',
          surfaceMuted: '#F5F5F7',
          borderSubtle: '#E3E4EA',
          divider: '#ECEDEF',
        },
        status: {
          success: '#22A45D',
          warning: '#F6A723',
          danger: '#E5495E',
          info: '#3B82F6',
        },
        tags: {
          availableBg: '#E6F8EE',
          availableText: '#1B9150',
          outOfStockBg: '#FDE7EC',
          outOfStockText: '#D13C60',
        },
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        sectionGap: '40px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 4px 10px rgba(15, 23, 42, 0.06)',
        'soft-elevated': '0 12px 35px rgba(15, 23, 42, 0.08)',
        inner: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      },
      fontSize: {
        h1: ['26px', { lineHeight: '32px', letterSpacing: '-0.4px', fontWeight: '600' }],
        h2: ['20px', { lineHeight: '26px', letterSpacing: '-0.2px', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        subtitle: ['14px', { lineHeight: '20px', fontWeight: '500' }],
        body: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        label: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        caption: ['11px', { lineHeight: '14px', fontWeight: '400' }],
        dataLarge: ['24px', { lineHeight: '30px', letterSpacing: '-0.4px', fontWeight: '700' }],
      },
      maxWidth: {
        container: '1440px',
      },
    },
  },
  plugins: [],
};

export default config;

