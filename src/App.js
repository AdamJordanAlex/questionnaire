import Questionnaire from './questionnaire/Questionnaire';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createCustomTheme } from './theme';
import { Toaster } from 'react-hot-toast';
import { Routes, Route } from "react-router-dom";
import NotFound from './questionnaire/NotFound';
import ReactGA from 'react-ga';
import { useEffect } from 'react';
require('./console');

function App() {
  const theme = createCustomTheme({
    direction: 'ltr',
    responsiveFontSizes: true,
    roundedCorners: true,
    theme: 'LIGHT'
  });

  if (process.env.REACT_APP_GOOGLE_TRACKING_ID) ReactGA.initialize(process.env.REACT_APP_GOOGLE_TRACKING_ID);

  useEffect(() => {
    if (process.env.REACT_APP_GOOGLE_TRACKING_ID) ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Toaster position="top-center" />
        <Routes>
          <Route path="/:code" element={<Questionnaire />} />
          <Route path="/l/:lender_id" element={<Questionnaire />} />
          <Route path="/q/:short_code" element={<Questionnaire />} />
          <Route path="*" element={<NotFound />} />
      </Routes>
    /</ThemeProvider>
  );
}

export default App;
