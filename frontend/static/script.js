document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const drugInput = document.getElementById('drugInput');
    const resultsContainer = document.getElementById('resultsContainer');

    // Use the source passed from Flask (either 'local' or 'fda')
    const source = selectedSource;  // This is injected into JS via the script in index.html
    console.log("Selected Source: ", source);  // Check the selected source in the console

    // Event listener for form submission
    searchButton.addEventListener('click', function (event) {
        event.preventDefault();  // Prevent form submission

        const drugName = drugInput.value.trim();  // Get drug name input

        if (drugName === '') {
            alert('Please enter a drug name.');  // Validate drug name
            return;
        }

        resultsContainer.innerHTML = '';  // Clear previous results

        // If using FDA API, fetch data from FDA
        if (source === 'fda') {
            fetchFDAData(drugName).then(data => {
                if (data.error) {
                    resultsContainer.innerHTML = `<p>${data.error}</p>`;  // Display error if no data is returned
                } else if (data.message) {
                    resultsContainer.innerHTML = `<p>${data.message}</p>`;  // Display no interactions found message
                } else {
                    // Display drug_interactions and warnings_and_cautions
                    let resultHTML = '<h3>Drug Interactions and Warnings/Cautions:</h3>';
                    resultHTML += '<ul>';

                    data.forEach(interaction => {
                        resultHTML += `
                            <li>
                                <strong>Drug Interactions:</strong> ${interaction.drug_interactions}<br>
                                <strong>Warnings/Cautions:</strong> ${interaction.warnings_and_cautions}<br>
                                <strong>Boxed Warnigs:</strong> ${interaction.boxed_warning}<br>
                                <strong>Indications and Usage:</strong> ${interaction.indications_and_usage}<br>
                                <strong>Dosage:</strong> ${interaction.dosage_and_administration}<br>
                                <strong>Contraindications:</strong> ${interaction.contraindications}<br>
                                <strong>Information for patients:</strong> ${interaction.information_for_patients}<br>

                            </li><br>
                        `;
                    });

                    resultHTML += '</ul>';
                    resultsContainer.innerHTML = resultHTML;  // Display the results in the container
                }
            }).catch(error => {
                console.error('Error fetching FDA data:', error);
                resultsContainer.innerHTML = '<p>There was an error fetching the drug interactions. Please try again later.</p>';
            });

        } else {
            // If using local database, fetch data from local database (existing logic)
            fetch(`/drug_interactions?drug_name=${drugName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultsContainer.innerHTML = `<p>${data.error}</p>`;  // Display error if no data is returned
                    } else if (data.message) {
                        resultsContainer.innerHTML = `<p>${data.message}</p>`;  // Display no interactions found message
                    } else if (data.drug_interactions) {
                        // Filter and categorize interactions based on PRR (Most Likely, Likely, Unlikely)
                        const categorizedResults = categorizeInteractions(data.drug_interactions);
                        console.log('Categorized results:', categorizedResults);

                        let resultHTML = '<h3>Drug Interactions Found:</h3>';
                        resultHTML += `<div style="display: flex; justify-content: space-around;">`;
                        resultHTML += displayCategory("Most Likely", categorizedResults.mostLikely);
                        resultHTML += displayCategory("Likely", categorizedResults.likely);
                        resultHTML += displayCategory("Unlikely", categorizedResults.unlikely);
                        resultHTML += `</div>`;

                        resultsContainer.innerHTML = resultHTML;
                    }
                })
                .catch(error => {
                    console.error('Error fetching drug interactions:', error);
                    resultsContainer.innerHTML = '<p>There was an error fetching the drug interactions. Please try again later.</p>';
                });
        }
    });

    // Function to fetch data from FDA API for both drug interactions and warnings/cautions
    function fetchFDAData(drugName) {
        const FDA_API_KEY = 'wDAtQe86UDtlfEkAjCS4uBBbvBZDCKAt8gNjk2MS';  // Replace with your actual FDA API key
        const apiUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${drugName}"`;
        const headers = {
            'Authorization': `Bearer ${FDA_API_KEY}`
        };
        
        return fetch(apiUrl, { headers })
            .then(response => {
                console.log('API Response Status:', response.status);  // Log the API response status
                return response.json();
            })
            .then(data => {
                console.log('API Response Data:', data);  // Log the API response data

                if (data.results) {
                    // Extract only the necessary fields (drug_interactions and warnings_and_cautions)
                    const interactions = data.results.map(interaction => ({
                        
                        drug_interactions: interaction.drug_interactions || 'No interactions available',
                        warnings_and_cautions: interaction.warnings_and_cautions || 'No warnings available',
                        boxed_warning: interaction.boxed_warning || 'No boxed warnings available',
                        indications_and_usage: interaction.indications_and_usage || 'No indications and usage available',
                        dosage_and_administration: interaction.dosage_and_administration || 'No dosage information available',
                        contraindications: interaction.contraindications || 'No contraindications available',
                        information_for_patients: interaction.information_for_patients || 'No information for patients available'


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

    // Function to categorize the interactions by PRR (Local Database only)
    function categorizeInteractions(interactions) {
        const mostLikely = [];
        const likely = [];
        const unlikely = [];

        interactions.forEach(interaction => {
            let prr = parseFloat(interaction.proportional_reporting_ratio);

            console.log(`PRR for ${interaction.drug1} and ${interaction.drug2}: ${prr}`);  // Check PRR values

            if (isNaN(prr)) {
                console.error(`Invalid PRR for ${interaction.drug1} and ${interaction.drug2}, assigning 0 PRR`);
                prr = 0;  // Default to 0 if PRR is invalid
            }

            // Categorize based on PRR value
            if (prr < 5) {
                unlikely.push(interaction);  // If the event is less likely
            } else if (prr >= 5 && prr < 15) {
                likely.push(interaction);  // If the event is more likely
            } else {
                mostLikely.push(interaction);  // If the event is most likely
            }
        });

        return { mostLikely, likely, unlikely };
    }

    // Function to display categorized results in a cleaner way (Local Database only)
    function displayCategory(category, interactions) {
        const uniqueCombinations = {};

        // Limit the number of interactions shown (e.g., first 10)
        const limitedInteractions = interactions.slice(0, 50);  // Change this number as per your preference

        // Order events inside parentheses by PRR in descending order
        limitedInteractions.forEach(interaction => {
            const drugCombination = `${interaction.drug1} and ${interaction.drug2}`;
            const event = interaction.event_name;
            const prr = parseFloat(interaction.proportional_reporting_ratio);

            if (!uniqueCombinations[drugCombination]) {
                uniqueCombinations[drugCombination] = [];
            }
            uniqueCombinations[drugCombination].push({ event, prr });
        });

        let categoryHTML = `<div><strong>${category}:</strong><ul>`;

        // Order the events by PRR (highest first) within each drug combination
        Object.keys(uniqueCombinations).forEach(drugCombination => {
            const sortedEvents = uniqueCombinations[drugCombination].sort((a, b) => b.prr - a.prr);
            const eventsList = sortedEvents.map(eventObj => eventObj.event).join(', ');
            categoryHTML += `<li><strong>${drugCombination}</strong>: (${eventsList})</li>`;
        });

        categoryHTML += `</ul>`;

        // Add "Show more" button if there are more than the limit
        if (limitedInteractions.length < interactions.length) {
            categoryHTML += `<button class="show-more" data-category="${category}">Show more</button>`;
        }

        categoryHTML += `</div>`;

        return categoryHTML;
    }
});
