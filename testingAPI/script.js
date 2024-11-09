// Your primary API key
const apiKey = 'b969575cc3f74ab5a157e053c13315d3';

// Endpoint URL for the /search API
const apiUrl = 'https://api.nyc.gov/calendar/search?startDate=11/09/2024';

// Fetch events from the API and display them on the front end
async function fetchAndDisplayEvents() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const eventsContainer = document.getElementById('events');

        if (data.length === 0) {
            eventsContainer.innerHTML = '<p>No events found for your search criteria.</p>';
        } else {
            data.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.innerHTML = `
                    <h2>${event.eventName}</h2>
                    <p><strong>Date:</strong> ${event.eventDate}</p>
                    <p><strong>Location:</strong> ${event.eventLocation}</p>
                    <p>${event.eventDescription}</p>
                `;
                eventsContainer.appendChild(eventElement);
            });
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        document.getElementById('events').innerHTML = '<p>Error fetching events. Please try again later.</p>';
    }
}

// Call the function to fetch and display events
fetchAndDisplayEvents();
