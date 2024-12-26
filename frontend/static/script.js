// List of severe events

const alwaysSevereEvents = [
    "heart attack",
    "stroke",
    "cardiac arrest",
    "cardiac failure",
    "anaphylaxis",
    "respiratory failure",
    "acute kidney failure",
    "gastrointestinal bleed",
    "cerebral hemorrhage",
    "sepsis",
    "liver failure",
    "multiple organ failure",
    "severe arrhythmia",
    "pulmonary embolism",
    "severe anemia",
    "myocardial infarction",
    "acute respiratory distress syndrome",
    "severe sepsis",
    "acute pancreatitis",
    "severe trauma",
    "shock",
    "coma",
    "severe dehydration",
    "acute myocardial ischemia",
    "arrhythmia",
    "brain death",
    "massive pulmonary embolism",
    "acute bacterial endocarditis",
    "acute bleeding disorders",
    "severe pneumonia",
    "severe stroke complications",
    "severe inflammatory bowel disease",
    "severe alcohol intoxication",
    "severe diabetic ketoacidosis",
    "bacterial meningitis",
    "severe asthma attack",
    "toxic shock syndrome",
    "sudden cardiac death",
    "massive heart failure",
    "severe hypoglycemia",
    "severe allergic reactions",
    "acute brain injury",
    "severe burns",
    "difficulty breathing",
    "kidney failure",
    "arterial pressure NOS decreased",
    "septic shock",
    "anaemia",
    
];

// Function to categorize the interactions by PRR
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

// Function to display categorized results in a cleaner way
function displayCategory(category, interactions) {
    const uniqueCombinations = {};

    // Limit the number of interactions shown (e.g., first 10)
    const limitedInteractions = interactions.slice(0, 30);  // Change this number as per your preference

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

// Handle search for drug interactions
document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const drugInput = document.getElementById('drugInput');
    const resultsContainer = document.getElementById('resultsContainer');

    // Event listener for form submission
    searchButton.addEventListener('click', function (event) {
        event.preventDefault();
        const drugName = drugInput.value.trim();

        if (drugName === '') {
            alert('Please enter a drug name.');
            return;
        }

        resultsContainer.innerHTML = '';

        // Assuming source is 'local' as per your current setup
        fetch(`/drug_interactions?drug_name=${drugName}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultsContainer.innerHTML = `<p>${data.error}</p>`;
                } else if (data.message) {
                    resultsContainer.innerHTML = `<p>${data.message}</p>`;
                } else if (data.drug_interactions) {
                    // Filter and categorize interactions based on PRR
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
    });

    // Event listener for "Show more" button
    resultsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('show-more')) {
            const category = event.target.getAttribute('data-category');

            fetch(`/drug_interactions?drug_name=${drugInput.value.trim()}`)
                .then(response => response.json())
                .then(data => {
                    const categorizedResults = categorizeInteractions(data.drug_interactions);

                    let resultHTML = `<div style="display: flex; justify-content: space-around;">`;

                    // Show more of the selected category
                    if (category === 'Most Likely') {
                        resultHTML += displayCategory("Most Likely", categorizedResults.mostLikely);
                    } else if (category === 'Likely') {
                        resultHTML += displayCategory("Likely", categorizedResults.likely);
                    } else {
                        resultHTML += displayCategory("Unlikely", categorizedResults.unlikely);
                    }

                    resultHTML += `</div>`;

                    resultsContainer.innerHTML = resultHTML;
                })
                .catch(error => {
                    console.error('Error fetching drug interactions:', error);
                    resultsContainer.innerHTML = '<p>There was an error fetching the drug interactions. Please try again later.</p>';
                });
        }
    });
});


