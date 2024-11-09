// $(document).ready(function() {
//     // Fetch the JSON data
//     fetch('jsonminifier.json') // File is in the same folder as form.js
//         .then(response => response.json())
//         .then(data => {
//             // Access the features array
//             const neighborhoods = data.features;

//             // Reference to the display container in HTML
//             const $displayContainer = $('#neighborhood-display');

//             // Loop through each feature and display the neighborhood names and boroughs
//             neighborhoods.forEach(feature => {
//                 const neighborhoodName = feature.properties.name;
//                 const boroughName = feature.properties.borough;
//                 $displayContainer.append(`<p><strong>Neighborhood:</strong> ${neighborhoodName} <br><strong>Borough:</strong> ${boroughName}</p>`);
//             });
//         })
//         .catch(error => console.error('Error fetching neighborhoods data:', error));
// });
$(document).ready(function() {
    let neighborhoodsData = [];

    // Fetch the JSON data and store it
    fetch('form/jsonminifier.json')
        .then(response => response.json())
        .then(data => {
            neighborhoodsData = data.features;
        })
        .catch(error => console.error('Error fetching neighborhoods data:', error));

    // Event listener for the neighborhood input field
    $('#neighborhood-input').on('input', function() {
        const selectedBorough = $('#borough-select').val();
        const inputText = $(this).val().toLowerCase();
        
        // Clear previous suggestions
        $('#suggestions').empty();

        if (selectedBorough && inputText) {
            // Filter neighborhoods based on borough and input text
            const filteredNeighborhoods = neighborhoodsData.filter(feature => {
                const neighborhoodName = feature.properties.name.toLowerCase();
                const borough = feature.properties.borough;
                return borough === selectedBorough && neighborhoodName.startsWith(inputText);
            });

            // Display suggestions
            filteredNeighborhoods.forEach(feature => {
                const neighborhoodName = feature.properties.name;
                $('#suggestions').append(`<p class="suggestion-item">${neighborhoodName}</p>`);
            });
        }
    });

    // Event listener for clicking on a suggestion
    $(document).on('click', '.suggestion-item', function() {
        const selectedNeighborhood = $(this).text();
        $('#neighborhood-input').val(selectedNeighborhood);
        $('#suggestions').empty(); // Clear suggestions once selected
    });
});
