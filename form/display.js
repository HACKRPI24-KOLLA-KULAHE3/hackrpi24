$(document).ready(function() {
    // Fetch the JSON data
    fetch('jsonminifier.json') // Adjust path if necessary
        .then(response => response.json())
        .then(data => {
            // Access the features array
            const neighborhoods = data.features;

            // Reference to the display container in HTML
            const $displayContainer = $('#neighborhood-display');

            // Loop through each feature and display the neighborhood names and boroughs
            neighborhoods.forEach(feature => {
                const neighborhoodName = feature.properties.name;
                const boroughName = feature.properties.borough;
                $displayContainer.append(`<p><strong>Neighborhood:</strong> ${neighborhoodName} <br><strong>Borough:</strong> ${boroughName}</p>`);
            });
        })
        .catch(error => console.error('Error fetching neighborhoods data:', error));
});
