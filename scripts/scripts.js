

//UPLOAD STEP

let selectedFile; // Global variable to store the file
let dropdownState = []; //global variable to save dropdowns in the review table




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
        uploadContainer.style.marginTop = '50px';
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
    selectedFile = file; // Store the file globally


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

// Function to generate the review table
function generateReviewTable(stepBody) {
    // Clear existing table if it exists
    const existingTable = stepBody.querySelector('table');
    if (existingTable) {
        existingTable.remove();
    }

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
    thead.style.width = '100%';

    // Create table body
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    if (dropdownState.length > 0) {
        // Use saved dropdown state
        dropdownState.forEach(({ header, value }) => {
            const row = document.createElement('tr');

            // Column label
            const cell1 = document.createElement('td');
            cell1.style.width = '33%';
            cell1.textContent = header;
            row.appendChild(cell1);

            // Data sample
            const cell2 = document.createElement('td');
            cell2.style.width = '33%';
            const samples = parsedCSVData.slice(0, 3).map(data => data[header]).join(', ');
            cell2.textContent = samples;
            row.appendChild(cell2);

            // Data type dropdown
            const cell3 = document.createElement('td');
            cell3.style.width = '33%';
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

    } else if (parsedCSVData.length > 0) {
        // Use parsed CSV data
        const headers = Object.keys(parsedCSVData[0]); // Get headers from first object
        headers.forEach((header) => {
            const row = document.createElement('tr');

            // Column label
            const cell1 = document.createElement('td');
            cell1.style.width = '33%';
            cell1.textContent = header;
            row.appendChild(cell1);

            // Data sample
            const cell2 = document.createElement('td');
            cell2.style.width = '33%';
            const samples = parsedCSVData.slice(0, 3).map(data => data[header]).join(', ');
            cell2.textContent = samples;
            row.appendChild(cell2);

            // Data type dropdown
            const cell3 = document.createElement('td');
            cell3.style.width = '33%';
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
    } else {
        console.error('No data available for generating the review table.');
    }

    stepBody.appendChild(table);
    initializeDropdownListeners();
}



// Function to read CSV content and convert to array. also calls the function that generates the review table
// Declare parsedCSVData array globally
let parsedCSVData = [];

// Function to convert CSV to array
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
    <div class="accordion-item mt-3">
        <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                Select a data type for each column
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


//declare the array that manages the review table's configuration

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






// ANALYZE STEP

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

    return result;
}




// Clear and update the stepper body with the "I want to..." dropdown
function updateStepBody() {
    const stepBody = document.getElementById('step-body');

    // Clear any existing content
    stepBody.innerHTML = '';

    // Create the container div and set its class
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row', 'sleek-row');

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

    // If the value of the select dropdown is "generic"...
    if (selectedValue === 'generic') {
        // Create and append the new dropdown
        createColumnDropdown();
        createFilterButton();
    }

}

// Create the column dropdown
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
            columnListInput.addEventListener('change', updateSelectedCount);
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


// Create the filter dropdown using the limited options array
function createFilterButton() {
    const limitedOptionsArray = createLimitedOptionsArray(); // Call the function to get the array
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

    // Populate the dropdown with headers and options
    limitedOptionsArray.forEach(group => {
        for (const [header, values] of Object.entries(group)) {
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
            });
        }
    });

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


// Update the Bottom Panel buttons 
function updateBottomPanel() {


    const panelButtonContainer2 = document.getElementById('panel-button-container-2');
    panelButtonContainer2.innerHTML = `
        <button id="back-button" class="btn btn-secondary">Back</button>
        <button id="export-button" class="btn btn-primary disabled">Export</button>
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

        // run the function that creates the limited options array, which is needed for the filter panel
        createLimitedOptionsArray();

    })
}
