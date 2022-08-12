import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography, Link } from '@mui/material';


const NotFound = () => {
  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: 'background.paper',
          display: 'flex',
          minHeight: '100%',
          px: 3,
          py: '80px'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            align="center"
            color="textPrimary"
            variant={'h4'}
          >
            404: The page you are looking for isn’t here
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 6
            }}
          >
            <Link
              href="https://nxtcre.com"
              rel="questionnaire"
              variant="body2"
              sx={{ mb: 2 }}
            >GO TO NXTCRE.COM</Link>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default NotFound;
