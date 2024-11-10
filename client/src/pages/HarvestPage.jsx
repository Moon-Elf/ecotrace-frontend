import Upload from "../artifacts/contracts/Upload.sol/ProductTracking.json";
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
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [formData, setFormData] = useState({
    forest_id: "",
    woodType: "",
    location: {
      latitude: "",
      longitude: "",
    },
    certificationId: "",
  });

  // Check if MetaMask is installed and connected
  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return false;
      }
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length !== 0) {
        setIsWalletConnected(true);
        return true;
      }
      console.log("No authorized account found");
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return false;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        return true;
      }
      return false;
    } catch (error) {
      if (error.code === 4001) {
        alert("Please connect to MetaMask to continue.");
      } else {
        console.error("Error connecting to MetaMask:", error);
        alert("Error connecting to wallet. Please try again.");
      }
      return false;
    }
  };

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
      // Check wallet connection first
      if (!isWalletConnected) {
        const connected = await connectWallet();
        if (!connected) {
          alert("Please connect your wallet to continue");
          return;
        }
      }

      const response = await axios.post(
        "http://localhost:8000/api/harvest/initiate",
        formData
      );
      console.log("Harvest initiated:", response.data);

      if (response.status === 201) {
        alert("Insert into db successful");

        try {
          // Initialize blockchain connection
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
          const contract = new ethers.Contract(
            contractAddress,
            Upload.abi,
            signer
          );

          console.log("Creating product with data:", {
            productId: response.data._id.toString(),
            forestId: formData.forest_id,
            woodType: formData.woodType,
          });

          // Step 1: Create the product
          const createTx = await contract.createProduct(
            response.data._id.toString(),
            formData.forest_id,
            formData.woodType
          );
          console.log("Waiting for create transaction...");
          await createTx.wait();
          console.log("Product created:", createTx.hash);

          // Step 2: Add harvest data
          const latitudeInt = Math.round(
            parseFloat(formData.location.latitude) * 1e6
          );
          const longitudeInt = Math.round(
            parseFloat(formData.location.longitude) * 1e6
          );

          console.log("Adding harvest data with:", {
            productId: response.data._id.toString(),
            forestId: formData.forest_id,
            woodType: formData.woodType,
            latitude: latitudeInt,
            longitude: longitudeInt,
            certificationId: formData.certificationId,
          });

          const harvestTx = await contract.addHarvestData(
            response.data._id.toString(),
            formData.forest_id,
            formData.woodType,
            latitudeInt,
            longitudeInt,
            formData.certificationId
          );
          console.log("Waiting for harvest transaction...");
          await harvestTx.wait();
          console.log("Harvest data added:", harvestTx.hash);

          // Generate QR code
          const qrData = JSON.stringify({
            productId: response.data._id,
            forestId: formData.forest_id,
            woodType: formData.woodType,
            certificationId: formData.certificationId,
            location: formData.location,
            createTransaction: createTx.hash,
            harvestTransaction: harvestTx.hash,
          });

          const qrCodeDataURL = await QRCode.toDataURL(qrData);
          const downloadLink = document.createElement("a");
          downloadLink.href = qrCodeDataURL;
          downloadLink.download = `product-${response.data._id}-qr.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          alert("Harvest data successfully recorded on blockchain");
        } catch (error) {
          console.error("Blockchain error:", error);
          if (error.code === 4001) {
            alert("Transaction was rejected. Please try again.");
          } else if (error.message.includes("user rejected transaction")) {
            alert("Transaction was rejected. Please try again.");
          } else {
            alert(`Blockchain Error: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error("Error processing harvest:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Set up MetaMask event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setIsWalletConnected(true);
        } else {
          setIsWalletConnected(false);
          alert("Please connect your MetaMask wallet");
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      checkIfWalletIsConnected();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  // Fetch initial data
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
        {!isWalletConnected && (
          <Button
            variant="contained"
            color="primary"
            onClick={connectWallet}
            sx={{ mb: 2 }}
          >
            Connect Wallet
          </Button>
        )}
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
                  disabled={!isWalletConnected}
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
