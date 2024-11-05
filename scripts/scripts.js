
//GENERAL SCRIPTS

//turn on the charts data label plugin
Chart.register(ChartDataLabels);

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
      stepBodyContainer.className = 'container col-md-8 offset-md-2';
    }
  };

  // Initial check upon load
  updateClasses();

  // check again whenever the window size changes
  mediaQuerySm.addEventListener('change', updateClasses);
}
// Call the function to set up the responsive behavior of the step-body div
responsiveStepBody();


//GLOBAL VARIABLES
let selectedFile; // Global variable to store the file. we need this to create an array with its data
let dropdownState = []; //global variable to save dropdowns in the review table. we need this to save the user's con
let CategoricalArray = []; //global array that saves all unique values of columns tagged as Categorical - useful for filters
let parsedCSVData = []; // global array that stores the uploaded csv's data
const guessedCSVheaderClassification = {}; // To store the guessed classification of each header
let analysisObjects = []; // Array to store analysis object instances
let nextAnalysisId = 1; // Unique ID counter
let currentAnalysisId = 1; //what analysis object the user is currently analyzing. set to 1 as the default, will update later.
let colorPalette = ['#247ba0', '#f25f5c', '#ffe066', '#50514f', '#70c1b3', '#6a4c93', '#0ead69', '#ffa5ab', '#1982c4', '#f3722c'];
let colorPaletteWithOpacity = ['rgba(36, 123, 160, 0.4)', 'rgba(242, 95, 92, 0.4)', 'rgba(255, 224, 102, 0.4)', 'rgba(80, 81, 79, 0.4)', 'rgba(112, 193, 179, 0.4)', 'rgba(106, 76, 147, 0.4)', 'rgba(14, 173, 105, 0.4)', 'rgba(255, 165, 171, 0.4)', 'rgba(25, 130, 196, 0.4)', 'rgba(243, 114, 44, 0.4)'];

let bookmarks = [];


//STEP WHERE I CHECK IF I NEED TO REGISTER THE  USER OR IF THEY ALREADY HAVE
function checkEmailInLocalStorage() {
  const registered = localStorage.getItem('registered');

  if (registered) {
    // If an email exists, skip the form and go directly to the next step
    checkLocalStorageData();
  } else {
    // If no email exists, show the email input form
    handleEmail();
  }
}

function checkLocalStorageData() {
  const localStorageData = localStorage.getItem('parsedCSVData');
  if (localStorageData) {
    const topNav = document.getElementById('top-nav');
    topNav.style.display = 'block';

    const stepBody = document.getElementById('step-body');
    stepBody.classList.add('mt-5');
    setupAnalyzeStep();
  }
  else {
    createUploadStepContent();
  }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', checkEmailInLocalStorage);



// GET EMAIL STEP

function handleEmail() {
  const topNav = document.getElementById('top-nav');
  topNav.style.display = 'none';

  const stepBody = document.getElementById('step-body');
  stepBody.innerHTML = '';
  stepBody.classList.remove('mt-5');

  const registrationContainer = document.createElement('div');
  registrationContainer.classList.add('d-flex', 'flex-column', 'justify-content-center', 'align-items-center', 'vh-100');

  // Create welcome row
  const welcomeRow = document.createElement('div');
  welcomeRow.classList.add('row', 'text-center');

  const welcomeText = document.createElement('h1');
  welcomeText.innerHTML = `👋 Welcome to Cuadro!`;

  const welcomeSubText = document.createElement('p');
  welcomeSubText.innerHTML = `Effortlessly create, filter, compare, and share charts — all with just a few clicks.<a style="text-decoration:none;color:#1c607d" href="https://cuadro.io" target="_blank"> Learn more here <i class="fa-solid fa-arrow-up-right-from-square"></i>.</a>`;

  welcomeRow.appendChild(welcomeText);
  welcomeRow.appendChild(welcomeSubText);

  // Append welcomeRow to the registrationContainer
  registrationContainer.appendChild(welcomeRow);

  // Create a new row for the form
  const formRow = document.createElement('div');
  formRow.classList.add('row', 'text-center');

  // Create the form element
  const earlyAccessForm = document.createElement('form');
  earlyAccessForm.id = 'earlyAccessForm';
  earlyAccessForm.method = 'POST';
  earlyAccessForm.action = 'https://github.us22.list-manage.com/subscribe/post?u=c63a46fb8e27f6d05a1f683c8&id=acffebec23';
  earlyAccessForm.target = '_blank';

  // Create the form group div
  const formGroup = document.createElement('div');
  formGroup.className = 'input-group'; // Use input-group for side-by-side layout

  // Create the email input element
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.name = 'EMAIL';
  emailInput.id = 'email';
  emailInput.className = 'form-control';
  emailInput.placeholder = 'Enter your email';
  emailInput.required = true;

  // Append the email input to the form group
  formGroup.appendChild(emailInput);

  // Create the submit button
  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.className = 'btn btn-primary';
  submitButton.textContent = 'Start building';

  // Append the button to the form group
  formGroup.appendChild(submitButton);

  // Append the form group to the form
  earlyAccessForm.appendChild(formGroup);

  // Append the form to the new formRow
  formRow.appendChild(earlyAccessForm);

  // Append the formRow to the registrationContainer
  registrationContainer.appendChild(formRow);

  // Finally, append the registrationContainer to stepBody
  stepBody.appendChild(registrationContainer);

  // Handle form submission
  earlyAccessForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = emailInput.value; // Get the email input value

    // Optional: Validate email format
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('EMAIL', email);

    // Send the form data to Mailchimp using fetch API
    fetch(this.action, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Use no-cors mode to prevent CORS issues
    })
      .then(response => {

        // Store the email in localStorage
        localStorage.setItem('registered', 'yes');

        // Trigger the createUploadStepContent function
        createUploadStepContent(); // Call your function here
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was a problem with your submission. Please try again.');
      });
  });
}

//sign out 
function signOut() {
  localStorage.removeItem('parsedCSVData');
  localStorage.removeItem('registered');
  localStorage.removeItem('selectedFile');
  handleEmail();
}

//UPLOAD STEP

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

  const topNav = document.getElementById('top-nav');
  topNav.style.display = 'block';

  const stepBody = document.getElementById('step-body');

  // Create the container for the upload content
  const uploadContainer = document.createElement('div');
  uploadContainer.classList.add(
    'container',
    'd-flex',
    'flex-column',
    'text-center',
    'align-items-center',
    'justify-content-center'
  );

  uploadContainer.style.marginTop = '50px';

  //create upload header
  const uploadHeader = document.createElement('h1');
  uploadHeader.textContent = `Upload your CSV file`;
  uploadContainer.appendChild(uploadHeader);

  // Create and add the upload text with line break
  const uploadText = document.createElement('h5');
  uploadText.className = 'mb-3';
  uploadText.innerHTML = `We'll help you create several insightful charts and comparisons in just a few clicks.`;
  uploadContainer.appendChild(uploadText);



  // Create and add the "Choose file" button
  const chooseFileButton = document.createElement('button');
  chooseFileButton.className = 'btn btn-primary';
  chooseFileButton.innerHTML = `<i class="fa-solid fa-upload"></i> Upload file`;
  chooseFileButton.id = 'chooseFileButton';
  uploadContainer.appendChild(chooseFileButton);

  const sampleFile = document.createElement('a');
  sampleFile.classList.add('text-decoration-none', 'sample-data-link');
  sampleFile.href = `../sample-csv.csv`; // Path to the file
  sampleFile.download = 'sample-csv.csv'; // Suggest the filename for download
  sampleFile.textContent = `here's a sample file.`; // Text for the link

  const sampleText = document.createElement('p');
  sampleText.className = 'mt-3 text-muted small';
  sampleText.innerHTML = `If you just want to play around, `; // Only set the initial text
  sampleText.appendChild(sampleFile); // Append the anchor element to the paragraph

  uploadContainer.appendChild(sampleText);


  // Create the accordion
  const accordion = document.createElement('div');
  accordion.classList.add('accordion', 'w-100', 'mb-3');
  accordion.id = 'what-data-can-i-upload-accordion';

  accordion.innerHTML = `
     <div class="accordion-item mt-3">
         <h2 class="accordion-header" id="headingOne">
             <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                <i class="fa-solid fa-circle-question" style="margin-right:1rem" aria-hidden="true" ></i>
                  What kind of data can I upload?
             </button>
         </h2>
         <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
             <div class="accordion-body">
              <p class="text-start">You can upload any kind of tabular data having rows as items and columns as the items' characteriscs.</p>  
              <p class="text-start">Here's an example of a supported dataset that contains both categorical and numerical data. </p>
             <div style="width:100%;overflow:hidden;position:relative">
             <img src="https://app.cuadro.io/images/sample-data.PNG" class="d-block w-100" style="object-fit:contain">
             </div>
              </div>
         </div>
     </div>
 `;



  uploadContainer.appendChild(accordion);


  // Clear existing content and append the upload container and its content to the step body
  stepBody.innerHTML = '';
  stepBody.appendChild(uploadContainer);

  initializeFileInput();

}


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


// Function to handle file selection and validate CSV file
async function handleFileSelection(event) {
  const file = event.target.files[0]; // Get the selected file from the input event
  selectedFile = file; // Store the file globally in the selectedFile variable so that we can parse it in other functions
  localStorage.setItem('selectedFile', selectedFile.name);
  if (file) {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file.'); // Show an alert if the file is not a CSV
      return; // Exit the function early
    }

    // Validate file size limit of 5 MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      alert(
        'The maximum supported file size is 5MB. Please select a smaller file.'
      ); // Show an alert if the file is too large
      return; // Exit the function early
    }

    // Validate CSV file content
    const reader = new FileReader(); // Create a new FileReader object to read the content of the file
    reader.onload = function (event) {
      // Define the function to be called when the file is successfully read
      const text = event.target.result; // Get the content of the file as a string
      const rows = text.split('\n').filter(row => row.trim() !== ''); // Split the content into rows and remove any empty rows
      const columnCount = rows[0].split(',').length; // Count the number of columns in the first row

      // Check if the number of columns exceeds the maximum allowed (20 columns)
      if (columnCount > 50) {
        alert(
          'Only files with a maximum of 50 columns are supported. Please remove excess columns and try again.'
        ); // Show an alert if there are too many columns
        return; // Exit the function early
      }

      // Check if the number of rows exceeds the maximum allowed (1000 rows)
      if (rows.length > 10000) {
        alert(
          'Only files with a maximum of 10,000 rows are supported. Please remove excess rows and try again.'
        ); // Show an alert if there are too many rows
        return; // Exit the function early
      }

      // check to ensure the first row has at least one column
      if (rows.length > 0 && rows[0].split(',').length < 1) {
        alert('CSV file header is missing or incorrect.'); // Show an alert if the first row (header) is missing or incorrect
        return; // Exit the function early
      }

      //check that all column headers are unique
      const columnHeaderTitles = rows.length > 0
        ? rows[0].split(',').map(header => header.replace(/[\r\n]/g, '').trim()) // Remove \r \n and trim spaces
        : [];
      const hasDuplicates =
        new Set(columnHeaderTitles).size !== columnHeaderTitles.length;

      if (hasDuplicates) {
        alert('Please ensure that the titles of each column header are unique.');
        return; // exit function early
      }
      setupAnalyzeStep();
    };
    reader.readAsText(file); // Reads the content of the file as a text string
  };
}


//REVIEW STEP



// Function to generate the review table
function generateReviewTable(body) {
  // Clear existing table if it exists
  const existingTable = body.querySelector('table');
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
  header1.textContent = 'Field name';
  const header2 = document.createElement('th');
  header2.textContent = 'Sample data';
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

  // Use saved dropdown state
  dropdownState.forEach(({ header, value }) => {
    //for each item in the dropdown state array...
    const row = document.createElement('tr'); //create a row

    const cell1 = document.createElement('td');
    cell1.style.width = '25%';
    cell1.textContent = header; //the first column will contain the dropdown state header
    row.appendChild(cell1);

    // Data sample
    const cell2 = document.createElement('td');
    cell2.style.width = '50%';
    const samples = parsedCSVData
      .slice(0, 3)
      .map(data => data[header])
      .join(', '); //get the first 3 rows, keep the values from the header that matches this loop, and join them together
    cell2.textContent = samples;
    row.appendChild(cell2);

    // Data type dropdown
    const cell3 = document.createElement('td');
    cell3.style.width = '25%';
    const select = document.createElement('select'); //third column will be a dropdown
    select.classList.add('form-select', 'data-type-dropdown');
    const options = [
      'Categorical',
      'Numerical',
      'Date / Time',
      'Ignore'

    ]; //here are the options
    options.forEach(option => {
      //for each option...
      const optionElement = document.createElement('option'); //create an item in the list
      optionElement.value = option; //the item's value = the option name
      optionElement.textContent = option; //the item's textcontent = the option name
      select.appendChild(optionElement);
    });
    select.value = value; // the dropdown's value will be the one that's saved

    select.addEventListener('change', function (event) {
      const selectedValue = event.target.value;
      if (selectedValue === 'Numerical') {
        NumberFormattingWarning(header);
      }
      if (selectedValue === 'Date / Time') {
        unsupportedDataTypesToast();
      }
    });

    cell3.appendChild(select);
    row.appendChild(cell3);

    tbody.appendChild(row);
  });

  body.appendChild(table);
}

// Function to read a CSV file and convert it to an array
function parseCSVToArray(file) {
  // Function to convert CSV string to an array of objects
  function csvToArray(csv) {

    // Split the CSV into lines and filter out any empty lines
    const lines = csv.match(/(?:[^\n"]|"[^"]*")+/g).filter(line => line.trim() !== '');

    // Split the first line into headers
    const headers = lines[0].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

    // Map the remaining lines to objects with keys from headers
    const data = lines.slice(1).map(line => {
      const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // Split each line into values
      let obj = {}; // Initialize an empty object

      // Assign each value to the corresponding header in the object
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });

      return obj; // Return the constructed object
    });

    return data; // Return the array of objects
  }

  const reader = new FileReader(); // Create a new FileReader instance

  // Define what to do when the file is successfully read
  reader.onload = function (e) {
    const csv = e.target.result; // Get the content of the file
    parsedCSVData = csvToArray(csv); // Convert CSV to array and store it globally
    localStorage.setItem('parsedCSVData', JSON.stringify(parsedCSVData));

    // Log the parsed data for testing
    console.log('Parsed CSV Data:', parsedCSVData);

    //this guesses what each fields types are
    guessDataTypes();

    // this creates the filter options
    createCategoricalArrayForFilterPanel();

  };

  // Read the file as a text string
  reader.readAsText(file);
}


// Function to save the state of the data type dropdowns - useful for Analysis step and triggered when click on Analyze
function saveDataTypestoArray() {
  dropdownState = []; //reset dropdown state to empty

  // Select all rows in the table body and iterate over each row
  document.querySelectorAll('tbody tr').forEach(row => {
    const header = row.children[0].textContent; // Get the text content of the first cell (header) in the current row
    const dropdown = row.querySelector('.data-type-dropdown'); // Select the dropdown element within the current row

    // Add an object with the header and the selected dropdown value to the dropdownState array
    dropdownState.push({ header: header, value: dropdown.value });
  });
}

function guessDataTypes() {

  const headers = Object.keys(parsedCSVData[0]);//get an array listing each header. 

  headers.forEach(header => {
    const values = parsedCSVData.map(row => row[header]); //an array of all the values relating to that header in the big array
    let isNumeric = true;

    for (let i = 0; i < values.length; i++) { //go thru all values and ensure they are numbers
      const numberCheck = Number(values[i].trim());
      if (isNaN(numberCheck)) {
        isNumeric = false;  //if at least one value isn't numeric, we say so and move on
        break;
      }
    }

    if (isNumeric) {
      guessedCSVheaderClassification[header] = 'Numerical';
    }
    else {
      const uniqueValues = new Set(values); //find all unique values relating to the header
      const uniqueRatio = uniqueValues.size / values.length;
      if (uniqueRatio < 0.4) { // if the ratio of unique values to actual values is low, chances are high that it's categorical
        guessedCSVheaderClassification[header] = 'Categorical';
      }
      else {
        guessedCSVheaderClassification[header] = 'Ignore';
      }
    }
    //need to push these to dropdown state as default values. 
    dropdownState.push({ header: header, value: guessedCSVheaderClassification[header] });

  })

}

function NumberFormattingWarning(event) {
  for (let i = 0; i < parsedCSVData.length; i++) {
    const numberCheck = Number(parsedCSVData[i][event].trim());
    if (isNaN(numberCheck)) {
      alert('At least one of the values in this field is not a number. Please review your data or select another data type.');
      break;
    }
  }
}

function unsupportedDataTypesToast() {
  const parentDiv = document.getElementById('toastContainer'); // Replace with your parent div ID
  parentDiv.innerHTML = ''; // Clear any existing content

  const toastHtml = `
            <div aria-live="polite" aria-atomic="true" style="position: fixed; top: 1rem; right: 1rem; z-index: 1050;">
                <div class="toast" style="background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <div class="toast-header" style="background-color: #ffce44;">
                        <strong class="mr-auto">Coming soon</strong>
                    </div>
                    <div class="toast-body">
                    We do not yet support Date / Time based data.
                    <br> It's coming soon though!
                    </div>
                </div>
            </div>`;

  parentDiv.innerHTML = toastHtml;

  // Initialize the toast using Bootstrap's JS API
  const toastElement = parentDiv.querySelector('.toast');
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}


// ANALYZE STEP

// Function to setup the analaysis step
function setupAnalyzeStep() {

  window.addEventListener('beforeunload', alertUnsavedChanges);





  //create the bookmarks button
  const TopNavButtonContainer = document.getElementById('top-nav-button-container');
  const bookmarkButtonContainer = document.getElementById('bookmark-button-container');
  if (!bookmarkButtonContainer) {
    const bookmarkButtonContainer = document.createElement('div');
    bookmarkButtonContainer.id = 'bookmark-button-container';
    bookmarkButtonContainer.innerHTML = `  
    <button id="bookmarks-button" class="btn btn-secondary"><i class="fa-solid fa-bookmark" style="padding-right:0.2rem"></i>Bookmarks</button>`;
    TopNavButtonContainer.appendChild(bookmarkButtonContainer);

    const bookmarksButton = document.getElementById('bookmarks-button');
    bookmarksButton.addEventListener('click', openBookmarksOverlay);
  }


  displayAnalysisOptions();
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: 'smooth' for a smooth scroll effect, or 'auto' for instant scroll
  });


  const localStorageData = localStorage.getItem('parsedCSVData');

  if (!localStorageData) {
    //this triggers a cascade of functions...transform csv into array, guess types, assign to dropdown state...
    parseCSVToArray(selectedFile);
    displayAutoDataTypesToast();

  }

  else {
    parsedCSVData = JSON.parse(localStorage.getItem('parsedCSVData'));
    guessDataTypes();
    createCategoricalArrayForFilterPanel();

  }
  //create a new analysis object
  createAnalysisObject();


}


// Function to create a new array to generate the filters dropdown
function createCategoricalArrayForFilterPanel() {

  // Extract headers marked as "Categorical" or 'Numerical'
  const CategoricalHeaders = dropdownState
    .filter(item => item.value !== 'Ignore')
    .map(item => item.header);

  // Create a new array with unique values for each header marked as "Categorical"
  const result = CategoricalHeaders.map(header => {
    const uniqueValues = [
      ...new Set(parsedCSVData.map(item => item[header])),
    ];
    return {
      [header]: uniqueValues,
    };
  });

  // Log the result for debugging
  console.log('Categorical Array:', result);

  // Update the global CategoricalArray
  CategoricalArray = result;

  return result;
}

function openDataTypeSettingsOverlay() {

  //call fctn to delete any existing analysis objects in case you're coming back from Analyze
  deleteAllAnalysisObjects();

  // Set up overlay
  const dataTypeSettingsOverlay = document.getElementById('data-type-settings-overlay');
  dataTypeSettingsOverlay.style.width = "100%";
  dataTypeSettingsOverlay.style.display = 'block';
  document.body.style.overflowY = 'hidden';

  const Container = document.getElementById('data-types-container');
  if (Container) {
    Container.remove();
  }

  const dataTypesContainer = document.createElement('div');
  dataTypesContainer.id = 'data-types-container';
  dataTypesContainer.classList.add('container');
  dataTypeSettingsOverlay.appendChild(dataTypesContainer);

  const closeButtonRow = document.createElement('div');
  closeButtonRow.classList.add('row', 'align-');
  dataTypesContainer.appendChild(closeButtonRow);




  //create the close button
  const closeButtonColumn = document.createElement('div');
  closeButtonColumn.classList.add('col-12', 'd-flex', 'align-items-center', 'justify-content-end'); // col-auto to make the column fit the content
  closeButtonColumn.innerHTML = `
    <a class="close-data-type-settings-overlay-btn" id="close-data-type-settings-overlay-btn" role="button">&times;</a>`;
  closeButtonRow.appendChild(closeButtonColumn);

  // Close the overlay when the close button is clicked
  const dataTypesOverlayCloseButton = document.getElementById('close-data-type-settings-overlay-btn');
  dataTypesOverlayCloseButton.addEventListener('click', () => {
    dataTypeSettingsOverlay.style.width = "0%";
    dataTypeSettingsOverlay.style.display = 'none';
    document.body.style.overflowY = 'scroll';

    createAnalysisObject();
    displayAnalysisOptions();
  });

  //create the row and columns containing the title
  const titleRow = document.createElement('div');
  titleRow.classList.add('row');
  dataTypesContainer.appendChild(titleRow);
  const titleColumn = document.createElement('div');
  titleColumn.classList.add('col-6', 'd-flex', 'align-items-center', 'justify-content-start');
  titleColumn.innerHTML = '<h1>Data Settings</h1>';

  //add a section for the save button
  const SaveColumn = document.createElement('div');
  SaveColumn.classList.add('col-6', 'd-flex', 'align-items-center', 'justify-content-end');

  const SaveButton = document.createElement('button');
  SaveButton.classList.add('btn', 'btn-primary');
  SaveButton.textContent = 'Save Settings';
  titleRow.appendChild(titleColumn);
  titleRow.appendChild(SaveColumn);
  SaveColumn.appendChild(SaveButton);

  SaveButton.addEventListener('click', function () {

    //save the review table's configuration into an array
    saveDataTypestoArray();
    // run the function that creates the Categorical array, which is needed for the filter panel
    createCategoricalArrayForFilterPanel();

    //create a new analysis object
    createAnalysisObject();

    dataTypeSettingsOverlay.style.width = "0%";
    dataTypeSettingsOverlay.style.display = 'none';
    document.body.style.overflowY = 'scroll';
    displayAnalysisOptions();

  })


  //build up the body
  const dataTypeSettingsRow = document.createElement('div');
  dataTypeSettingsRow.classList.add('row');
  const dataTypeSettingsCol = document.createElement('div');
  dataTypeSettingsCol.classList.add('col-md-8', 'offset-md-2');
  dataTypesContainer.appendChild(dataTypeSettingsRow);
  dataTypeSettingsRow.appendChild(dataTypeSettingsCol);

  //display the file name
  const fileName = document.createElement('p');
  const selectedFileInStorage = localStorage.getItem('selectedFile');
  fileName.textContent = 'Uploaded file: ' + selectedFileInStorage;
  dataTypeSettingsCol.appendChild(fileName);

  // Create the accordion
  const accordion = document.createElement('div');
  accordion.classList.add('accordion', 'w-100', 'mb-3');
  accordion.id = 'dataTypeAccordion';

  accordion.innerHTML = `
    <div class="accordion-item mt-3">
        <h2 class="accordion-header" id="headingOne">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                <i class="fa fa-info-circle me-2" aria-hidden="true"></i>
                Review your fields' assigned data types
            </button>
        </h2>
        <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
            <div class="accordion-body">
                 We've made some calculated but imperfect guesses at assigning data types to your fields. Please take a minute to review them.
                <ul>
                    <li><strong>Categorical:</strong> Also known as discrete data. Use this for fields where a restricted set of possible values is expected. A field with unique values doesn't fall into Categorical - it should be set to Ignore.</li>
                    <li><strong>Numerical:</strong> This is for any field containing numerical values. We will compute these by summing them, rather than counting them.</li>
                                        <li><strong>Date / Time:</strong> This is for any field containing timestamps. This is especially useful for generating time-based comparisons, such as line charts and so on.</li>
                    <li><strong>Ignore:</strong> Assign this to any field that doesn't fall into the above categories. e.g. comments, names, unique identifiers, etc.</li>

                </ul>
            </div>
        </div>
    </div>
`;

  dataTypeSettingsCol.appendChild(accordion);
  generateReviewTable(dataTypeSettingsCol);
}



// new function to clear and uppdate the stepper body with analysis options
function displayAnalysisOptions() {

  const stepBody = document.getElementById('step-body');
  stepBody.classList.remove('mt-5');
  stepBody.classList.remove('mt-2');
  stepBody.classList.add('mt-3');
  // Clear any existing content
  stepBody.innerHTML = '';


  // Create the restart button 
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('row', 'mb-2');
  const restartColumn = document.createElement('div');
  restartColumn.classList.add('col-6', 'd-flex', 'justify-content-start', 'align-items-center');
  buttonRow.appendChild(restartColumn);
  stepBody.appendChild(buttonRow);
  const restartButton = document.createElement('a');
  restartButton.classList.add('text-decoration-none', 'tertiary-button')
  restartButton.innerHTML = `<i class="fas fa-rotate-left" style="padding-right:0.2rem"></i>New Analysis`;
  restartButton.addEventListener('click', () => {
    localStorage.removeItem('parsedCSVData');
    localStorage.removeItem('selectedFile');
    location.reload();
  }); // a confirmation dialog will appear due to a function above
  restartColumn.appendChild(restartButton);

  //create the data type settings button
  const dataTypeSettingsColumn = document.createElement('div');
  dataTypeSettingsColumn.classList.add('col-6', 'd-flex', 'justify-content-end', 'align-items-center');
  const dataTypeButton = document.createElement('a');
  dataTypeButton.classList.add('text-decoration-none', 'tertiary-button');
  dataTypeButton.innerHTML = '<i class="fa-solid fa-gear"></i> Data Settings';
  dataTypeSettingsColumn.appendChild(dataTypeButton);
  buttonRow.appendChild(dataTypeSettingsColumn);

  dataTypeButton.addEventListener('click', function () {
    openDataTypeSettingsOverlay();
  })


  // Create the "i want to text", col and row
  const analysisOptionTextRow = document.createElement('div');
  analysisOptionTextRow.classList.add('row', 'mt-3');
  analysisOptionTextRow.id = 'analysis-option-text-row';
  const analysisOptionTextColumn = document.createElement('div');
  analysisOptionTextColumn.classList.add('col-12');
  const analysisOptionText = document.createElement('h5');
  analysisOptionText.textContent = 'What would you like to see?';
  analysisOptionTextColumn.appendChild(analysisOptionText);
  analysisOptionTextRow.appendChild(analysisOptionTextColumn);
  stepBody.appendChild(analysisOptionTextRow);




  // Create the analysis option cards, cols, and row
  const analysisOptionCardsRow1 = document.createElement('div');
  analysisOptionCardsRow1.classList.add('row');
  const analysisOptionCardsRow2 = document.createElement('div');
  analysisOptionCardsRow2.classList.add('row');

  // Helper function to create a card in a column
  function createCardInCol(cardID, column, title, description, iconHTML, imageSRC) {
    const card = document.createElement('button');
    card.classList.add(
      'card',
      'h-100',
      'shadow-sm',
      'rounded-3',
      'card-hover'
    );
    card.style.width = '100%';
    card.style.border = '1px solid rgba(0, 0, 0,0.15)';
    card.id = cardID;

    // img
    const imgDiv = document.createElement('div');
    imgDiv.className = 'rounded-3';
    imgDiv.style.width = '100%'; // Full width of the parent container
    imgDiv.style.height = '200px'; // Fixed height for consistency
    imgDiv.style.overflow = 'hidden'; // Hide overflow to prevent overflow issues with different dimensions
    imgDiv.style.position = 'relative'; // Position for more control

    const img = document.createElement('img');
    img.src = imageSRC; // Replace with the actual image path
    img.classList.add('d-block', 'w-100'); // Keep width consistent
    img.style.height = '100%'; // Ensure height fits the container
    img.style.objectFit = 'contain';



    imgDiv.appendChild(img);
    card.appendChild(imgDiv);



    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'text-start');

    // Add the icon
    const iconContainer = document.createElement('div');
    iconContainer.className = 'd-flex justify-content-between align-items-center w-100 mb-2';

    cardBody.appendChild(iconContainer);

    // Add the title
    const titleDiv = document.createElement('h6');
    titleDiv.classList.add('card-title');
    titleDiv.innerHTML = `${iconHTML} ${title}`;
    cardBody.appendChild(titleDiv);

    // Add the description
    const descriptionDiv = document.createElement('p');
    descriptionDiv.classList.add('card-text', 'small');
    descriptionDiv.textContent = description;
    cardBody.appendChild(descriptionDiv);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the column
    column.appendChild(card);
  }


  // Create the simple analysis column and card
  const analysisOptionCardBasicCol = document.createElement('div');
  analysisOptionCardBasicCol.classList.add('col-12', 'col-sm-4', 'mb-2', 'px-2');
  createCardInCol(
    'simple-analysis-option',
    analysisOptionCardBasicCol,
    'Split by category',
    `Count the number of times each category appears within a field.`,
    '<i class="fas fa-chart-bar"></i>',
    '../images/category-distribution-preview.png'
  );

  // Create the numerical analysis column and card
  const analysisOptionCardNumCol = document.createElement('div');
  analysisOptionCardNumCol.classList.add('col-12', 'col-sm-4', 'mb-2', 'px-2');
  createCardInCol(
    'number-analysis-option',
    analysisOptionCardNumCol,
    'Split by range',
    `Count the number of times a range of numbers appears within a field.`,
    '<i class="fa-solid fa-chart-area"></i>',
    '../images/number-distribution-preview.png'
  );

  // Create the comparative analysis column and card
  const analysisOptionCardCompareCol = document.createElement('div');
  analysisOptionCardCompareCol.classList.add('col-12', 'col-sm-4', 'mb-2', 'px-2');
  createCardInCol(
    'comparative-analysis-option',
    analysisOptionCardCompareCol,
    'Split of categories by group',
    `Count the number of times a grouping of categories appears across two fields.`,
    '<i class="fas fa-table"></i>',
    '../images/category-grouping-distribution-preview.png'
  );

  // Create the sum by category  card
  const analysisOptionCardNumCompareCol = document.createElement('div');
  analysisOptionCardNumCompareCol.classList.add('col-12', 'col-sm-4', 'mb-2', 'px-2');
  createCardInCol(
    'sum-comparative-analysis-option',
    analysisOptionCardNumCompareCol,
    'Sum by Category',
    `Calculate the sum of values by category.`,
    '<i class="fa-solid fa-calculator"></i>',
    '../images/sum-preview.png'
  );

  // Create the avg by category  card
  const analysisOptionAvgCol = document.createElement('div');
  analysisOptionAvgCol.classList.add('col-12', 'col-sm-4', 'mb-2', 'px-2');
  createCardInCol(
    'average-comparative-analysis-option',
    analysisOptionAvgCol,
    'Avg by Category',
    `Calculate the average of values by category.`,
    '<i class="fa-solid fa-calculator"></i>',
    '../images/avg-preview.png'
  );

  // Create the trend analysis column and card
  const analysisOptionCardTrendCol = document.createElement('div');
  analysisOptionCardTrendCol.classList.add('col-12', 'col-sm-4', 'mb-2', 'px-2');
  createCardInCol(
    'trend-analysis-option',
    analysisOptionCardTrendCol,
    'Trend Analysis',
    'Uncover patterns and changes over time.',
    '<i class="fas fa-chart-line"></i><span class="badge" style="background-color: #f4b400; margin-left:0.2rem; color: white; font-size: 0.875rem;">Coming Soon!</span>',
    '../images/line_chart_temp.png'
  );

  // Append analysis columns to the row
  analysisOptionCardsRow1.appendChild(analysisOptionCardBasicCol);
  analysisOptionCardsRow1.appendChild(analysisOptionCardNumCol);
  analysisOptionCardsRow1.appendChild(analysisOptionCardCompareCol);
  analysisOptionCardsRow2.appendChild(analysisOptionCardNumCompareCol);
  analysisOptionCardsRow2.appendChild(analysisOptionAvgCol);
  analysisOptionCardsRow2.appendChild(analysisOptionCardTrendCol);

  // Append the row to the step body
  stepBody.appendChild(analysisOptionCardsRow1);
  stepBody.appendChild(analysisOptionCardsRow2);




  const trendCard = document.getElementById('trend-analysis-option');
  trendCard.style.backgroundColor = '#ececec';
  trendCard.style.cursor = 'default';

  const simpleCard = document.getElementById('simple-analysis-option');
  simpleCard.addEventListener('click', function () {
    handleIWantTo('simple');
  });

  const numbersCard = document.getElementById('number-analysis-option');
  numbersCard.addEventListener('click', function () {
    handleIWantTo('number');
  });

  const comparativeCard = document.getElementById(
    'comparative-analysis-option'
  );
  comparativeCard.addEventListener('click', function () {
    handleIWantTo('comparative');
  });

  const sumComparativeCard = document.getElementById('sum-comparative-analysis-option');
  sumComparativeCard.addEventListener('click', function () { handleIWantTo('sum-comparative') });

  const avgComparativeCard = document.getElementById('average-comparative-analysis-option');
  avgComparativeCard.addEventListener('click', function () { handleIWantTo('average-comparative') });


}

function displayAutoDataTypesToast() {
  const parentDiv = document.getElementById('autoDataTypetoastContainer'); // Replace with your parent div ID
  parentDiv.innerHTML = ''; // Clear any existing content

  const toastHtml = `
            <div aria-live="polite" aria-atomic="true" style="position: fixed; top: 1rem; right: 1rem; z-index: 1050;">
                <div class="toast" style="background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <div class="toast-header" style="background-color: #247ba0;color:white;">
                        <strong class="mr-auto">Data Types Assigned</strong>
                    </div>
                    <div class="toast-body">
                    We've reviewed and assigned a type to each uploaded field. To review or adjust, go to Data Type Settings. 
                    </div>
                </div>
            </div>`;

  parentDiv.innerHTML = toastHtml;

  // Initialize the toast using Bootstrap's JS API
  const toastElement = parentDiv.querySelector('.toast');
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}


// Handle the select change event
function handleIWantTo(event) {

  //update the current analysis object. scrap any previously existing info and give it a type
  updateAnalysisObjectById(currentAnalysisId, {
    analysisType: event,
    usingThese: [],
    groupedBy: '',
    filteredBy: [],
  });


  const stepBody = document.getElementById('step-body');

  // Clear any existing content
  stepBody.innerHTML = '';

  //create the back to start button, row and col
  const backRow = document.createElement('div');
  backRow.className = 'row';
  const backCol = document.createElement('div');
  backCol.classList.add('col-6');
  const backButton = document.createElement('a');
  backButton.classList.add('text-decoration-none', 'tertiary-button');
  backButton.innerHTML =
    ' <i class="fas fa-arrow-left" style="padding-right:0.2rem"></i> Back to types';

  backCol.appendChild(backButton);
  backRow.appendChild(backCol);
  stepBody.appendChild(backRow);

  backButton.addEventListener('click', displayAnalysisOptions);


  //create the data type settings button
  const dataTypeSettingsColumn = document.createElement('div');
  dataTypeSettingsColumn.classList.add('col-6', 'd-flex', 'justify-content-end', 'align-items-center');
  const dataTypeButton = document.createElement('a');
  dataTypeButton.classList.add('text-decoration-none', 'tertiary-button');
  dataTypeButton.innerHTML = '<i class="fa-solid fa-gear"></i> Data Settings';
  dataTypeSettingsColumn.appendChild(dataTypeButton);
  backRow.appendChild(dataTypeSettingsColumn);

  dataTypeButton.addEventListener('click', function () {
    openDataTypeSettingsOverlay();
  })

  // Create the container div and set its class
  const promptRow = document.createElement('div');
  promptRow.classList.add('row');
  promptRow.id = 'prompt-row';
  promptRow.style.margin = '1rem';

  // Create four  column divs for the dropdowns and set their class
  const typeColumn = document.createElement('div');
  typeColumn.id = 'type-colum';
  typeColumn.classList.add('col-12', 'col-sm-6', 'col-md-4');

  const usingColumn = document.createElement('div');
  usingColumn.id = 'using-column';
  usingColumn.classList.add('col-12', 'col-sm-6', 'col-md-4');

  const groupColumn = document.createElement('div');
  groupColumn.id = 'group-column';
  //no class for now. just keep empty

  const filterColumn = document.createElement('div');
  filterColumn.id = 'filter-column';
  filterColumn.classList.add('col-12', 'col-sm-6', 'col-md-4');

  // Append the col divs to the rowdiv
  promptRow.appendChild(typeColumn);
  promptRow.appendChild(usingColumn);
  promptRow.appendChild(groupColumn);
  promptRow.appendChild(filterColumn);

  // Append the row div to the stepBody
  stepBody.appendChild(promptRow);

  // Create the i want text
  const iWantText = document.createElement('span');
  iWantText.id = 'i-want-to-text';
  iWantText.style.fontSize = '0.9rem';
  iWantText.textContent = 'Analysis type';

  // Create the i want menu container
  const iWantdropdownContainer = document.createElement('div');
  iWantdropdownContainer.id = 'i-want-to-dropdown-container';
  iWantdropdownContainer.classList.add('dropdown');

  // Create the i want button
  const iWantSelect = document.createElement('button');
  iWantSelect.classList.add(
    'btn',
    'truncate-btn',
    'btn-secondary',
    'form-select',
    'data-type-dropdown'
  );
  iWantSelect.type = 'button';
  iWantSelect.style.width = '100%';
  iWantSelect.style.fontSize = '0.9rem';
  iWantSelect.textContent = 'make a selection';
  iWantSelect.style.textAlign = 'left';
  iWantSelect.id = 'i-want-to-dropdown';
  iWantSelect.setAttribute('data-bs-toggle', 'dropdown');
  iWantSelect.setAttribute('aria-expanded', 'false');

  // Create the options menu
  const iWantMenu = document.createElement('ul');
  iWantMenu.classList.add('dropdown-menu');

  // Populate the new dropdown with types of comparisons

  const simpleListItem = document.createElement('li');
  const simpleListAnchor = document.createElement('a');
  simpleListAnchor.classList.add('dropdown-item');
  const simpleListAnchorText = document.createElement('label');
  simpleListAnchorText.textContent = 'split by category';
  simpleListAnchor.setAttribute('data-value', 'simple');

  const numberListItem = document.createElement('li');
  const numberListAnchor = document.createElement('a');
  numberListAnchor.classList.add('dropdown-item');
  const numberListAnchorText = document.createElement('label');
  numberListAnchorText.textContent = 'split by range';
  numberListAnchor.setAttribute('data-value', 'number');

  const compareListItem = document.createElement('li');
  const compareListAnchor = document.createElement('a');
  compareListAnchor.classList.add('dropdown-item');
  const compareListAnchorText = document.createElement('label');
  compareListAnchorText.textContent = 'split of categories by group';
  compareListAnchor.setAttribute('data-value', 'comparative');

  const sumListItem = document.createElement('li');
  const sumListAnchor = document.createElement('a');
  sumListAnchor.classList.add('dropdown-item');
  const sumListAnchorText = document.createElement('label');
  sumListAnchorText.textContent = 'sum by category';
  sumListAnchor.setAttribute('data-value', 'sum-comparative');

  const avgListItem = document.createElement('li');
  const avgListAnchor = document.createElement('a');
  avgListAnchor.classList.add('dropdown-item');
  const avgListAnchorText = document.createElement('label');
  avgListAnchorText.textContent = 'average by category';
  avgListAnchor.setAttribute('data-value', 'avg-comparative');

  //append options to menu
  simpleListAnchor.appendChild(simpleListAnchorText);
  simpleListItem.appendChild(simpleListAnchor);
  iWantMenu.appendChild(simpleListItem);

  numberListAnchor.appendChild(numberListAnchorText);
  numberListItem.appendChild(numberListAnchor);
  iWantMenu.appendChild(numberListItem);

  compareListAnchor.appendChild(compareListAnchorText);
  compareListItem.appendChild(compareListAnchor);
  iWantMenu.appendChild(compareListItem);

  sumListAnchor.appendChild(sumListAnchorText);
  sumListItem.appendChild(sumListAnchor);
  iWantMenu.appendChild(sumListItem);

  avgListAnchor.appendChild(avgListAnchorText);
  avgListItem.appendChild(avgListAnchor);
  iWantMenu.appendChild(avgListItem);

  // Append elements to the dropdown container
  iWantdropdownContainer.appendChild(iWantSelect);
  iWantdropdownContainer.appendChild(iWantMenu);

  // place the select dropdown to colDiv1
  typeColumn.appendChild(iWantText);
  typeColumn.appendChild(iWantdropdownContainer);



  if (event === 'simple') {
    // Update select.textContent
    iWantSelect.textContent = 'split by category';

    //hide group column
    if (groupColumn) {
      groupColumn.style.display = 'none';
    }

    // Create and append the required dropdowns
    createUsingTheseDropdown(event);
    createFilterButton();
  }

  // If the value of the select dropdown is "generic"...
  if (event === 'number') {
    // Update select.textContent
    iWantSelect.textContent = 'split by range';

    //hide group column
    if (groupColumn) {
      groupColumn.style.display = 'none';
    }

    // Create and append the required dropdowns
    createUsingTheseDropdown(event);
    createFilterButton();
  }

  if (event === 'comparative' || event === 'sum-comparative' || event === 'average-comparative') {
    // Update select.textContent
    if (event === 'comparative') {
      iWantSelect.textContent = 'Split of categories by group';
    }
    if (event === 'sum-comparative') {
      iWantSelect.textContent = 'sum by category';
    }
    if (event === 'average-comparative') {
      iWantSelect.textContent = 'average by category';
    }
    //show group column
    if (groupColumn) {
      groupColumn.style.display = '';
    }


    // Readjust column widths
    typeColumn.classList.remove('col-md-6', 'col-md-4');
    typeColumn.classList.add('col-md-3');

    usingColumn.classList.remove('col-md-6', 'col-md-4');
    usingColumn.classList.add('col-md-3');
    usingColumn.innerHTML = '';

    groupColumn.classList.remove('col-md-6', 'col-md-4');
    groupColumn.classList.add('col-12', 'col-sm-6', 'col-md-3');
    groupColumn.innerHTML = '';

    filterColumn.classList.remove('col-md-6', 'col-md-4');
    filterColumn.classList.add('col-md-3');
    filterColumn.innerHTML = '';

    // Create and append the required dropdowns
    createUsingTheseDropdown(event);
    createGroupByDropdown();
    createFilterButton();
  }


  //remove any previously existing chart cards from the body
  let cardsContainer = document.getElementById('step-body-cards-container');

  if (cardsContainer) {
    cardsContainer.innerHTML = '';
  } else {
    cardsContainer = document.createElement('div');
    cardsContainer.id = 'step-body-cards-container';
    stepBody.appendChild(cardsContainer);
  }

  iWantMenu.addEventListener('click', function (event) {
    const target = event.target.closest('a.dropdown-item');
    let analysisType = '';
    if (target.innerText === 'split by category') {
      analysisType = 'simple';
    }
    if (target.innerText === 'split by range') {
      analysisType = 'number';
    }
    if (target.innerText === 'split of categories by group') {
      analysisType = 'comparative';
    }
    if (target.innerText === 'sum by category') {
      analysisType = 'sum-comparative';
    }
    if (target.innerText === 'average by category') {
      analysisType = 'average-comparative';
    }

    handleIWantTo(analysisType);
  });
}

// function to Create the Using dropdown
function createUsingTheseDropdown(event) {

  const usingColumn = document.getElementById('using-column');

  // Create the span element for text
  const span = document.createElement('span');
  span.id = 'using-these-values-text';
  span.style.fontSize = '0.9rem';
  span.textContent = 'using these fields';

  // Create the menu container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('dropdown');

  // Create the button
  const columnSelect = document.createElement('button');
  columnSelect.classList.add(
    'btn',
    'truncate-btn',
    'btn-secondary',
    'form-select',
    'data-type-dropdown'
  );
  columnSelect.type = 'button';
  columnSelect.style.width = '100%';
  columnSelect.style.fontSize = '0.9rem';
  columnSelect.textContent = '0 selected'; // Start with 0 selected
  columnSelect.style.textAlign = 'left'; // Align text to the left
  columnSelect.id = 'column-select';

  columnSelect.setAttribute('data-bs-toggle', 'dropdown');
  columnSelect.setAttribute('aria-expanded', 'false');

  // Create the menu
  const columnMenu = document.createElement('ul');
  columnMenu.classList.add('dropdown-menu');
  columnMenu.id = 'using-these-list';

  columnMenu.style.maxHeight = '300px'; // Adjust max-height as needed
  columnMenu.style.maxWidth = '400px';
  columnMenu.style.overflowY = 'auto';
  columnMenu.style.overflowX = 'hidden';

  //the type of analysis dictates what the users options should be
  const currentAnalysisObject = analysisObjects.find(obj => obj.id === currentAnalysisId);
  const analysisType = currentAnalysisObject.analysisType;

  // Populate the new dropdown with options from the saved dropdown state
  dropdownState.forEach(({ header, value }) => {
    if (
      ((event === 'simple' || event === 'comparative') && value === 'Categorical') ||
      ((event === 'number' || (event === 'sum-comparative' || event === 'average-comparative')) && value === 'Numerical')
    ) {
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
        updateUsingTheseCount();
        updateUsingTheseArray();
      });
    }
  });


  // Append elements to the dropdown container
  dropdownContainer.appendChild(columnSelect);
  dropdownContainer.appendChild(columnMenu);

  // Append elements to usingcolumn
  usingColumn.appendChild(span);
  usingColumn.appendChild(dropdownContainer);

  // Prevent dropdown menu from closing when clicking inside
  columnMenu.addEventListener('click', function (event) {
    event.stopPropagation();
  });
}

// Update the text of the columnSelect button based on selected checkboxes
function updateUsingTheseCount() {
  const columnSelect = document.getElementById('column-select');
  const checkboxes = document.querySelectorAll(
    '#column-select ~ .dropdown-menu input[type="checkbox"]'
  );
  const selectedCount = Array.from(checkboxes).filter(
    checkbox => checkbox.checked
  ).length;
  columnSelect.textContent = `${selectedCount} selected`;
}

// Update the usingThese array based on selected checkboxes
function updateUsingTheseArray() {
  const selectedValues = Array.from(
    document.querySelectorAll(
      '#column-select ~ .dropdown-menu input[type="checkbox"]:checked'
    )
  ).map(checkbox => checkbox.value);

  // Find the current AnalysisObject and update its usingThese array
  const analysis = analysisObjects.find(obj => obj.id === currentAnalysisId);
  if (analysis) {
    analysis.usingThese = selectedValues;
    analysis.beginChartGenerationProcess();
    console.log(analysis);
  } else {
    console.error('AnalysisObject not found');
  }
}

// function to create the group by dropdown necessary for comparisons
function createGroupByDropdown() {
  const groupColumn = document.getElementById('group-column');

  // Create the span element for text
  const span = document.createElement('span');
  span.id = 'group-by-text';
  span.style.fontSize = '0.9rem';
  span.textContent = 'grouped by';

  // Create the menu container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('dropdown');

  // Create the button
  const groupBySelect = document.createElement('button');
  groupBySelect.classList.add(
    'btn',
    'truncate-btn',
    'btn-secondary',
    'form-select',
    'data-type-dropdown'
  );
  groupBySelect.type = 'button';
  groupBySelect.style.width = '100%';
  groupBySelect.style.fontSize = '0.9rem';
  groupBySelect.textContent = 'make a selection';
  groupBySelect.style.textAlign = 'left'; // Align text to the left
  groupBySelect.id = 'group-by-select';
  groupBySelect.setAttribute('data-bs-toggle', 'dropdown');
  groupBySelect.setAttribute('aria-expanded', 'false');

  // Create the menu
  const groupByMenu = document.createElement('ul');
  groupByMenu.classList.add('dropdown-menu');
  groupByMenu.id = 'group-by-menu';

  groupByMenu.style.maxHeight = '300px'; // Adjust max-height as needed
  groupByMenu.style.maxWidth = '400px';
  groupByMenu.style.overflowY = 'auto';
  groupByMenu.style.overflowX = 'hidden';

  // Populate the group by dropdown with columns that were typed as "Categorical"
  dropdownState.forEach(({ header, value }) => {
    if (value === 'Categorical') {
      const groupByListItem = document.createElement('li');
      const groupByListAnchor = document.createElement('a');
      groupByListAnchor.classList.add('dropdown-item');
      groupByListAnchor.setAttribute('data-value', 'open');
      const groupByListAnchorText = document.createElement('label');
      groupByListAnchorText.textContent = header;
      groupByListAnchor.id = header;

      //append all items to the group by menu
      groupByListAnchor.appendChild(groupByListAnchorText);
      groupByListItem.appendChild(groupByListAnchor);
      groupByMenu.appendChild(groupByListItem);
    }
  });

  // Append elements to the dropdown container
  dropdownContainer.appendChild(groupBySelect);
  dropdownContainer.appendChild(groupByMenu);

  // Append elements to colDiv3
  groupColumn.appendChild(span);
  groupColumn.appendChild(dropdownContainer);

  // Add event listener for selection change, which will call a cascade of functions
  groupByMenu.addEventListener('click', handleGroupByChange);
}

// Handle the group by change event
function handleGroupByChange(event) {
  const target = event.target.closest('a.dropdown-item');
  if (!target) return;

  const groupBySelect = document.getElementById('group-by-select');

  // Update groupby menu to display the selected value
  groupBySelect.textContent = target.querySelector('label').textContent;

  //call the function that updates the analysis object's groupBy property
  updateGroupByValue();
}

//function to update the analysis object with the selected groupBy value
function updateGroupByValue() {
  const selectedValue = document.getElementById('group-by-select')
    .textContent;

  // Find the current AnalysisObject and update its groupBy property
  const analysis = analysisObjects.find(obj => obj.id === currentAnalysisId);
  if (analysis) {
    analysis.groupedBy = selectedValue;
    analysis.beginChartGenerationProcess();
    console.log(analysis);
  } else {
    console.error('AnalysisObject not found');
  }
}

// function to Create the filter dropdown using the Categorical array
function createFilterButton() {
  const filterColumn = document.getElementById('filter-column');

  // Create the span element for text
  const span = document.createElement('span');
  span.id = 'filtered-by-text';
  span.style.fontSize = '0.9rem';
  span.textContent = 'Filtered by';

  // Create the menu container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('dropdown');

  // Create the button
  const filterSelect = document.createElement('button');
  filterSelect.classList.add(
    'btn',
    'truncate-btn',
    'btn-secondary',
    'form-select',
    'data-type-dropdown'
  );
  filterSelect.type = 'button';
  filterSelect.style.width = '100%';
  filterSelect.style.fontSize = '0.9rem';
  filterSelect.textContent = '0 selected'; // Start with 0 selected
  filterSelect.style.textAlign = 'left'; // Align text to the left
  filterSelect.id = 'filter-select';
  filterSelect.setAttribute('data-bs-toggle', 'dropdown');
  filterSelect.setAttribute('aria-expanded', 'false');

  // Create the menu
  const filterMenu = document.createElement('ul');
  filterMenu.classList.add('dropdown-menu');
  filterMenu.id = 'filtered-by-list';

  filterMenu.style.maxHeight = '300px'; // Adjust max-height as needed
  filterMenu.style.maxWidth = '400px';
  filterMenu.style.overflowY = 'auto';
  filterMenu.style.overflowX = 'hidden';

  let itemToHeaderMap = new Map();

  // Populate the dropdown with headers and options
  CategoricalArray.forEach(group => {
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
        });
      });
    }
  });

  // Function to update the Filtered by array based on selected checkboxes
  function updateFilteredArray() {
    const selectedValues = Array.from(
      document.querySelectorAll(
        '#filter-select ~ .dropdown-menu input[type="checkbox"]:checked'
      )
    ).map(checkbox => {
      const value = checkbox.value;
      const header = itemToHeaderMap.get(value);
      return { header, value };
    });

    // Find the current AnalysisObject and update its filteredBy array
    const analysis = analysisObjects.find(
      obj => obj.id === currentAnalysisId
    );
    if (analysis) {
      analysis.filteredBy = selectedValues;
      analysis.beginChartGenerationProcess();
      console.log(analysis);
    } else {
      console.error('AnalysisObject not found');
    }
  }

  // Append elements to the dropdown container
  dropdownContainer.appendChild(filterSelect);
  dropdownContainer.appendChild(filterMenu);

  filterColumn.appendChild(span);
  filterColumn.appendChild(dropdownContainer);

  // Prevent dropdown menu from closing when clicking inside
  filterMenu.addEventListener('click', function (event) {
    event.stopPropagation();
  });
}

// Update the text of the filterSelect button based on selected checkboxes
function updateFilteredCount() {
  const filterSelect = document.getElementById('filter-select');
  const checkboxes = document.querySelectorAll(
    '#filter-select ~ .dropdown-menu input[type="checkbox"]'
  );
  const filteredCount = Array.from(checkboxes).filter(
    checkbox => checkbox.checked
  ).length;
  filterSelect.textContent = `${filteredCount} selected`;
}


// a boilerplate for analysis objects. users will be able to create many of them
class AnalysisObject {
  constructor() {
    //create a new empty object
    this.id = nextAnalysisId++; // Assign a unique ID that increments by 1 each time a new one is created
    this.analysisType = ''; // simple, comparative, temporal...
    this.usingThese = []; // the main column being processed
    this.groupedBy = ''; // sometimes the data will be sliced by this column and displayed in the chart
    this.filteredBy = []; // sometimes the data will be filtered by these values
    this.chartObjects = []; // the array storing the charts created by the above parameters
    this.label = ''; // Optional label for user naming
  }

  //update the object's parameters. if any are not defined in the call, default to current value
  updateAnalysisObject(
    analysisType = this.analysisType,
    usingThese = this.usingThese,
    groupedBy = this.groupedBy,
    filteredBy = this.filteredBy,
    label = this.label
  ) {
    this.analysisType = analysisType; //update the parameter to what's passed as an argument
    this.usingThese = usingThese; //update the parameter to what's passed as an argument
    this.groupedBy = groupedBy; //update the parameter to what's passed as an argument
    this.filteredBy = filteredBy; //update the parameter to what's passed as an argument
    this.label = label; //update the parameter to what's passed as an argument
  }
  beginChartGenerationProcess() {
    //meant as a router that chooses what charts to produce depending on the inputs
    // Check if usingThese is not empty and analysisobject's type is 'generic'
    if (this.usingThese.length > 0 && this.analysisType === 'simple') {
      this.addSimpleChartObjects();
    }
    if (this.usingThese.length > 0 && this.analysisType === 'number') {
      this.addNumberChartObjects();
    }
    if (this.usingThese.length > 0 && this.analysisType === 'comparative' && this.groupedBy != '') {
      this.addComparativeChartObjects();
    }
    if (this.usingThese.length > 0 && this.analysisType === 'sum-comparative' && this.groupedBy != '') {
      this.addSumChartObjects();
    }
    if (this.usingThese.length > 0 && this.analysisType === 'average-comparative' && this.groupedBy != '') {
      this.addAverageChartObjects();
    }

  }

  addSimpleChartObjects() {
    //produces the data, labels and charts
    this.chartObjects = []; // Clear any pre-existing charts before creating new ones
    this.usingThese.forEach(value => {
      //iterates over each element in the this.usingThese array.
      // get the data we need to produce the chart
      const result = this.generateSimpleChartObjectDataArrayAndLabels(
        value,
        this.filteredBy
      );

      // Extract data and labels from the result object
      const data = result.data;
      const labels = result.labels;
      const percentagesCounts = result.PercentagesCounts;
      const chartTitle = `Split of '${value}' categories`;
      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `simple-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens


      // Create and add the chart
      const newChartObject = new ChartObject(
        this.analysisType,
        chartTitle,
        chartID,
        'bar',
        data,
        labels,
        percentagesCounts,
        [],
        value,
        this.groupedBy,
        this.filteredBy
      ); //value= the current item in the usingthese foreach loop
      this.chartObjects.push(newChartObject); // add the new chart object at the end of the analysis object's charts array
    });
    this.prepChartContainerInStepBody(); // render all charts once their code and data is ready
  }

  addNumberChartObjects() {
    //produces the data, labels and charts
    this.chartObjects = []; // Clear any pre-existing charts before creating new ones
    this.usingThese.forEach(value => {
      //iterates over each element in the this.usingThese array.
      // get the data we need to produce the chart
      const result = this.generateNumberChartObjectDataArrayAndLabels(
        value,
        this.filteredBy
      );

      // Extract data and labels from the result object
      const data = result.data;
      const labels = result.labels;
      const percentagesCounts = '';
      const chartTitle = `Split of '${value}' ranges`;
      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `number-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens

      // Create and add the chart
      const newChartObject = new ChartObject(
        this.analysisType,
        chartTitle,
        chartID,
        'line',
        data,
        labels,
        percentagesCounts,
        [],
        value,
        this.groupedBy,
        this.filteredBy
      ); //value= the current item in the usingthese foreach loop
      this.chartObjects.push(newChartObject); // add the new chart object at the end of the analysis object's charts array
    });
    this.prepChartContainerInStepBody(); // render all charts once their code and data is ready

  }

  addComparativeChartObjects() {
    this.chartObjects = []; // Clear existing charts
    this.usingThese.forEach(value => {
      // Generate data, labels, and cluster labels for the clustered chart
      const result = this.generateComparativeChartObjectDataArrayAndLabels(
        value,
        this.groupedBy,
        this.filteredBy
      );

      const data = result.data;
      const labels = result.labels;
      const clusterLabels = result.clusterLabels;
      const percentagesCounts = result.percentagesCounts;
      const UsingTheseType = dropdownState.find(obj => obj.header === value);
      let chartTitle = '';

      chartTitle = `Split of '${value}' categories grouped by '${this.groupedBy}' `;


      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `comparative-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens

      // Create and add the chart
      const newChartObject = new ChartObject(
        this.analysisType,
        chartTitle,
        chartID,
        'bar',
        data,
        labels,
        percentagesCounts,
        clusterLabels, // Pass cluster labels to ChartObject
        value,
        this.groupedBy,
        this.filteredBy
      );
      this.chartObjects.push(newChartObject);
    });
    this.prepChartContainerInStepBody(); // render clustered once the code and data is ready
  }

  addSumChartObjects() {
    this.chartObjects = []; // Clear existing charts
    this.usingThese.forEach(value => {
      // Generate data, labels, and cluster labels for the clustered chart
      const result = this.generateSumChartObjectDataArrayAndLabels(
        value,
        this.groupedBy,
        this.filteredBy
      );

      const data = result.data;
      const labels = result.labels;
      const clusterLabels = result.clusterLabels;
      const percentagesCounts = result.percentagesCounts;
      const UsingTheseType = dropdownState.find(obj => obj.header === value);
      let chartTitle = '';

      chartTitle = `Sum of '${value}' by '${this.groupedBy}'`;

      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `sum-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens

      // Create and add the chart
      const newChartObject = new ChartObject(
        this.analysisType,
        chartTitle,
        chartID,
        'bar',
        data,
        labels,
        percentagesCounts,
        clusterLabels, // Pass cluster labels to ChartObject
        value,
        this.groupedBy,
        this.filteredBy
      );
      this.chartObjects.push(newChartObject);
    });
    this.prepChartContainerInStepBody(); // render clustered once the code and data is ready
  }

  addAverageChartObjects() {
    this.chartObjects = []; // Clear existing charts
    this.usingThese.forEach(value => {
      // Generate data, labels, and cluster labels for the clustered chart
      const result = this.generateAverageChartObjectDataArrayAndLabels(
        value,
        this.groupedBy,
        this.filteredBy
      );

      const data = result.data;
      const labels = result.labels;
      const clusterLabels = result.clusterLabels;
      const percentagesCounts = result.percentagesCounts;
      const UsingTheseType = dropdownState.find(obj => obj.header === value);
      let chartTitle = '';

      chartTitle = `Average of '${value}' by '${this.groupedBy}'`;

      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `averages-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens

      // Create and add the chart
      const newChartObject = new ChartObject(
        this.analysisType,
        chartTitle,
        chartID,
        'bar',
        data,
        labels,
        percentagesCounts,
        clusterLabels, // Pass cluster labels to ChartObject
        value,
        this.groupedBy,
        this.filteredBy
      );
      this.chartObjects.push(newChartObject);
    });
    this.prepChartContainerInStepBody(); // render clustered once the code and data is ready
  }


  generateSimpleChartObjectDataArrayAndLabels(header, filteredBy) {
    // Helper function to check if an object matches all the filter criteria. OR within the the same header, AND between headers
    function matchesFilter(item, filters) {
      // Loop through each filter
      for (let i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let header = filter.header;
        let value = filter.value;

        // Check if this item matches the filter
        if (item[header] === value) {
          // If it matches, continue to the next filter
          continue;
        } else {
          // If it doesn't match, check if there is another filter with the same header and a matching value
          let hasAnotherMatch = false;
          for (let j = 0; j < filters.length; j++) {
            if (
              filters[j].header === header &&
              item[header] === filters[j].value
            ) {
              hasAnotherMatch = true;
              break;
            }
          }
          // If no other match is found for the same header, return false
          if (!hasAnotherMatch) {
            return false;
          }
        }
      }

      // If the item passes all filters, return true
      return true;
    }

    // Filter the array based on applied filters
    let filteredCSVArray = []; // Initialize an empty array for filtered items
    for (let i = 0; i < parsedCSVData.length; i++) {
      let item = parsedCSVData[i]; // Get the current item from parsedCSVData
      if (matchesFilter(item, filteredBy)) {
        // Check if the item matches the filters
        filteredCSVArray.push(item); // If it matches, add it to the filtered array
      }
    }

    // Count the occurrences of each unique value for the specified header
    let countMap = {}; // Initialize an empty object for counting
    for (let i = 0; i < filteredCSVArray.length; i++) {
      let item = filteredCSVArray[i]; // Get the current item from the filtered array
      let value = item[header]; // Get the value from the curent item's usingthese header
      if (countMap[value]) {
        // If the value is already in countMap, increment its count
        countMap[value]++;
      } else {
        // Otherwise, add the value to countMap with a count of 1
        countMap[value] = 1;
      }
    }

    // Calculate the percentage for each unique value
    let totalCount = filteredCSVArray.length; // Get the total count of filtered items
    let data = []; // Initialize an array for the data
    let labels = []; // Initialize an array for the labels
    let PercentagesCounts = [];

    // Get an array of keys from the countMap object - these are the unique values of the items in the usingthese array
    let keys = Object.keys(countMap);

    // Use a standard for loop to iterate through the keys
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]; // Get the current key
      let count = countMap[key]; // Get the count for the current key
      let percentage = Math.round(count / totalCount * 100); // Calculate the percentage
      let percentageCount = `${percentage}% (${count})`; //merge percentage and count - useful for data labels later
      data.push(percentage); // Add the percentage to the data array
      labels.push(key); // Add the key to the labels array
      PercentagesCounts.push(percentageCount);
    }

    // Sort data and labels in descending order based on data values
    let sortedIndices = []; // Initialize an array for sorted indices
    for (let i = 0; i < data.length; i++) {
      sortedIndices.push(i); // Add the index to the sortedIndices array
    }
    sortedIndices.sort(function (a, b) {
      // Sort the indices based on data values
      return data[b] - data[a]; // Sort in descending order
    });

    let sortedData = []; // Initialize an array for sorted data
    let sortedLabels = []; // Initialize an array for sorted labels
    let sortedPercentagesCounts = [];
    for (let i = 0; i < sortedIndices.length; i++) {
      let index = sortedIndices[i]; // Get the current sorted index
      sortedData.push(data[index]); // Add the sorted data value to sortedData array
      sortedLabels.push(labels[index]); // Add the sorted label to sortedLabels array
      sortedPercentagesCounts.push(PercentagesCounts[index]);
    }

    return {
      data: sortedData, // Return the sorted data array
      labels: sortedLabels, // Return the sorted labels array
      PercentagesCounts: sortedPercentagesCounts, // return the sorted array of percentages and counts
    };
  }

  generateNumberChartObjectDataArrayAndLabels(header, filteredBy) {
    // Helper function to check if an object matches all the filter criteria. OR within the the same header, AND between headers
    function matchesFilter(item, filters) {
      // Loop through each filter
      for (let i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let header = filter.header;
        let value = filter.value;

        // Check if this item matches the filter
        if (item[header] === value) {
          // If it matches, continue to the next filter
          continue;
        } else {
          // If it doesn't match, check if there is another filter with the same header and a matching value
          let hasAnotherMatch = false;
          for (let j = 0; j < filters.length; j++) {
            if (
              filters[j].header === header &&
              item[header] === filters[j].value
            ) {
              hasAnotherMatch = true;
              break;
            }
          }
          // If no other match is found for the same header, return false
          if (!hasAnotherMatch) {
            return false;
          }
        }
      }

      // If the item passes all filters, return true
      return true;
    }

    // Filter the array based on applied filters
    let filteredCSVArray = []; // Initialize an empty array for filtered items
    for (let i = 0; i < parsedCSVData.length; i++) {
      let item = parsedCSVData[i]; // Get the current item from parsedCSVData
      if (matchesFilter(item, filteredBy)) {
        // Check if the item matches the filters
        filteredCSVArray.push(item); // If it matches, add it to the filtered array
      }
    }
    console.log('filtered csv array', filteredCSVArray);

    const numbers = filteredCSVArray.map(obj => Number(obj[header].trim()));
    console.log('numbers: ', numbers);
    // Step 1: Calculate the range of the data
    const minValue = Math.min(...numbers);
    const maxValue = Math.max(...numbers);
    const dataRange = maxValue - minValue;

    // Step 2: Calculate the number of bins dynamically
    let numBins = Math.min(Math.ceil(1 + Math.log2(numbers.length)), 20); // Sturges' Rule with a cap at 20

    // Step 3: Calculate the bin width without rounding
    const binSize = dataRange / numBins;

    // Step 4: Create the bins dynamically
    const bins = [];
    for (let i = minValue; i <= maxValue; i += binSize) {
      bins.push(i);
    }

    // Step 5: Count how many values fall into each bin
    const frequencies = new Array(bins.length - 1).fill(0);
    numbers.forEach(value => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (value >= bins[i] && value < bins[i + 1]) {
          frequencies[i] += 1;
          break;
        }
      }
      if (value === maxValue) frequencies[frequencies.length - 1] += 1; // Edge case for max value
    });

    // Step 6: Prepare the labels as ranges for x-axis, adjusting the final bin to include maxValue
    const binRanges = bins.slice(0, -1).map((bin, index) => {
      if (index === bins.length - 2) { // Last bin
        return `${Math.floor(bin)}-${maxValue}`;
      }
      return `${Math.floor(bin)}-${Math.floor(bins[index + 1] - 1)}`;
    });
    console.log('data: ', frequencies);
    console.log('labels: ', binRanges);

    return {
      data: frequencies,
      labels: binRanges,
    };
  }

  generateComparativeChartObjectDataArrayAndLabels(header, groupedBy, filteredBy) {
    // Updated function to check if an item matches all filters
    function matchesFilter(item, filters) {
      // Loop through each filter
      for (let i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let filterHeader = filter.header;
        let filterValue = filter.value;

        // Check if this item matches the filter
        if (item[filterHeader] === filterValue) {
          // If it matches, continue to the next filter
          continue;
        } else {
          // If it doesn't match, check if there is another filter with the same header and a matching value
          let hasAnotherMatch = false;
          for (let j = 0; j < filters.length; j++) {
            if (
              filters[j].header === filterHeader &&
              item[filterHeader] === filters[j].value
            ) {
              hasAnotherMatch = true;
              break;
            }
          }
          // If no other match is found for the same header, return false
          if (!hasAnotherMatch) {
            return false;
          }
        }
      }

      // If the item passes all filters, return true
      return true;
    }

    // Filter the data based on applied filters
    const filteredData = [];
    for (let i = 0; i < parsedCSVData.length; i++) {
      let item = parsedCSVData[i];
      if (matchesFilter(item, filteredBy)) {
        filteredData.push(item);
      }
    }
    console.log('Filtered data:', filteredData);


    // Create a map to count occurrences for each group
    const groupCounts = {};
    const valueCounts = {}; // To store total counts for each value across all groups

    for (let i = 0; i < filteredData.length; i++) {
      let item = filteredData[i];
      let group = item[header];
      let value = item[groupedBy];

      // Initialize group key if not present
      if (!groupCounts[group]) {
        groupCounts[group] = {};
      }

      // Initialize value count if not present
      if (!groupCounts[group][value]) {
        groupCounts[group][value] = 0;
      }

      // Increment the count for the current value in the group
      groupCounts[group][value]++;

      // Increment the total count for the current value across all groups
      if (!valueCounts[value]) {
        valueCounts[value] = 0;
      }
      valueCounts[value]++;
    }

    // Prepare labels and data arrays
    const labels = Object.keys(valueCounts);

    const clusterLabels = Object.keys(groupCounts);

    // Create data and PercentagesCounts arrays
    const data = [];
    const percentagesCounts = [];
    for (let i = 0; i < clusterLabels.length; i++) {
      let groupKey = clusterLabels[i];
      let groupData = [];
      let groupPercentagesCounts = [];
      for (let j = 0; j < labels.length; j++) {
        let label = labels[j];
        let count = groupCounts[groupKey][label] || 0;
        let total = valueCounts[label];
        let percentage = total > 0 ? Math.round(count / total * 100) : 0;

        groupData.push(percentage);
        groupPercentagesCounts.push(`${percentage}% (${count})`); // Concatenate percentage and count
      }
      data.push(groupData);
      percentagesCounts.push(groupPercentagesCounts);
    }


    return {
      data, // Array of arrays with percentages for each group
      labels, // Labels for data points
      clusterLabels, // Labels for each group
      percentagesCounts, // Array of arrays with percentage and count strings for each group
    };



  }

  generateSumChartObjectDataArrayAndLabels(header, groupedBy, filteredBy) {
    // Updated function to check if an item matches all filters
    function matchesFilter(item, filters) {
      // Loop through each filter
      for (let i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let filterHeader = filter.header;
        let filterValue = filter.value;

        // Check if this item matches the filter
        if (item[filterHeader] === filterValue) {
          // If it matches, continue to the next filter
          continue;
        } else {
          // If it doesn't match, check if there is another filter with the same header and a matching value
          let hasAnotherMatch = false;
          for (let j = 0; j < filters.length; j++) {
            if (
              filters[j].header === filterHeader &&
              item[filterHeader] === filters[j].value
            ) {
              hasAnotherMatch = true;
              break;
            }
          }
          // If no other match is found for the same header, return false
          if (!hasAnotherMatch) {
            return false;
          }
        }
      }

      // If the item passes all filters, return true
      return true;
    }

    // Filter the data based on applied filters
    const filteredData = [];
    for (let i = 0; i < parsedCSVData.length; i++) {
      let item = parsedCSVData[i];
      if (matchesFilter(item, filteredBy)) {
        filteredData.push(item);
      }
    }
    console.log('Filtered data:', filteredData);

    const headerType = dropdownState.find(item => item.header === header).value;
    console.log('dropdownState: ', dropdownState);

    // Create a map to sum values for each group
    const groupSums = {};

    for (let i = 0; i < filteredData.length; i++) {
      let item = filteredData[i];
      let group = item[groupedBy];
      let value = parseFloat(item[header]); // Convert to float to handle numerical values

      // Check if the value is a number
      if (isNaN(value)) {
        console.warn(`Non-numeric value found for ${header}:`, item[header]);
        continue; // Skip this item if the value is not a number
      }

      // Initialize group key if not present
      if (!groupSums[group]) {
        groupSums[group] = 0;
      }

      // Increment the sum for the current value in the group
      groupSums[group] += value; // Sum the numerical values
      
    }

    //round as needed to the nearest decimal if applicable

    const groupNames = new Set(filteredData.map(row => row[groupedBy]));
    groupNames.forEach(group => {
      groupSums[group]= Math.round(groupSums[group] * 100) / 100;
    })


    // Prepare labels and data arrays
    const labels = Object.keys(groupSums); // Unique groups for cluster labels
    const data = labels.map(groupKey => groupSums[groupKey]); // Sums for each group
    const clusterLabels = data;

    return {
      data, // Array with sums for each group
      labels,
      clusterLabels// Labels for each group
    };

  }


  generateAverageChartObjectDataArrayAndLabels(header, groupedBy, filteredBy) {
    // Updated function to check if an item matches all filters
    function matchesFilter(item, filters) {
      // Loop through each filter
      for (let i = 0; i < filters.length; i++) {
        let filter = filters[i];
        let filterHeader = filter.header;
        let filterValue = filter.value;

        // Check if this item matches the filter
        if (item[filterHeader] === filterValue) {
          // If it matches, continue to the next filter
          continue;
        } else {
          // If it doesn't match, check if there is another filter with the same header and a matching value
          let hasAnotherMatch = false;
          for (let j = 0; j < filters.length; j++) {
            if (
              filters[j].header === filterHeader &&
              item[filterHeader] === filters[j].value
            ) {
              hasAnotherMatch = true;
              break;
            }
          }
          // If no other match is found for the same header, return false
          if (!hasAnotherMatch) {
            return false;
          }
        }
      }

      // If the item passes all filters, return true
      return true;
    }

    // Filter the data based on applied filters
    const filteredData = [];
    for (let i = 0; i < parsedCSVData.length; i++) {
      let item = parsedCSVData[i];
      if (matchesFilter(item, filteredBy)) {
        filteredData.push(item);
      }
    }
    console.log('Filtered data:', filteredData);

    const headerType = dropdownState.find(item => item.header === header).value;
    console.log('dropdownState: ', dropdownState);

    // Create a map to sum values for each group
    const groupSums = {};
    const groupCounts = {};
    const groupAverages = {};

    for (let i = 0; i < filteredData.length; i++) {
      let item = filteredData[i];
      let group = item[groupedBy];
      let value = parseFloat(item[header]); // Convert to float to handle numerical values

      // Check if the value is a number
      if (isNaN(value)) {
        console.warn(`Non-numeric value found for ${header}:`, item[header]);
        continue; // Skip this item if the value is not a number
      }

      // Initialize group key if not present
      if (!groupSums[group]) {
        groupSums[group] = 0;
        groupCounts[group] = 0;
        groupAverages[group] = 0;
      }

      // Increment the sum for the current value in the group
      groupSums[group] += value; // Sum the numerical values
      groupCounts[group] += 1;
    }

    const groupNames = new Set(filteredData.map(row => row[groupedBy]));
    groupNames.forEach(group => {
      groupAverages[group] = Math.round(groupSums[group] / groupCounts[group] * 100) / 100;
    })

    // Prepare labels and data arrays
    const labels = Object.keys(groupAverages); // Unique groups for cluster labels
    const data = labels.map(groupKey => groupAverages[groupKey]); // Sums for each group
    const clusterLabels = data;

    return {
      data, // Array with sums for each group
      labels,
      clusterLabels// Labels for each group
    };
  }

  // Function to render all chart objects
  prepChartContainerInStepBody() {
    // Find the step-body container where the cards will be appended
    const stepBody = document.getElementById('step-body');
    let cardsContainer = document.getElementById('step-body-cards-container');

    if (cardsContainer) {
      //if the cards container was created in a previous call, empty it.
      cardsContainer.innerHTML = '';
    } else {
      //if the cards container doesn't exist, create it within the stepbody div
      cardsContainer = document.createElement('div');
      cardsContainer.id = 'step-body-cards-container';
      stepBody.appendChild(cardsContainer);
    }

    if (this.analysisType === 'simple') {
      this.chartObjects.forEach(chart => {
        renderSimpleChartInCard(chart, cardsContainer);
      });
    }
    if (this.analysisType === 'number') {
      this.chartObjects.forEach(chart => {
        renderNumberChartInCard(chart, cardsContainer);
      });
    }
    if (this.analysisType === 'comparative') {
      this.chartObjects.forEach(chart => {
        renderComparativeChartInCard(chart, cardsContainer);
      });
    }
    if (this.analysisType === 'sum-comparative') {
      this.chartObjects.forEach(chart => {
        renderSumAvgChartInCard(chart, cardsContainer);
      });
    }
    if (this.analysisType === 'average-comparative') {
      this.chartObjects.forEach(chart => {
        renderSumAvgChartInCard(chart, cardsContainer);
      });
    }
  }

}

// Function to create and add a new Analysis object
function createAnalysisObject() {
  const newAnalysis = new AnalysisObject();
  analysisObjects.push(newAnalysis);
  console.log(newAnalysis); // Log the new object to the console
  return newAnalysis; // Optionally return the new object
}

// Function to update an existing AnalysisObject by ID
function updateAnalysisObjectById(id, updates) {
  const analysis = analysisObjects.find(obj => obj.id === id);
  if (analysis) {
    // Apply updates only for the properties provided in the updates object
    const { analysisType, usingThese, groupedBy, filteredBy, label } = updates;
    analysis.updateAnalysisObject(
      analysisType !== undefined ? analysisType : analysis.analysisType,
      usingThese !== undefined ? usingThese : analysis.usingThese,
      groupedBy !== undefined ? groupedBy : analysis.groupedBy,
      filteredBy !== undefined ? filteredBy : analysis.filteredBy,
      label !== undefined ? label : analysis.label
    );
  } else {
    console.error('AnalysisObject not found');
  }
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

// boilerplate for charts we create via the generic dropdown option.
class ChartObject {
  constructor(analysisType, title, id, type, data, labels, percentagesCounts, clusterLabels, usingThese, groupedBy, filteredBy) {
    this.analysisType = analysisType;
    this.title = title; // Title of the chart
    this.id = id;
    this.type = type; // Type of the chart (e.g., 'bar', 'line')
    this.data = data; // Data required for chart generation
    this.labels = labels; // Data required for chart generation
    this.percentagesCounts = percentagesCounts; // Labels for the data points
    this.clusterLabels = clusterLabels; // New property for cluster labels
    this.usingThese = usingThese;
    this.groupedBy = groupedBy;
    this.filteredBy = filteredBy;
    this.backgroundColor = 'rgba(36, 123, 160, 0.2)'; //
    this.borderColor = 'rgba(36, 123, 160, 1)'; //
    this.borderWidth = 1;
    this.bookmarked = false;
    this.chartType = 'horizontal-bars';
    this.verticalColumnChartOptions = {
      plugins: {
        legend: {
          display: false,
        },
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 90,        // Rotates the labels vertically
          color: 'black',
          anchor: 'start',
          align: 'end',
          formatter: (value, context) => {
            // Use percentagesCounts based on the index of the current data point
            return this.percentagesCounts[context.dataIndex];
          },
        },
      },
      indexAxis: 'x', // Make it a horizontal bar chart
      scales: {
        y: {
          // Make the data appear as percentages
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              // Format the x-axis ticks as percentages
              return value.toFixed(0) + '%';
            },
          },
        },
        x: {
          // You can customize the axis as needed
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5,
        },
      },
      responsive: true, // Ensure the chart is  responsive
    };

    this.horizontalBarChartOptions = {
      plugins: {
        legend: {
          display: false,
        },
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 0,        // Rotates the labels vertically
          color: 'black',
          anchor: 'start',
          align: 'end',
          formatter: (value, context) => {
            // Use percentagesCounts based on the index of the current data point
            return this.percentagesCounts[context.dataIndex];
          },
        },
      },
      indexAxis: 'y', // Make it a horizontal bar chart
      scales: {
        x: {
          // Make the data appear as percentages
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              // Format the x-axis ticks as percentages
              return value.toFixed(0) + '%';
            },
          },
        },
        y: {
          // You can customize the axis as needed
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 3,
        },
      },
      responsive: true, // Ensure the chart is  responsive
    };

    this.numberChartOptions = {
      plugins: {
        legend: {
          display: false,
        },
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 90,        // Rotates the labels vertically

          color: 'black',
          anchor: 'start',
          align: 'end',

        },
      },
      indexAxis: 'x', // Make it a horizontal bar chart
      scales: {
        y: {
          // Make the data appear as percentages
          beginAtZero: true,

        },
        y: {
          // You can customize the y-axis as needed
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5,
        },
      },
      responsive: true, // Ensure the chart is  responsive
    };

    this.horizontalCalculationBarChartOptions = {
      plugins: {
        legend: {
          display: false,
        },
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 0,        // Rotates the labels vertically

          color: 'black',
          anchor: 'start',
          align: 'end',

        },
      },
      indexAxis: 'y', // Make it a horizontal bar chart
      scales: {
        x: {
          // Make the data appear as percentages
          beginAtZero: true,

        },
        y: {
          // You can customize the y-axis as needed
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 3,
        },
      },
      responsive: true, // Ensure the chart is  responsive
    };

    this.verticalCalculationBarChartOptions = {
      plugins: {
        legend: {
          display: false,
        },
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 0,        // Rotates the labels vertically

          color: 'black',
          anchor: 'start',
          align: 'end',

        },
      },
      indexAxis: 'x', // Make it a horizontal bar chart
      scales: {
        y: {
          // Make the data appear as percentages
          beginAtZero: true,

        },
        x: {
          // You can customize the y-axis as needed
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 3,
        },
      },
      responsive: true, // Ensure the chart is  responsive
    };


    this.clusteredBarChartOptions = {
      responsive: true,
      indexAxis: 'x', // Set to 'y' for horizontal bars
      scales: {
        y: {
          stacked: false, // Bars should not be stacked
          ticks: {
            autoSkip: false, // Ensure all x-axis labels are visible
            callback: function (value) {
              // Format the x-axis ticks as percentages
              return value.toFixed(0) + '%';
            },
          },
        },
        x: {
          stacked: false, // Bars should not be stacked
          beginAtZero: true,
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5,
        },
      },
      plugins: {
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 90,        // Rotates the labels vertically
          color: 'black',
          anchor: 'start',
          align: 'end',
          formatter: (value, context) => {
            // Use percentagesCounts array to get the correct label
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            return this.percentagesCounts[datasetIndex][dataIndex];
          },
        },
        legend: {
          position: 'top',
        },
      },
    };

    this.horizontalClusteredBarChartOptions = {
      responsive: true,
      indexAxis: 'y', // Set to 'y' for horizontal bars
      scales: {
        x: {
          stacked: false, // Bars should not be stacked
          ticks: {
            autoSkip: false, // Ensure all x-axis labels are visible
            callback: function (value) {
              // Format the x-axis ticks as percentages
              return value.toFixed(0) + '%';
            },
          },
        },
        y: {
          stacked: false, // Bars should not be stacked
          beginAtZero: true,
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5,
        },
      },
      plugins: {
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 0,        // Rotates the labels vertically
          color: 'black',
          anchor: 'start',
          align: 'end',
          formatter: (value, context) => {
            // Use percentagesCounts array to get the correct label
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            return this.percentagesCounts[datasetIndex][dataIndex];
          },
        },
        legend: {
          position: 'top',
        },
      },
    };

    this.verticalClusteredColumnChartOptions = {
      responsive: true,
      indexAxis: 'x', // Set to 'y' for horizontal bars
      scales: {
        y: {
          stacked: false, // Bars should not be stacked
          ticks: {
            autoSkip: false, // Ensure all x-axis labels are visible
            callback: function (value) {
              // Format the x-axis ticks as percentages
              return value.toFixed(0) + '%';
            },
          },
        },
        x: {
          stacked: false, // Bars should not be stacked
          beginAtZero: true,
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5,
        },
      },
      plugins: {
        // Change options for ALL labels of THIS CHART
        datalabels: {
          rotation: 90,        // Rotates the labels vertically
          color: 'black',
          anchor: 'start',
          align: 'end',
          formatter: (value, context) => {
            // Use percentagesCounts array to get the correct label
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            return this.percentagesCounts[datasetIndex][dataIndex];
          },
        },
        legend: {
          position: 'top',
        },
      },
    };
  }
}

function // Function to create and render a chart in a Bootstrap card component and append to 'step-body'
  renderSimpleChartInCard(chartObject, container) {

  // Create the card element
  const card = document.createElement('div');
  card.classList.add('card', 'mt-4'); // Add Bootstrap card and margin classes

  // Create the card body element
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  //create the options, title and filters rows and columns - append to body
  const cardOptionsRow = document.createElement('div');
  cardOptionsRow.className = 'row';
  const cardTitleRow = document.createElement('div');
  cardTitleRow.className = 'row';
  const cardFiltersRow = document.createElement('div');
  cardFiltersRow.className = 'row';
  cardBody.appendChild(cardOptionsRow);
  cardBody.appendChild(cardTitleRow);
  cardBody.appendChild(cardFiltersRow);

  // Append the card body to the card
  card.appendChild(cardBody);

  // Append the card to the container
  container.appendChild(card);

  const cardOptionsColumn = document.createElement('div');
  cardOptionsColumn.classList.add(
    'col-md-12',
    'd-flex',
    'justify-content-end'
  );
  const cardTitleColumn = document.createElement('div');
  cardTitleColumn.classList.add('col-12');
  const cardFiltersColumn = document.createElement('div');
  cardFiltersColumn.classList.add('col-12');
  cardOptionsRow.appendChild(cardOptionsColumn);
  cardTitleRow.appendChild(cardTitleColumn);
  cardFiltersRow.appendChild(cardFiltersColumn);

  //create the chart type button
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.classList.add('dropdown', 'me-2');

  // Create the dropdown button
  const dropdownButton = document.createElement('button');
  dropdownButton.id = 'chartTypeDropdown-' + chartObject.id;
  dropdownButton.classList.add('btn', 'btn-secondary', 'dropdown-toggle');
  dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
  if (chartObject.chartType === "horizontal-bars") {
    dropdownButton.textContent = 'Horizontal Bars';
  }
  if (chartObject.chartType === 'vertical-columns') {
    dropdownButton.textContent = 'Vertical Columns';
  }
  // Create the dropdown menu with options
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.classList.add('dropdown-menu');

  const horizontalBarDropdownLink = document.createElement('li');
  dropdownMenu.appendChild(horizontalBarDropdownLink);
  const horizontalBarAnchor = document.createElement('a');
  horizontalBarAnchor.id = 'horizontalBarAnchor-' + chartObject.id;
  horizontalBarAnchor.textContent = 'Horizontal Bars';
  horizontalBarAnchor.className = 'dropdown-item';
  horizontalBarDropdownLink.appendChild(horizontalBarAnchor);

  const verticalColumnDropdownLink = document.createElement('li');
  dropdownMenu.appendChild(verticalColumnDropdownLink);
  const verticalColumnAnchor = document.createElement('a');
  verticalColumnAnchor.id = 'verticalColumnAnchor-' + chartObject.id;
  verticalColumnAnchor.textContent = 'Vertical Columns';
  verticalColumnAnchor.className = 'dropdown-item';
  verticalColumnDropdownLink.appendChild(verticalColumnAnchor);

  dropdownWrapper.appendChild(dropdownButton);
  dropdownWrapper.appendChild(dropdownMenu);
  cardOptionsColumn.appendChild(dropdownWrapper);

  //create listener function that recreates the canvas upon updating the option

  horizontalBarAnchor.addEventListener('click', function () {

    dropdownButton.textContent = 'Horizontal Bars';
    chartObject.chartType = 'horizontal-bars';
    createCanvas();

    //if applicable, update the corresponding bookmark's charttype attribute 
    const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
    if (bookmark) {
      bookmark.chartType = chartObject.chartType;
    }
  })


  verticalColumnAnchor.addEventListener('click', function () {
    dropdownButton.textContent = 'Vertical Columns';
    chartObject.chartType = 'vertical-columns';
    createCanvas();
    //if applicable, update the corresponding bookmark's charttype attribute 
    const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
    if (bookmark) {
      bookmark.chartType = chartObject.chartType;
    }
  })

  //create the bookmark button and set whether it's active or not
  const bookmarkButton = document.createElement('button');
  bookmarkButton.classList.add('btn', 'btn-secondary');
  bookmarkButton.setAttribute('bookmarkButtonIdentifier', chartObject.id);
  const isChartBookmarked = bookmarks.some(obj => obj.id === chartObject.id);
  if (isChartBookmarked) {
    bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'true');
    bookmarkButton.classList.remove('btn-secondary');
    bookmarkButton.classList.add('btn-primary');
  } else {
    bookmarkButton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'false');
  }
  cardOptionsColumn.appendChild(bookmarkButton);

  bookmarkButton.addEventListener('click', function () {
    addRemoveBookmark(bookmarkButton, chartObject);
  });

  //create the title
  const cardTitle = document.createElement('h5');
  cardTitle.textContent = chartObject.title;
  cardTitleColumn.appendChild(cardTitle);

  //create filter badges as needed
  const filters = chartObject.filteredBy;

  for (let i = 0; i < filters.length; i++) {
    const cardFilter = document.createElement('span');
    cardFilter.className = 'filter-badge'; // Apply the custom class
    cardFilter.textContent = filters[i].value;
    cardFiltersColumn.appendChild(cardFilter);
  }

  function createCanvas() {

    const existingCanvas = cardBody.querySelector('canvas'); //check in this cardBody to see if there's already a canvas (in case we are changing type)
    if (existingCanvas) {
      cardBody.removeChild(existingCanvas);
    }
    const canvas = document.createElement('canvas');

    if (container.id === 'step-body-cards-container') {
      canvas.id = 'canvas-' + chartObject.id;
    }
    if (container === 'bookmarksBodyColumn') {
      canvas.id = 'bookmarked-canvas-' + chartObject.id;
    }
    canvas.style.width = '100%'; // Full width

    //canvas height depends on the type of chart we're displaying
    let barOptions = '';
    if (chartObject.chartType === 'horizontal-bars') {
      canvas.style.height = `${chartObject.data.length * 40 + 50}px`; // Set the height dynamically
      barOptions = chartObject.horizontalBarChartOptions;
    }
    else {
      canvas.style.height = '350px';
      barOptions = chartObject.verticalColumnChartOptions;
    }

    //calculate how many bars there will be and use that to calculate the canvas height

    // Append the canvas to the card body
    cardBody.appendChild(canvas);



    // Render the chart on the canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    new Chart(ctx, { //new chart in canvas
      //create a new chart using the properties of the chartObject being called as an argument in the function
      type: chartObject.type,
      data: {
        labels: chartObject.labels,
        datasets: [
          {
            label: chartObject.title, //the tooltip label is just the series title
            data: chartObject.data,
            backgroundColor: chartObject.backgroundColor,
            borderColor: chartObject.borderColor,
            borderWidth: chartObject.borderWidth,
            maxBarThickness: 50
          },
        ],
      },
      options: barOptions,
    });

  }
  createCanvas();

}

function renderNumberChartInCard(chartObject, container) {

  // Create the card element
  const card = document.createElement('div');
  card.classList.add('card', 'mt-4'); // Add Bootstrap card and margin classes

  // Create the card body element
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  //create the options, title and filters rows and columns - append to body
  const cardOptionsRow = document.createElement('div');
  cardOptionsRow.className = 'row';
  const cardTitleRow = document.createElement('div');
  cardTitleRow.className = 'row';
  const cardFiltersRow = document.createElement('div');
  cardFiltersRow.className = 'row';
  cardBody.appendChild(cardOptionsRow);
  cardBody.appendChild(cardTitleRow);
  cardBody.appendChild(cardFiltersRow);

  const cardOptionsColumn = document.createElement('div');
  cardOptionsColumn.classList.add(
    'col-12',
    'd-flex',
    'justify-content-end'
  );
  const cardTitleColumn = document.createElement('div');
  cardTitleColumn.classList.add('col-12');
  const cardFiltersColumn = document.createElement('div');
  cardFiltersColumn.classList.add('col-12');
  cardOptionsRow.appendChild(cardOptionsColumn);
  cardTitleRow.appendChild(cardTitleColumn);
  cardFiltersRow.appendChild(cardFiltersColumn);

  //create the chart type button
  const chartButton = document.createElement('button');
  chartButton.classList.add('btn', 'btn-secondary', 'me-2', 'disabled');
  chartButton.textContent = 'Area';
  cardOptionsColumn.appendChild(chartButton);

  //create the bookmark button and set whether it's active or not
  const bookmarkButton = document.createElement('button');
  bookmarkButton.classList.add('btn', 'btn-secondary');
  bookmarkButton.setAttribute('bookmarkButtonIdentifier', chartObject.id);
  const isChartBookmarked = bookmarks.some(obj => obj.id === chartObject.id);
  if (isChartBookmarked) {
    bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'true');
    bookmarkButton.classList.remove('btn-secondary');
    bookmarkButton.classList.add('btn-primary');
  } else {
    bookmarkButton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'false');
  }
  cardOptionsColumn.appendChild(bookmarkButton);

  bookmarkButton.addEventListener('click', function () {
    addRemoveBookmark(bookmarkButton, chartObject);
  });

  //create the title
  const cardTitle = document.createElement('h5');
  cardTitle.textContent = chartObject.title;
  cardTitleColumn.appendChild(cardTitle);

  //create filter badges as needed
  const filters = chartObject.filteredBy;

  for (let i = 0; i < filters.length; i++) {
    const cardFilter = document.createElement('span');
    cardFilter.className = 'filter-badge'; // Apply the custom class
    cardFilter.textContent = filters[i].value;
    cardFiltersColumn.appendChild(cardFilter);
  }

  // Create the canvas element
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%'; // Full width

  //calculate how many bars there will be and use that to calculate the canvas height
  canvas.style.height = `350px`; //will be 100px if filters return no data and 125px if they return 1 bar

  // Append the canvas to the card body
  cardBody.appendChild(canvas);

  // Append the card body to the card
  card.appendChild(cardBody);

  // Append the card to the container
  container.appendChild(card);

  // Render the chart on the canvas
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  //create min y value
  const minDataValue = Math.min(...chartObject.data);
  const yMinValue = minDataValue > 100 ? minDataValue * 0.9 : 0; // Adjusts to 90% of the min value, or 0 if min is small


  new Chart(ctx, {
    type: chartObject.type,
    data: {
      labels: chartObject.labels,
      datasets: [
        {
          label: chartObject.title,
          data: chartObject.data,
          fill: true,
          borderColor: 'rgba(36, 123, 160, 1)',
          backgroundColor: 'rgba(36, 123, 160, 0.2)',
          tension: 0.4
        }
      ]
    },

    options: {
      plugins: {

        datalabels: {
          display: false
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          min: yMinValue,
          ticks: {
            stepSize: 1, // Set tick interval to 1
            callback: function (value) {
              return Number.isInteger(value) ? value : null; // Show only integer values
            }
          }
        }
      }
    }
  });

}

// Function to create and render a horizontal clustered bar chart in a Bootstrap card component and append to 'step-body'
function renderComparativeChartInCard(chartObject, container) {

  //some renderings will depend on the usingthese datatype
  const UsingTheseType = dropdownState.find(obj => obj.header === chartObject.usingThese);

  // Create the card element
  const card = document.createElement('div');
  card.classList.add('card', 'mt-4'); // Add Bootstrap card and margin classes

  // Create the card body element
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  //create the options, title and filters rows and columns - append to body
  const cardOptionsRow = document.createElement('div');
  cardOptionsRow.className = 'row';
  const cardTitleRow = document.createElement('div');
  cardTitleRow.className = 'row';
  const cardFiltersRow = document.createElement('div');
  cardFiltersRow.className = 'row';
  cardBody.appendChild(cardOptionsRow);
  cardBody.appendChild(cardTitleRow);
  cardBody.appendChild(cardFiltersRow);

  const cardOptionsColumn = document.createElement('div');
  cardOptionsColumn.classList.add(
    'col-12',
    'd-flex',
    'justify-content-end'
  );
  const cardTitleColumn = document.createElement('div');
  cardTitleColumn.classList.add('col-12');
  const cardFiltersColumn = document.createElement('div');
  cardFiltersColumn.classList.add('col-12');
  cardOptionsRow.appendChild(cardOptionsColumn);
  cardTitleRow.appendChild(cardTitleColumn);
  cardFiltersRow.appendChild(cardFiltersColumn);

  //set chartType to horizontal clusters
  chartObject.chartType = 'horizontal-clusters';


  //create the chart type button
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.classList.add('dropdown', 'me-2');

  // Create the dropdown button
  const dropdownButton = document.createElement('button');
  dropdownButton.id = 'chartTypeDropdown-' + chartObject.id;
  dropdownButton.classList.add('btn', 'btn-secondary', 'dropdown-toggle');
  dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
  if (chartObject.chartType === "horizontal-clusters") {
    dropdownButton.textContent = 'Horizontal Clusters';
  }
  if (chartObject.chartType === 'vertical-clusters') {
    dropdownButton.textContent = 'Vertical Clusters';
  }
  // Create the dropdown menu with options
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.classList.add('dropdown-menu');

  const horizontalBarDropdownLink = document.createElement('li');
  dropdownMenu.appendChild(horizontalBarDropdownLink);
  const horizontalBarAnchor = document.createElement('a');
  horizontalBarAnchor.id = 'horizontalBarAnchor-' + chartObject.id;
  horizontalBarAnchor.textContent = 'Horizontal Clusters';
  horizontalBarAnchor.className = 'dropdown-item';
  horizontalBarDropdownLink.appendChild(horizontalBarAnchor);

  const verticalColumnDropdownLink = document.createElement('li');
  dropdownMenu.appendChild(verticalColumnDropdownLink);
  const verticalColumnAnchor = document.createElement('a');
  verticalColumnAnchor.id = 'verticalColumnAnchor-' + chartObject.id;
  verticalColumnAnchor.textContent = 'Vertical Clusters';
  verticalColumnAnchor.className = 'dropdown-item';
  verticalColumnDropdownLink.appendChild(verticalColumnAnchor);

  dropdownWrapper.appendChild(dropdownButton);
  dropdownWrapper.appendChild(dropdownMenu);
  cardOptionsColumn.appendChild(dropdownWrapper);

  //create listener function that recreates the canvas upon updating the option

  horizontalBarAnchor.addEventListener('click', function () {

    dropdownButton.textContent = 'Horizontal Clusters';
    chartObject.chartType = 'horizontal-clusters';
    createCanvas();

    //if applicable, update the corresponding bookmark's charttype attribute 
    const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
    if (bookmark) {
      bookmark.chartType = chartObject.chartType;
    }
  })


  verticalColumnAnchor.addEventListener('click', function () {
    dropdownButton.textContent = 'Vertical Clusters';
    chartObject.chartType = 'vertical-clusters';
    createCanvas();
    //if applicable, update the corresponding bookmark's charttype attribute 
    const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
    if (bookmark) {
      bookmark.chartType = chartObject.chartType;
    }
  })



  //create the bookmark button and set whether it's active or not
  const bookmarkButton = document.createElement('button');
  bookmarkButton.classList.add('btn', 'btn-secondary');
  bookmarkButton.setAttribute('bookmarkButtonIdentifier', chartObject.id);
  const isChartBookmarked = bookmarks.some(obj => obj.id === chartObject.id);
  if (isChartBookmarked) {
    bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'true');
    bookmarkButton.classList.remove('btn-secondary');
    bookmarkButton.classList.add('btn-primary');
  } else {
    bookmarkButton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'false');
  }
  cardOptionsColumn.appendChild(bookmarkButton);
  bookmarkButton.addEventListener('click', function () {
    addRemoveBookmark(bookmarkButton, chartObject);
  });

  //create the title
  const cardTitle = document.createElement('h5');
  cardTitle.textContent = chartObject.title;
  cardTitleColumn.appendChild(cardTitle);

  //create filter badges as needed
  const filters = chartObject.filteredBy;

  for (let i = 0; i < filters.length; i++) {
    const cardFilter = document.createElement('span');
    cardFilter.className = 'filter-badge'; // Apply the custom class
    cardFilter.textContent = filters[i].value;
    cardFiltersColumn.appendChild(cardFilter);
  }

  function createCanvas(){

    const existingCanvas = cardBody.querySelector('canvas'); //check in this cardBody to see if there's already a canvas (in case we are changing type)
    if (existingCanvas) {
      cardBody.removeChild(existingCanvas);
    }
    // Create the canvas element
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%'; // Full width
    let barOptions = '';

    if (chartObject.chartType === 'horizontal-clusters') {
      canvas.style.height = `${chartObject.data.length * chartObject.data[0].length * 40 + 50}px`; // Set the height dynamically
      barOptions = chartObject.horizontalClusteredBarChartOptions;

    }
    else {
      canvas.style.height = '350px';
      barOptions = chartObject.verticalClusteredColumnChartOptions;

    }
   

    //calculate how many bars there will be and use that to calculate the canvas height
    let totalArrayValues = 0;
    chartObject.data.forEach(subArray => {
      totalArrayValues += subArray.length;
    });

    // Append the canvas to the card body
    cardBody.appendChild(canvas);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the container
    container.appendChild(card);

    // Render the chart on the canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Create the datasets for each cluster
    const datasets = chartObject.data.map((clusterData, index) => {
      // Cycle through colorPalette for background and border colors
      const colorIndex = index % colorPalette.length;
      const backgroundColor = colorPaletteWithOpacity[colorIndex];
      const borderColor = colorPalette[colorIndex];

      return {
        label: chartObject.clusterLabels[index], // Label for the cluster
        data: clusterData,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1, // Fixed border width
        maxBarThickness: 50,
      };
    });

    let chartOptions = '';


    new Chart(ctx, { //new chart in canvas
      type: 'bar', // Use 'bar' type for horizontal bar chart
      data: {
        labels: chartObject.labels,
        datasets: datasets,
      },
      options: barOptions,
    });
  }
  createCanvas();

}
function renderSumAvgChartInCard(chartObject, container) {

  //some renderings will depend on the usingthese datatype
  const UsingTheseType = dropdownState.find(obj => obj.header === chartObject.usingThese);

  // Create the card element
  const card = document.createElement('div');
  card.classList.add('card', 'mt-4'); // Add Bootstrap card and margin classes

  // Create the card body element
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  //create the options, title and filters rows and columns - append to body
  const cardOptionsRow = document.createElement('div');
  cardOptionsRow.className = 'row';
  const cardTitleRow = document.createElement('div');
  cardTitleRow.className = 'row';
  const cardFiltersRow = document.createElement('div');
  cardFiltersRow.className = 'row';
  cardBody.appendChild(cardOptionsRow);
  cardBody.appendChild(cardTitleRow);
  cardBody.appendChild(cardFiltersRow);

  const cardOptionsColumn = document.createElement('div');
  cardOptionsColumn.classList.add(
    'col-12',
    'd-flex',
    'justify-content-end'
  );
  const cardTitleColumn = document.createElement('div');
  cardTitleColumn.classList.add('col-12');
  const cardFiltersColumn = document.createElement('div');
  cardFiltersColumn.classList.add('col-12');
  cardOptionsRow.appendChild(cardOptionsColumn);
  cardTitleRow.appendChild(cardTitleColumn);
  cardFiltersRow.appendChild(cardFiltersColumn);

  //create the chart type button
  const dropdownWrapper = document.createElement('div');
  dropdownWrapper.classList.add('dropdown', 'me-2');

  // Create the dropdown button
  const dropdownButton = document.createElement('button');
  dropdownButton.id = 'chartTypeDropdown-' + chartObject.id;
  dropdownButton.classList.add('btn', 'btn-secondary', 'dropdown-toggle');
  dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
  if (chartObject.chartType === "horizontal-bars") {
    dropdownButton.textContent = 'Horizontal Bars';
  }
  if (chartObject.chartType === 'vertical-columns') {
    dropdownButton.textContent = 'Vertical Columns';
  }
  // Create the dropdown menu with options
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.classList.add('dropdown-menu');

  const horizontalBarDropdownLink = document.createElement('li');
  dropdownMenu.appendChild(horizontalBarDropdownLink);
  const horizontalBarAnchor = document.createElement('a');
  horizontalBarAnchor.id = 'horizontalBarAnchor-' + chartObject.id;
  horizontalBarAnchor.textContent = 'Horizontal Bars';
  horizontalBarAnchor.className = 'dropdown-item';
  horizontalBarDropdownLink.appendChild(horizontalBarAnchor);

  const verticalColumnDropdownLink = document.createElement('li');
  dropdownMenu.appendChild(verticalColumnDropdownLink);
  const verticalColumnAnchor = document.createElement('a');
  verticalColumnAnchor.id = 'verticalColumnAnchor-' + chartObject.id;
  verticalColumnAnchor.textContent = 'Vertical Columns';
  verticalColumnAnchor.className = 'dropdown-item';
  verticalColumnDropdownLink.appendChild(verticalColumnAnchor);

  dropdownWrapper.appendChild(dropdownButton);
  dropdownWrapper.appendChild(dropdownMenu);
  cardOptionsColumn.appendChild(dropdownWrapper);

  //create listener function that recreates the canvas upon updating the option

  horizontalBarAnchor.addEventListener('click', function () {

    dropdownButton.textContent = 'Horizontal Bars';
    chartObject.chartType = 'horizontal-bars';
    createCanvas();

    //if applicable, update the corresponding bookmark's charttype attribute 
    const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
    if (bookmark) {
      bookmark.chartType = chartObject.chartType;
    }
  })


  verticalColumnAnchor.addEventListener('click', function () {
    dropdownButton.textContent = 'Vertical Columns';
    chartObject.chartType = 'vertical-columns';
    createCanvas();
    //if applicable, update the corresponding bookmark's charttype attribute 
    const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
    if (bookmark) {
      bookmark.chartType = chartObject.chartType;
    }
  })


  //create the bookmark button and set whether it's active or not
  const bookmarkButton = document.createElement('button');
  bookmarkButton.classList.add('btn', 'btn-secondary');
  bookmarkButton.setAttribute('bookmarkButtonIdentifier', chartObject.id);
  const isChartBookmarked = bookmarks.some(obj => obj.id === chartObject.id);
  if (isChartBookmarked) {
    bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'true');
    bookmarkButton.classList.remove('btn-secondary');
    bookmarkButton.classList.add('btn-primary');
  } else {
    bookmarkButton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'false');
  }
  cardOptionsColumn.appendChild(bookmarkButton);
  bookmarkButton.addEventListener('click', function () {
    addRemoveBookmark(bookmarkButton, chartObject);
  });

  //create the title
  const cardTitle = document.createElement('h5');
  cardTitle.textContent = chartObject.title;
  cardTitleColumn.appendChild(cardTitle);

  //create filter badges as needed
  const filters = chartObject.filteredBy;

  for (let i = 0; i < filters.length; i++) {
    const cardFilter = document.createElement('span');
    cardFilter.className = 'filter-badge'; // Apply the custom class
    cardFilter.textContent = filters[i].value;
    cardFiltersColumn.appendChild(cardFilter);
  }

  function createCanvas() {

    const existingCanvas = cardBody.querySelector('canvas'); //check in this cardBody to see if there's already a canvas (in case we are changing type)
    if (existingCanvas) {
      cardBody.removeChild(existingCanvas);
    }

    // Create the canvas element
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%'; // Full width

    //calculate how many bars there will be and use that to calculate the canvas height
    let totalArrayValues = 0;
    chartObject.data.forEach(subArray => {
      totalArrayValues += subArray.length;
    });
    //canvas height depends on the type of chart we're displaying
    let barOptions = '';
    if (chartObject.chartType === 'horizontal-bars') {
      canvas.style.height = `${chartObject.data.length * 40 + 50}px`; // Set the height dynamically
      barOptions = chartObject.horizontalCalculationBarChartOptions;
    }
    else {
      canvas.style.height = '350px';
      barOptions = chartObject.verticalCalculationBarChartOptions;
    }
    // Append the canvas to the card body
    cardBody.appendChild(canvas);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the container
    container.appendChild(card);

    // Render the chart on the canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Create the datasets for each cluster
    const datasets = chartObject.data.map((clusterData, index) => {
      // Cycle through colorPalette for background and border colors
      const colorIndex = index % colorPalette.length;
      const backgroundColor = colorPaletteWithOpacity[colorIndex];
      const borderColor = colorPalette[colorIndex];

      return {
        label: chartObject.clusterLabels[index], // Label for the cluster
        data: clusterData,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1, // Fixed border width
        maxBarThickness: 50
      };
    });

    let chartOptions = '';
    new Chart(ctx, { //new chart in canvas
      //create a new chart using the properties of the chartObject being called as an argument in the function
      type: chartObject.type,
      data: {
        labels: chartObject.labels,
        datasets: [
          {
            label: chartObject.title, //the tooltip label is just the series title
            data: chartObject.data,
            backgroundColor: chartObject.backgroundColor,
            borderColor: chartObject.borderColor,
            borderWidth: chartObject.borderWidth,
            maxBarThickness: 50

          },
        ],
      },
      options: barOptions,
    });

  }
  createCanvas()
}




function addRemoveBookmark(target, chart) {
  const bookmarkButton = target;
  let isActive = bookmarkButton.getAttribute('isActive');

  //if bookmark is activated
  if (isActive === 'false') {

//update all instances of button (could be 2 instances if its in bookmark overlay.
const bookmarkButtons = document.querySelectorAll(`[bookmarkButtonIdentifier="${chart.id}"]`);

for (let i = 0; i < bookmarkButtons.length; i++) {
  bookmarkButtons[i].setAttribute('isActive', 'true');
  bookmarkButtons[i].innerHTML = '<i class="fa-solid fa-bookmark"></i>';
  bookmarkButtons[i].classList.remove('btn-secondary');
  bookmarkButtons[i].classList.add('btn-primary');
}

    //update chartobject and push to bookmarks array
    chart.bookmarked = true;
    bookmarks.push(chart);

     //if you're ractivating from bookmarks overlay, we should reactivate any chart object
     const currentAnalysisObject = analysisObjects.find(obj => obj.id === currentAnalysisId); //find the current analysis object
     for (let i = 0; i < currentAnalysisObject.chartObjects.length; i++) {//for each displayed chart object
       if (currentAnalysisObject.chartObjects[i].id === chart.id) { //if the chart matches the id of the object just unbookmarked
         currentAnalysisObject.chartObjects[i].bookmarked = true; //unbookmark the chart object (if hasn't been done already)
         break; // Exit the loop as we found the matching chart object
       }
     }


    console.log('bookmarks: ', bookmarks);
  }


  //if bookmark is deactivated
  if (isActive === 'true') {

    //update all instances of button (could be 2 instances if its in bookmark overlay.
    const bookmarkButtons = document.querySelectorAll(`[bookmarkButtonIdentifier="${chart.id}"]`);

    for (let i = 0; i < bookmarkButtons.length; i++) {
      bookmarkButtons[i].setAttribute('isActive', 'false');
      bookmarkButtons[i].innerHTML = '<i class="fa-regular fa-bookmark"></i>';
      bookmarkButtons[i].classList.remove('btn-primary');
      bookmarkButtons[i].classList.add('btn-secondary');
    }
    //update chartobject and remove from bookmarks array
    chart.bookmarked = false;

    function removeFromArray(arr, id) {
      const index = arr.findIndex(obj => obj.id === id);  // Find the index of the object
      if (index !== -1) { //if it exists
        arr.splice(index, 1);  // Remove the object at that index
      }
    }
    removeFromArray(bookmarks, chart.id);
    console.log('bookmarks: ', bookmarks);

    //if you're deactivating from bookmarks overlay, we need to deactivate any chart object displayed in the analysis step
    const currentAnalysisObject = analysisObjects.find(obj => obj.id === currentAnalysisId); //find the current analysis object
    for (let i = 0; i < currentAnalysisObject.chartObjects.length; i++) {//for each displayed chart object
      if (currentAnalysisObject.chartObjects[i].id === chart.id) { //if the chart matches the id of the object just unbookmarked
        currentAnalysisObject.chartObjects[i].bookmarked = false; //unbookmark the chart object (if hasn't been done already)
        break; // Exit the loop as we found the matching chart object
      }
    }
    console.log(currentAnalysisObject); //make sure that the charts bookmark setting is now set to off 
    //update the bookmark icon
  }
}

function openBookmarksOverlay() {
  // Set up overlay
  const bookmarksOverlay = document.getElementById('bookmarks-overlay');
  bookmarksOverlay.style.width = "100%";
  bookmarksOverlay.style.display = 'block';
  document.body.style.overflowY = 'hidden';

  let bookmarksContainer = document.getElementById('bookmarks-container');
  // if the container doesn't exist, create it and all of its children
  if (!bookmarksContainer) {
    const bookmarksContainer = document.createElement('div');
    bookmarksContainer.id = 'bookmarks-container';
    bookmarksContainer.classList.add('container');
    bookmarksOverlay.appendChild(bookmarksContainer);

    const closeButtonRow = document.createElement('div');
    closeButtonRow.classList.add('row', 'justify-content-end');
    bookmarksContainer.appendChild(closeButtonRow);

    const closeButtonColumn = document.createElement('div');
    closeButtonColumn.classList.add('col-auto'); // col-auto to make the column fit the content
    closeButtonColumn.innerHTML = `
    <a class="close-bookmarks-overlay-btn" id="close-bookmarks-overlay-btn" role="button">&times;</a>`;
    closeButtonRow.appendChild(closeButtonColumn);

    // Close the overlay when the close button is clicked
    const bookmarksOverlayCloseButton = document.getElementById('close-bookmarks-overlay-btn');
    bookmarksOverlayCloseButton.addEventListener('click', () => {
      bookmarksOverlay.style.width = "0%";
      bookmarksOverlay.style.display = 'none';
      document.body.style.overflowY = 'scroll';
    });

    //create the row and columns containing the title and the export button
    const titleExportRow = document.createElement('div');
    titleExportRow.classList.add('row');
    bookmarksContainer.appendChild(titleExportRow);
    const titleColumn = document.createElement('div');
    titleColumn.classList.add('col-8', 'd-flex', 'align-items-center', 'justify-content-start');
    titleColumn.innerHTML = '<h1>Bookmarks</h1>';
    titleExportRow.appendChild(titleColumn);
    const exportColumn = document.createElement('div');
    exportColumn.classList.add('col-4', 'd-flex', 'align-items-center', 'justify-content-end');
    titleExportRow.appendChild(exportColumn);



    // Create the export menu container
    const exportdropdownContainer = document.createElement('div');
    exportdropdownContainer.id = 'export-dropdown-container';
    exportdropdownContainer.classList.add('dropdown');

    // Create the export button
    const exportSelect = document.createElement('button');
    exportSelect.id = 'export-button';
    exportSelect.classList.add(
      'btn',
      'truncate-btn',
      'btn-primary'
    );
    exportSelect.type = 'button';
    exportSelect.style.width = '100%';
    exportSelect.textContent = 'Export';
    exportSelect.style.textAlign = 'left';
    exportSelect.setAttribute('data-bs-toggle', 'dropdown');
    exportSelect.setAttribute('aria-expanded', 'false');

    // Create the export options menu
    const exportMenu = document.createElement('ul');
    exportMenu.classList.add('dropdown-menu');

    // Populate the export dropdown menu

    const exportPDFListItem = document.createElement('li');
    const exportPDFListAnchor = document.createElement('a');
    exportPDFListAnchor.classList.add('dropdown-item');
    const exportPDFListAnchorText = document.createElement('label');
    exportPDFListAnchorText.textContent = 'PDF';
    exportPDFListAnchor.setAttribute('data-value', 'simple');
    exportPDFListAnchor.addEventListener('click', exportAllBookmarkedCardsToPDF);


    const exportPPTListItem = document.createElement('li');
    const exportPPTListAnchor = document.createElement('a');
    exportPPTListAnchor.classList.add('dropdown-item');
    const exportPPTListAnchorText = document.createElement('label');
    exportPPTListAnchorText.textContent = 'PPT / Slides';
    exportPPTListAnchor.setAttribute('data-value', 'simple');
    exportPPTListAnchor.addEventListener('click', exportAllBookmarkedCardsToPPTX);


    //append options to menu
    exportPDFListAnchor.appendChild(exportPDFListAnchorText);
    exportPDFListItem.appendChild(exportPDFListAnchor);
    exportMenu.appendChild(exportPDFListItem);

    exportPPTListAnchor.appendChild(exportPPTListAnchorText);
    exportPPTListItem.appendChild(exportPPTListAnchor);
    exportMenu.appendChild(exportPPTListItem);

    // Append elements to the dropdown container
    exportdropdownContainer.appendChild(exportSelect);
    exportdropdownContainer.appendChild(exportMenu);


    exportColumn.appendChild(exportdropdownContainer);


    //build up the bookmarks body
    const bookmarksBodyContainer = document.createElement('div');
    bookmarksBodyContainer.id = 'bookmarks-body-container';
    bookmarksBodyContainer.classList.add('col-md-8', 'offset-md-2', 'mt-2');
    bookmarksBodyContainer.style.marginBottom = '50px';
    bookmarksContainer.appendChild(bookmarksBodyContainer);
    const bookmarksBodyRow = document.createElement('div');
    bookmarksBodyRow.classList.add('row');
    bookmarksBodyContainer.appendChild(bookmarksBodyRow);
    const bookmarksBodyColumn = document.createElement('div');
    bookmarksBodyColumn.id = 'bookmarks-body-column';
    bookmarksBodyRow.appendChild(bookmarksBodyColumn);
  }
  else {
    const bookmarksBodyColumn = document.getElementById('bookmarks-body-column');
    bookmarksBodyColumn.innerHTML = '';
  }

  if (bookmarks.length === 0) {
    const exportButton = document.getElementById('export-button');
    exportButton.classList.add('disabled'); //ensure the export button is  disabled

    //create an empty state
    const emptyBookmarksContainer = document.getElementById('empty-bookmarks-container');
    if (!emptyBookmarksContainer) {
      const emptyBookmarksContainer = document.createElement('div');
      emptyBookmarksContainer.id = 'empty-bookmarks-container';
      const bookmarksContainer = document.getElementById('bookmarks-container');
      bookmarksContainer.appendChild(emptyBookmarksContainer);
      emptyBookmarksContainer.classList.add(
        'container',
        'd-flex',
        'flex-column',
        'align-items-center',
        'justify-content-center',
        'text-center'
      );
      emptyBookmarksContainer.style.width = '100%';
      emptyBookmarksContainer.style.minHeight = '300px';
      emptyBookmarksContainer.style.margin = '0 auto';
      emptyBookmarksContainer.style.border = '3px solid var(--primary)';
      emptyBookmarksContainer.style.backgroundColor = 'var(--tertiary-color)';
      emptyBookmarksContainer.style.borderRadius = '5px';
      emptyBookmarksContainer.innerHTML = emptyBookmarksContainer.innerHTML = `
  <div class="warning-icon">
    <i class="fas fa-bookmark"></i>
  </div>
  <div class="bookmark-title" style="font-weight: bold; margin-top: 10px;">
    This is where your bookmarked charts will be saved.
  </div>
  <div class="bookmark-description" style="margin-top: 5px;">
    You can view them all here or export them to ppt or pdf.
  </div>
`;
    }
  }
  else {
    const exportButton = document.getElementById('export-button');
    exportButton.classList.remove('disabled'); //ensure the export button isn't disabled

    const emptyBookmarksContainer = document.getElementById('empty-bookmarks-container');
    if (emptyBookmarksContainer) {
      emptyBookmarksContainer.remove();
    }
    for (let i = 0; i < bookmarks.length; i++) {
      const bookmarksBodyColumn = document.getElementById('bookmarks-body-column');
      if (bookmarks[i].analysisType === 'simple') {
        renderSimpleChartInCard(bookmarks[i], bookmarksBodyColumn);
      }
      if (bookmarks[i].analysisType === 'number') {
        renderNumberChartInCard(bookmarks[i], bookmarksBodyColumn);
      }
      if (bookmarks[i].analysisType === 'comparative') {
        renderComparativeChartInCard(bookmarks[i], bookmarksBodyColumn);
      }
      if (bookmarks[i].analysisType === 'sum-comparative') {
        renderSumAvgChartInCard(bookmarks[i], bookmarksBodyColumn);
      }
      if (bookmarks[i].analysisType === 'average-comparative') {
        renderSumAvgChartInCard(bookmarks[i], bookmarksBodyColumn);
      }

    }
    const bookmarksBodyColumn = document.getElementById('bookmarks-body-column');

    // Loop through each child in the bookmarksBodyColumn
    const children = bookmarksBodyColumn.children;
    for (let i = 0; i < children.length; i++) {
      // Assign the attribute to each child
      children[i].setAttribute('bookmarked', 'true');
    }

  }
}
// function for exporting all bookmarked cards to PDF
function exportAllBookmarkedCardsToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  // Find all the bookmarked cards on the page
  const cards = document.querySelectorAll('[bookmarked="true"]');
  let cardIndex = 0;

  // Function to process each card one by one and add to PDF
  function processNextCard() {
    if (cardIndex < cards.length) {
      const card = cards[cardIndex];

      // Use html2canvas to convert the card to an image
      html2canvas(card, { scale: 2 }).then(function (canvas) {
        const imgData = canvas.toDataURL('image/png');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const maxWidth = 232;  // Maximum width in PDF units (landscape mode full page width)
        const maxHeight = 160; // Maximum height in PDF units (arbitrary value you can adjust)

        let imgWidth = canvas.width;
        let imgHeight = canvas.height;

        // Calculate aspect ratio
        const aspectRatio = imgWidth / imgHeight;

        // Adjust the width and height to fit within the max bounds
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = maxWidth / aspectRatio;
        }

        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = maxHeight * aspectRatio;
        }

        // Calculate the x and y position to center the image
        const xOffset = (pageWidth - imgWidth) / 2;
        const yOffset = (pageHeight - imgHeight) / 2;

        // Now add the adjusted image to the PDF
        doc.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

        // Add footer text at the bottom of the page
        const footerText = "Powered by Cuadro";
        const footerX = (pageWidth - doc.getTextWidth(footerText)) / 2;  // Centered horizontally
        const footerY = pageHeight - 10;  // 10 units from the bottom of the page

        // Set font and add text to the page
        doc.setFontSize(10);  // Set the font size for the footer
        doc.text(footerText, footerX, footerY);

        // If there are more cards, add a new page and process the next one
        if (cardIndex < cards.length - 1) {
          doc.addPage();
        }

        cardIndex++;
        processNextCard(); // Process the next card
      });
    } else {
      // Once all cards are processed, save the PDF
      doc.save('charts.pdf');
    }
  }

  // Start processing the first card
  processNextCard();
}

//function to export all bookmarks to pptx
function exportAllBookmarkedCardsToPPTX() {
  const pptx = new PptxGenJS(); // Create a new PPTX presentation
  const cards = document.querySelectorAll('[bookmarked="true"]');
  let cardIndex = 0;

  // Function to process each card one by one and add to PPTX
  function processNextCard() {
    if (cardIndex < cards.length) {
      const card = cards[cardIndex];

      // Use html2canvas to convert the card to an image
      html2canvas(card, { scale: 2 }).then(function (canvas) {
        const imgData = canvas.toDataURL('image/png');

        const pageWidth = pptx.width; // Width of the PPTX slide
        const pageHeight = pptx.height; // Height of the PPTX slide

        const maxWidth = 7;  // Maximum width in inches (adjust based on your needs)
        const maxHeight = 5;  // Maximum height in inches (adjust based on your needs)

        let imgWidth = canvas.width / 96; // Convert to inches (96 DPI)
        let imgHeight = canvas.height / 96; // Convert to inches (96 DPI)

        // Calculate aspect ratio
        const aspectRatio = imgWidth / imgHeight;

        // Adjust the width and height to fit within the max bounds
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = maxWidth / aspectRatio;
        }

        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = maxHeight * aspectRatio;
        }

        // Calculate the x and y position to center the image
        const xOffset = (pageWidth - imgWidth) / 2; // Center horizontally
        const yOffset = (pageHeight - imgHeight) / 2; // Center vertically

        // Create a new slide and add the adjusted image to it
        const slide = pptx.addSlide();
        slide.addImage({
          data: imgData,
          x: xOffset,
          y: yOffset,
          w: imgWidth,
          h: imgHeight,
        });


        // If there are more cards, add a new slide and process the next one
        if (cardIndex < cards.length - 1) {
          cardIndex++;
          processNextCard(); // Process the next card
        } else {
          // Once all cards are processed, save the PPTX
          pptx.writeFile({ fileName: 'charts.pptx' });
        }
      });
    }
  }

  // Start processing the first card
  processNextCard();
}
