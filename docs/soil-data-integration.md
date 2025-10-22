# Soil Data Integration

This document explains how soil data from the SoilMap component is integrated with the crop recommendation system.

## Overview

The integration allows users to:
1. Click on the Soil Map to get soil data for a specific location
2. Use that soil data to auto-fill the crop recommendation form
3. Get more accurate crop recommendations based on real soil conditions

## Architecture

### Context Management
- Extended AppContext to include SoilData interface
- Added soil data state management with actions:
  - SET_SOIL_DATA: Updates soil data
  - CLEAR_SOIL_DATA: Resets soil data

### Data Flow
1. *SoilMap Component*: 
   - Fetches soil data from ISRIC SoilGrids API
   - Stores data in global context via setSoilData()
   - Maps API response to standardized format

2. *Crop Recommendation Page*:
   - Reads soil data from context
   - Shows auto-fill button when soil data is available
   - Maps soil properties to form fields:
     - nitrogen → N field
     - phosphorus → P field  
     - wv0033 (potassium) → K field
     - phh2o → pH field

### Soil Data Mapping

| API Property | Context Field | Form Field | Description |
|-------------|---------------|------------|-------------|
| phh2o | phh2o | ph | Soil pH |
| nitrogen | nitrogen | N | Nitrogen content |
| bdod | phosphorus | P | Phosphorus content |
| wv0033 | wv0033 | K | Potassium content |
| soc | soc | - | Soil organic carbon |
| sand | sand | - | Sand content |
| silt | silt | - | Silt content |
| clay | clay | - | Clay content |
| cec | cec | - | Cation exchange capacity |

## Usage

1. Navigate to the Soil Map page
2. Click on any location to fetch soil data
3. Navigate to Crop Recommendation page
4. Click "Auto-fill from Soil Map" button
5. Complete remaining fields (temperature, humidity, rainfall)
6. Get crop recommendations

## Benefits

- *Accuracy*: Uses real soil data instead of manual input
- *Convenience*: Reduces manual data entry
- *Consistency*: Standardized soil data format
- *Integration*: Seamless flow between map and recommendation features