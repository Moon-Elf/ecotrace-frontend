import Upload from "./artifacts/contracts/Upload.sol/ProductTracking.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import LandingPage from "./pages/LandingPage";
import HarvestPage from "./pages/HarvestPage";
import ManufacturingPage from "./pages/ManufacturingPage";
import TransportationPage from "./pages/TransportationPage";
import ConsumerPage from "./pages/ConsumerPage";
function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        const contract = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );
        console.log(contract);
        setContract(contract);
        setProvider(provider);
      } else {
        console.error("Metamask is not installed");
      }
    };
    provider && loadProvider();
  }, []);
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/harvest" element={<HarvestPage />} />
          <Route path="/manufacturing" element={<ManufacturingPage />} />
          <Route path="/transportation" element={<TransportationPage />} />
          <Route path="/consumer" element={<ConsumerPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
