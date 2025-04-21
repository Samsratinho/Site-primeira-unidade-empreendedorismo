/*
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
*/
const bounds = L.latLngBounds(
    L.latLng(-6.7, -38.7),  // 👈 Canto inferior esquerdo (sudoeste do RN)
    L.latLng(-4.5, -34.5)   // 👈 Canto superior direito (nordeste do RN)
);

// Coordenadas da ECT - UFRN
const ectCoords = [-5.8368, -35.2075];

const map = L.map('map', {
    center: ectCoords,
    zoom: 8, // 👈 Zoom alto pra ver a ECT de pertinho
    minZoom: 6, // 👈 Zoom out mínimo (não vê além do RN)
    maxZoom: 18, // 👈 Zoom in máximo (chega pertinho dos prédios)
    maxBounds: bounds,
    //maxBoundsViscosity: 1.0, // 👈 Isso evita que o usuário arraste pra fora
    scrollWheelZoom: true,
    touchZoom: true,
    doubleClickZoom: true,
    boxZoom: false,
    keyboard: false,
    dragging: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Adiciona um marcadorzinho maroto na ECT só pra mostrar o ponto inicial
const ectMarker = L.marker([-5.836487, -35.207434]).addTo(map).bindPopup('Escola de Ciências e Tecnologia');

let startMarker = null;
let endMarker = null;
let routeLine = null;

// Função para verificar se uma coordenada está dentro dos limites do RN
async function geocode(placeName) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`);
    const data = await response.json();
    if (data.length > 0) {
        return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
        };
    } else {
        throw new Error("Local não encontrado");
    }
}

// Manipulando cliques no mapa para adicionar marcadores
map.on('click', function(e) {
    const { lat, lng } = e.latlng;

    if (!isInsideBounds(lat, lng)) {
        alert('Por favor, selecione um ponto dentro do estado do Rio Grande do Norte.');
        return;
    }

    if (!startMarker) {
        startMarker = L.marker(e.latlng).addTo(map);
        document.getElementById('start').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } else if (!endMarker) {
        endMarker = L.marker(e.latlng).addTo(map);
        document.getElementById('end').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        calculateAndDisplayRoute();
    }
});

// Botão de "Encontrar Rota"
document.getElementById('findRoute').addEventListener('click', calculateAndDisplayRoute);

async function calculateAndDisplayRoute() {
    const startInput = document.getElementById('start').value;
    const endInput = document.getElementById('end').value;

    try {
        const startCoords = await geocode(startInput);
        const endCoords = await geocode(endInput);

        // Verifica se está dentro do RN
        const rnBounds = {
            north: -4.000,
            south: -6.350,
            west: -38.000,
            east: -34.000
        };

        function isInRN(coords) {
            return coords.lat >= rnBounds.south && coords.lat <= rnBounds.north &&
                   coords.lng >= rnBounds.west && coords.lng <= rnBounds.east;
        }

        if (!isInRN(startCoords) || !isInRN(endCoords)) {
            alert("Apenas rotas dentro do estado do RN são permitidas.");
            return;
        }

        // Limpa marcadores anteriores
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker) map.removeLayer(endMarker);
        if (routeLine) map.removeLayer(routeLine);

        // Adiciona novos marcadores
        startMarker = L.marker(startCoords).addTo(map);
        endMarker = L.marker(endCoords).addTo(map);

        // Cria rota direta
        const routePoints = [ [startCoords.lat, startCoords.lng], [endCoords.lat, endCoords.lng] ];
        routeLine = L.polyline(routePoints, { color: '#3498db', weight: 5, opacity: 0.7 }).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        // Atualiza info
        updateRouteInfo(startCoords, endCoords);
    } catch (error) {
        alert("Erro ao encontrar local: " + error.message);
    }
    if (ectMarker) {
        map.removeLayer(ectMarker);
    }
}

function updateRouteInfo(start, end) {
    const distance = calculateDistance(start, end);
    const timeInMinutes = Math.round((distance / 5) * 60); // Estimativa de tempo com velocidade de 5 km/h
    const safetyScore = Math.floor(Math.random() * 3) + 8; // Pontuação de segurança aleatória (8-10)

    // Atualiza a interface com as informações
    document.getElementById('distance').textContent = `${distance.toFixed(2)} km`;
    document.getElementById('time').textContent = `${timeInMinutes} min`;
    document.getElementById('safety').textContent = `${safetyScore}/10`;
}

function calculateDistance(start, end) {
    const R = 6371; // Raio da Terra em quilômetros
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

// Função para resetar os marcadores
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