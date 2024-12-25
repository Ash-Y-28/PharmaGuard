document.addEventListener('DOMContentLoaded', function() {
    const searchButton = document.getElementById('searchButton');
    const drugInput = document.getElementById('drugInput');
    const resultsContainer = document.getElementById('resultsContainer');

    // Use the source passed from Flask (either 'local' or 'fda')
    const source = selectedSource;  // This is injected into JS via the script in index.html

    console.log("Selected Source: ", source);  // Check the selected source in the console

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

        if (source === 'fda') {
            // Fetch data from FDA API (drug interactions and warnings/cautions)
            fetchFDAData(drugName).then(data => {
                if (data.error) {
                    resultsContainer.innerHTML = `<p>${data.error}</p>`;
                } else if (data.message) {
                    resultsContainer.innerHTML = `<p>${data.message}</p>`;
                } else {
                    let resultHTML = '<h3>Drug Interactions and Warnings/Cautions Found:</h3>';
                    resultHTML += '<ul>';

                    data.forEach(interaction => {
                        resultHTML += 
                            `<li>
                                <strong>Drug Interactions:</strong> ${interaction.drug_interactions}<br>
                                <strong>Warnings/Cautions:</strong> ${interaction.warnings_and_cautions}<br>
                            </li><br>`;
                    });

                    resultHTML += '</ul>';
                    resultsContainer.innerHTML = resultHTML;
                }
            });
        } else {
            // Fetch data from the local database (existing logic)
            fetch(`/drug_interactions?drug_name=${drugName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultsContainer.innerHTML = 
                        `<p>${data.error}</p>`;
                    } else if (data.message) {
                        resultsContainer.innerHTML = `<p>${data.message}</p>`;
                    } else if (data.drug_interactions) {
                        let resultHTML = '<h3>Drug Interactions Found:</h3>';
                        resultHTML += '<ul>';

                        // For local data, display drug1, drug2, and event_name
                        data.drug_interactions.forEach(interaction => {
                            resultHTML += 
                                `<li>
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
        }
    });
});

// Function to fetch data from FDA API for both drug interactions and warnings/cautions
function fetchFDAData(drugName) {
    const FDA_API_KEY = 'wDAtQe86UDtlfEkAjCS4uBBbvBZDCKAt8gNjk2MS';
    const apiUrl = `https://api.fda.gov/drug/label.json?search=drug_interactions:"${drugName}"`;

    const headers = {
        'Authorization': `Bearer ${FDA_API_KEY}`
    };

    return fetch(apiUrl, { headers })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed to fetch data from FDA API');
        })
        .then(data => {
            if (data.results) {
                const interactions = data.results.map(interaction => ({
                    drug_interactions: interaction.drug_interactions || 'No interactions available',
                    warnings_and_cautions: interaction.warnings_and_cautions || 'No warnings available'
                }));
                return interactions;
            } else {
                return { message: `No interactions found for ${drugName}` };
            }
        })
        .catch(error => {
            console.error('Error fetching FDA data:', error);
            return { error: 'An error occurred while fetching the data.' };
        });
}
