// Initialize the map centered on Natal, Brazil
const map = L.map('map').setView([-5.7945, -35.2120], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store markers and route
let startMarker = null;
let endMarker = null;
let routeLine = null;
let amenityMarkers = [];
let checkpointInterval = null;
let activeRoute = null;

// Simulated data for amenities (in a real app, this would come from a database)
const amenities = [
    { type: 'bathroom', lat: -5.7945, lng: -35.2120, name: 'Banheiro Público - Ponta Negra' },
    { type: 'rest', lat: -5.7855, lng: -35.2030, name: 'Área de Descanso - Praia do Meio' },
    { type: 'bathroom', lat: -5.7799, lng: -35.2055, name: 'Banheiro Público - Praia dos Artistas' },
    { type: 'rest', lat: -5.7912, lng: -35.1988, name: 'Área de Descanso - Parque das Dunas' }
];

// Simulated data for safety zones (in a real app, this would come from a database)
const safetyZones = [
    { lat: -5.7945, lng: -35.2120, level: 9, description: 'Área bem iluminada e movimentada' },
    { lat: -5.7855, lng: -35.2030, level: 7, description: 'Área com patrulhamento regular' },
    { lat: -5.7799, lng: -35.2055, level: 8, description: 'Área comercial com câmeras' }
];

// Initialize emergency features
function initializeEmergency() {
    const emergencyButton = document.getElementById('emergencyButton');
    const shareRouteButton = document.getElementById('shareRoute');
    const trustedContactInput = document.getElementById('trustedContact');

    emergencyButton.addEventListener('click', handleEmergency);
    shareRouteButton.addEventListener('click', () => shareRouteWithContact(false));
    
    // Format phone number as user types
    trustedContactInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 7) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            } else {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
            }
        }
        e.target.value = value;
    });
}

// Handle emergency button click
function handleEmergency() {
    const currentPosition = getCurrentPosition();
    const emergencyMessage = `🆘 EMERGÊNCIA! Localização atual: ${currentPosition.lat}, ${currentPosition.lng}`;
    
    // Simulate sending emergency alert (in a real app, this would contact emergency services)
    alert('Alerta de emergência enviado! Serviços de emergência foram notificados.');
    
    // Send message to trusted contact
    const trustedContact = document.getElementById('trustedContact').value;
    if (trustedContact) {
        shareRouteWithContact(true);
    }
}

// Share route with trusted contact
function shareRouteWithContact(isEmergency = false) {
    const contact = document.getElementById('trustedContact').value.replace(/\D/g, '');
    
    if (!contact || contact.length < 11) {
        alert('Por favor, adicione um número de WhatsApp válido (DDD + número)');
        return;
    }

    if (!activeRoute && !isEmergency) {
        alert('Por favor, calcule uma rota primeiro antes de compartilhar.');
        return;
    }

    const currentPosition = getCurrentPosition();
    let message = '';

    if (isEmergency) {
        message = `🆘 EMERGÊNCIA! Preciso de ajuda! Minha localização atual: https://www.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`;
    } else {
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        const distance = document.getElementById('distance').textContent;
        const time = document.getElementById('time').textContent;
        
        message = `🚶‍♂️ Olá! Estou compartilhando minha rota no SafeRoute:\n` +
                 `Partida: ${start}\n` +
                 `Destino: ${end}\n` +
                 `Distância: ${distance}\n` +
                 `Tempo estimado: ${time}\n` +
                 `Acompanhe minha localização: https://www.google.com/maps?q=${currentPosition.lat},${currentPosition.lng}`;
    }

    // Format WhatsApp URL
    const whatsappUrl = `https://wa.me/55${contact}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
}

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

// Show amenities on the map
function showAmenities() {
    // Clear existing amenity markers
    amenityMarkers.forEach(marker => map.removeLayer(marker));
    amenityMarkers = [];

    // Add markers for each amenity
    amenities.forEach(amenity => {
        const icon = amenity.type === 'bathroom' ? '🚻' : '⛱️';
        const marker = L.marker([amenity.lat, amenity.lng])
            .bindPopup(`${icon} ${amenity.name}`)
            .addTo(map);
        amenityMarkers.push(marker);

        // Add to amenities list
        const amenitiesList = document.getElementById('amenitiesList');
        const item = document.createElement('div');
        item.className = 'amenity-item';
        item.innerHTML = `<span class="icon">${icon}</span> ${amenity.name}`;
        amenitiesList.appendChild(item);
    });
}

// Simulate real-time alerts
function startAlertSimulation() {
    const alerts = [
        '🚧 Obras na Av. Roberto Freire - Desvio necessário',
        '⚠️ Evento na orla - Tráfego intenso',
        '🚨 Alerta de segurança reportado próximo à rota',
        '🌧️ Previsão de chuva nos próximos 30 minutos'
    ];

    setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of new alert
            const alertsList = document.getElementById('alertsList');
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            alertItem.textContent = alerts[Math.floor(Math.random() * alerts.length)];
            alertsList.insertBefore(alertItem, alertsList.firstChild);

            // Remove old alerts
            if (alertsList.children.length > 5) {
                alertsList.removeChild(alertsList.lastChild);
            }
        }
    }, 30000); // Check for new alerts every 30 seconds
}

// Start periodic safety checks
function startSafetyChecks() {
    if (checkpointInterval) {
        clearInterval(checkpointInterval);
    }

    checkpointInterval = setInterval(() => {
        const nextCheckpoint = document.getElementById('nextCheckpoint');
        const checkpoints = [
            'Próximo à Praia do Meio',
            'Chegando ao Parque das Dunas',
            'Próximo ao Shopping',
            'Área monitorada'
        ];
        nextCheckpoint.textContent = checkpoints[Math.floor(Math.random() * checkpoints.length)];
    }, 60000); // Update checkpoint every minute
}

function calculateAndDisplayRoute() {
    if (!startMarker || !endMarker) {
        alert('Por favor, selecione os pontos de partida e chegada no mapa');
        return;
    }

    // Clear existing route
    if (routeLine) {
        map.removeLayer(routeLine);
    }

    const start = startMarker.getLatLng();
    const end = endMarker.getLatLng();
    
    // Get route preferences
    const avoidSlopes = document.getElementById('avoidSlopes').checked;
    const preferBikeLanes = document.getElementById('preferBikeLanes').checked;
    const safetyPriority = document.getElementById('safetyPriority').checked;

    // Simulate route calculation with preferences
    const routePoints = calculateSafeRoute(start, end, {
        avoidSlopes,
        preferBikeLanes,
        safetyPriority
    });

    // Draw the route
    routeLine = L.polyline(routePoints, {
        color: '#3498db',
        weight: 5,
        opacity: 0.7
    }).addTo(map);

    // Store active route
    activeRoute = {
        start: start,
        end: end,
        points: routePoints
    };

    // Fit the map to show the entire route
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    // Update route information
    updateRouteInfo(start, end);

    // Show amenities along the route
    showAmenities();

    // Start safety checks
    startSafetyChecks();
}

function calculateSafeRoute(start, end, preferences) {
    // In a real app, this would use a routing service with safety data
    // For now, we'll create a simple route with some waypoints
    const waypoints = [
        [start.lat, start.lng],
        [-5.7899, -35.2080], // Safe waypoint 1
        [-5.7855, -35.2030], // Safe waypoint 2
        [end.lat, end.lng]
    ];

    return waypoints;
}

function updateRouteInfo(start, end) {
    // Calculate approximate distance
    const distance = calculateDistance(start, end);
    
    // Estimate time (assuming 5 km/h walking speed)
    const timeInMinutes = Math.round((distance / 5) * 60);
    
    // Calculate safety score based on nearby safe zones
    const safetyScore = calculateSafetyScore(start, end);

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

function calculateSafetyScore(start, end) {
    // In a real app, this would use actual crime data and safety factors
    // For now, return a simulated score based on proximity to safe zones
    const averageSafety = safetyZones.reduce((acc, zone) => acc + zone.level, 0) / safetyZones.length;
    return Math.min(10, Math.max(6, Math.round(averageSafety)));
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function getCurrentPosition() {
    // In a real app, this would use the Geolocation API
    return startMarker ? startMarker.getLatLng() : { lat: -5.7945, lng: -35.2120 };
}

// Initialize emergency features and start alert simulation
initializeEmergency();
startAlertSimulation();

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
    activeRoute = null;
    document.getElementById('start').value = '';
    document.getElementById('end').value = '';
    document.getElementById('distance').textContent = '0.0 km';
    document.getElementById('time').textContent = '0 min';
    document.getElementById('safety').textContent = 'N/A';
    document.getElementById('nextCheckpoint').textContent = 'N/A';
}