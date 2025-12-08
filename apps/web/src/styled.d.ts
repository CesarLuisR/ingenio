import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        mode: 'light' | 'dark';
        colors: {
            background: string;
            card: string;
            text: {
                primary: string;
                secondary: string;
                tertiary: string;
            };
            border: string;
            accent: {
                primary: string;
                hover: string;
                text: string;
            };
            status: {
                ok: string;
                warning: string;
                critical: string;
                neutral: string;
            };
            chart: {
                grid: string;
                tooltip: string;
            };
        };
        breakpoints: {
            mobile: string;
            tablet: string;
            laptop: string;
            desktop: string;
        };
    }
}
