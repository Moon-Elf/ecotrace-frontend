// src/pages/LandingPage.jsx
import { Container, Typography, Box, Paper, Grid } from '@mui/material';

const LandingPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom>
          Welcome to EcoTrace
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Track and trace the environmental impact of wood products from harvest to consumer
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Harvest Tracking</Typography>
              <Typography variant="body2">Monitor wood sourcing and forest management</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Manufacturing</Typography>
              <Typography variant="body2">Track production processes and environmental metrics</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Transportation</Typography>
              <Typography variant="body2">Monitor shipping routes and emissions</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Consumer Impact</Typography>
              <Typography variant="body2">Calculate total carbon footprint</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default LandingPage;
