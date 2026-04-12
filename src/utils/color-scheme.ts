export interface ColorScheme {
    background: string;
    text: string;
    border: string;
}

const lightColorScheme: ColorScheme = {
    background: '#FFFFFF',
    text: '#000000',
    border: '#7F7F7F',
};

const darkColorScheme: ColorScheme = {
    background: '#000000',
    text: '#FFFFFF',
    border: '#7F7F7F',
};

export class ColorController {
    scheme: ColorScheme;

    constructor() {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        this.scheme = mediaQuery.matches ? darkColorScheme : lightColorScheme
        mediaQuery.addEventListener('change', ev => {
            if (ev.matches) {
                this.scheme = darkColorScheme;
            } else {
                this.scheme = lightColorScheme;
            }
        })
    }
}