// src/pages/ManufacturingPage.jsx
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Container, Typography, Box, Paper, Button } from "@mui/material";
import { Modal, Form } from "react-bootstrap";
import axios from "axios";
import "./ManufacturingPage.css";
import { ethers } from "ethers";
import QRCode from "qrcode";
import Upload from "../artifacts/contracts/Upload.sol/ProductTracking.json";

const ManufacturingPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    materialId: "",
    facilityId: "",
    productType: "",
    processDetails: {
      plannedStartDate: "",
      estimatedDuration: "",
      manufacturingSteps: [],
      environmentalMetrics: {
        estimatedEnergyUsage: "",
        estimatedWaterUsage: "",
        estimatedWaste: "",
      },
      qualityChecks: [],
    },
  });
  const [newStep, setNewStep] = useState({
    stepId: "",
    name: "",
    estimatedDuration: "",
    toolsRequired: [],
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(handleQRScan, handleError);
    return () => scanner.clear();
  }, []);

  const handleQRScan = (result) => {
    try {
      console.log(result);
      
      const data = JSON.parse(result);
      const extractedId = data.productId;
      console.log("Extracted ID:", extractedId);

      setScanResult(extractedId);
      setShowModal(true);
      setFormData((prev) => ({ ...prev, materialId: extractedId }));
    } catch (error) {
      console.error("Error parsing QR code data:", error);
    }
  };

  const handleError = (err) => {
    console.warn(err);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProcessDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      processDetails: {
        ...prev.processDetails,
        [name]: value,
      },
    }));
  };

  const handleEnvironmentalMetricsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      processDetails: {
        ...prev.processDetails,
        environmentalMetrics: {
          ...prev.processDetails.environmentalMetrics,
          [name]: value,
        },
      },
    }));
  };

  const handleNewStepChange = (e) => {
    const { name, value } = e.target;
    setNewStep((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      processDetails: {
        ...prev.processDetails,
        manufacturingSteps: [
          ...prev.processDetails.manufacturingSteps,
          newStep,
        ],
      },
    }));
    setNewStep({
      stepId: "",
      name: "",
      estimatedDuration: "",
      toolsRequired: [],
    });
  };

  // Update the handleCreate function's blockchain interaction part
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // First handle the database creation
      console.log("Submitting to database:", formData);
      const response = await axios.post(
        "http://localhost:8000/api/manufacturing/create",
        formData
      );
      console.log("Database response:", response.data);

      // // Connect to blockchain
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // await provider.send("eth_requestAccounts", []);
      // const signer = provider.getSigner();

      // const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      // const contract = new ethers.Contract(contractAddress, Upload.abi, signer);

      // // Convert form data to match contract parameters
      // const productId = formData.materialId.toString(); // Ensure it's a BigNumber
      // // console.log("Product ID (BigNumber):", );

      // // Convert date to Unix timestamp for _plannedStartDate
      // const plannedStartDate = Math.floor(
      //   new Date(formData.processDetails.plannedStartDate).getTime() / 1000
      // );
      // console.log("Planned Start Date (Unix):", plannedStartDate);

      // // Convert all numerical fields to strings
      // const estimatedDuration =
      //   formData.processDetails.estimatedDuration.toString();
      // const estimatedEnergyUsage =
      //   formData.processDetails.environmentalMetrics.estimatedEnergyUsage.toString();
      // const estimatedWaterUsage =
      //   formData.processDetails.environmentalMetrics.estimatedWaterUsage.toString();
      // const estimatedWaste =
      //   formData.processDetails.environmentalMetrics.estimatedWaste?.toString() ||
      //   "0";

      // const params = {
      //   _productId: productId,
      //   _plannedStartDate: plannedStartDate.toString(),
      //   _estimatedDuration: estimatedDuration,
      //   _estimatedEnergyUsage: estimatedEnergyUsage,
      //   _estimatedWaterUsage: estimatedWaterUsage,
      //   _estimatedWaste: estimatedWaste,
      // };

      // console.log("Sending to blockchain:", params);

      // // Call contract with correct parameters
      // const tx = await contract.createManufacturingRecord(
      //   params._productId,
      //   params._plannedStartDate,
      //   params._estimatedDuration,
      //   params._estimatedEnergyUsage,
      //   params._estimatedWaterUsage,
      //   params._estimatedWaste
      // );

      // console.log("Transaction sent:", tx);
      // const receipt = await tx.wait();
      // console.log("Transaction confirmed:", receipt);

      // // Generate and download QR code
      const qrData = JSON.stringify(response.data);
      const qrCodeDataURL = await QRCode.toDataURL(qrData);

      const downloadLink = document.createElement("a");
      downloadLink.href = qrCodeDataURL;
      downloadLink.download = `product-${response.data._id}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      resetFormAndClose();
      alert("Manufacturing record created successfully!");
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        formData: JSON.stringify(formData, null, 2),
      });
      alert(`Error creating record: ${error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await axios.put(
        `http://localhost:8000/api/manufacturing/${formData.materialId}`,
        { stepDetails: newStep }
      );
      console.log("Updated successfully:", response.data);
      resetFormAndClose();
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const resetFormAndClose = () => {
    setShowCreateForm(false);
    setShowUpdateForm(false);
    setShowModal(false);
    setScanResult(null);
    setFormData({
      materialId: "",
      facilityId: "",
      productType: "",
      processDetails: {
        plannedStartDate: "",
        estimatedDuration: "",
        manufacturingSteps: [],
        environmentalMetrics: {
          estimatedEnergyUsage: "",
          estimatedWaterUsage: "",
          estimatedWaste: "",
        },
        qualityChecks: [],
      },
    });
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
            <Typography variant="h6" gutterBottom>
              QR Code Scanned Successfully
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Initial Modal after QR Scan */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-around">
            <Button
              variant="primary"
              onClick={() => {
                setShowModal(false);
                setShowCreateForm(true);
              }}
            >
              Create New
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setShowUpdateForm(true);
              }}
            >
              Update Existing
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Create Form Modal */}
      <Modal show={showCreateForm} onHide={() => setShowCreateForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Manufacturing Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group>
              <Form.Label>Material ID</Form.Label>
              <Form.Control
                type="text"
                name="materialId"
                value={formData.materialId}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Facility ID</Form.Label>
              <Form.Control
                type="text"
                name="facilityId"
                value={formData.facilityId}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Product Type</Form.Label>
              <Form.Control
                type="text"
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Planned Start Date</Form.Label>
              <Form.Control
                type="date"
                name="plannedStartDate"
                value={formData.processDetails.plannedStartDate}
                onChange={handleProcessDetailsChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Estimated Duration</Form.Label>
              <Form.Control
                type="text"
                name="estimatedDuration"
                value={formData.processDetails.estimatedDuration}
                onChange={handleProcessDetailsChange}
                required
              />
            </Form.Group>
            {/* Add step form */}
            <Form.Group>
              <Form.Label>New Step</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newStep.name}
                onChange={handleNewStepChange}
                placeholder="Step Name"
              />
              <Form.Control
                type="number"
                name="stepId"
                value={newStep.stepId}
                onChange={handleNewStepChange}
                placeholder="Step ID"
              />
              <Form.Control
                type="text"
                name="estimatedDuration"
                value={newStep.estimatedDuration}
                onChange={handleNewStepChange}
                placeholder="Duration"
              />
              <Button variant="secondary" onClick={handleAddStep}>
                Add Step
              </Button>
            </Form.Group>
            <Button type="submit">Create</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Update Form Modal */}
      <Modal show={showUpdateForm} onHide={() => setShowUpdateForm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Manufacturing Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group>
              <Form.Label>New Step</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newStep.name}
                onChange={handleNewStepChange}
                placeholder="Step Name"
              />
              <Form.Control
                type="number"
                name="stepId"
                value={newStep.stepId}
                onChange={handleNewStepChange}
                placeholder="Step ID"
              />
              <Form.Control
                type="text"
                name="estimatedDuration"
                value={newStep.estimatedDuration}
                onChange={handleNewStepChange}
                placeholder="Duration"
              />
              <Button variant="secondary" onClick={handleAddStep}>
                Add Step
              </Button>
            </Form.Group>
            <Button type="submit">Update</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManufacturingPage;
