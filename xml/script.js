// Function to get the selected date and borough from the URL
function getSelectedDateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('date');
}

function getSelectedBoroughFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('borough');
}

// Function to calculate distance using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRadians = (degree) => degree * (Math.PI / 180);
    const R = 6371; // Radius of Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Function to calculate carbon emissions based on distance
function calculateCarbonEmissions(distance) {
    const walkingEmission = 0; // kg CO2 per km (essentially zero for walking)
    const drivingEmission = 0.21; // kg CO2 per km (average for a car)
    const transitEmission = 0.06; // kg CO2 per km (average for public transit)

    return {
        walking: (walkingEmission * distance).toFixed(2),
        driving: (drivingEmission * distance).toFixed(2),
        transit: (transitEmission * distance).toFixed(2)
    };
}

async function loadXML() {
    try {
        const selectedDate = getSelectedDateFromURL(); // Get the selected date from the URL
        const selectedBorough = getSelectedBoroughFromURL(); // Get the selected borough from the URL

        const response = await fetch('events.xml'); // Ensure 'events.xml' is in the same directory or adjust path

        if (!response.ok) {
            throw new Error(`Failed to load XML file: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");

        if (xml.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Error parsing XML');
        }

        const items = xml.getElementsByTagName('item');
        let eventsFound = false;

        for (let item of items) {
            const startDateElement = item.getElementsByTagName('event:startdate')[0];
            const startDate = startDateElement ? startDateElement.textContent : '';

            // Only display events that match the selected date
            if (startDate === selectedDate) {
                let borough = 'Borough not available';
                const coordinatesElement = item.getElementsByTagName('event:coordinates')[0];
                const coordinates = coordinatesElement ? coordinatesElement.textContent : 'No coordinates available';

                let latitude, longitude;
                if (coordinates !== 'No coordinates available') {
                    [latitude, longitude] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
                    if (!latitude || !longitude) {
                        console.error('Latitude or longitude is undefined');
                        continue; // Skip to the next item if the coordinates are invalid
                    }

                    // Fetch full address using Google Maps Geocoding API
                    try {
                        const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD9AHcZ354omb7QqEyx2xtSZKaed7thlUs`);
                        const geoData = await geoResponse.json();

                        if (geoData.status === 'OK' && geoData.results.length > 0) {
                            const addressComponents = geoData.results[0].address_components;
                            for (let component of addressComponents) {
                                if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                                    borough = component.long_name;
                                }
                            }
                        }
                    } catch (geoError) {
                        console.error('Error fetching address:', geoError);
                    }
                }

                // Filter by the selected borough
                if (borough === selectedBorough) {
                    eventsFound = true;
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');

                    const titleElement = item.getElementsByTagName('title')[0];
                    const linkElement = item.getElementsByTagName('link')[0];
                    const descriptionElement = item.getElementsByTagName('description')[0];
                    const startTimeElement = item.getElementsByTagName('event:starttime')[0];
                    const locationElement = item.getElementsByTagName('event:location')[0];

                    const title = titleElement ? titleElement.textContent : 'No title available';
                    const link = linkElement ? linkElement.textContent : '#';
                    const description = descriptionElement ? descriptionElement.textContent : 'No description available';
                    const startTime = startTimeElement ? startTimeElement.textContent : 'No time available';
                    const location = locationElement ? locationElement.textContent : 'No location available';

                    // Calculate the distance from the fixed starting point
                    const startLatitude = 42.7284; // Fixed latitude
                    const startLongitude = -73.6918; // Fixed longitude
                    const distance = calculateDistance(startLatitude, startLongitude, latitude, longitude).toFixed(2);

                    // Calculate carbon emissions
                    const emissions = calculateCarbonEmissions(distance);

                    // Determine emission levels
                    const getEmissionLevel = (value) => {
                        if (value <= 0.1) return 'low';
                        if (value <= 0.5) return 'medium';
                        return 'high';
                    };

                    const drivingLevel = getEmissionLevel(emissions.driving);
                    const transitLevel = getEmissionLevel(emissions.transit);

                    // Filter out specific details from the description
                    const filteredDescription = description
                        .replace(/<p>Date:.*?<\/p>/g, '')
                        .replace(/<p>Start time:.*?<\/p>/g, '')
                        .replace(/<p>End time:.*?<\/p>/g, '')
                        .replace(/<p>Contact phone:.*?<\/p>/g, '')
                        .replace(/<p>Location:.*?<\/p>/g, '');

// Modify this part of the eventDiv innerHTML to include clickable links
eventDiv.innerHTML = `
    <h3><a href="${link}" target="_blank">${title}</a></h3>
    <p><strong>Date:</strong> ${startDate}</p>
    <p><strong>Time:</strong> ${startTime}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Borough:</strong> ${borough}</p>
    <p><strong>Distance from starting point:</strong> ${distance} km</p>
    <p><strong>Carbon Emissions:</strong></p>
    <ul class="emission-list">
        <li class="emission-level ${drivingLevel}">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving" target="_blank">
                Driving: ${emissions.driving} kg CO2
            </a>
        </li>
        <li class="emission-level ${transitLevel}">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=transit" target="_blank">
                Transit: ${emissions.transit} kg CO2
            </a>
        </li>
        <li class="emission-level low">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking" target="_blank">
                Walking: ${emissions.walking} kg CO2
            </a>
        </li>
    </ul>

    <div class="map-container">
        <iframe 
            width="100%" 
            height="300" 
            frameborder="0" 
            style="border:0" 
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD9AHcZ354omb7QqEyx2xtSZKaed7thlUs&q=${latitude},${longitude}" 
            allowfullscreen>
        </iframe>
    </div>
    <p><a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank">Get Directions</a></p>
    <p>${filteredDescription}</p>
    <div id="distance">Distance calculated: ${distance} km</div>
`;

document.getElementById('events').appendChild(eventDiv);

                }
            }
        }


        // If no events are found for the selected date and borough
        if (!eventsFound) {
            document.getElementById('events').innerHTML = `<p>No events found for the selected date and borough: ${selectedDate}, ${selectedBorough}</p>`;
        }
    } catch (error) {
        console.error('Error loading XML:', error);
    }
}

loadXML();

$(document).ready(function() {
    let neighborhoodsData = [];



    // Fetch the JSON data and store it
    fetch('jsonminifier.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load JSON file: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            neighborhoodsData = data.features;
        })
        .catch(error => console.error('Error fetching neighborhoods data:', error));

    // Event listener for the neighborhood input field
    $('#neighborhood-input').on('input', function() {
        const selectedBorough = $('#borough-select').val();
        const inputText = $(this).val().toLowerCase();

        // Clear previous options
        $('#neighborhood-dropdown').empty();

        if (selectedBorough && inputText) {
            // Filter neighborhoods based on borough and input text
            const filteredNeighborhoods = neighborhoodsData.filter(feature => {
                const neighborhoodName = feature.properties.name.toLowerCase();
                const borough = feature.properties.borough;
                return borough === selectedBorough && neighborhoodName.startsWith(inputText);
            });

            // Show the dropdown with filtered options


            // Show the dropdown with filtered options
            if (filteredNeighborhoods.length > 0) {
                $('#neighborhood-dropdown').show();
                filteredNeighborhoods.forEach(feature => {
                    const neighborhoodName = feature.properties.name;
                    $('#neighborhood-dropdown').append(`<option value="${neighborhoodName}">${neighborhoodName}</option>`);
                });
            } else {
                $('#neighborhood-dropdown').hide();
            }
        } else {
            $('#neighborhood-dropdown').hide();
        }
    });

    // Event listener for the "Go" button
    $('#go-button').on('click', function() {
        const selectedBorough = $('#borough-select').val();
        const selectedNeighborhood = $('#neighborhood-input').val();
        const selectedDate = $('#date-input').val();

        if (selectedBorough && selectedNeighborhood && selectedDate) {
            // Redirect to the event display page with the selected borough and date in the URL
            window.location.href = `../xml/events.html?date=${encodeURIComponent(selectedDate)}&borough=${encodeURIComponent(selectedBorough)}`;
        } else {
            alert('Please select a borough, neighborhood, and date before proceeding.');
        }
    });
});


