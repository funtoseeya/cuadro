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