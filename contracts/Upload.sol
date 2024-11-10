// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductTracking {
    struct Product {
        uint256 productId;
        string materialId;
        string facilityId;
        string productType;
        address manufacturer;
        uint256 manufacturingTimestamp;
        bool isActive;
    }
    
    struct ManufacturingRecord {
        uint256 productId;
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
        uint256 shipmentId;
        string uniqueShipmentId;
        uint256 productId;
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
    mapping(uint256 => Product) public products;
    mapping(uint256 => HarvestData) public productHarvestData;
    
    // Manufacturing mappings
    mapping(uint256 => ManufacturingRecord) public manufacturingRecords;
    mapping(uint256 => mapping(uint256 => ManufacturingStep)) public manufacturingSteps;
    mapping(uint256 => mapping(uint256 => string[])) public manufacturingToolsRequired;
    mapping(uint256 => string[]) public qualityChecks;
    
    // Shipment mappings
    mapping(uint256 => Shipment[]) public productShipments;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => RoutePoint))) public shipmentRoutePoints;
    mapping(uint256 => mapping(uint256 => LocationUpdate[])) public shipmentLocationUpdates;
    
    uint256 private productCounter = 0;
    uint256 private shipmentCounter = 0;
    
    // Events
    event ProductCreated(uint256 productId, string productType, address manufacturer);
    event ManufacturingRecordCreated(uint256 productId, uint256 plannedStartDate);
    event ManufacturingStepAdded(uint256 productId, uint256 stepId, string name);
    event QualityCheckAdded(uint256 productId, string check);
    event ShipmentCreated(uint256 shipmentId, string uniqueShipmentId, uint256 productId);
    event ShipmentRoutePointAdded(uint256 shipmentId, string origin, string destination);
    event ShipmentLocationUpdated(uint256 shipmentId, int256 latitude, int256 longitude);
    event HarvestDataAdded(uint256 productId, string forestId, string woodType);
    
    // Product Management
    function createProduct(
        string memory _materialId,
        string memory _facilityId,
        string memory _productType
    ) public returns (uint256) {
        productCounter++;
        
        products[productCounter] = Product({
            productId: productCounter,
            materialId: _materialId,
            facilityId: _facilityId,
            productType: _productType,
            manufacturer: msg.sender,
            manufacturingTimestamp: block.timestamp,
            isActive: true
        });
        
        emit ProductCreated(productCounter, _productType, msg.sender);
        return productCounter;
    }

    function addHarvestData(
        uint256 _productId,
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
    
    // Manufacturing Management
    function createManufacturingRecord(
        uint256 _productId,
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
        uint256 _productId,
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
    
    function addQualityCheck(uint256 _productId, string memory _check) public {
        require(products[_productId].isActive, "Product does not exist");
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can add quality checks");
        
        qualityChecks[_productId].push(_check);
        emit QualityCheckAdded(_productId, _check);
    }
    
    // Shipment Management
    function createShipment(
        uint256 _productId,
        string memory _uniqueShipmentId,
        uint256 _fuelConsumption,
        uint256 _distance
    ) public returns (uint256) {
        require(products[_productId].isActive, "Product does not exist");
        
        shipmentCounter++;
        
        ShipmentMetrics memory metrics = ShipmentMetrics({
            fuelConsumption: _fuelConsumption,
            distance: _distance
        });
        
        Shipment memory newShipment = Shipment({
            shipmentId: shipmentCounter,
            uniqueShipmentId: _uniqueShipmentId,
            productId: _productId,
            status: "INITIATED",
            routePointsCount: 0,
            metrics: metrics,
            timestamp: block.timestamp,
            carrier: msg.sender
        });
        
        productShipments[_productId].push(newShipment);
        
        emit ShipmentCreated(shipmentCounter, _uniqueShipmentId, _productId);
        return shipmentCounter;
    }
    
    function addRoutePoint(
        uint256 _productId,
        uint256 _shipmentId,
        string memory _origin,
        string memory _destination
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        
        Shipment[] storage shipments = productShipments[_productId];
        uint256 shipmentIndex;
        bool found = false;
        
        for(uint256 i = 0; i < shipments.length; i++) {
            if(shipments[i].shipmentId == _shipmentId) {
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
        uint256 _productId,
        uint256 _shipmentId,
        string memory _newStatus,
        int256 _latitude,
        int256 _longitude
    ) public {
        require(products[_productId].isActive, "Product does not exist");
        
        Shipment[] storage shipments = productShipments[_productId];
        bool found = false;
        
        for(uint256 i = 0; i < shipments.length; i++) {
            if(shipments[i].shipmentId == _shipmentId) {
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
    
    // Data Retrieval Functions
    function getProductDetails(uint256 _productId) public view returns (
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
    
    function getManufacturingSteps(uint256 _productId) public view returns (
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
    
    function getShipmentDetails(uint256 _productId, uint256 _shipmentId) public view returns (
        Shipment memory shipment,
        RoutePoint[] memory routePoints,
        LocationUpdate[] memory locationUpdates
    ) {
        Shipment[] storage shipments = productShipments[_productId];
        bool found = false;
        
        for(uint256 i = 0; i < shipments.length; i++) {
            if(shipments[i].shipmentId == _shipmentId) {
                shipment = shipments[i];
                found = true;
                break;
            }
        }
        
        require(found, "Shipment not found");
        
        // Get route points
        routePoints = new RoutePoint[](shipment.routePointsCount);
        for(uint256 i = 1; i <= shipment.routePointsCount; i++) {
            routePoints[i-1] = shipmentRoutePoints[_productId][_shipmentId][i];
        }
        
        // Get location updates
        locationUpdates = shipmentLocationUpdates[_productId][_shipmentId];
        
        return (shipment, routePoints, locationUpdates);
    }
}