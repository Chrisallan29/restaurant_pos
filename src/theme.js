import { createContext, useState, useMemo} from "react";
import { createTheme } from "@mui/material/styles";




export const tokens = (mode) => ({
    ...(mode === 'dark'
        ? {
            gray: {
                100: "#f3f2f3",
                200: "#e6e5e6",
                300: "#dad8da",
                400: "#cdcbcd",
                500: "#c1bec1",
                600: "#9a989a",
                700: "#747274",
                800: "#4d4c4d",
                900: "#272627"
            },
            primary: {
                100: "#a1a1a1",
                200: "#888888",
                300: "#6f6f6f",
                400: "#565656",
                500: "#3d3d3d",
                600: "#2e2e2e",
                700: "#1f1f1f",
                800: "#0f0f0f",
                900: "#000000"
            },
            blueAccent: {
                100: "#d5d8e5",
                200: "#acb1cb",
                300: "#828ab2",
                400: "#596398",
                500: "#2f3c7e",
                600: "#263065",
                700: "#1c244c",
                800: "#131832",
                900: "#090c19"
            },
            pinkAccent: {
                100: "#fefbfb",
                200: "#fdf7f7",
                300: "#fdf2f3",
                400: "#fceeef",
                500: "#fbeaeb",
                600: "#c9bbbc",
                700: "#978c8d",
                800: "#645e5e",
                900: "#322f2f"
            }
        } : {
            gray: {
                100: "#272627",
                200: "#4d4c4d",
                300: "#747274",
                400: "#9a989a",
                500: "#c1bec1",
                600: "#cdcbcd",
                700: "#dad8da",
                800: "#e6e5e6",
                900: "#f3f2f3",
            },
            primary: {
                100: "#ffffff",
                200: "#f0f0f0",
                300: "#dcdcdc",
                400: "#c8c8c8",
                500: "#b4b4b4",
                600: "#909090",
                700: "#707070",
                800: "#505050",
                900: "#303030",
            },
            blueAccent: {
                100: "#090c19",
                200: "#131832",
                300: "#1c244c",
                400: "#263065",
                500: "#2f3c7e",
                600: "#596398",
                700: "#828ab2",
                800: "#acb1cb",
                900: "#d5d8e5",
            },
            pinkAccent: {
                100: "#322f2f",
                200: "#645e5e",
                300: "#978c8d",
                400: "#c9bbbc",
                500: "#fbeaeb",
                600: "#fceeef",
                700: "#fdf2f3",
                800: "#fdf7f7",
                900: "#fefbfb",
            }
        })
});



export const themeSettings = (mode) => {
    const colors = tokens(mode);

    return {
        palette: {
            mode: mode,
            ...(mode === 'dark'
                ? {
                    primary: {
                        main: colors.primary[500],
                        contrastText: "#ffffff" // Ensure high contrast text
                    },
                    secondary: {
                        main: colors.blueAccent[500]
                    },
                    neutral: {
                        dark: colors.gray[700],
                        main: colors.gray[300],
                        light: colors.gray[100]
                    },
                    background: {
                        default: '#021526', // Darker background for better contrast
                        paper: colors.primary[800]
                    },
                    text: {
                        primary: "#ffffff",
                        secondary: "#b0b0b0" 
                    }
                }
                : {
                    primary: {
                        main: "#000000",
                        contrastText: "#ffffff" 
                    },
                    secondary: {
                        main: colors.pinkAccent[500]
                    },
                    neutral: {
                        dark: colors.gray[700],
                        main: colors.gray[300],
                        light: colors.gray[100]
                    },
                    background: {
                        default: '#FFDFD6', // Lighter background for better contrast
                        paper: colors.primary[300]
                    },
                    text: {
                        primary: "#1c1c1c", // Very dark grey text for light mode
                        secondary: "#333333" // Slightly lighter dark grey for secondary text
                    }
                })
        },
        typography: {
            fontFamily: ["Source Sans 3", "sans-serif"].join(","),
            fontSize: 12,
            h1: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 40,
            },
            h2: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 32,
                default: colors.gray[100],
            },
            h3: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 24,
            },
            h4: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 20,
            },
            h5: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 16,
            },
            h6: {
                fontFamily: ["Source Sans 3", "sans-serif"].join(","),
                fontSize: 12,
            },
        }
    };
};




export const colorModeContext = createContext({
    toggleColorMode: () => {}
});

export const useMode = () => {
    const[mode, setMode] = useState("dark");

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () =>
                setMode((prev) => (prev === "light" ? "dark" : "light")),
        }), []
    );

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return [theme, colorMode];
}