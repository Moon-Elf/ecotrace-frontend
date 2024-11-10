// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductTracking {
    struct Product {
        string productId;
        string materialId;
        string facilityId;
        string productType;
        address manufacturer;
        uint256 manufacturingTimestamp;
        bool isActive;
    }
    
    struct ManufacturingRecord {
        string productId;
        uint256 plannedStartDate;
        string estimatedDuration;
        uint256 stepCount;
        EnvironmentalMetrics environmentalMetrics;
        uint256 timestamp;
    }
    
    struct ManufacturingStep {
        uint256 stepId;
        string name;
        string estimatedDuration;
    }
    
    struct EnvironmentalMetrics {
        string estimatedEnergyUsage;
        string estimatedWaterUsage;
        string estimatedWaste;
    }
    
    struct Shipment {
        string shipmentId;
        string productId;
        string status; // INITIATED, IN_TRANSIT, DELIVERED
        uint256 routePointsCount;
        ShipmentMetrics metrics;
        uint256 timestamp;
        address carrier;
    }
    
    struct ShipmentMetrics {
        uint256 fuelConsumption;
        uint256 distance;
    }
    
    struct RoutePoint {
        string origin;
        string destination;
    }
    
    struct LocationUpdate {
        uint256 timestamp;
        int256 latitude;
        int256 longitude;
    }
    
    struct HarvestData {
        string forestId;
        string woodType;
        int256 latitude;
        int256 longitude;
        string certificationId;
    }
    
    // Product mappings
    mapping(string => Product) public products;
    mapping(string => HarvestData) public productHarvestData;
    
    // Manufacturing mappings
    mapping(string => ManufacturingRecord) public manufacturingRecords;
    mapping(string => mapping(uint256 => ManufacturingStep)) public manufacturingSteps;
    mapping(string => mapping(uint256 => string[])) public manufacturingToolsRequired;
    mapping(string => string[]) public qualityChecks;
    
    // Shipment mappings
    mapping(string => Shipment[]) public productShipments;
    mapping(string => mapping(string => mapping(uint256 => RoutePoint))) public shipmentRoutePoints;
    mapping(string => mapping(string => LocationUpdate[])) public shipmentLocationUpdates;
    
    uint256 private productCounter = 0;
    uint256 private shipmentCounter = 0;
    
    // Events
    event ProductCreated(string productId, string productType, address manufacturer);
    event ManufacturingRecordCreated(string productId, uint256 plannedStartDate);
    event ManufacturingStepAdded(string productId, uint256 stepId, string name);
    event QualityCheckAdded(string productId, string check);
    event ShipmentCreated(string shipmentId, string productId);
    event ShipmentRoutePointAdded(string shipmentId, string origin, string destination);
    event ShipmentLocationUpdated(string shipmentId, int256 latitude, int256 longitude);
    event HarvestDataAdded(string productId, string forestId, string woodType);
    
    // Product Management
    function createProduct(
        string memory _materialId,
        string memory _facilityId,
        string memory _productType
    ) public returns (string memory) {
        productCounter++;
        string memory newProductId = uint2str(productCounter);
        
        require(bytes(products[newProductId].productId).length == 0, "Product ID already exists");

        products[newProductId] = Product({
            productId: newProductId,
            materialId: _materialId,
            facilityId: _facilityId,
            productType: _productType,
            manufacturer: msg.sender,
            manufacturingTimestamp: block.timestamp,
            isActive: true
        });
        
        emit ProductCreated(newProductId, _productType, msg.sender);
        return newProductId;
    }

    function addHarvestData(
        string memory _productId,
        string memory _forestId,
        string memory _woodType,
        int256 _latitude,
        int256 _longitude,
        string memory _certificationId
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can add harvest data");
        
        productHarvestData[_productId] = HarvestData({
            forestId: _forestId,
            woodType: _woodType,
            latitude: _latitude,
            longitude: _longitude,
            certificationId: _certificationId
        });
        
        emit HarvestDataAdded(_productId, _forestId, _woodType);
    }
    
    function createManufacturingRecord(
        string memory _productId,
        uint256 _plannedStartDate,
        string memory _estimatedDuration,
        string memory _estimatedEnergyUsage,
        string memory _estimatedWaterUsage,
        string memory _estimatedWaste
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can create record");
        
        EnvironmentalMetrics memory metrics = EnvironmentalMetrics({
            estimatedEnergyUsage: _estimatedEnergyUsage,
            estimatedWaterUsage: _estimatedWaterUsage,
            estimatedWaste: _estimatedWaste
        });
        
        manufacturingRecords[_productId] = ManufacturingRecord({
            productId: _productId,
            plannedStartDate: _plannedStartDate,
            estimatedDuration: _estimatedDuration,
            stepCount: 0,
            environmentalMetrics: metrics,
            timestamp: block.timestamp
        });
        
        emit ManufacturingRecordCreated(_productId, _plannedStartDate);
    }

    function addManufacturingStep(
        string memory _productId,
        string memory _name,
        string memory _estimatedDuration,
        string[] memory _toolsRequired
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can add steps");
        
        ManufacturingRecord storage record = manufacturingRecords[_productId];
        record.stepCount++;
        
        manufacturingSteps[_productId][record.stepCount] = ManufacturingStep({
            stepId: record.stepCount,
            name: _name,
            estimatedDuration: _estimatedDuration
        });
        
        manufacturingToolsRequired[_productId][record.stepCount] = _toolsRequired;
        
        emit ManufacturingStepAdded(_productId, record.stepCount, _name);
    }
    
    function addQualityCheck(string memory _productId, string memory _check) public {
        require(products[_productId].isActive, "Product does not exist");
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can add quality checks");
        
        qualityChecks[_productId].push(_check);
        emit QualityCheckAdded(_productId, _check);
    }
    
    function createShipment(
        string memory _productId,
        uint256 _fuelConsumption,
        uint256 _distance
    ) public returns (string memory) {
        require(products[_productId].isActive, "Product does not exist");
        
        shipmentCounter++;
        string memory newShipmentId = uint2str(shipmentCounter);
        
        ShipmentMetrics memory metrics = ShipmentMetrics({
            fuelConsumption: _fuelConsumption,
            distance: _distance
        });
        
        Shipment memory newShipment = Shipment({
            shipmentId: newShipmentId,
            productId: _productId,
            status: "INITIATED",
            routePointsCount: 0,
            metrics: metrics,
            timestamp: block.timestamp,
            carrier: msg.sender
        });
        
        productShipments[_productId].push(newShipment);
        
        emit ShipmentCreated(newShipmentId, _productId);
        return newShipmentId;
    }
    
    function addRoutePoint(
        string memory _productId,
        string memory _shipmentId,
        string memory _origin,
        string memory _destination
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        
        Shipment[] storage shipments = productShipments[_productId];
        uint256 shipmentIndex;
        bool found = false;
        
        for(uint256 i = 0; i < shipments.length; i++) {
            if(compareStrings(shipments[i].shipmentId, _shipmentId)) {
                require(shipments[i].carrier == msg.sender, "Only assigned carrier can add route points");
                shipmentIndex = i;
                found = true;
                break;
            }
        }
        
        require(found, "Shipment not found");
        
        shipments[shipmentIndex].routePointsCount++;
        uint256 currentRouteCount = shipments[shipmentIndex].routePointsCount;
        
        shipmentRoutePoints[_productId][_shipmentId][currentRouteCount] = RoutePoint({
            origin: _origin,
            destination: _destination
        });
        
        emit ShipmentRoutePointAdded(_shipmentId, _origin, _destination);
    }
    
    function updateShipmentLocation(
        string memory _productId,
        string memory _shipmentId,
        string memory _newStatus,
        int256 _latitude,
        int256 _longitude
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        
        Shipment[] storage shipments = productShipments[_productId];
        bool found = false;
        
        for(uint256 i = 0; i < shipments.length; i++) {
            if(compareStrings(shipments[i].shipmentId, _shipmentId)) {
                require(shipments[i].carrier == msg.sender, "Only assigned carrier can update location");
                shipments[i].status = _newStatus;
                found = true;
                break;
            }
        }
        
        require(found, "Shipment not found");
        
        LocationUpdate memory newUpdate = LocationUpdate({
            timestamp: block.timestamp,
            latitude: _latitude,
            longitude: _longitude
        });
        
        shipmentLocationUpdates[_productId][_shipmentId].push(newUpdate);
        emit ShipmentLocationUpdated(_shipmentId, _latitude, _longitude);
    }
    
    function getProductDetails(string memory _productId) public view returns (
        Product memory product,
        HarvestData memory harvestData,
        ManufacturingRecord memory manufacturingRecord
    ) {
        require(products[_productId].isActive, "Product does not exist");
        return (
            products[_productId],
            productHarvestData[_productId],
            manufacturingRecords[_productId]
        );
    }
    
    function getManufacturingSteps(string memory _productId) public view returns (
        ManufacturingStep[] memory steps,
        string[][] memory tools
    ) {
        uint256 stepCount = manufacturingRecords[_productId].stepCount;
        steps = new ManufacturingStep[](stepCount);
        tools = new string[][](stepCount);
        
        for(uint256 i = 1; i <= stepCount; i++) {
            steps[i-1] = manufacturingSteps[_productId][i];
            tools[i-1] = manufacturingToolsRequired[_productId][i];
        }
        
        return (steps, tools);
    }
    
    function getShipmentDetails(string memory _productId, string memory _shipmentId) public view returns (
        Shipment memory shipment,
        RoutePoint[] memory routePoints,
        LocationUpdate[] memory locationUpdates
    ) {
        Shipment[] storage shipments = productShipments[_productId];
        bool found = false;
        
        for(uint256 i = 0; i < shipments.length; i++) {
            if(compareStrings(shipments[i].shipmentId, _shipmentId)) {
                shipment = shipments[i];
                found = true;
                break;
            }
        }
        
        require(found, "Shipment not found");
        
        routePoints = new RoutePoint[](shipment.routePointsCount);
        for(uint256 i = 1; i <= shipment.routePointsCount; i++) {
            routePoints[i-1] = shipmentRoutePoints[_productId][_shipmentId][i];
        }
        
        locationUpdates = shipmentLocationUpdates[_productId][_shipmentId];
        
        return (shipment, routePoints, locationUpdates);
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(j - j / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            j /= 10;
        }
        str = string(bstr);
    }

    // Helper function to compare strings
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}