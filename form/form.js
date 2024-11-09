$(document).ready(function() {
    // Fetch the JSON data
    fetch('neighborhoods.geojson')
        .then(response => response.json())
        .then(data => {
            const neighborhoods = data.features;
            const $displayContainer = $('#neighborhood-display');

            // Loop through each feature to extract neighborhood name and borough
            neighborhoods.forEach(neighborhood => {
                const name = neighborhood.properties.name;
                const borough = neighborhood.properties.borough;

                // Append the borough and neighborhood name to the display container
                $displayContainer.append(`<p><strong>Borough:</strong> ${borough}, <strong>Neighborhood:</strong> ${name}</p>`);
            });
        })
        .catch(error => console.error('Error fetching neighborhoods data:', error));
});
