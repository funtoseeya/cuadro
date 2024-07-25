//UPLOAD STEP

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
        <i class="fa-solid fa-rotate-left" ></i> Reload</a>`;

    //remove 'disabled' class from the review button 
    let reviewButton = document.getElementById('review-button');
    reviewButton.classList.remove('disabled');
}




// Initialize file input setup on document load
document.addEventListener('DOMContentLoaded', initializeFileInput);




//REVIEW STEP
// Function to initialize the "Review" step
function initializeReviewStep() {
    const reviewButton = document.getElementById('review-button');
    reviewButton.addEventListener('click', () => {
        
        // Log file path to console
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            console.log(`Uploaded file name: ${fileName}`);
        } else {
            console.log("No file uploaded.");
        }


        // Clear step body content
        const stepBody = document.getElementById('step-body');
        stepBody.innerHTML = '';

        // Update stepper circle styling
        const stepperUpload = document.getElementById('stepper-upload');
        stepperUpload.classList.remove('circle-primary');
        stepperUpload.classList.add('circle-secondary');

        const stepperReview = document.getElementById('stepper-review');
        stepperReview.classList.remove('circle-secondary');
        stepperReview.classList.add('circle-primary');

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
 Select data types
                        <i class="fa fa-chevron-down float-right" aria-hidden="true" id="accordionIcon"></i>
                    </button>
                </h2>
            </div>
            <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#dataTypeAccordion">
                <div class="card-body">
                    Please take a minute to map your data. This will help us give you the best outputs for your needs.
                    <ul>
                        <li><strong>Limited Options (default):</strong> Use this for fields where a small set of specific values is expected. </li>
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

        // Remove the review button and add the back and analyze buttons
        replaceReviewButton();
    });
}
// Function to initialize the back button
function initializeBackButton() {
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => {
        location.reload(); // This will reset the application
    });
}

// Function to replace the Review button with Back and Analyze buttons
function replaceReviewButton() {
    const container = document.getElementById('panel-button-container-2');
    const reviewButton = document.getElementById('review-button');

    // Remove the review button
    if (reviewButton) {
        container.removeChild(reviewButton);
    }

    // Create the back button
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.className = 'btn btn-secondary mr-2'; // Add the classes for styling
    backButton.textContent = 'Back'; // Set button text
    container.appendChild(backButton);

    // Create the analyze button
    const analyzeButton = document.createElement('button');
    analyzeButton.id = 'analyze-button';
    analyzeButton.className = 'btn btn-primary'; // Add the classes for styling
    analyzeButton.textContent = 'Analyze'; // Set button text
    container.appendChild(analyzeButton);



    // Initialize back button functionality
    initializeBackButton();

        // Call to setup the analyze button listener
        setupAnalyzeButtonListener();
}

// Function to initialize the mapping dropdowns 
function initializeDropdownListeners() {
    // Select all dropdowns in the review table
    const dropdowns = document.querySelectorAll('.data-type-dropdown');

}
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

    // Parse CSV headers and sample data
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
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
            select.classList.add('form-select');
            select.classList.add('data-type-dropdown');
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

        table.appendChild(tbody);
        stepBody.appendChild(table);

        // Initialize dropdown listeners after adding dropdowns to DOM
        initializeDropdownListeners();
    };

    reader.readAsText(file);
}

// Initialize review step setup on document load
document.addEventListener('DOMContentLoaded', initializeReviewStep);


// ANALYZE STEP

// Update the Stepper Circles styles
function updateStepperCircles() {
    document.getElementById('stepper-review').classList.remove('circle-primary');
    document.getElementById('stepper-review').classList.add('circle-secondary');
    document.getElementById('stepper-analyze').classList.remove('circle-secondary');
    document.getElementById('stepper-analyze').classList.add('circle-primary');
}

// Clear and update the stepper body
function updateStepBody() {
    const stepBody = document.getElementById('step-body');
    stepBody.innerHTML = `
        <div class="row sleek-row">
            <span>I want to...</span>
            <select class="sleek-dropdown">
                <option value="" disabled selected>make a selection</option>
                <option value="generic">create basic charts</option>
                <option value="compare">compare my data</option>
                <option value="compare">Analyze open-ended data</option>

                <option value="visualize">visualize trends</option>
            </select>
        </div>
    `;
}

// Update the Bottom Panel buttons and analysis list
function updateBottomPanel() {
    const analyzeButton = document.getElementById('analyze-button');
    if (analyzeButton) {
        analyzeButton.remove();
    }

    const panelButtonContainer2 = document.getElementById('panel-button-container-2');
    panelButtonContainer2.innerHTML = `
        <button id="back-button" class="btn btn-secondary">Back</button>
        <button id="export-button" class="btn btn-primary">Export</button>
    `;

    
        }


// Function to show the review step's confirmation modal that leads to analyze 
function showConfirmationModal() {
    // Create the modal HTML structure
    const modalHTML = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">Are you sure?</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        Please confirm that that your column headers are are mapped to the correct data type. You can adjust this later if you encounter a problem. 
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmButton">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
        `;

    // Append the modal to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show the modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();

    // Add event listener for the confirm button
    document.getElementById('confirmButton').addEventListener('click', () => {
        saveDropdownState();
        updateStepperCircles();
        updateStepBody();
        updateBottomPanel();
        confirmationModal.hide();
    });

    // Clean up the modal from the DOM after it is hidden
    $('#confirmationModal').on('hidden.bs.modal', () => {
        document.getElementById('confirmationModal').remove();
    });

}
// Function to setup event listener for the analyze button
function setupAnalyzeButtonListener() {
    const analyzeButton = document.getElementById('analyze-button');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', showConfirmationModal);
    }
}

