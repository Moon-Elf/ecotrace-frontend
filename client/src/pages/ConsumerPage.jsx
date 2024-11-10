// src/pages/ConsumerPage.jsx

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });

      scanner.render(success, error);
      setScanner(scanner);

      function success(result) {
        scanner.clear();
        try {
          const data = JSON.parse(result); // Parse JSON data from QR code
          const productId = data.productId; // Assuming QR code has `productId`
          console.log(productId);
          
          setScanResult(productId);
          fetchCarbonData(productId);
        } catch (err) {
          console.error("Error parsing QR code data:", err);
        }
      }

      function error(err) {
        console.warn("QR Code scanning error:", err);
      }

      return () => {
        scanner?.clear();
      };
    }
  }, [showScanner]);


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
