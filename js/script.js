// Initialize the map centered on Natal, Brazil
const map = L.map('map').setView([-5.843212241989942, -35.199019795073895], 17);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store markers and route
let startMarker = null;
let endMarker = null;
let routeLine = null;
let checkpointInterval = null;
let activeRoute = null;

// Simulated data for safety zones
const safetyZones = [
    { lat: -5.8384, lng: -35.1989, level: 9, description: 'Biblioteca Central Zila Mamede - Área bem iluminada e monitorada' },
    { lat: -5.8379, lng: -35.1982, level: 9, description: 'Praça Cívica do Campus - Área movimentada e segura' },
    { lat: -5.8372, lng: -35.1977, level: 8, description: 'Centro de Convivência - Área com câmeras e segurança' },
    { lat: -5.8389, lng: -35.1995, level: 9, description: 'Setor de Aulas IV - Área bem iluminada e patrulhada' },
    { lat: -5.8395, lng: -35.2001, level: 8, description: 'Instituto Metrópole Digital - Monitoramento 24h' },
    { lat: -5.8368, lng: -35.1973, level: 7, description: 'Restaurante Universitário - Área movimentada' },
    { lat: -5.8401, lng: -35.2005, level: 8, description: 'Departamento de Informática - Câmeras de segurança' }
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
    
    // Simulate sending emergency alert
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

// Simulate real-time alerts
function startAlertSimulation() {
    const alerts = [
        '🚧 Obras na Av. Roberto Freire - Desvio necessário',
        '⚠️ Evento na orla - Tráfego intenso',
        '🚨 Alerta de segurança reportado próximo à rota',
        '🌧️ Previsão de chuva nos próximos 30 minutos'
    ];

    setInterval(() => {
        if (Math.random() > 0.7) {
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
    }, 30000);
}

// Start periodic safety checks
function startSafetyChecks() {
    if (checkpointInterval) {
        clearInterval(checkpointInterval);
    }

    checkpointInterval = setInterval(() => {
        const nextCheckpoint = document.getElementById('nextCheckpoint');
        const checkpoints = [
            'Próximo à Biblioteca Central',
            'Chegando ao Centro de Convivência',
            'Próximo ao Restaurante Universitário',
            'Área monitorada do IMD'
        ];
        nextCheckpoint.textContent = checkpoints[Math.floor(Math.random() * checkpoints.length)];
    }, 60000);
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

    // Calculate route with preferences
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

    // Start safety checks
    startSafetyChecks();
}

function calculateSafeRoute(start, end, preferences) {
    // Create a route with waypoints considering preferences
    const waypoints = [
        [start.lat, start.lng],
        [start.lat + (end.lat - start.lat) * 0.33, start.lng + (end.lng - start.lng) * 0.33],
        [start.lat + (end.lat - start.lat) * 0.66, start.lng + (end.lng - start.lng) * 0.66],
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
    // Calculate safety score based on proximity to safe zones
    const averageSafety = safetyZones.reduce((acc, zone) => acc + zone.level, 0) / safetyZones.length;
    return Math.min(10, Math.max(6, Math.round(averageSafety)));
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function getCurrentPosition() {
    return startMarker ? startMarker.getLatLng() : { lat: -5.843212241989942, lng: -35.199019795073895 };
}

// Reset markers function
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

// Initialize emergency features and start alert simulation
initializeEmergency();
startAlertSimulation();