import Questionnaire from './questionnaire/Questionnaire';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createCustomTheme } from './theme';
import { Toaster } from 'react-hot-toast';

function App() {
  const theme = createCustomTheme({
    direction: 'ltr',
    responsiveFontSizes: true,
    roundedCorners: true,
    theme: 'LIGHT'
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Toaster position="top-center" />
        <Questionnaire />
    /</ThemeProvider>
  );
}

export default App;
