import Upload from "../artifacts/contracts/Upload.sol/ProductTracking.json";
// src/pages/HarvestPage.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import QRCode from "qrcode";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
} from "@mui/material";
import axios from "axios";
const HarvestPage = () => {
  const [forests, setforest] = useState([]);
  const [woodTypes, setwoodTypes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [formData, setFormData] = useState({
    forest_id: "",
    woodType: "",
    location: {
      latitude: "",
      longitude: "",
    },
    certificationId: "",
  });

  // Sample data for dropdowns - you can replace these with actual data from your backend
  // const forests = [
  //   { id: "FOR001", name: "Northern Forest Reserve" },
  //   { id: "FOR002", name: "Eastern Woodlands" },
  //   { id: "FOR003", name: "Western Pine Forest" },
  // ];

  // const woodTypes = ["Pine", "Oak", "Maple", "Cedar", "Birch"];

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "latitude" || name === "longitude") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/harvest/initiate",
        formData
      );
      console.log("Harvest initiated:", response.data);

      if (response.status === 201) {
        alert("Insert into db successful");

        // Initialize blockchain connection
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Create contract instance
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const contract = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );

        // Create product on blockchain
        const createProductTx = await contract.createProduct(
          response.data._id.toString(), // Convert to string if it's an ObjectId
          formData.forest_id.toString(), // Ensure string
          formData.woodType.toString() // Ensure string
        );
        await createProductTx.wait();

        // Convert coordinates to integers
        const latitudeInt = Math.round(
          parseFloat(formData.location.latitude) * 1e6
        );
        const longitudeInt = Math.round(
          parseFloat(formData.location.longitude) * 1e6
        );

        // Add harvest data
        const addHarvestTx = await contract.addHarvestData(
          1, // productId should be numeric based on your smart contract
          formData.forest_id.toString(),
          formData.woodType.toString(),
          latitudeInt,
          longitudeInt,
          formData.certificationId.toString()
        );

        await addHarvestTx.wait();
        console.log("Data successfully added to blockchain", addHarvestTx);
        alert("Data successfully added to blockchain", addHarvestTx);
        const qrData = JSON.stringify(response.data);
        const qrCodeDataURL = await QRCode.toDataURL(qrData);
        const downloadLink = document.createElement("a");
        downloadLink.href = qrCodeDataURL;
        downloadLink.download = `product-${response.data._id}-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    } catch (error) {
      console.error("Error initiating harvest:", error);
    }
  };

  useEffect(() => {
    const setData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/getforests"
        );
        if (response.data) {
          setforest(response.data[0].forest_ids);
        }

        const certificationIds = await axios.get(
          "http://localhost:8000/api/certification"
        );
        if (certificationIds.data) {
          setCertificates(certificationIds.data);
        }
        const woodType = await axios.get("http://localhost:8000/api/woodtype");
        if (woodType.data) {
          setwoodTypes(woodType.data);
        }
      } catch (error) {
        console.error("Error fetching forests:", error);
      }
    };
    setData();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Initiate Harvest
        </Typography>
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Forest"
                  name="forest_id"
                  value={formData.forest_id}
                  onChange={handleChange}
                  required
                >
                  {forests.map((forest) => (
                    <MenuItem key={forest._id} value={forest.location}>
                      {forest.location}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Wood Type"
                  name="woodType"
                  value={formData.woodType}
                  onChange={handleChange}
                  required
                >
                  {woodTypes.map((wood) => (
                    <MenuItem key={wood?._id} value={wood?.wood_type}>
                      {wood?.wood_type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  type="number"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  type="number"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Certification ID"
                  name="certificationId"
                  value={formData.certificationId}
                  onChange={handleChange}
                  required
                />
              </Grid> */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Certification ID"
                  name="certificationId"
                  value={formData.certificationId}
                  onChange={handleChange}
                  required
                >
                  {certificates.map((certificate) => (
                    <MenuItem
                      key={certificate._id}
                      value={certificate.certificationId}
                    >
                      {certificate.certificationId}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                >
                  Submit Harvest
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default HarvestPage;
