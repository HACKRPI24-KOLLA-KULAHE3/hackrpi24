// Fetch and display NYC events from the API
function fetchNYCEvents() {
    const apiKey = 'b969575cc3f74ab5a157e053c13315d3'; // Replace with your primary key if needed
    
    // Set the start and end dates as per your updated request
    const startDate = '11/09/2024 12:00 AM';
    const endDate = '12/07/2024 12:00 AM';

    // Fetch events using the NYC Events API
    fetch(`https://api.nyc.gov/calendar/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&sort=DATE`, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
            'Ocp-Apim-Subscription-Key': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = ''; // Clear previous content

        if (data.events && data.events.length > 0) {
            data.events.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerHTML = `
                    <h2>${event.title}</h2>
                    <p><strong>Date:</strong> ${event.startDate}</p>
                    <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
                    <p>${event.description || 'No description available.'}</p>
                `;
                eventsContainer.appendChild(eventDiv);
            });
        } else {
            eventsContainer.innerHTML = '<p>No events found for the selected date range.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching events:', error);
        document.getElementById('events-container').innerHTML = '<p>Failed to load events.</p>';
    });
}

// Call the function to fetch events when the script is loaded
fetchNYCEvents();
