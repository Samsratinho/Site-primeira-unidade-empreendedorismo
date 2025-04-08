// Initialize the map centered on a default location (Natal, Brazil)
const map = L.map('map').setView([-5.7945, -35.2120], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store markers and route
let startMarker = null;
let endMarker = null;
let routeLine = null;

// Handle map clicks to set markers
map.on('click', function(e) {
    if (!startMarker) {
        startMarker = L.marker(e.latlng).addTo(map);
        document.getElementById('start').value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
    } else if (!endMarker) {
        endMarker = L.marker(e.latlng).addTo(map);
        document.getElementById('end').value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
        calculateAndDisplayRoute();
    }
});

// Find route button click handler
document.getElementById('findRoute').addEventListener('click', calculateAndDisplayRoute);

function calculateAndDisplayRoute() {
    if (!startMarker || !endMarker) {
        alert('Please select both starting and ending points on the map');
        return;
    }

    // Clear existing route
    if (routeLine) {
        map.removeLayer(routeLine);
    }

    // Simulate route calculation (in a real app, this would use a routing service)
    const start = startMarker.getLatLng();
    const end = endMarker.getLatLng();
    
    // Create a simple route (straight line for demonstration)
    const routePoints = [
        [start.lat, start.lng],
        [end.lat, end.lng]
    ];

    // Draw the route
    routeLine = L.polyline(routePoints, {
        color: '#3498db',
        weight: 5,
        opacity: 0.7
    }).addTo(map);

    // Fit the map to show the entire route
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    // Calculate and display route information
    updateRouteInfo(start, end);
}

function updateRouteInfo(start, end) {
    // Calculate approximate distance (in kilometers)
    const distance = calculateDistance(start, end);
    
    // Estimate time (assuming 5 km/h walking speed)
    const timeInMinutes = Math.round((distance / 5) * 60);
    
    // Generate a mock safety score (1-10)
    const safetyScore = Math.floor(Math.random() * 3) + 8; // Random score between 8-10

    // Update the UI
    document.getElementById('distance').textContent = `${distance.toFixed(2)} km`;
    document.getElementById('time').textContent = `${timeInMinutes} min`;
    document.getElementById('safety').textContent = `${safetyScore}/10`;
}

function calculateDistance(start, end) {
    // Calculate distance using the Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(end.lat - start.lat);
    const dLon = toRad(end.lng - start.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(start.lat)) * Math.cos(toRad(end.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Reset markers button (optional feature)
function resetMarkers() {
    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }
    if (endMarker) {
        map.removeLayer(endMarker);
        endMarker = null;
    }
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
    document.getElementById('start').value = '';
    document.getElementById('end').value = '';
    document.getElementById('distance').textContent = '0.0 km';
    document.getElementById('time').textContent = '0 min';
    document.getElementById('safety').textContent = 'N/A';
}