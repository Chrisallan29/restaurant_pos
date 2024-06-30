import { createContext, useState, useMemo} from "react";
import { createTheme } from "@mui/material/styles";



export const tokens = (mode) => ({
    ... (mode === 'dark'
        ? {gray: {
            100: "#f3f2f3",
            200: "#e6e5e6",
            300: "#dad8da",
            400: "#cdcbcd",
            500: "#c1bec1",
            600: "#9a989a",
            700: "#747274",
            800: "#4d4c4d",
            900: "#272627"
        }, primary: {
            100: "#dddbdd",
            200: "#bbb8bb",
            300: "#99949a",
            400: "#777178",
            500: "#554d56",
            600: "#443e45",
            700: "#332e34",
            800: "#221f22",
            900: "#110f11"
        }, blueAccent: {
            100: "#d5d8e5",
            200: "#acb1cb",
            300: "#828ab2",
            400: "#596398",
            500: "#2f3c7e",
            600: "#263065",
            700: "#1c244c",
            800: "#131832",
            900: "#090c19"
        }, pinkAccent: {
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
        }, primary: {
            100: "#110f11",
            200: "#221f22",
            300: "#332e34",
            400: "#443e45",
            500: "#554d56",
            600: "#777178",
            700: "#99949a",
            800: "#bbb8bb",
            900: "#dddbdd",
        }, blueAccent: {
            100: "#090c19",
            200: "#131832",
            300: "#1c244c",
            400: "#263065",
            500: "#2f3c7e",
            600: "#596398",
            700: "#828ab2",
            800: "#acb1cb",
            900: "#d5d8e5",
        }, pinkAccent: {
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
        } 

    ) 
});



export const themeSettings = (mode) => {
    const colors = tokens(mode);

    return {
        palette: {
            mode: mode,
            ...(mode === 'dark'
                ? {
                    primary: {
                        main: colors.primary[400]
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
                        default: colors.primary[500]
                    }
                }
                : {
                    primary: {
                        main: colors.primary[100]
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
                        default: colors.primary[200]
                    }
                }
            )
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