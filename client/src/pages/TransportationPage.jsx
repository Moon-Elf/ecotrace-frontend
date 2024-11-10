// src/pages/TransportationPage.jsx
import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  TextField,
  MenuItem,
  Grid 
} from '@mui/material';
import axios from 'axios';

const TransportationPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    shipmentId: '',
    route: [{
      origin: '',
      destination: ''
    }],
    status: 'INITIATED',
    metrics: {
      fuelConsumption: 0,
      distance: 0
    }
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);
    setScanner(scanner);

    function success(result) {
      scanner.clear();
      setScanResult(result);
      setFormData(prev => ({
        ...prev,
        productId: result
      }));
    }

    function error(err) {
      console.warn(err);
    }

    return () => {
      scanner?.clear();
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'origin' || name === 'destination') {
      setFormData({
        ...formData,
        route: [{
          ...formData.route[0],
          [name]: value
        }]
      });
    } else if (name === 'fuelConsumption' || name === 'distance') {
      setFormData({
        ...formData,
        metrics: {
          ...formData.metrics,
          [name]: parseFloat(value)
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/transportation/create', formData);
      console.log('Transportation record created:', response.data);
      // Add success notification here
    } catch (error) {
      console.error('Error creating transportation record:', error);
      // Add error notification here
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Transportation Details
        </Typography>
        <Paper sx={{ p: 3 }}>
          {!scanResult && (
            <>
              <Typography variant="h6" gutterBottom>
                Scan Product QR Code
              </Typography>
              <div id="reader"></div>
            </>
          )}
          {scanResult && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product ID"
                    value={formData.productId}
                    disabled
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Shipment ID"
                    name="shipmentId"
                    value={formData.shipmentId}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Origin"
                    name="origin"
                    value={formData.route[0].origin}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Destination"
                    name="destination"
                    value={formData.route[0].destination}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="INITIATED">Initiated</MenuItem>
                    <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                    <MenuItem value="DELIVERED">Delivered</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Fuel Consumption"
                    name="fuelConsumption"
                    value={formData.metrics.fuelConsumption}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Distance (km)"
                    name="distance"
                    value={formData.metrics.distance}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    fullWidth
                  >
                    Submit Transportation Details
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default TransportationPage;
