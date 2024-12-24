document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const drugInput = document.getElementById('drugInput');
    const resultsContainer = document.getElementById('resultsContainer');

    // Event listener for form submission
    searchButton.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent form submission
        
        const drugName = drugInput.value.trim();

        // Validate if drug name is entered
        if (drugName === '') {
            alert('Please enter a drug name.');
            return;
        }

        // Clear previous results
        resultsContainer.innerHTML = '';

        // Fetch drug interactions from the server
        fetch(`/drug_interactions?drug_name=${drugName}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultsContainer.innerHTML = `<p>${data.error}</p>`;
                } else if (data.message) {
                    resultsContainer.innerHTML = `<p>${data.message}</p>`;
                } else if (data.drug_interactions) {
                    let resultHTML = '<h3>Drug Interactions Found:</h3>';
                    resultHTML += '<ul>';

                    data.drug_interactions.forEach(interaction => {
                        resultHTML += `
                            <li>
                                <strong>Drug 1:</strong> ${interaction.drug1}<br>
                                <strong>Drug 2:</strong> ${interaction.drug2}<br>
                                <strong>Event Name:</strong> ${interaction.event_name}<br>
                            </li><br>`;
                    });

                    resultHTML += '</ul>';
                    resultsContainer.innerHTML = resultHTML;
                }
            })
            .catch(error => {
                console.error('Error fetching drug interactions:', error);
                resultsContainer.innerHTML = '<p>There was an error fetching the drug interactions. Please try again later.</p>';
            });
    });
});
