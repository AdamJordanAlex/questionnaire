import merge from 'lodash/merge';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { lightShadows, darkShadows } from './shadows';

const baseOptions = {
  direction: 'ltr',
  components: {
    MuiAvatar: {
      styleOverrides: {
        fallback: {
          height: '75%',
          width: '75%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'upper',
          fontFamily: '"Raleway", sans-serif',
        },

      },
    },
    // MuiSelect: {
    //   styleOverrides: {
    //     root: {
    //       textTransform: 'upper',
    //       fontFamily: '"Lato", sans-serif',
    //     },
    //   },
    // },
    // MuiTextField: {
    //   styleOverrides: {
    //     root: {
    //       textTransform: 'upper',
    //       fontFamily: '"Lato", sans-serif',
    //     },
    //   },
    // },
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
        },
        '#root': {
          height: '100%',
        },
        '#nprogress .bar': {
          zIndex: '2000 !important',
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: {
          variant: 'h6',
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: 'black',
          fontWeight: 500,
          fontSize: '19px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 'auto',
          marginRight: '16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  typography: {
    button: {
      fontWeight: 700,
      borderRadius: 10,
    },
    fontFamily: '"Raleway", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '3.75rem',
    },
    h2: {
      fontWeight: 300,
      fontSize: '3rem',
    },
    h3: {
      fontWeight: 300,
      fontSize: '2.25rem',
    },
    h4: {
      fontWeight: 300,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 300,
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 300,
      fontSize: '1.125rem',
    },

    overline: {
      fontWeight: 600,
    },
  },
};

const themesOptions = {
  "LIGHT": {
    components: {
      MuiInputBase: {
        styleOverrides: {
          input: {
            '&::placeholder': {
              opacity: 0.86,
              color: '#42526e',
            },
            "&:-webkit-autofill": {
              transition:
                "background-color 50000s ease-in-out 0s, color 50000s ease-in-out 0s",
            },
            "&:-webkit-autofill:focus": {
              transition:
                "background-color 50000s ease-in-out 0s, color 50000s ease-in-out 0s",
            },
            "&:-webkit-autofill:hover": {
              transition:
                "background-color 50000s ease-in-out 0s, color 50000s ease-in-out 0s",
            },
          },
        },
      },
    },
    layout: {
      contentWidth: 1236,
    },
    palette: {
      action: {
        active: '#6b778c',
      },
      background: {
        default: 'rgba(124, 154, 144, 0.05);',
        dark: '#172842',
        paper: '#ffffff',
        offWhite: '#f8f8ff',
      },
      alternate: {
        main: 'rgb(247, 249, 250)',
        dark: '#e8eaf6',
      },
      error: {
        contrastText: '#ffffff',
        main: '#f44336',
      },
      mode: 'light',
      primary: {
        contrastText: '#ffffff',
        main: '#00b0d3',
      },
      secondary: {
        contrastText: '#ffffff',
        main: '#152E55',
      },
      black: {
        contrastText: '#000000',
        main: '#ffffff',
      },
      white: {
        contrastText: '#000000',
        main: '#ffffff',
      },
      offWhite: {
        contrastText: '#000000',
        main: '#f5f5f5',
      },
      success: {
        contrastText: '#ffffff',
        main: '#4caf50',
      },
      info: {
        contrastText: '#000000',
        main: '#e1ede4',
      },
      info2: {
        contrastText: '#ffffff',
        main: '#77ade0',
      },
      text: {
        primary: '#172b4d',
        secondary: '#6b778c',
      },
      warning: {
        contrastText: '#ffffff',
        main: '#ff9800',
      },
    },
    shadows: lightShadows,
  },
  "DARK": {
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(145, 158, 171, 0.24)',
          },
        },
      },
    },
    palette: {
      background: {
        default: '#eff1f4',
        paper: '#222b36',
      },
      divider: 'rgba(145, 158, 171, 0.24)',
      error: {
        contrastText: '#ffffff',
        main: '#f44336',
      },
      mode: 'dark',
      primary: {
        contrastText: '#ffffff',
        main: '#025BDB',
      },
      black: {
        contrastText: '#ffffff',
        main: '#000000',
      },
      white: {
        contrastText: '#ffffff',
        main: '#ffffff',
      },
      success: {
        contrastText: '#ffffff',
        main: '#4caf50',
      },
      text: {
        primary: '#ffffff',
        secondary: '#919eab',
      },
      warning: {
        contrastText: '#ffffff',
        main: '#ff9800',
      },
    },
    shadows: darkShadows,
  },
  "NATURE": {
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(145, 158, 171, 0.24)',
          },
        },
      },
    },
    palette: {
      background: {
        default: '#1c2531',
        paper: '#293142',
      },
      divider: 'rgba(145, 158, 171, 0.24)',
      error: {
        contrastText: '#ffffff',
        main: '#f44336',
      },
      mode: 'dark',
      primary: {
        contrastText: '#ffffff',
        main: '#025BDB',
      },
      black: {
        contrastText: '#ffffff',
        main: '#000000',
      },
      white: {
        contrastText: '#ffffff',
        main: '#ffffff',
      },
      success: {
        contrastText: '#ffffff',
        main: '#4caf50',
      },
      text: {
        primary: '#ffffff',
        secondary: '#919eab',
      },
      warning: {
        contrastText: '#ffffff',
        main: '#ff9800',
      },
    },
    shadows: darkShadows,
  },
};

export const createCustomTheme = (config = {}) => {
  let themeOptions = themesOptions[config.theme];

  if (!themeOptions) {
    console.warn(new Error(`The theme ${config.theme} is not valid`));
    themeOptions = themesOptions["LIGHT"];
  }

  let theme = createTheme(
    merge(
      {},
      baseOptions,
      themeOptions,
      {
        ...(config.roundedCorners && {
          shape: {
            borderRadius: 16,
          },
        }),
      },
      {
        direction: config.direction,
      }
    )
  );

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }

  return theme;
};
