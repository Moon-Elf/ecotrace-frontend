// src/pages/ManufacturingPage.jsx
import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Button 
} from '@mui/material';
import axios from 'axios';

const ManufacturingPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanner, setScanner] = useState(null);

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
      // Here you would typically make an API call to your manufacturing endpoint
      handleScanSuccess(result);
    }

    function error(err) {
      console.warn(err);
    }

    return () => {
      scanner?.clear();
    };
  }, []);

  const handleScanSuccess = async (qrData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/manufacturing/create', {
        harvestId: qrData // Assuming QR contains harvest ID
      });
      console.log('Manufacturing process initiated:', response.data);
    } catch (error) {
      console.error('Error initiating manufacturing:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manufacturing Process
        </Typography>
        <Paper sx={{ p: 3 }}>
          {!scanResult && (
            <>
              <Typography variant="h6" gutterBottom>
                Scan Harvest QR Code
              </Typography>
              <div id="reader"></div>
            </>
          )}
          {scanResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                QR Code Scanned Successfully
              </Typography>
              <Typography>
                Harvest ID: {scanResult}
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => {
                  setScanResult(null);
                  window.location.reload();
                }}
              >
                Scan Another Code
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ManufacturingPage;
