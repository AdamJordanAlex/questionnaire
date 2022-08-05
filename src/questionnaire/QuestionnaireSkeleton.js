import {
  Box,
  DialogTitle,
  DialogContent,
  Grid,
  Container,
  Skeleton
} from '@mui/material';

const QuestionnaireSkeleton = () => {

  return (
    <>
      <DialogTitle id="form-dialog-title" ><Skeleton variant='text' width={150} height={55} /></DialogTitle>

      <DialogContent>
        <Container>
          <Box
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Skeleton variant="text" width={835} height={48} />
          </Box>
          <Box
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <Skeleton variant="text" width={300} height={48} />
          </Box>
          <Box m={4} />
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Skeleton variant="rectangular" width={320} height={358} />
          </Box>
          <Box m={2} />
          <Grid container justifyContent="space-between" spacing={2}>
            <Grid item xs={4}>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Skeleton variant="text" width={180} height={50} />
              </Box>
            </Grid>
          </Grid>
          <Box m={4} />
        </Container>
      </DialogContent>
    </>
  )
};

export default QuestionnaireSkeleton;