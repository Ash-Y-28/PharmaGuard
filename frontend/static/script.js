// List of events that should always be classified as 'Severe'
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


// Define the thresholds globally at the beginning of the script
const mildThreshold = 5;
const moderateThreshold = 10;
const severeThreshold = 15;

console.log("Thresholds defined - Mild:", mildThreshold, "Moderate:", moderateThreshold, "Severe:", severeThreshold);

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
                    resultHTML += '<ul>';

                    resultHTML += displayCategory("Mild", categorizedResults.mild);
                    resultHTML += displayCategory("Moderate", categorizedResults.moderate);
                    resultHTML += displayCategory("Severe", categorizedResults.severe);

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

// Function to categorize the interactions by PRR
function categorizeInteractions(interactions) {
    const mild = [];
    const moderate = [];
    const severe = [];

    interactions.forEach(interaction => {
        let prr = parseFloat(interaction.proportional_reporting_ratio);

        console.log(`PRR for ${interaction.drug1} and ${interaction.drug2}: ${prr}`);

        if (isNaN(prr)) {
            console.error(`Invalid PRR for ${interaction.drug1} and ${interaction.drug2}, assigning 0 PRR`);
            prr = 0;
        }

        // Check if the event name should always be classified as severe
        const eventName = interaction.event_name.toLowerCase();
        if (alwaysSevereEvents.includes(eventName)) {
            severe.push(interaction);  // Always classify these events as severe
        } else {
            // Proceed with categorization logic based on PRR
            if (prr < mildThreshold) {
                mild.push(interaction);
            } else if (prr >= mildThreshold && prr < moderateThreshold) {
                moderate.push(interaction);
            } else if (prr >= moderateThreshold) {
                severe.push(interaction);
            }
        }
    });

    return { mild, moderate, severe };
}

// Function to display categorized results (Mild, Moderate, Severe)
function displayCategory(category, interactions) {
    if (interactions.length === 0) {
        return `<li><strong>${category}:</strong> No interactions found.</li>`;
    }

    const limitedInteractions = interactions.slice(0, 10);

    let categoryHTML = `<li><strong>${category}:</strong><ul>`;
    limitedInteractions.forEach(interaction => {
        categoryHTML += `<li><strong>Drug 1:</strong> ${interaction.drug1} <strong>Drug 2:</strong> ${interaction.drug2} <strong>Event:</strong> ${interaction.event_name}</li>`;
    });
    categoryHTML += '</ul></li>';

    return categoryHTML;
}
