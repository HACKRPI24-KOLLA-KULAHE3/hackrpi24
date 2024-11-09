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

            // If there are matches, show the dropdown and populate it
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

    // Event listener for selecting a neighborhood from the dropdown
    $('#neighborhood-dropdown').on('change', function() {
        const selectedNeighborhood = $(this).val();
        $('#neighborhood-input').val(selectedNeighborhood);
        $('#neighborhood-dropdown').hide(); // Hide dropdown after selection
    });

    // Hide dropdown when clicking outside of it
    $(document).on('click', function(event) {
        if (!$(event.target).closest('#neighborhood-input, #neighborhood-dropdown').length) {
            $('#neighborhood-dropdown').hide();
        }
    });

    // Event listener for the date input (optional - logs selected date)
    $('#date-input').on('change', function() {
        const selectedDate = $(this).val();
        console.log('Selected date:', selectedDate); // Perform any action needed with the date
    });
});
