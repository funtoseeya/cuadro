//UPLOAD STEP

// Function to alert the user about unsaved changes
function alertUnsavedChanges(event) {
    // Most browsers will display a generic message, and custom messages are often ignored
    const message = 'You have unsaved changes. Do you really want to leave?';

    // Setting event.returnValue is necessary for some browsers to show the alert
    event.returnValue = message;

    // Return the message for browsers that support it
    return message;
}

// Function to create and insert the Review button
function createReviewButton() {
    // Create the button element
    const button = document.createElement('button');
    button.id = 'review-button';
    button.className = 'btn btn-primary disabled'; // Add the classes for styling
    button.textContent = 'Review'; // Set button text

    // Insert the button into the column with id 'panel-button-container-2'
    const container = document.getElementById('panel-button-container-2');
    container.appendChild(button);
    button.addEventListener('click', initializeReviewStep);

}

// Call the function to create and insert the button
createReviewButton();

// Function to create and insert the upload step content
document.addEventListener('DOMContentLoaded', function () {
    function createUploadStepContent() {
        const stepBody = document.getElementById('step-body');

        // Create the container for the upload content
        const uploadContainer = document.createElement('div');
        uploadContainer.style.width = '80%';
        uploadContainer.style.height = '200px';
        uploadContainer.style.margin = '0 auto';
        uploadContainer.style.marginTop = '100px';
        uploadContainer.style.border = '3px dashed var(--primary)';
        uploadContainer.style.borderRadius = '5px';
        uploadContainer.style.display = 'flex';
        uploadContainer.style.flexDirection = 'column';
        uploadContainer.style.alignItems = 'center';
        uploadContainer.style.justifyContent = 'center';
        uploadContainer.style.textAlign = 'center'; // Center text alignment

        // Create and add the upload icon
        const uploadIcon = document.createElement('div');
        uploadIcon.innerHTML = '<i class="fa-solid fa-upload"></i>';
        uploadContainer.appendChild(uploadIcon);

        // Create and add the upload text with line break
        const uploadText = document.createElement('div');
        uploadText.innerHTML = 'Upload a CSV file';
        uploadText.style.margin = '20px 0'; // Add spacing
        uploadContainer.appendChild(uploadText);

        // Create and add the "Choose file" button
        const chooseFileButton = document.createElement('button');
        chooseFileButton.className = 'btn btn-secondary';
        chooseFileButton.textContent = 'Choose file';
        chooseFileButton.id = 'chooseFileButton'
        uploadContainer.appendChild(chooseFileButton);

        // Clear existing content and append the upload container and it's content to the step body
        stepBody.innerHTML = '';
        stepBody.appendChild(uploadContainer);
    }

    // Call the function to create and insert the upload content
    createUploadStepContent();

});

// Function to initialize the file input and set up event listeners
function initializeFileInput() {
    const chooseFileButton = document.getElementById('chooseFileButton');
    const fileInput = document.getElementById('file-input');

    // Add click event to the button to trigger file input
    chooseFileButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Add change event to handle file selection
    fileInput.addEventListener('change', handleFileSelection);
}
// Initialize file input setup on document load
document.addEventListener('DOMContentLoaded', initializeFileInput);

// Function to handle file selection
async function handleFileSelection(event) {
    const file = event.target.files[0];

    if (file) {
        // Validate file type and size
        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file.');
            return;
        }

        // Size limit (e.g., 5 MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_FILE_SIZE) {
            alert('The maximum supported file size is 5MB. Please select a smaller file.');
            return;
        }

        // Validate CSV file content
        const { isValid, errorMessage } = await validateCsvFile(file);
        if (!isValid) {
            alert(errorMessage);
            return;
        }

        // Update UI
        updateUploadStepUI(file.name);
    }
}

// Function to validate CSV file (Size, Format, Columns, Rows)
async function validateCsvFile(file) {
    const reader = new FileReader();

    return new Promise((resolve) => {
        reader.onload = function (event) {
            const text = event.target.result;
            const rows = text.split('\n').filter(row => row.trim() !== ''); // Remove empty rows
            const columnCount = rows[0].split(',').length;

            if (columnCount > 20) {
                resolve({ isValid: false, errorMessage: 'Only files with a maximum of 20 columns are supported. Please remove excess columns and try again.' });
                return;
            }

            if (rows.length > 1000) {
                resolve({ isValid: false, errorMessage: 'Only files with a maximum of 1000 rows are supported. Please remove excess rows and try again.' });
                return;
            }

            // Simple header check
            if (rows.length > 0 && rows[0].split(',').length < 1) {
                resolve({ isValid: false, errorMessage: 'CSV file header is missing or incorrect.' });
                return;
            }

            resolve({ isValid: true });
        };

        reader.readAsText(file);
    });
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

    //remove 'disabled' class from the review button 
    let reviewButton = document.getElementById('review-button');
    reviewButton.classList.remove('disabled');

    // Log file path to console
    console.log(`Uploaded file name: ${fileName}`);


    // Add the event listener that triggers a warning message about unsaved changes whenever the user tries to close or refresh the tab
    window.addEventListener('beforeunload', alertUnsavedChanges);
}







//REVIEW STEP

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
    setupAnalyzeButtonListener();





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

    // Create the accordion
    const accordion = document.createElement('div');
    accordion.classList.add('accordion', 'w-100', 'mb-3');
    accordion.id = 'dataTypeAccordion';

    accordion.innerHTML = `
        <div class="card mt-3">
            <div class="card-header" id="headingOne">
                <h2 class="mb-0">
                    <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                       <i class="fa fa-info-circle mr-2" aria-hidden="true"></i>
 Select a data type for each column
                        <i class="fa fa-chevron-down float-right" aria-hidden="true" id="accordionIcon"></i>
                    </button>
                </h2>
            </div>
            <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#dataTypeAccordion">
                <div class="card-body">
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

    // Generate table for CSV review
    generateReviewTable(stepBody);

}


//declare the array that manages the review table's configuration
let dropdownState = [];

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

// Function to initialize the mapping dropdowns 
function initializeDropdownListeners() {
    // Select all dropdowns in the review table
    const dropdowns = document.querySelectorAll('.data-type-dropdown');
}


// Function to generate the review table
function generateReviewTable(stepBody) {
    
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'mt-3'); // Added margin-top class

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const header1 = document.createElement('th');
    header1.textContent = 'Column label from CSV file';

    const header2 = document.createElement('th');
    header2.textContent = 'Data sample from CSV file';

    const header3 = document.createElement('th');
    header3.textContent = 'Data type';

    headerRow.appendChild(header1);
    headerRow.appendChild(header2);
    headerRow.appendChild(header3);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Style the table header
    thead.style.backgroundColor = 'var(--primary-color)';
    thead.style.color = 'white';

    // Create table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (dropdownState.length > 0) {
        // Use saved dropdown state
        dropdownState.forEach(({ header, value }) => {
            const row = document.createElement('tr');

            // Column label
            const cell1 = document.createElement('td');
            cell1.textContent = header;
            row.appendChild(cell1);

            // Data sample
            const cell2 = document.createElement('td');
            cell2.textContent = 'Sample data'; // Assuming you want to display some placeholder sample data
            row.appendChild(cell2);

            // Data type dropdown
            const cell3 = document.createElement('td');
            const select = document.createElement('select');
            select.classList.add('form-select', 'data-type-dropdown');
            const options = ['Limited options', 'Open-ended', 'Numbers'];
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

        stepBody.appendChild(table);
        initializeDropdownListeners();

    } else if (file) {
        // Parse CSV headers and sample data
        const reader = new FileReader();

        reader.onload = function (event) {
            const text = event.target.result;
            const rows = text.split('\n').filter(row => row.trim() !== '');
            const headers = rows[0].split(',');

            headers.forEach((header, index) => {
                const row = document.createElement('tr');

                // Column label
                const cell1 = document.createElement('td');
                cell1.textContent = header;
                row.appendChild(cell1);

                // Data sample
                const cell2 = document.createElement('td');
                const samples = rows.slice(1, 4).map(row => row.split(',')[index]).join(', ');
                cell2.textContent = samples;
                row.appendChild(cell2);

                // Data type dropdown
                const cell3 = document.createElement('td');
                const select = document.createElement('select');
                select.classList.add('form-select', 'data-type-dropdown');
                const options = ['Limited options', 'Open-ended', 'Numbers'];
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

            stepBody.appendChild(table);
            initializeDropdownListeners();
        };

        reader.readAsText(file);
    } else {
        console.error('No file input found and no saved dropdown state.');
    }
}



// ANALYZE STEP



// Clear and update the stepper body with the "I want to..." dropdown
function updateStepBody() {
    const stepBody = document.getElementById('step-body');
    
    // Clear any existing content
    stepBody.innerHTML = '';

    // Create the container div and set its class
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row', 'sleek-row');

    
    
    // Create the span element for text
    const span = document.createElement('span');
    span.textContent = 'I want to...';
    
    // Create the select element with its options
    const select = document.createElement('select');
    select.classList.add('sleek-dropdown');
    select.innerHTML = `
        <option value="" disabled selected>make a selection</option>
        <option value="generic">create basic charts</option>
        <option value="compare">compare my data</option>
        <option value="open-ended">analyze open-ended data</option>
        <option value="trends">visualize trends</option>
    `;

       // Append the span and select elements to the row div
       rowDiv.appendChild(span);
       rowDiv.appendChild(select);

       // Append the row div to the stepBody
    stepBody.appendChild(rowDiv);
    
}
// Update the Bottom Panel buttons 
function updateBottomPanel() {


    const panelButtonContainer2 = document.getElementById('panel-button-container-2');
    panelButtonContainer2.innerHTML = `
        <button id="back-button" class="btn btn-secondary">Back</button>
        <button id="export-button" class="btn btn-primary">Export</button>
    `;
    // Add event listener to the back button
    document.getElementById('back-button').addEventListener('click', initializeReviewStep);

}




// Function to setup event listener for the analyze button
function setupAnalyzeButtonListener() {
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

        })}
