$(document).ready(function() {
    // Fetch the JSON data
    fetch('jsonminifier.json') // File is in the same folder as form.js
        .then(response => response.json())
        .then(data => {
            // Access the features array
            const neighborhoods = data.features;

            // Reference to the display container in HTML
            const $displayContainer = $('#neighborhood-display');

            // Loop through each feature and display the neighborhood names
            neighborhoods.forEach(feature => {
                const neighborhoodName = feature.properties.name;
                $displayContainer.append(`<p><strong>Neighborhood:</strong> ${neighborhoodName}</p>`);
            });
        })
        .catch(error => console.error('Error fetching neighborhoods data:', error));
});
