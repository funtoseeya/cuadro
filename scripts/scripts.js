

//GENERAL SCRIPTS

//function to make the step-body section's available width responsize
function responsiveStepBody() {
    // Define the media query for small screens
    const mediaQuerySm = window.matchMedia('(max-width: 576px)');
    const stepBodyContainer = document.getElementById('step-body');

    // Function to update classes based on screen size
    const updateClasses = () => {
        if (mediaQuerySm.matches) {
            stepBodyContainer.className = 'container mt-5';
        } else {
            stepBodyContainer.className = 'container mt-5 col-md-8 offset-md-2';
        }
    };

    // Initial check upon load
    updateClasses();

    // check again whenever the window size changes
    mediaQuerySm.addEventListener('change', updateClasses);
}

//GLOBAL VARIABLES
let selectedFile; // Global variable to store the file. we need this to create an array with its data
let dropdownState = []; //global variable to save dropdowns in the review table. we need this to save the user's con
let limitedOptionsArray = [] //global array that saves all unique values of columns tagged as limited options - useful for filters
let parsedCSVData = []; // global array that stores the uploaded csv's data 
let analysisObjects = []; // Array to store analysis object instances
let nextAnalysisId = 1; // Unique ID counter
let currentAnalysisId = 1; //what analysis object the user is currently analyzing. set to 1 as the default, will update later.


//UPLOAD STEP

// Call the function to set up the responsive behavior of the step-body div
responsiveStepBody();


// Function to alert the user about unsaved changes if they refresh or restart, e.g.location.reload()

function alertUnsavedChanges(event) {
    // Most browsers will display a generic message, and custom messages are often ignored
    const message = 'Changes you made will not be saved.';

    // Setting event.returnValue is necessary for some browsers to show the alert
    event.returnValue = message;

    // Return the message for browsers that support it
    return message;
}


// Function to create and insert the upload step content
function createUploadStepContent() {
    const stepBody = document.getElementById('step-body');

    // Create the container for the upload content
    const uploadContainer = document.createElement('div');
    uploadContainer.classList.add('container', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center', 'text-center');
    uploadContainer.style.width = '80%';
    uploadContainer.style.minHeight = '200px';
    uploadContainer.style.margin = '0 auto';
    uploadContainer.style.border = '3px dashed var(--primary)';
    uploadContainer.style.borderRadius = '5px';

    // Create and add the upload icon
    const uploadIcon = document.createElement('div');
    uploadIcon.innerHTML = '<i class="fa-solid fa-upload fa-2x"></i>'; // Increased icon size for better visibility
    uploadContainer.appendChild(uploadIcon);

    // Create and add the upload text with line break
    const uploadText = document.createElement('div');
    uploadText.innerHTML = 'Upload a CSV file';
    uploadText.classList.add('my-3'); // Added margin for spacing
    uploadContainer.appendChild(uploadText);

    // Create and add the "Choose file" button
    const chooseFileButton = document.createElement('button');
    chooseFileButton.className = 'btn btn-secondary';
    chooseFileButton.textContent = 'Choose file';
    chooseFileButton.id = 'chooseFileButton';
    uploadContainer.appendChild(chooseFileButton);

    // Clear existing content and append the upload container and its content to the step body
    stepBody.innerHTML = '';
    stepBody.appendChild(uploadContainer);

    // Function to create and insert the Review button. 
    function createReviewButton() {
        // Create the button element
        const button = document.createElement('button');
        button.id = 'review-button';
        button.className = 'btn btn-primary disabled'; // disabled by default
        button.textContent = 'Review';

        // Insert the review button into the bottom panel
        const container = document.getElementById('panel-button-container-2');
        container.appendChild(button);
        button.addEventListener('click', initializeReviewStep);

    }

    // create the review button 
    createReviewButton();

}

// Create the upload step as part of onload
createUploadStepContent();

// Function to initialize the file input and listen for when it is clicked
function initializeFileInput() {
    const chooseFileButton = document.getElementById('chooseFileButton'); //the file button created in createUploadStepContent()
    const fileInput = document.getElementById('file-input'); //this is somewhere hidden in the base HTML DOM

    // When the choose file button is clicked, trigger a click event on the file input, which opens a dialog box
    chooseFileButton.addEventListener('click', () => {
        fileInput.click();
    });

    // when a file is selected, trigger the file handling function 
    fileInput.addEventListener('change', handleFileSelection);
}

// Initialize file input setup as part of load
document.addEventListener('DOMContentLoaded', initializeFileInput);

// Function to handle file selection and validate CSV file
async function handleFileSelection(event) {
    const file = event.target.files[0]; // Get the selected file from the input event
    selectedFile = file; // Store the file globally in the selectedFile variable so that we can parse it in other functions

    if (file) {
        // Validate file type
        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file.'); // Show an alert if the file is not a CSV
            return; // Exit the function early
        }

        // Validate file size limit of 5 MB
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_FILE_SIZE) {
            alert('The maximum supported file size is 5MB. Please select a smaller file.'); // Show an alert if the file is too large
            return; // Exit the function early
        }

        // Validate CSV file content
        const reader = new FileReader(); // Create a new FileReader object to read the content of the file
        reader.onload = function (event) { // Define the function to be called when the file is successfully read
            const text = event.target.result; // Get the content of the file as a string
            const rows = text.split('\n').filter(row => row.trim() !== ''); // Split the content into rows and remove any empty rows
            const columnCount = rows[0].split(',').length; // Count the number of columns in the first row

            // Check if the number of columns exceeds the maximum allowed (20 columns)
            if (columnCount > 20) {
                alert('Only files with a maximum of 20 columns are supported. Please remove excess columns and try again.'); // Show an alert if there are too many columns
                return; // Exit the function early
            }

            // Check if the number of rows exceeds the maximum allowed (1000 rows)
            if (rows.length > 1000) {
                alert('Only files with a maximum of 1000 rows are supported. Please remove excess rows and try again.'); // Show an alert if there are too many rows
                return; // Exit the function early
            }

            // Simple header check to ensure the first row has at least one column
            if (rows.length > 0 && rows[0].split(',').length < 1) {
                alert('CSV file header is missing or incorrect.'); // Show an alert if the first row (header) is missing or incorrect
                return; // Exit the function early
            }

            // Update UI with the name of the selected file
            updateUploadStepUI(file.name);
        };

        reader.readAsText(file); // Reads the content of the file as a text string
    }
}

// Function to update the UI after a successful file upload
function updateUploadStepUI(fileName) {
    const stepBody = document.getElementById('step-body');
    const uploadContainer = document.querySelector('#step-body > div');

    // Update styles
    uploadContainer.style.border = `2px solid var(--primary-color)`;
    uploadContainer.style.backgroundColor = 'var(--secondary-color)';

    // Clear existing content and append new content
    uploadContainer.innerHTML = `
        <i class="fa-solid fa-check" style="font-size: 2em;"></i>
        <div style="margin-top: 20px;"><strong>Upload successful!</strong> <br> ${fileName}</div>
        <a class="btn btn-secondary" style="margin-top: 40px; cursor: pointer;" onclick="location.reload();">
        <i class="fa-solid fa-rotate-left" ></i> Restart</a>`;

    //remove 'disabled' class from the review button so that they can move on. 
    let reviewButton = document.getElementById('review-button');
    reviewButton.classList.remove('disabled');



    // Add the event listener that triggers a warning message whenever the user tries to close or refresh the tab
    window.addEventListener('beforeunload', alertUnsavedChanges);
}







//REVIEW STEP

// Function to generate the review table
function generateReviewTable(stepBody) {
    // Clear existing table if it exists
    const existingTable = stepBody.querySelector('table');
    if (existingTable) {
        existingTable.remove();
    }

    const table = document.createElement('table');
    table.classList.add('table', 'custom-table');

    // Create table header
    const thead = document.createElement('thead'); //header
    const headerRow = document.createElement('tr');

    // create the header row columns
    const header1 = document.createElement('th');
    header1.textContent = 'Column label';
    const header2 = document.createElement('th');
    header2.textContent = 'Data samples';
    const header3 = document.createElement('th');
    header3.textContent = 'Data type';

    //append the row cells to the row, the row to the header, and the header to the table
    headerRow.appendChild(header1);
    headerRow.appendChild(header2);
    headerRow.appendChild(header3);
    thead.appendChild(headerRow);
    table.appendChild(thead);


    // Create table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    //if the data type dropdowns had been configured already (i.e user accessed the review step via the back button in analyze step...) 
    if (dropdownState.length > 0) {
        // Use saved dropdown state
        dropdownState.forEach(({ header, value }) => {
            const row = document.createElement('tr');

            // Column label
            const cell1 = document.createElement('td');
            cell1.style.width = '25%';
            cell1.textContent = header;
            row.appendChild(cell1);

            // Data sample
            const cell2 = document.createElement('td');
            cell2.style.width = '50%';
            const samples = parsedCSVData.slice(0, 3).map(data => data[header]).join(', '); //get the first 3 rows, keep the values from the header that matches this loop, and join them together
            cell2.textContent = samples;
            row.appendChild(cell2);

            // Data type dropdown
            const cell3 = document.createElement('td');
            cell3.style.width = '25%';
            const select = document.createElement('select');
            select.classList.add('form-select', 'data-type-dropdown');
            const options = ['Limited options', 'Open-ended', 'Numbers', 'Timestamps'];
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            select.value = value; // Set saved value
            cell3.appendChild(select);
            row.appendChild(cell3);

            tbody.appendChild(row);
        });

    } else if (parsedCSVData.length > 0) {
        // Use parsed CSV data
        const headers = Object.keys(parsedCSVData[0]); // Get headers from first object
        headers.forEach((header) => {
            const row = document.createElement('tr');

            // Column label
            const cell1 = document.createElement('td');
            cell1.style.width = '25%';
            cell1.textContent = header;
            row.appendChild(cell1);

            // Data sample
            const cell2 = document.createElement('td');
            cell2.style.width = '50%';
            const samples = parsedCSVData.slice(0, 3).map(data => data[header]).join(', ');
            cell2.textContent = samples;
            row.appendChild(cell2);

            // Data type dropdown
            const cell3 = document.createElement('td');
            cell3.style.width = '25%';
            const select = document.createElement('select');
            select.classList.add('form-select', 'data-type-dropdown');
            const options = ['Limited options', 'Open-ended', 'Numbers', 'Timestamps'];
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            cell3.appendChild(select);
            row.appendChild(cell3);

            tbody.appendChild(row);
        });
    } else {
        console.error('No data available for generating the review table.');
    }

    stepBody.appendChild(table);

}

// Function to read CSV content and convert to array. also calls the function that generates the review table
function csvToArray(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        let obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index].trim();
        });
        return obj;
    });

    return data;
}

function readAndConvertCSV(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const csv = e.target.result;
        parsedCSVData = csvToArray(csv); // Convert CSV to array and store it globally

        // Log the parsed data for testing
        console.log('Parsed CSV Data:', parsedCSVData);

        // Call generateReviewTable here to ensure it's called after parsing
        generateReviewTable(document.getElementById('step-body'));
    };

    reader.readAsText(file);
}


// Function to initialize the "Review" step
function initializeReviewStep() {


    // Clear step body content
    const stepBody = document.getElementById('step-body');
    stepBody.innerHTML = '';

    //update the botton panel by removing the review button and appending a restart and analyze button
    const panelButtonContainer2 = document.getElementById('panel-button-container-2');
    panelButtonContainer2.innerHTML = "";
    const reviewButton = document.getElementById('review-button');

    // Remove the review button
    if (reviewButton) {
        container.removeChild(reviewButton);
    }

    // Create the restart button
    const restartButton = document.createElement('button');
    restartButton.id = 'restart-button';
    restartButton.className = 'btn btn-secondary mr-2'; // Add the classes for styling
    restartButton.textContent = 'Restart'; // Set button text
    panelButtonContainer2.appendChild(restartButton);
    restartButton.addEventListener('click', () => { location.reload() })

    // Create the analyze button
    const analyzeButton = document.createElement('button');
    analyzeButton.id = 'analyze-button';
    analyzeButton.className = 'btn btn-primary'; // Add the classes for styling
    analyzeButton.textContent = 'Analyze'; // Set button text
    panelButtonContainer2.appendChild(analyzeButton);

    // Call to setup the analyze button listener
    setupAnalyzeStep();

    // Update stepper circle styling
    const stepperUpload = document.getElementById('stepper-upload');
    stepperUpload.classList.remove('circle-primary');
    stepperUpload.classList.add('circle-secondary');

    const stepperReview = document.getElementById('stepper-review');
    stepperReview.classList.remove('circle-secondary');
    stepperReview.classList.add('circle-primary');

    //in case you are coming back from the analyze step
    const stepperAnalyze = document.getElementById('stepper-analyze');
    stepperAnalyze.classList.remove('circle-primary');
    stepperAnalyze.classList.add('circle-secondary');
    deleteAllAnalysisObjects();

    // Create the accordion
    const accordion = document.createElement('div');
    accordion.classList.add('accordion', 'w-100', 'mb-3');
    accordion.id = 'dataTypeAccordion';

    accordion.innerHTML = `
    <div class="accordion-item mt-3">
        <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                Select a data type for each of your CSV file's columns
            </button>
        </h2>
        <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
            <div class="accordion-body">
                Please take a minute to map your data. This will help us give you the best outputs for your needs.
                <ul>
                    <li><strong>Limited Options (default):</strong> Use this for fields where a restricted set of possible values is expected. </li>
                    <li><strong>Open-ended:</strong> Use this for qualitative / open-ended fields (e.g., comments, names, descriptions). We'll be able to categorize, summarize, and extract insights using AI. </li>
                    <li><strong>Numbers:</strong> This is for any field containing numerical values. We will compute these by summing them, rather than counting them.</li>
                </ul>
            </div>
        </div>
    </div>
`;

    stepBody.appendChild(accordion);

    //transform csv into an array and log to console
    readAndConvertCSV(selectedFile); // Pass the selected file
}

// Function to save the state of the dropdowns
function saveDropdownState() {
    dropdownState = [];
    document.querySelectorAll('tbody tr').forEach((row, index) => {
        const header = row.children[0].textContent;
        const dropdown = row.querySelector('.data-type-dropdown');
        dropdownState.push({ header: header, value: dropdown.value });
    });
    console.log('Saved dropdown state:', dropdownState);
}







// ANALYZE STEP


// Template for chart objects
class ChartObject {
    constructor(title, type, data, labels) {
        this.title = title; // Title of the chart
        this.type = type; // Type of the chart (e.g., 'bar', 'line')
        this.data = data; // Data required for chart generation
        this.labels = labels; // Data required for chart generation
        this.backgroundColor = '#2d6a4f'; // Primary color
        this.borderColor = '#1b4332'; // Darker primary color
        this.borderWidth = 1;
        this.options = {
            indexAxis: 'y', // Make it a horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            // Format the x-axis ticks as percentages
                            return (value * 100).toFixed(0) + '%';
                        }
                    }
                },
                y: {
                    // You can customize the y-axis as needed
                }
            },
            responsive: false // Ensure the chart is not responsive
        };
    }
}



// Function to render all charts in the ChartObject
function renderAllCharts(chartObject) {
    // Find the container where the cards will be appended
    const stepBody = document.getElementById('step-body');
    let cardsContainer = document.getElementById('cards-container');

    if (cardsContainer) {
        cardsContainer.innerHTML = '';
    } else {
        cardsContainer = document.createElement('div');
        cardsContainer.id = 'cards-container';
        stepBody.appendChild(cardsContainer);
    }

    // Iterate over each chart in the chartObject's charts array
    chartObject.charts.forEach(chart => {
        renderChartInCard(chart);
    });
}

// Function to create and render a chart in a Bootstrap card and append to 'step-body'
function renderChartInCard(chartObject) {
    // Find the container where the cards will be appended
    const container = document.getElementById('cards-container');


    // Create the card element
    const card = document.createElement('div');
    card.classList.add('card', 'mt-4'); // Add Bootstrap card and margin classes

    // Create the card body element
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    // Create the canvas element
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%'; // Full width

    // Append the canvas to the card body
    cardBody.appendChild(canvas);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the container
    container.appendChild(card);

    // Render the chart on the canvas
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: chartObject.type,
        data: {
            labels: chartObject.labels,
            datasets: [{
                label: chartObject.title,
                data: chartObject.data,
                backgroundColor: chartObject.backgroundColor,
                borderColor: chartObject.borderColor,
                borderWidth: chartObject.borderWidth
            }]
        },
        options: chartObject.options
    });
}



// a template for analysis objects
class AnalysisObject {
    constructor(type = '', usingThese = [], groupedBy = null, filteredBy = [], label = '') {
        this.id = nextAnalysisId++; // Assign a unique ID
        this.type = type; // Single value picked from dropdown
        this.usingThese = usingThese; // Array of values picked from dropdown (create basic charts)
        this.groupedBy = groupedBy; // Value picked from groupby single select dropdown (Compare, timeline, AI)
        this.filteredBy = filteredBy; // Array of headers and values picked from dropdown (all)
        this.charts = []; // Array to store one or more Chart objects
        this.label = label; // Optional label for user naming

    }

    addChart(title, chartType, data, labels) {
        const newChart = new ChartObject(title, chartType, data, labels);
        this.charts.push(newChart);
    }

    update(type = this.type, usingThese = this.usingThese, groupedBy = this.groupedBy, filteredBy = this.filteredBy, label = this.label) {
        this.type = type;
        this.usingThese = usingThese;
        this.groupedBy = groupedBy;
        this.filteredBy = filteredBy;
        this.label = label;
        this.watchChanges(); // a master function that will listen in for specific changes to the object and trigger other functions accordingly
    }
    watchChanges() {
        // Check if usingThese is not empty and type is 'generic'
        if (this.usingThese.length > 0 && this.type === 'generic') {
            this.addGenericCharts();
            renderAllCharts(this); // Call to render all charts after updating
        }
    }

    addGenericCharts() {
        this.charts = []; // Clear existing charts
        this.usingThese.forEach(value => {
            // Generate the data array and labels based on value and filteredBy
            const { data, labels } = this.generateGenericDataArrayAndLabels(value, this.filteredBy);

            // Create and add the chart
            const newChart = new ChartObject(
                `${value} Chart`,
                'bar',
                data,
                labels
            );
            this.charts.push(newChart);
        });
    };

    generateGenericDataArrayAndLabels(header, filteredBy) {
        // Helper function to check if an object matches all the filter criteria
        function matchesFilter(obj, filters) {
            return filters.every(filter => {
                const { header: filterHeader, value } = filter;
                return obj[filterHeader] === value;
            });
        }
    
        // Filter the array based on applied filters
        const filteredCSVArray = parsedCSVData.filter(item => matchesFilter(item, filteredBy));
        console.log('filtered csv array', filteredCSVArray);
    
        // Ensure the header parameter is used
        if (!header) {
            throw new Error("The 'header' parameter is required.");
        }
    
        // Count the occurrences of each unique value for the specified header
        const countMap = filteredCSVArray.reduce((acc, item) => {
            const value = item[header];
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    
        // Calculate the percentage for each unique value
        const totalCount = filteredCSVArray.length;
        const data = Object.entries(countMap).map(([key, count]) => count / totalCount);
        const labels = Object.keys(countMap);
    
        // Sort data and labels in descending order based on data values
        const sortedIndices = data.map((value, index) => index).sort((a, b) => data[b] - data[a]);
        const sortedData = sortedIndices.map(index => data[index]);
        const sortedLabels = sortedIndices.map(index => labels[index]);
    
        return {
            data: sortedData,
            labels: sortedLabels
        };
    }
    

}

// Function to create and add a new Analysis object
function createAnalysis(type = '', usingThese = [], groupedBy = null, filteredBy = [], label = '') {
    const newAnalysis = new AnalysisObject(type, usingThese, groupedBy, filteredBy, label);
    analysisObjects.push(newAnalysis);
    console.log(newAnalysis); // Log the new object to the console
    return newAnalysis; // Optionally return the new object
}

// Function to update an existing AnalysisObject by ID
function updateAnalysisById(id, updates) {
    const analysis = analysisObjects.find(obj => obj.id === id);
    if (analysis) {
        // Apply updates only for the properties provided in the updates object
        const { type, usingThese, groupedBy, filteredBy, label } = updates;
        analysis.update(
            type !== undefined ? type : analysis.type,
            usingThese !== undefined ? usingThese : analysis.usingThese,
            groupedBy !== undefined ? groupedBy : analysis.groupedBy,
            filteredBy !== undefined ? filteredBy : analysis.filteredBy,
            label !== undefined ? label : analysis.label
        );
    } else {
        console.error('AnalysisObject not found');
    }
    console.log(analysis); // Log the  object to the console

}


// Function to delete an AnalysisObject by ID
function deleteAnalysisObjectById(id) {
    const index = analysisObjects.findIndex(obj => obj.id === id);
    if (index !== -1) {
        analysisObjects.splice(index, 1); // Remove the object at the given index
    } else {
        console.error('AnalysisObject not found');
    }
}

// Function to delete all AnalysisObject instances
function deleteAllAnalysisObjects() {
    analysisObjects = []; // Reassign to a new empty array
    nextAnalysisId = 1;
}


// Function to create a new array with unique values for headers marked as "Limited options"
function createLimitedOptionsArray() {
    if (parsedCSVData.length === 0) {
        console.error('No parsed CSV data available.');
        return [];
    }

    // Extract headers marked as "Limited options"
    const limitedOptionsHeaders = dropdownState
        .filter(item => item.value === 'Limited options')
        .map(item => item.header);

    // Create a new array with unique values for each header marked as "Limited options"
    const result = limitedOptionsHeaders.map(header => {
        const uniqueValues = [...new Set(parsedCSVData.map(item => item[header]))];
        return {
            [header]: uniqueValues
        };
    });

    // Log the result for debugging
    console.log('Limited Options Array:', result);

    // Update the global limitedOptionsArray
    limitedOptionsArray = result;

    return result;
}

// function to clear and update the stepper body with the "I want to..." dropdown
function updateStepBody() {
    const stepBody = document.getElementById('step-body');

    // Clear any existing content
    stepBody.innerHTML = '';

    // Create the container div and set its class
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    // Create three column divs for the dropdowns and set their class
    const colDiv1 = document.createElement('div');
    colDiv1.id = 'col-div-1';
    colDiv1.classList.add('col-12', 'col-sm-6', 'col-md-3');

    const colDiv2 = document.createElement('div');
    colDiv2.id = 'col-div-2';
    colDiv2.classList.add('col-12', 'col-sm-6', 'col-md-6');

    const colDiv3 = document.createElement('div');
    colDiv3.id = 'col-div-3';
    colDiv3.classList.add('col-12', 'col-sm-6', 'col-md-3');


    // Create the span element for text
    const span = document.createElement('span');
    span.id = 'i-want-to-text';
    span.textContent = 'I want to...';

    // Create the menu container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'i-want-to-dropdown-container'
    dropdownContainer.classList.add('dropdown');

    // Create the button 
    const select = document.createElement('button');
    select.classList.add('btn', 'btn-secondary', 'form-select', 'data-type-dropdown');
    select.type = 'button';
    select.style.width = '100%';
    select.textContent = 'make a selection';
    select.style.textAlign = 'left'; // Align text to the left
    select.id = 'i-want-to-dropdown';
    select.setAttribute('data-bs-toggle', 'dropdown');
    select.setAttribute('aria-expanded', 'false');

    // Create the menu
    const menu = document.createElement('ul');
    menu.classList.add('dropdown-menu');


    // Populate the new dropdown with types of comparisons

    const genericListItem = document.createElement('li');
    const genericListAnchor = document.createElement('a');
    genericListAnchor.classList.add('dropdown-item');
    const genericListAnchorText = document.createElement('label');
    genericListAnchorText.textContent = 'create basic charts';
    genericListAnchor.setAttribute('data-value', 'generic');

    const compareListItem = document.createElement('li');
    const compareListAnchor = document.createElement('a');
    compareListAnchor.classList.add('dropdown-item');
    const compareListAnchorText = document.createElement('label');
    compareListAnchorText.textContent = 'make comparisons';
    compareListAnchor.setAttribute('data-value', 'compare');

    const openListItem = document.createElement('li');
    const openListAnchor = document.createElement('a');
    openListAnchor.classList.add('dropdown-item');
    const openListAnchorText = document.createElement('label');
    openListAnchorText.textContent = 'analyze open-ended content';
    openListAnchor.setAttribute('data-value', 'open');

    //append options to menu
    genericListAnchor.appendChild(genericListAnchorText);
    genericListItem.appendChild(genericListAnchor);
    menu.appendChild(genericListItem);

    compareListAnchor.appendChild(compareListAnchorText);
    compareListItem.appendChild(compareListAnchor);
    menu.appendChild(compareListItem);

    openListAnchor.appendChild(openListAnchorText);
    openListItem.appendChild(openListAnchor);
    menu.appendChild(openListItem);

    // Append elements to the dropdown container
    dropdownContainer.appendChild(select);
    dropdownContainer.appendChild(menu);

    // Append elements to colDiv2
    colDiv2.appendChild(span);
    colDiv2.appendChild(dropdownContainer);

    // Append the col divs to the rowdiv 
    rowDiv.appendChild(colDiv1);
    rowDiv.appendChild(colDiv2);
    rowDiv.appendChild(colDiv3);

    // Append the row div to the stepBody
    stepBody.appendChild(rowDiv);

    // Add event listener for selection change
    menu.addEventListener('click', handleSelectChange);

}

// Handle the select change event
function handleSelectChange(event) {
    const target = event.target.closest('a.dropdown-item');
    if (!target) return;

    const selectedValue = target.getAttribute('data-value');
    const select = document.getElementById('i-want-to-dropdown');

    // Update select.textContent with genericListAnchorText.textContent
    select.textContent = target.querySelector('label').textContent;

    // Move the select dropdown to colDiv1
    const colDiv1 = document.getElementById('col-div-1');
    const span = document.getElementById('i-want-to-text');
    const dropdownContainer = document.getElementById('i-want-to-dropdown-container');
    colDiv1.classList.remove('col-md-3');
    colDiv1.classList.add('col-md-4');
    colDiv1.appendChild(span);
    colDiv1.appendChild(dropdownContainer);

    // Readjust widths of col 2 and 3
    const colDiv2 = document.getElementById('col-div-2');
    colDiv2.classList.remove('col-md-6');
    colDiv2.classList.add('col-md-4');
    colDiv2.innerHTML = '';

    const colDiv3 = document.getElementById('col-div-3');
    colDiv3.classList.remove('col-md-3');
    colDiv3.classList.add('col-md-4');
    colDiv3.innerHTML = '';


    // If the value of the select dropdown is "generic"...
    if (selectedValue === 'generic') {
        // Create and append the new dropdown
        createColumnDropdown();
        createFilterButton();
    }
    updateAnalysisById(currentAnalysisId, { type: selectedValue, usingThese: [], groupedBy: [], filteredBy: [] });

    let stepBody= document.getElementById('step-body');
    let cardsContainer = document.getElementById('cards-container');

    if (cardsContainer) {
        cardsContainer.innerHTML = '';
    } else {
        cardsContainer = document.createElement('div');
        cardsContainer.id = 'cards-container';
        stepBody.appendChild(cardsContainer);
    }

}




// function to Create the Using dropdown
function createColumnDropdown() {

    const colDiv2 = document.getElementById('col-div-2');

    // Create the span element for text
    const span = document.createElement('span');
    span.id = 'using-these-values-text';
    span.textContent = 'using these columns';

    // Create the menu container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown');

    // Create the button 
    const columnSelect = document.createElement('button');
    columnSelect.classList.add('btn', 'btn-secondary', 'form-select', 'data-type-dropdown');
    columnSelect.type = 'button';
    columnSelect.style.width = '100%';
    columnSelect.textContent = '0 selected'; // Start with 0 selected
    columnSelect.style.textAlign = 'left'; // Align text to the left
    columnSelect.id = 'column-select';

    columnSelect.setAttribute('data-bs-toggle', 'dropdown');
    columnSelect.setAttribute('aria-expanded', 'false');

    // Create the menu
    const columnMenu = document.createElement('ul');
    columnMenu.classList.add('dropdown-menu');
    columnMenu.id = 'using-these-list';

    // Populate the new dropdown with options from the saved dropdown state
    dropdownState.forEach(({ header, value }) => {
        if (value === 'Limited options') {
            const columnListItem = document.createElement('li');
            const columnListAnchor = document.createElement('a');
            columnListAnchor.classList.add('dropdown-item');
            const columnListInput = document.createElement('input');
            columnListInput.type = 'checkbox';
            columnListInput.id = header;
            columnListInput.value = header;

            const columnListLabel = document.createElement('label');
            columnListLabel.style.marginLeft = '10px';
            columnListLabel.htmlFor = header;
            columnListLabel.textContent = header;

            columnListAnchor.appendChild(columnListInput);
            columnListAnchor.appendChild(columnListLabel);
            columnListItem.appendChild(columnListAnchor);
            columnMenu.appendChild(columnListItem);

            // Add event listener to update button text when checkbox is changed
            columnListInput.addEventListener('change', () => {
                updateSelectedCount();
                updateUsingTheseArray();
            })

        }
    });

    // Append elements to the dropdown container
    dropdownContainer.appendChild(columnSelect);
    dropdownContainer.appendChild(columnMenu);

    // Append elements to colDiv2
    colDiv2.appendChild(span);
    colDiv2.appendChild(dropdownContainer);

    // Prevent dropdown menu from closing when clicking inside
    columnMenu.addEventListener('click', function (event) {
        event.stopPropagation();
    });

}

// Update the text of the columnSelect button based on selected checkboxes
function updateSelectedCount() {
    const columnSelect = document.getElementById('column-select');
    const checkboxes = document.querySelectorAll('#column-select ~ .dropdown-menu input[type="checkbox"]');
    const selectedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    columnSelect.textContent = `${selectedCount} selected`;
}

// Update the usingThese array based on selected checkboxes
function updateUsingTheseArray() {
    const selectedValues = Array.from(document.querySelectorAll('#column-select ~ .dropdown-menu input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // Find the current AnalysisObject and update its usingThese array
    const analysis = analysisObjects.find(obj => obj.id === currentAnalysisId);
    if (analysis) {
        analysis.usingThese = selectedValues;
        analysis.watchChanges();
        console.log(analysis);
    } else {
        console.error('AnalysisObject not found');
    }
}



// function to Create the filter dropdown using the limited options array
function createFilterButton() {
    const limitedOptionsArray1 = limitedOptionsArray; // Call the function to get the array
    const colDiv3 = document.getElementById('col-div-3');

    // Create the span element for text
    const span = document.createElement('span');
    span.id = 'filtered-by-text';
    span.textContent = 'filtered by';

    // Create the menu container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown');

    // Create the button
    const filterSelect = document.createElement('button');
    filterSelect.classList.add('btn', 'btn-secondary', 'form-select', 'data-type-dropdown');
    filterSelect.type = 'button';
    filterSelect.style.width = '100%';
    filterSelect.textContent = '0 selected'; // Start with 0 selected
    filterSelect.style.textAlign = 'left'; // Align text to the left
    filterSelect.id = 'filter-select';
    filterSelect.setAttribute('data-bs-toggle', 'dropdown');
    filterSelect.setAttribute('aria-expanded', 'false');

    // Create the menu
    const filterMenu = document.createElement('ul');
    filterMenu.classList.add('dropdown-menu');
    filterMenu.id = 'filtered-by-list';

    let itemToHeaderMap = new Map();

    // Populate the dropdown with headers and options
    limitedOptionsArray1.forEach(group => {
        for (const [header, values] of Object.entries(group)) {
            values.forEach(value => {
                itemToHeaderMap.set(value, header);
            });
            // Create and append header
            const headerItem = document.createElement('li');
            headerItem.classList.add('dropdown-header');
            headerItem.textContent = header;
            filterMenu.appendChild(headerItem);

            // Create and append divider
            const divider = document.createElement('li');
            divider.classList.add('dropdown-divider');
            filterMenu.appendChild(divider);

            // Create and append options
            values.forEach(value => {
                const item = document.createElement('li');
                item.classList.add('dropdown-item');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = value;
                checkbox.value = value;

                const label = document.createElement('label');
                label.htmlFor = value;
                label.textContent = value;
                label.style.marginLeft = '10px';

                item.appendChild(checkbox);
                item.appendChild(label);

                filterMenu.appendChild(item);

                // Add event listener to update button text when checkbox is changed
                item.addEventListener('change', () => {
                    updateFilteredCount();
                    updateFilteredArray();
                })
            });
        }
    });
    // Function to update the Filtered by array based on selected checkboxes
    function updateFilteredArray() {
        const selectedValues = Array.from(document.querySelectorAll('#filter-select ~ .dropdown-menu input[type="checkbox"]:checked'))
            .map(checkbox => {
                const value = checkbox.value;
                const header = itemToHeaderMap.get(value);
                return { header, value };
            });

        // Find the current AnalysisObject and update its filteredBy array
        const analysis = analysisObjects.find(obj => obj.id === currentAnalysisId);
        if (analysis) {
            analysis.filteredBy = selectedValues;
            analysis.watchChanges();
            console.log(analysis);
        } else {
            console.error('AnalysisObject not found');
        }
    }

    // Append elements to the dropdown container
    dropdownContainer.appendChild(filterSelect);
    dropdownContainer.appendChild(filterMenu);

    // Append elements to colDiv3
    colDiv3.appendChild(span);
    colDiv3.appendChild(dropdownContainer);

    // Prevent dropdown menu from closing when clicking inside
    filterMenu.addEventListener('click', function (event) {
        event.stopPropagation();
    });


}

// Update the text of the filterSelect button based on selected checkboxes
function updateFilteredCount() {
    const filterSelect = document.getElementById('filter-select');
    const checkboxes = document.querySelectorAll('#filter-select ~ .dropdown-menu input[type="checkbox"]');
    const filteredCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    filterSelect.textContent = `${filteredCount} selected`;
}

// Function to show a confirmation dialog when they hit the back button, as it will delete all analyses
function showConfirmationDialog(message, onConfirm) {
    const confirmed = window.confirm(message);

    if (confirmed) {
        onConfirm();
    }
}

// Function to initialize the back button listener, which takes the user back to the review step
function InitializeBackButtonListener() {
    // Add event listener to the back button
    document.getElementById('back-button').addEventListener('click', () => {
        // Define the confirmation message
        const message = "Your analysis will be lost. Are you sure you want to continue?";

        // Call showConfirmationDialog with the message and a callback to initializeReviewStep
        showConfirmationDialog(message, initializeReviewStep);
    });
}

// Update the Bottom Panel buttons and 
function updateBottomPanel() {

    const panelButtonContainer2 = document.getElementById('panel-button-container-2');
    panelButtonContainer2.innerHTML = `
        <button id="back-button" class="btn btn-secondary">Back</button>
        <button id="export-button" class="btn btn-primary disabled">Export</button>
    `;
    InitializeBackButtonListener();
}




// Function to setup the analaysis step
function setupAnalyzeStep() {
    const analyzeButton = document.getElementById('analyze-button');
    analyzeButton.addEventListener('click', () => {

        //save the review table's configuration into an array
        saveDropdownState();

        //adjust the steppers
        document.getElementById('stepper-review').classList.remove('circle-primary');
        document.getElementById('stepper-review').classList.add('circle-secondary');
        document.getElementById('stepper-analyze').classList.remove('circle-secondary');
        document.getElementById('stepper-analyze').classList.add('circle-primary');

        //update the step body. will keep as a separate function because this is going to be big
        updateStepBody();

        //update the bottom panel. will keep as a separate function because this is going to be big
        updateBottomPanel();

        // run the function that creates the limited options array, which is needed for the filter panel
        createLimitedOptionsArray();

        //create a new analysis object
        createAnalysis();

    })
}

