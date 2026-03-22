// src/utilities/AppTheme.tsx

/* ---------------------------------- */
/* Type definitions */
/* ---------------------------------- */

interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
        primary: string;
        secondary: string;
        disabled: string;
        inverse: string;
    };
    status: {
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    border: {
        default: string;
        focused: string;
        error: string;
    };
    shadow: string;
    overlay: string;
    gradient: {
        cinema: string[];
        card: string[];
        button: string[];
    };
}

interface AppThemeType {
    colors: ColorPalette;
}

/* ---------------------------------- */
/* Color definitions */
/* ---------------------------------- */
const colors: ColorPalette = {
    // Main brand colors
    primary: '#FF2E63',    // Electric Crimson
    secondary: '#432323',  // Vanta Black
    accent: '#7647a3',     // Royal Violet (for the bot's "voice" or glowing state)
    // Background colors
    background: '#2F5755',
    surface: '#432323',

    // Text colors
    text: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        disabled: '#4D4D4D',
        inverse: '#FFFFFF',
    },

    // Status colors
    status: {
        success: '#00FFAB',
        warning: '#FFCC00',
        error: '#FF2E63',
        info: '#8A2BE2',
    },

    // Border colors
    border: {
        default: '#fff',
        focused: '#FF2E63',
        error: '#FF2E63',
    },

    // Shadow and overlay
    shadow: '#fff',
    overlay: 'rgba(0, 0, 0, 0.4)',

    // Gradients
    gradient: {
        cinema: ['#2F5755', '#4d3e36', '#121212'],
        card: ['#2F5755', '#121212'],
        button: ['#FF2E63', '#C1123F'],
    },
};
/* ---------------------------------- */
/* Final export */
/* ---------------------------------- */

export const AppTheme: AppThemeType = {
    colors,
};

// Export individual colors for convenience
export const Colors = colors;