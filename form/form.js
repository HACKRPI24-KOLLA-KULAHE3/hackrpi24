$(document).ready(function() {
    let neighborhoodsData = [];

    // Fetch the JSON data and store it
    fetch('jsonminifier.json')
        .then(response => response.json())
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
            // Redirect to the event display page with the selected date in the URL
            window.location.href = `../xml/events.html?date=${encodeURIComponent(selectedDate)}`;
        } else {
            alert('Please select a borough, neighborhood, and date before proceeding.');
        }
    });
});
