// src/pages/ConsumerPage.jsx
import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button,
  Grid,
  Card,
  CardContent 
} from '@mui/material';
import axios from 'axios';

const ConsumerPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [carbonData, setCarbonData] = useState(null);

  useEffect(() => {
    if (showScanner) {
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
        fetchCarbonData(result);
      }

      function error(err) {
        console.warn(err);
      }

      return () => {
        scanner?.clear();
      };
    }
  }, [showScanner]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    // Here you would implement QR code reading from image
    // For now, we'll just show how it would work
    const mockQrData = "sample-id-123"; // This would come from QR reading
    fetchCarbonData(mockQrData);
  };

  const fetchCarbonData = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/consumer/${productId}`);
      setCarbonData(response.data.data);
    } catch (error) {
      console.error('Error fetching carbon data:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Carbon Footprint
        </Typography>
        <Paper sx={{ p: 3 }}>
          {!carbonData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setShowScanner(true)}
                >
                  Scan QR Code
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                >
                  Upload QR Code
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </Button>
              </Grid>
              {showScanner && (
                <Grid item xs={12}>
                  <div id="reader"></div>
                </Grid>
              )}
            </Grid>
          )}

          {carbonData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Total Carbon Footprint: {carbonData.totalCarbonFootprint} {carbonData.unit}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Breakdown:
                    </Typography>
                    <Typography>
                      Manufacturing: {carbonData.breakdown.manufacturing} {carbonData.unit}
                    </Typography>
                    <Typography>
                      Transportation: {carbonData.breakdown.transportation} {carbonData.unit}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setCarbonData(null);
                    setShowScanner(false);
                    setScanResult(null);
                  }}
                >
                  Check Another Product
                </Button>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ConsumerPage;
