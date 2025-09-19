# Google Maps Location Input Integration

This guide explains how to use the enhanced location input component with Google Maps integration in your Cycle.LK application.

## Features

✅ **Google Places Autocomplete** - Search for locations with intelligent suggestions  
✅ **Interactive Map Selection** - Click on map to select locations by coordinates  
✅ **Draggable Markers** - Fine-tune location selection by dragging markers  
✅ **Reverse Geocoding** - Convert coordinates to human-readable addresses  
✅ **Local Suggestions** - Fallback to predefined Sri Lankan city list  
✅ **Coordinate Display** - Show precise latitude/longitude values  
✅ **TypeScript Support** - Full type safety and IntelliSense

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)

### 2. Configure Environment

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Add your API key to `.env`:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Usage Examples

### Basic Usage

```tsx
import React, { useState } from "react";
import { MapLocationInput } from "../components/forms";
import { type LocationData } from "../config/googleMaps";

const MyForm: React.FC = () => {
  const [location, setLocation] = useState("");

  const handleLocationChange = (value: string, locationData?: LocationData) => {
    setLocation(value);
    if (locationData) {
      console.log("Coordinates:", locationData.coordinates);
    }
  };

  return (
    <MapLocationInput
      value={location}
      onChange={handleLocationChange}
      placeholder="Search for a location"
      showMap={true}
      required
    />
  );
};
```

### Advanced Usage with Form Integration

```tsx
import React, { useState } from "react";
import { MapLocationInput } from "../components/forms";
import { type LocationData } from "../config/googleMaps";

interface BusinessForm {
  name: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  address: string;
}

const BusinessRegistration: React.FC = () => {
  const [formData, setFormData] = useState<BusinessForm>({
    name: "",
    location: "",
    address: "",
  });

  const handleLocationChange = (value: string, locationData?: LocationData) => {
    setFormData((prev) => ({
      ...prev,
      location: value,
      coordinates: locationData
        ? {
            lat: locationData.coordinates.lat,
            lng: locationData.coordinates.lng,
          }
        : undefined,
      // Auto-fill address if selected from map
      address: locationData?.formattedAddress || prev.address,
    }));
  };

  const handleLocationSelect = (locationData: LocationData) => {
    // Additional actions when location is selected
    console.log("Selected:", locationData);
  };

  const sriLankanCities = [
    "Colombo",
    "Kandy",
    "Galle",
    "Anuradhapura",
    "Polonnaruwa",
  ];

  return (
    <form>
      <div>
        <label>Business Location *</label>
        <MapLocationInput
          value={formData.location}
          onChange={handleLocationChange}
          onLocationSelect={handleLocationSelect}
          placeholder="Search or click on map"
          suggestions={sriLankanCities}
          showMap={true}
          mapHeight="300px"
          required
        />
      </div>

      {formData.coordinates && (
        <div className="mt-2 text-sm text-green-600">
          📍 Coordinates: {formData.coordinates.lat.toFixed(6)},{" "}
          {formData.coordinates.lng.toFixed(6)}
        </div>
      )}
    </form>
  );
};
```

## Component Props

### MapLocationInput Props

| Prop               | Type                                                   | Default                             | Description                                            |
| ------------------ | ------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------ |
| `value`            | `string`                                               | -                                   | Current input value                                    |
| `onChange`         | `(value: string, locationData?: LocationData) => void` | -                                   | Called when input changes                              |
| `onLocationSelect` | `(location: LocationData) => void`                     | -                                   | Called when location is selected from map/autocomplete |
| `placeholder`      | `string`                                               | `"Search location or click on map"` | Input placeholder text                                 |
| `required`         | `boolean`                                              | `false`                             | Whether field is required                              |
| `suggestions`      | `string[]`                                             | `[]`                                | Local fallback suggestions                             |
| `disabled`         | `boolean`                                              | `false`                             | Whether input is disabled                              |
| `className`        | `string`                                               | `""`                                | Additional CSS classes                                 |
| `showMap`          | `boolean`                                              | `true`                              | Whether to show interactive map                        |
| `mapHeight`        | `string`                                               | `"300px"`                           | Height of map container                                |

### LocationData Interface

```typescript
interface LocationData {
  address: string; // Display address
  coordinates: {
    lat: number; // Latitude
    lng: number; // Longitude
    address?: string; // Coordinate address
    placeId?: string; // Google Place ID
  };
  placeId?: string; // Google Place ID
  formattedAddress?: string; // Google formatted address
}
```

## Integration with Partner Registration

To integrate with your existing partner registration form:

1. Replace the existing `LocationInput` with `MapLocationInput`:

```tsx
// Before
<LocationInput
  value={formData.location}
  onChange={handleLocationChange}
  suggestions={sriLankanLocations}
/>

// After
<MapLocationInput
  value={formData.location}
  onChange={(value, locationData) => {
    handleLocationChange(value);
    // Store coordinates for backend
    if (locationData) {
      setFormData(prev => ({
        ...prev,
        coordinates: locationData.coordinates
      }));
    }
  }}
  suggestions={sriLankanLocations}
  showMap={true}
/>
```

2. Update your form submission to include coordinates:

```tsx
const registrationData = {
  // ... other fields
  location: formData.location,
  coordinates: formData.coordinates, // Add this
  // ... rest of form data
};
```

## Troubleshooting

### Common Issues

1. **Map not loading**

   - Check if API key is correctly set in `.env`
   - Verify that Maps JavaScript API is enabled
   - Check browser console for errors

2. **Autocomplete not working**

   - Ensure Places API is enabled in Google Cloud Console
   - Check API key restrictions

3. **Geocoding failures**
   - Verify Geocoding API is enabled
   - Check network connectivity
   - Ensure API quotas are not exceeded

### Testing

Visit `/location-test` to test the component functionality with a demonstration page.

## Cost Considerations

Google Maps APIs have usage-based pricing:

- **Maps JavaScript API**: ~$7 per 1000 loads
- **Places API**: ~$17 per 1000 requests
- **Geocoding API**: ~$5 per 1000 requests

For development and small-scale usage, the free tier ($200/month credit) should be sufficient.

## Security Best Practices

1. **Restrict API Keys**: Limit API key usage to your domain
2. **Environment Variables**: Never commit API keys to version control
3. **Quotas**: Set daily quotas to prevent unexpected charges
4. **HTTPS**: Always use HTTPS in production

## Files Created

- `src/config/googleMaps.ts` - Configuration and types
- `src/services/googleMapsService.ts` - Google Maps service wrapper
- `src/components/forms/MapLocationInput.tsx` - Enhanced location input component
- `src/pages/LocationTestPage.tsx` - Demonstration page
- `src/components/forms/ExampleUsage.tsx` - Usage examples
- `.env.example` - Environment variables template
