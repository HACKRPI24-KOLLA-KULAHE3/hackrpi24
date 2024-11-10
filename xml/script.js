// script.js
// Function to get the selected date from the URL
function getSelectedDateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('date');
}

async function loadXML() {
    try {
        const selectedDate = getSelectedDateFromURL(); // Get the selected date from the URL
        const response = await fetch('events.xml'); // Ensure 'events.xml' is in the same directory or adjust path
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
                eventsFound = true;
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');

                const titleElement = item.getElementsByTagName('title')[0];
                const linkElement = item.getElementsByTagName('link')[0];
                const descriptionElement = item.getElementsByTagName('description')[0];
                const startTimeElement = item.getElementsByTagName('event:starttime')[0];
                const locationElement = item.getElementsByTagName('event:location')[0];
                const coordinatesElement = item.getElementsByTagName('event:coordinates')[0];

                const title = titleElement ? titleElement.textContent : 'No title available';
                const link = linkElement ? linkElement.textContent : '#';
                const description = descriptionElement ? descriptionElement.textContent : 'No description available';
                const startTime = startTimeElement ? startTimeElement.textContent : 'No time available';
                const location = locationElement ? locationElement.textContent : 'No location available';
                const coordinates = coordinatesElement ? coordinatesElement.textContent : 'No coordinates available';

                let latitude = 'N/A';
                let longitude = 'N/A';
                let fullAddress = 'Address not available';
                let borough = 'Borough not available';
                let neighborhood = 'Neighborhood not available';

                if (coordinates !== 'No coordinates available') {
                    [latitude, longitude] = coordinates.split(',').map(coord => coord.trim());
                    
                    // Fetch full address using Google Maps Geocoding API
                    try {
                        const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyD9AHcZ354omb7QqEyx2xtSZKaed7thlUs`);
                        const geoData = await geoResponse.json();

                        if (geoData.status === 'OK' && geoData.results.length > 0) {
                            fullAddress = geoData.results[0].formatted_address;
                            
                            // Extract borough and neighborhood from address components
                            const addressComponents = geoData.results[0].address_components;
                            for (let component of addressComponents) {
                                if (component.types.includes('neighborhood')) {
                                    neighborhood = component.long_name;
                                }
                                if (component.types.includes('sublocality') || component.types.includes('sublocality_level_1')) {
                                    borough = component.long_name;
                                }
                            }

                            // Ensure borough is correctly set if only `political` type contains it
                            if (borough === 'Borough not available') {
                                for (let component of addressComponents) {
                                    if (component.types.includes('political') && !component.types.includes('country')) {
                                        borough = component.long_name;
                                        break;
                                    }
                                }
                            }
                        } else {
                            console.warn('Geocoding API response error:', geoData.status);
                        }
                    } catch (geoError) {
                        console.error('Error fetching address:', geoError);
                    }
                }

                // Filter out specific details from the description
                const filteredDescription = description
                    .replace(/<p>Date:.*?<\/p>/g, '')
                    .replace(/<p>Start time:.*?<\/p>/g, '')
                    .replace(/<p>End time:.*?<\/p>/g, '')
                    .replace(/<p>Contact phone:.*?<\/p>/g, '')
                    .replace(/<p>Location:.*?<\/p>/g, '');

                eventDiv.innerHTML = `
                    <h3><a href="${link}" target="_blank">${title}</a></h3>
                    <p><strong>Date:</strong> ${startDate}</p>
                    <p><strong>Time:</strong> ${startTime}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Coordinates:</strong> Latitude: ${latitude}, Longitude: ${longitude}</p>
                    <p><strong>Full Address:</strong> ${fullAddress}</p>
                    <p><strong>Borough:</strong> ${borough}</p>
                    <p><strong>Neighborhood:</strong> ${neighborhood}</p>
                    <p>${filteredDescription}</p>
                `;

                document.getElementById('events').appendChild(eventDiv);
            }
        }

        // If no events are found for the selected date
        if (!eventsFound) {
            document.getElementById('events').innerHTML = `<p>No events found for the selected date: ${selectedDate}</p>`;
        }
    } catch (error) {
        console.error('Error loading XML:', error);
    }
}

loadXML();
