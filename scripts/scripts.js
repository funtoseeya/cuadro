


//GENERAL SCRIPTS


//turn on the charts data label plugin
Chart.register(ChartDataLabels);




//GLOBAL VARIABLES
let selectedFile; // Global variable to store the file. we need this to create an array with its data
let dropdownState = []; //global variable to save dropdowns in the review table. we need this to save the user's con
let CategoricalArray = [];  //global array that saves all unique values of columns tagged as Categorical - useful for filters
let numericalHeaderArray = []; //using this for compare by dropdown
let categoricalHeaderArray = []; //using this for compare by dropdown
const guessedCSVheaderClassification = {}; // To store the guessed classification of each header
let parsedCSVData = []; // global array that stores the uploaded csv's data
let filteredData = [];
let comparisonType = null; //comparison values
let comparisonValue = null; //comparison values
let fieldXValue = null;//comparison values
let fieldYValue = null;//comparison values
let analysisObjects = []; // Array to store analysis object instances
let colorPalette = ['#176BA0', '#19AADE', '#1AC9E6', '#caf0f8', '#52b69a', '#1DE3BD', '#CDFDD2', '#C7F9EE', '#b66ee8', '#d689ff', '#f2a8ff', '#ffc4ff', '#ebd9fc'];
let colorPaletteWithOpacity = [
  'rgba(23, 107, 160, 0.5)',  // '#176BA0'
  'rgba(25, 170, 222, 0.5)',  // '#19AADE'
  'rgba(26, 201, 230, 0.5)',  // '#1AC9E6'
  'rgba(202, 240, 248, 0.5)', // '#caf0f8'
  'rgba(82, 182, 154, 0.5)',  // '#52b69a'
  'rgba(29, 227, 189, 0.5)',  // '#1DE3BD'
  'rgba(205, 253, 210, 0.5)', // '#CDFDD2'
  'rgba(199, 249, 238, 0.5)', // '#C7F9EE'
  'rgba(182, 110, 232, 0.5)', // '#b66ee8'
  'rgba(214, 137, 255, 0.5)', // '#d689ff'
  'rgba(242, 168, 255, 0.5)', // '#f2a8ff'
  'rgba(255, 196, 255, 0.5)', // '#ffc4ff'
  'rgba(235, 217, 252, 0.5)'  // '#ebd9fc'
];

let bookmarks = [];



// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function () {

  checkEmailInLocalStorage();
  pushLocalBookmarkstoMainBookmarks();
});


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

function pushLocalBookmarkstoMainBookmarks() {
  const bookmarksLocalStorage = JSON.parse(localStorage.getItem('bookmarks'));

  if (!bookmarksLocalStorage || bookmarksLocalStorage.length === 0) {

    bookmarks = [];
    console.log('bookmarks empty / not saved from local storage: ', bookmarks);
  }
  else {
    bookmarks = bookmarksLocalStorage;
    console.log('bookmarks saved based on local storage: ', bookmarks);

  }
}

function checkLocalStorageData() {
  const dropdownStateInStorage = localStorage.getItem('dropdownState');
  if (dropdownStateInStorage) { //if we've got everything to load analyze step
    const topNav = document.getElementById('fixed-top-bar');
    topNav.style.display = 'block';

    const navigationPanel = document.getElementById('navigation-panel');
    navigationPanel.style.display = 'block';
    const analyzeBreadcrumb = document.getElementById('analyze-breadcrumb');
    analyzeBreadcrumb.style.fontWeight = 'bold';

    const stepBody = document.getElementById('step-body');
    setupAnalyzeStep();
    showContinueOverlay();

  }
  else {
    createUploadStepContent();
  }

}


function showContinueOverlay() {
  // Create the overlay element
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 9999;

  // Create the message container
  const messageContainer = document.createElement("div");
  messageContainer.className = "p-4 bg-white rounded text-center";
  messageContainer.style.maxWidth = "400px";
  messageContainer.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";

  // Create the header elements
  const header1 = document.createElement("h5");
  header1.className = "mb-2";
  header1.innerText = "Continue from where you left off?";

  const header2 = document.createElement("h6");
  header2.className = "mb-4 text-muted";
  header2.innerText = "We've saved your uploaded file. You can continue or start fresh with a new upload.";

  // Create the buttons
  const continueButton = document.createElement("button");
  continueButton.className = "btn btn-primary me-2";
  continueButton.innerText = "Continue";
  continueButton.onclick = () => overlay.remove();

  const restartButton = document.createElement("button");
  restartButton.className = "btn btn-secondary";
  restartButton.innerText = "Restart";

  restartButton.addEventListener('click', navToUpload);

  // Append elements to the message container
  messageContainer.appendChild(header1);
  messageContainer.appendChild(header2);
  messageContainer.appendChild(continueButton);
  messageContainer.appendChild(restartButton);

  // Append the message container to the overlay
  overlay.appendChild(messageContainer);

  // Append the overlay to the body
  document.body.appendChild(overlay);
}

function navToUpload() {
  location.reload();
  localStorage.removeItem('parsedCSVData');
  localStorage.removeItem('selectedFile');
  localStorage.removeItem('dropdownState');
  localStorage.removeItem('bookmarks');

}

function navToReview() {
  reviewData();
}

function navToAnalyze() {
  saveDataTypestoArray();
  setupAnalyzeStep();
}

// GET EMAIL STEP

function handleEmail() {

  const stepBody = document.getElementById('step-body');
  stepBody.style.display = 'none';

  //hide panels 
  const fixedTopBar = document.getElementById('fixed-top-bar');
  fixedTopBar.style.display = 'none';
  const navigationPanel = document.getElementById('navigation-panel');
  navigationPanel.style.display = 'none';

  const registrationBody = document.getElementById('registration-body');
  registrationBody.innerHTML = '';

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

  //temp workaround register
  const closeRegisterButton = document.createElement('button');
  closeRegisterButton.classList.add('btn', 'tertiary-button');
  closeRegisterButton.style.color = 'white';
  closeRegisterButton.textContent = 'skip';
  registrationContainer.appendChild(closeRegisterButton);

  closeRegisterButton.addEventListener('click', function () {
    localStorage.setItem('registered', 'yes');
    registrationBody.style.display = 'none';
    stepBody.style.display = 'block';
    alert('Lucky you - you found the back door!');

    // Trigger the createUploadStepContent function
    createUploadStepContent(); // Call your function here
  })

  // Finally, append the registrationContainer to stepBody
  registrationBody.appendChild(registrationContainer);

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

        //hide the registration body
        registrationBody.style.display = 'none';
        stepBody.style.display = 'block';

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
  localStorage.removeItem('registered');
  localStorage.removeItem('parsedCSVData');
  localStorage.removeItem('selectedFile');
  localStorage.removeItem('dropdownState');
  localStorage.removeItem('bookmarks');
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

  //display the top nav bar
  const topNav = document.getElementById('fixed-top-bar');
  topNav.style.display = 'block';



  //hide nav panel 
  const navigationPanel = document.getElementById('navigation-panel');
  navigationPanel.style.display = 'none';

  //update  breadcrumbs
  const uploadBreadcrumb = document.getElementById('upload-breadcrumb');
  uploadBreadcrumb.style.fontWeight = 'bold';
  uploadBreadcrumb.classList.remove('clickable-breadcrumb-item');
  const reviewBreadcrumb = document.getElementById('review-breadcrumb');
  reviewBreadcrumb.style.fontWeight = 'normal';
  reviewBreadcrumb.classList.remove('clickable-breadcrumb-item');
  const analyzeBreadcrumb = document.getElementById('analyze-breadcrumb');
  analyzeBreadcrumb.style.fontWeight = 'normal';
  analyzeBreadcrumb.classList.remove('clickable-breadcrumb-item');

  uploadBreadcrumb.removeEventListener('click', navToUpload);
  reviewBreadcrumb.removeEventListener('click', navToReview);
  analyzeBreadcrumb.removeEventListener('click', navToAnalyze);


  const stepBody = document.getElementById('step-body');

  // Create the container for the upload content
  const uploadContainer = document.createElement('div');
  uploadContainer.classList.add(
    'container',
    'd-flex',
    'flex-column',
    'text-center',
    'align-items-center',
    'justify-content-center');


  //create upload header
  const uploadHeader = document.createElement('h2');
  uploadHeader.textContent = `Upload your CSV file`;
  uploadContainer.appendChild(uploadHeader);

  // Create and add the upload text with line break
  const uploadText = document.createElement('h6');
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
    <div class="accordion-item mt-3" style="margin-top: 0.5rem;">
  <h2 class="accordion-header" id="headingOne">
    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
      <i class="fa-solid fa-circle-question" style="margin-right: 0.5rem; font-size: 1rem;" aria-hidden="true"></i>
      What kind of data can I upload?
    </button>
  </h2>
  <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
    <div class="accordion-body" style="font-size: 0.85rem; padding: 0.75rem 1rem;">
      <p class="text-start">You can upload any kind of tabular data having rows as items and columns as the items' characteristics.</p>
      <p class="text-start">Here's an example of a supported dataset that contains both categorical and numerical data.</p>
      <div style="width: 100%; overflow: hidden; position: relative;">
        <img src="https://app.cuadro.io/images/sample-data.PNG" class="d-block w-100" style="object-fit: contain;">
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
      reviewData();
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
  return new Promise((resolve, reject) => {
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

      // This guesses what each field's types are
      guessDataTypes();

      // This creates the filter options
      createCategoricalArrayForFilterPanel();

      resolve(); // Resolve the promise when done
    };

    // Define what to do if there's an error reading the file
    reader.onerror = function () {
      reject(new Error('Error reading file')); // Reject the promise with an error
    };

    // Read the file as a text string
    reader.readAsText(file);
  });
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

  localStorage.setItem('dropdownState', JSON.stringify(dropdownState));

}

function guessDataTypes() {

  const headers = Object.keys(parsedCSVData[0]);//get an array listing each header. 
  dropdownState = [];

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
  console.log('guessed data types: ', dropdownState);
}

async function reviewData() {

  //display navigation bar  and update to review step
  const navigationPanel = document.getElementById('navigation-panel');
  navigationPanel.style.display = 'block';
  const uploadBreadcrumb = document.getElementById('upload-breadcrumb');
  uploadBreadcrumb.classList.add('clickable-breadcrumb-item');
  uploadBreadcrumb.style.fontWeight = 'normal';
  const reviewBreadcrumb = document.getElementById('review-breadcrumb');
  reviewBreadcrumb.style.fontWeight = 'bold';
  reviewBreadcrumb.classList.remove('clickable-breadcrumb-item');
  const analyzeBreadcrumb = document.getElementById('analyze-breadcrumb');
  analyzeBreadcrumb.style.fontWeight = 'normal';
  analyzeBreadcrumb.classList.add('clickable-breadcrumb-item');

  uploadBreadcrumb.addEventListener('click', navToUpload);
  reviewBreadcrumb.removeEventListener('click', navToReview);
  analyzeBreadcrumb.addEventListener('click', navToAnalyze);


  //check if we already have a dropdown state stored. in which case we dont need to reprocess it
  const dropdownStateInStorage = localStorage.getItem('dropdownState');
  if (!dropdownStateInStorage) {
    await parseCSVToArray(selectedFile);
    console.log('dropdownstate', dropdownState);
  }

  //delete any existing analysis object
  deleteAllAnalysisObjects();

  //clear the step body
  const stepBody = document.getElementById('step-body');
  stepBody.innerHTML = '';


  const reviewContainer = document.createElement('div');
  reviewContainer.classList.add('row', 'mt-3');


  stepBody.appendChild(reviewContainer);

  //create review title, text row
  const reviewHeaderRow = document.createElement('div');
  reviewHeaderRow.classList.add('row');
  reviewContainer.appendChild(reviewHeaderRow);

  //create review header col and contents
  const reviewHeaderCol = document.createElement('div');
  reviewHeaderCol.classList.add('col-12');
  reviewHeaderRow.appendChild(reviewHeaderCol);

  const reviewHeader = document.createElement('h5');
  reviewHeader.textContent = `Does this look right?`;
  reviewHeaderCol.appendChild(reviewHeader);

  const instructionLabel = document.createElement('p');
  instructionLabel.textContent = 'Please take a moment to review and adjust how the data has been categorized.';
  reviewHeaderCol.appendChild(instructionLabel);

  //build up the body
  const dataTypeSettingsRow = document.createElement('div');
  dataTypeSettingsRow.classList.add('row');
  const dataTypeSettingsCol = document.createElement('div');
  dataTypeSettingsCol.classList.add('col-12');
  reviewContainer.appendChild(dataTypeSettingsRow);
  dataTypeSettingsRow.appendChild(dataTypeSettingsCol);

  //create the yes no buttons
  const yesNoRow = document.createElement('div');
  dataTypeSettingsCol.appendChild(yesNoRow);
  const noButton = document.createElement('a');
  noButton.className = 'tertiary-button';
  noButton.textContent = `❌ Nope, let's restart with a new file`;
  yesNoRow.appendChild(noButton);
  const yesButton = document.createElement('a');
  yesButton.className = 'tertiary-button';
  yesButton.textContent = `✅ Yes, let's analyze it!`;
  yesNoRow.appendChild(yesButton);

  yesButton.addEventListener('click', navToAnalyze);
  noButton.addEventListener('click', navToUpload);

  // Create the accordion
  const accordion = document.createElement('div');
  accordion.classList.add('accordion', 'w-100', 'mb-3');
  accordion.id = 'dataTypeAccordion';

  accordion.innerHTML = `
  <div class="accordion-item" style="margin: 0.5rem 0;">
  <p class="accordion-header" id="headingOne">
    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
      <i class="fa-solid fa-circle-question" style="margin-right: 0.3rem; font-size: 1rem;" aria-hidden="true"></i>
      What is this table?
    </button>
  </p>
  <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
    <div class="accordion-body" style="font-size: 0.85rem; padding: 0.75rem 1rem;">
      The table below displays your data's structure and how it has been categorized. You may update the categories if need be. You can always come back to this as well.
      <ul>
        <li><strong><i class="fa-solid fa-shapes"></i> Categorical:</strong> Also known as discrete data. Use this for fields where a restricted set of possible values is expected. A field with unique values doesn't fall into Categorical - it should be set to Ignore.</li>
        <li><strong><i class="fa-solid fa-hashtag"></i> Numerical:</strong> This is for any field containing numerical values. We will compute these by summing or averaging them, rather than counting them.</li>
        <li><strong><i class="fa-regular fa-calendar"></i> Date / Time:</strong> This is for any field containing timestamps. This is especially useful for generating trend analyses.</li>
        <li><strong>Ignore:</strong> Assign this to any field that doesn't fall into the above categories. e.g. comments, names, unique identifiers, etc.</li>
      </ul>
    </div>
  </div>
</div>

`;

  dataTypeSettingsCol.appendChild(accordion);



  const fileRow = document.createElement('div');
  stepBody.appendChild(fileRow);
  const fileName = document.createElement('p');
  fileName.className = 'text-muted small';
  const selectedFileInStorage = localStorage.getItem('selectedFile');
  fileName.innerHTML = `<strong>Uploaded file:</strong> ${selectedFileInStorage}`;
  dataTypeSettingsCol.appendChild(fileName);



  generateReviewTable(dataTypeSettingsCol);

  //button panel
  loadReviewButtonPanel();

}

function loadReviewButtonPanel() {

  //redo button
  const leftCol = document.getElementById('navigation-back-column');
  leftCol.innerHTML = '';
  const redoButton = document.createElement('button');
  redoButton.className = 'btn btn-secondary';
  redoButton.innerHTML = `<i class="fa-solid fa-left-long"></i> Restart`;
  leftCol.append(redoButton);

  redoButton.addEventListener('click', function () {
    location.reload();
    localStorage.removeItem('parsedCSVData');
    localStorage.removeItem('selectedFile');
    localStorage.removeItem('dropdownState');
    localStorage.removeItem('bookmarks');

  })


  // analyze button
  const rightCol = document.getElementById('navigation-next-column');
  rightCol.innerHTML = '';
  const analyzeButton = document.createElement('button');
  analyzeButton.id = 'analyze-button'
  analyzeButton.classList.add('btn', 'btn-primary');
  analyzeButton.innerHTML = `Analyze <i class="fa-solid fa-right-long"></i>`;
  rightCol.appendChild(analyzeButton);

  analyzeButton.addEventListener('click', navToAnalyze);

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

  const dropdownStateInStorage = localStorage.getItem('dropdownState');

  if (dropdownStateInStorage) {

    parsedCSVData = JSON.parse(localStorage.getItem('parsedCSVData'));
    dropdownState = JSON.parse(localStorage.getItem('dropdownState'));
  }
  filteredData = parsedCSVData;
  createCategoricalArrayForFilterPanel();
  createNumericalArray();
  createCategoricalHeaderArray();

  //replace save button with data settings button
  const analyzeButton = document.getElementById('analyze-button');
  if (analyzeButton) {
    analyzeButton.remove();
  }


  window.addEventListener('beforeunload', alertUnsavedChanges);

  //update nav panel 
  const navigationPanel = document.getElementById('navigation-panel');
  navigationPanel.style.display = 'block';
  const uploadBreadcrumb = document.getElementById('upload-breadcrumb');
  uploadBreadcrumb.style.fontWeight = 'normal';
  uploadBreadcrumb.classList.add('clickable-breadcrumb-item');
  const reviewBreadcrumb = document.getElementById('review-breadcrumb');
  reviewBreadcrumb.style.fontWeight = 'normal';
  reviewBreadcrumb.classList.add('clickable-breadcrumb-item');
  const analyzeBreadcrumb = document.getElementById('analyze-breadcrumb');
  analyzeBreadcrumb.style.fontWeight = 'bold';
  analyzeBreadcrumb.classList.remove('clickable-breadcrumb-item');

  uploadBreadcrumb.addEventListener('click', navToUpload);
  reviewBreadcrumb.addEventListener('click', navToReview);
  analyzeBreadcrumb.removeEventListener('click', navToAnalyze);

  //create the bookmarks button
  const TopNavButtonContainer = document.getElementById('top-nav-bookmark-container');
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

  //update nav panel to contain review button
  loadAnalyzeButtonPanel();

  // clear the step body 
  const stepBody = document.getElementById('step-body');
  stepBody.innerHTML = ''; // Clear any existing content

  //create the back and filter row
  const backFilterRow = document.createElement('div');
  backFilterRow.className = 'row mb-2';
  stepBody.appendChild(backFilterRow);

  //create the back button
  const reviewColumn = document.createElement('div');
  reviewColumn.className = 'col-6 p-0 d-flex align-items-center justify-content-start';
  backFilterRow.appendChild(reviewColumn);
  const reviewNavButton = document.createElement('a');
  reviewNavButton.className = 'btn tertiary-button d-none d-md-block'; // Adds Bootstrap's responsive display utility
  reviewNavButton.innerHTML = `<i class="fa-solid fa-left-long" style="padding-right:0.5rem"></i>Back to Review`;
  reviewColumn.appendChild(reviewNavButton);
  reviewNavButton.addEventListener('click', navToReview);


  const filterColumn = document.createElement('div');
  filterColumn.className = 'col-6 d-flex align-items-center justify-content-end';
  filterColumn.style.padding = '0 0.5rem';
  filterColumn.id = 'filter-column';
  backFilterRow.appendChild(filterColumn);
  createFilterButton();

  // Create the tab panel
  const tabPanelRow = document.createElement('div');
  tabPanelRow.className = 'row';
  stepBody.appendChild(tabPanelRow);

  const tabPanel = document.createElement('ul');
  tabPanel.className = 'nav nav-tabs';
  tabPanel.id = 'tab-panel';
  tabPanel.role = 'tablist';
  tabPanelRow.appendChild(tabPanel);

  // Summary tab
  const summaryTab = document.createElement('li');
  summaryTab.className = 'nav-item';
  summaryTab.id = 'summary-tab';
  summaryTab.role = 'presentation';
  tabPanel.appendChild(summaryTab);

  const summaryTabLink = document.createElement('a');
  summaryTabLink.className = 'nav-link active';
  summaryTabLink.id = 'summary-tab-link';
  summaryTabLink.href = '#summary-tab-content';
  summaryTabLink.role = 'tab';
  summaryTabLink.setAttribute('data-bs-toggle', 'tab');
  summaryTabLink.setAttribute('aria-controls', 'summary');
  summaryTabLink.setAttribute('aria-selected', 'true');
  summaryTabLink.textContent = 'Distributions';
  summaryTab.appendChild(summaryTabLink);

  // Advanced tab
  const advancedTab = document.createElement('li');
  advancedTab.className = 'nav-item';
  advancedTab.id = 'advanced-tab';
  advancedTab.role = 'presentation';
  tabPanel.appendChild(advancedTab);

  const advancedTabLink = document.createElement('a');
  advancedTabLink.className = 'nav-link';
  advancedTabLink.id = 'advanced-tab-link';
  advancedTabLink.href = '#advanced-tab-content';
  advancedTabLink.role = 'tab';
  advancedTabLink.setAttribute('data-bs-toggle', 'tab');
  advancedTabLink.setAttribute('aria-controls', 'advanced');
  advancedTabLink.setAttribute('aria-selected', 'false');
  advancedTabLink.textContent = 'Comparisons';
  advancedTab.appendChild(advancedTabLink);

  // Create the tab content
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content';
  tabPanelRow.appendChild(tabContent);

  // Summary tab content
  const summaryTabContent = document.createElement('div');
  summaryTabContent.className = 'tab-pane fade show active mt-3';
  summaryTabContent.id = 'summary-tab-content';
  summaryTabContent.role = 'tabpanel';
  summaryTabContent.innerHTML = '<h5>Data Distributions</h5><p>Explore how frequently categories and numbers occur in the dataset.</p>';
  tabContent.appendChild(summaryTabContent);

  // Advanced tab content
  const advancedTabContent = document.createElement('div');
  advancedTabContent.className = 'tab-pane fade';
  advancedTabContent.id = 'advanced-tab-content';
  advancedTabContent.role = 'tabpanel';
  tabContent.appendChild(advancedTabContent);

  loadSummaryTab();

  loadCompareTab();

  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: 'smooth' for a smooth scroll effect, or 'auto' for instant scroll
  });


}


function loadSummaryTab() {
  const summaryAnalysisObject = new AnalysisObject(1);
  const summaryValue = dropdownState.filter(field => field.value === 'Categorical' || field.value === 'Numerical').map(field => field.header);
  summaryAnalysisObject.analysisType = 'distribution';
  summaryAnalysisObject.summaryValue = summaryValue;

  console.log('summary analysis object: ', analysisObjects.find(obj => obj.analysisType === 'distribution'));
  summaryAnalysisObject.beginSummaryChartGenerationProcess(summaryAnalysisObject.analysisType);

}

function loadCompareTab() {

  const advancedAnalysisObject = new AnalysisObject(2);
  advancedAnalysisObject.analysisType = 'comparison';
  console.log('advanced analysis object:', advancedAnalysisObject);

  const advancedTabContent = document.getElementById('advanced-tab-content');
  advancedTabContent.innerHTML = ``;

  // Create the header row
  const analysisOptionTextRow = document.createElement('div');
  analysisOptionTextRow.classList.add('row', 'mt-3');

  const analysisOptionTextColumn = document.createElement('div');
  const analysisOptionText = document.createElement('div');
  analysisOptionText.innerHTML = `<h5>What would you like to compare?</h5><p>Compare counts, sums, and averages across any combination of fields.</p>`;

  analysisOptionTextColumn.appendChild(analysisOptionText);
  analysisOptionTextRow.appendChild(analysisOptionTextColumn);
  advancedTabContent.appendChild(analysisOptionTextRow);



  //create prompt row and columns
  const promptRow = document.createElement('div');
  promptRow.className = 'row';
  advancedTabContent.appendChild(promptRow);

  const comparisonCol = document.createElement('div');
  comparisonCol.className = 'col-12 col-md-4 pt-2';
  comparisonCol.id = 'prompt-row-comparison-col';
  promptRow.appendChild(comparisonCol);

  const fieldXCol = document.createElement('div');
  fieldXCol.className = 'col-12 col-md-4 pt-2';
  fieldXCol.id = 'prompt-row-field-x-col';
  promptRow.appendChild(fieldXCol);

  const fieldYCol = document.createElement('div');
  fieldYCol.className = 'col-12 col-md-4 pt-2';
  fieldYCol.id = 'prompt-row-field-y-col';
  promptRow.appendChild(fieldYCol);

  // Create comparison dropdown
  function createComparisonDropdown() {

    const parentElement = document.getElementById("prompt-row-comparison-col");

    // Create dropdown container
    const dropdownContainer = document.createElement("div");
    dropdownContainer.classList.add("dropdown");

    // Title above dropdown
    const dropdownTitle = document.createElement("h6");
    dropdownTitle.innerText = "Compare";
    parentElement.appendChild(dropdownTitle);

    // Create dropdown toggle button
    const dropdownToggle = document.createElement("button");
    dropdownToggle.className = "btn btn-secondary d-flex justify-content-between w-100 text-start text-truncate"; // Left-aligned text
    dropdownToggle.style.maxWidth = "100%"; // Ensure the button doesn't exceed available space
    dropdownToggle.setAttribute("type", "button");

    const textSpan = document.createElement("span");
    textSpan.className = "text-truncate"; // For truncation
    textSpan.style.flex = "1"; // Ensure it takes up all available space
    textSpan.innerText = "Select an option";

    // Add the dropdown arrow
    const arrowIcon = document.createElement("span");
    arrowIcon.classList.add("ms-2", "flex-shrink-0"); // Prevent shrinking of the icon
    arrowIcon.innerHTML = "&#9662;"; // Downward-facing arrow

    // Append text and icon to the button
    dropdownToggle.appendChild(textSpan);
    dropdownToggle.appendChild(arrowIcon);

    // Create dropdown menu container
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "dropdown-menu w-100";

    // Create main menu
    const mainMenu = document.createElement("div");
    mainMenu.className = "menu";

    // Create secondary menu
    const secondaryMenu = document.createElement("div");
    secondaryMenu.className = "menu d-none";

    // Back button for secondary menu
    const backButton = document.createElement("a");
    backButton.href = "#";
    backButton.className = "dropdown-item border-bottom";
    backButton.style.backgroundColor='rgb(224, 224, 224)';
    backButton.innerText = "Back";
    backButton.addEventListener("click", (e) => {
      e.preventDefault();
      showMenu(mainMenu, secondaryMenu);
    });
    secondaryMenu.appendChild(backButton);

    // Define main options
    const options = [
      { text: "Count of occurrences", hasSubmenu: false },
      { text: "Sum of", hasSubmenu: true },
      { text: "Average of", hasSubmenu: true },
    ];

    // Populate main menu
    options.forEach((option) => {
      const menuItem = document.createElement("a");
      menuItem.href = "#";
      menuItem.className = "dropdown-item d-flex justify-content-between align-items-center text-start text-truncate"; // Left-align text
      menuItem.innerText = option.text;

      if (option.hasSubmenu) {
        const chevron = document.createElement("span");
        chevron.innerHTML = "&#9656;"; // Solid chevron
        chevron.style.fontSize = "18px"; // Larger chevron
        chevron.style.color = "#6c757d";
        menuItem.appendChild(chevron);

        menuItem.addEventListener("click", (e) => {
          e.preventDefault();
          populateSubmenu(option.text);
          showMenu(secondaryMenu, mainMenu);
        });
      } else {
        menuItem.addEventListener("click", (e) => {
          e.preventDefault();
          comparisonType = "Count of occurrences";
          textSpan.innerText = comparisonType;
          advancedAnalysisObject.compareType = comparisonType;
          advancedAnalysisObject.beginComparisonChartGenerationProcess();
          closeDropdown();
        });
      }

      mainMenu.appendChild(menuItem);
    });

    // Populate submenu with numerical headers
    function populateSubmenu(optionText) {
      // Clear submenu (except the back button)
      Array.from(secondaryMenu.children)
        .slice(1) // Skip the back button
        .forEach((child) => child.remove());

      numericalHeaderArray.forEach((header) => {
        const submenuItem = document.createElement("a");
        submenuItem.href = "#";
        submenuItem.className = "dropdown-item text-start text-truncate";
        submenuItem.style.maxWidth = "100%"; // Ensure the button doesn't exceed available space

        submenuItem.innerText = header;

        submenuItem.addEventListener("click", (e) => {
          e.preventDefault();
          comparisonType = optionText;
          comparisonValue = header;
          textSpan.innerText = `${comparisonType} ${comparisonValue}`;
          advancedAnalysisObject.compareType = comparisonType;
          advancedAnalysisObject.compareBy = comparisonValue;
          advancedAnalysisObject.beginComparisonChartGenerationProcess();
          closeDropdown();
        });

        secondaryMenu.appendChild(submenuItem);
      });
    }

    // Show the appropriate menu
    function showMenu(menuToShow, menuToHide) {
      menuToHide.classList.add("d-none");
      menuToShow.classList.remove("d-none");
    }

    // Close the dropdown
    function closeDropdown() {
      dropdownMenu.classList.remove("show");
    }

    // Append menus to dropdown
    dropdownMenu.appendChild(mainMenu);
    dropdownMenu.appendChild(secondaryMenu);
    dropdownContainer.appendChild(dropdownToggle);
    dropdownContainer.appendChild(dropdownMenu);
    parentElement.appendChild(dropdownContainer);

    // Toggle dropdown visibility
    dropdownToggle.addEventListener("click", (e) => {
      e.preventDefault();
      dropdownMenu.classList.toggle("show");
      // Always reset to main menu
      showMenu(mainMenu, secondaryMenu);
    });

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (!dropdownContainer.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // Create the dropdowns
  function createFieldDropdowns() {
    // Parent elements
    const fieldXParent = document.getElementById("prompt-row-field-x-col");
    const fieldYParent = document.getElementById("prompt-row-field-y-col");

    // Create dropdown container
    function createDropdown(parentElement, title, placeholder, onSelect) {
      const container = document.createElement("div");
      container.className = "dropdown w-100";

      // Dropdown title
      const dropdownTitle = document.createElement("h6");
      dropdownTitle.innerText = title;

      // Dropdown button
      const dropdownToggle = document.createElement("button");
      dropdownToggle.className = "btn btn-secondary d-flex justify-content-between w-100 text-start text-truncate"; // Left-aligned text
      dropdownToggle.setAttribute("type", "button");
      dropdownToggle.setAttribute("data-bs-toggle", "dropdown");

      const textSpan = document.createElement("span");
      textSpan.className = "text-truncate"; // For truncation
      textSpan.style.flex = "1"; // Ensure it takes up all available space
      textSpan.innerText = placeholder;

      // Add the dropdown arrow
      const arrowIcon = document.createElement("span");
      arrowIcon.classList.add("ms-2", "flex-shrink-0"); // Prevent shrinking of the icon
      arrowIcon.innerHTML = "&#9662;"; // Downward-facing arrow

      // Append text and icon to the button
      dropdownToggle.appendChild(textSpan);
      dropdownToggle.appendChild(arrowIcon);

      // Dropdown menu
      const dropdownMenu = document.createElement("div");
      dropdownMenu.className = "dropdown-menu w-100";

      // Populate the menu with options
      function populateMenu(excludeValue) {
        dropdownMenu.innerHTML = ""; // Clear existing options

        //create empty option
        const emptyOption = document.createElement('a')
        emptyOption.href = "#";
        if (textSpan.innerText === placeholder){
        emptyOption.style.display = 'none';
      }
        emptyOption.style.backgroundColor = 'rgb(224, 224, 224)';
        emptyOption.className = "dropdown-item text-truncate";
        emptyOption.innerText = 'Clear Selection';
        dropdownMenu.appendChild(emptyOption);

        emptyOption.addEventListener("click", (e) => {
          e.preventDefault();
          textSpan.innerText = placeholder;
          onSelect(null);
          emptyOption.style.display = 'none';
          advancedAnalysisObject.compareFieldA = fieldXValue;
          advancedAnalysisObject.compareFieldB = fieldYValue;
          advancedAnalysisObject.beginComparisonChartGenerationProcess();
        });

        categoricalHeaderArray.forEach((option) => {
          if (option !== excludeValue) {
            const item = document.createElement("a");
            item.href = "#";
            item.className = "dropdown-item text-truncate";
            item.innerText = option;

            item.addEventListener("click", (e) => {
              e.preventDefault();
              textSpan.innerText = option;
              onSelect(option); //this does two things. it sets fieldXYvalue to the selected value AND it makes sure the other dropdown menu doesn't offer it as an option 
              emptyOption.style.display = 'block';
              advancedAnalysisObject.compareFieldA = fieldXValue;
              advancedAnalysisObject.compareFieldB = fieldYValue;
              advancedAnalysisObject.beginComparisonChartGenerationProcess();
            });

            dropdownMenu.appendChild(item);
          }
        });
      }

      populateMenu(null); // Initial population

      // Assemble and attach
      container.appendChild(dropdownTitle);
      container.appendChild(dropdownToggle);
      container.appendChild(dropdownMenu);
      parentElement.appendChild(container);

      return populateMenu;
    }


    const fieldXPopulateMenu = createDropdown(
      fieldXParent,
      "By Field A",
      "Select a field",
      (value) => {
        fieldXValue = value;
        fieldYPopulateMenu(fieldXValue); //field Y dropdown menu won't contain this selected value
      }
    );

    const fieldYPopulateMenu = createDropdown(
      fieldYParent,
      "And Field B",
      "Select a field",
      (value) => {
        fieldYValue = value;
        fieldXPopulateMenu(fieldYValue); //field X dropdown menu won't contain this selected value
      }
    );
  }

  createComparisonDropdown();
  createFieldDropdowns();
}


// Function to create a new array to generate the filters dropdown
function createCategoricalArrayForFilterPanel() {

  // Extract headers marked as "Categorical" 
  const CategoricalHeaders = dropdownState
    .filter(item => item.value === 'Categorical')
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

function createNumericalArray() {

  numericalHeaderArray = dropdownState
    .filter(item => item.value === 'Numerical')
    .map(item => item.header);
}

function createCategoricalHeaderArray() {
  categoricalHeaderArray = dropdownState
    .filter(obj => obj.value === 'Categorical')
    .map(obj => obj.header);
}



function loadAnalyzeButtonPanel() {


  //review button
  const leftCol = document.getElementById('navigation-back-column');
  leftCol.innerHTML = '';
  const reviewButton = document.createElement('button');
  reviewButton.classList.add('btn', 'btn-secondary');
  reviewButton.innerHTML = `<i class="fa-solid fa-left-long"></i> Review`;
  leftCol.appendChild(reviewButton);

  reviewButton.addEventListener('click', navToReview);

  const rightCol = document.getElementById('navigation-next-column');
  rightCol.innerHTML = '';

}






// function to Create the filter dropdown using the Categorical array
function createFilterButton() {
  const filterColumn = document.getElementById('filter-column');

  // Create the menu container
  const dropdownContainer = document.createElement('div');
  dropdownContainer.classList.add('dropdown');

  // Create the button
  const filterSelect = document.createElement('button');
  filterSelect.innerHTML = `<i class="fa-solid fa-filter"></i> Filter`;
  filterSelect.className = 'btn btn-grey';
  filterSelect.type = 'button';
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
          filterData();
        });
      });
    }
  });

  // Function to update the Filtered by array based on selected checkboxes
  function filterData() {
    filteredData = [];
    const selectedValues = Array.from(
      document.querySelectorAll(
        '#filter-select ~ .dropdown-menu input[type="checkbox"]:checked'
      )
    ).map(checkbox => {
      const value = checkbox.value;
      const header = itemToHeaderMap.get(value);
      return { header, value };
    });

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
    for (let i = 0; i < parsedCSVData.length; i++) {
      let item = parsedCSVData[i]; // Get the current item from parsedCSVData
      if (matchesFilter(item, selectedValues)) {
        // Check if the item matches the filters
        filteredData.push(item); // If it matches, add it to the filtered array
      }
    }

    // Find each AnalysisObject and update its filteredBy array
    analysisObjects.forEach(obj => {
      obj.filteredBy = selectedValues;
    })
    const summaryAnalysisObject = analysisObjects.find(obj => obj.id === 1);
    summaryAnalysisObject.beginSummaryChartGenerationProcess(summaryAnalysisObject.analysisType);

    const advancedAnalysisObject = analysisObjects.find(obj => obj.id === 2);
    advancedAnalysisObject.beginComparisonChartGenerationProcess(advancedAnalysisObject.analysisType);

    console.log('analysis objects:', analysisObjects);


  }

  // Append elements to the dropdown container
  dropdownContainer.appendChild(filterSelect);
  dropdownContainer.appendChild(filterMenu);

  filterColumn.appendChild(dropdownContainer);

  // Prevent dropdown menu from closing when clicking inside
  filterMenu.addEventListener('click', function (event) {
    event.stopPropagation();
  });
}




// a boilerplate for analysis objects. users will be able to create many of them
class AnalysisObject {
  constructor(id) {
    //create a new empty object
    this.id = id; // 
    this.analysisType = ''; // summary or advanced
    this.summaryValue = []; // stores all values for summary/distribution tab
    this.compareType = null; // count/sum/avg...
    this.compareBy = null; //either null or a numerical value if sum/avg
    this.compareFieldA = null; //compare field A
    this.compareFieldB = null; //compare field B
    this.compareHeatmapDataArray = null;
    this.filteredBy = []; // sometimes the data will be filtered by these values
    this.chartObjects = []; // the array storing the charts created by the above parameters
    this.label = ''; // Optional label for user naming

    //add to analysisObjects array
    analysisObjects.push(this);

  }

  beginSummaryChartGenerationProcess() {
    this.chartObjects = []; // Clear any pre-existing charts before creating new ones
    this.summaryValue.forEach(field => {
      const type = dropdownState.find(item => item.header === field).value;

      let result = [];
      let percentagesCounts = [];
      let chartTitle = '';
      let chartID = '';
      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      let analysisType = ''; //to know what type of visTypes we can offer (e.g. categoryDistribution, numberDistribution)
      let visType = ''; //for charts.js to render the right chart type (e.g. bar, pie, line)
      let chartType = ''; // for cuadro to load the right chart options (e.g. horizontal bar or vertical columns)


      if (type === 'Categorical') {
        result = this.genSummaryCatData(field);
        percentagesCounts = result.PercentagesCounts;
        chartTitle = `Count of occurrences by '${field}'`;
        chartID = `summary-simple-${field}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens
        analysisType = 'categoryDistribution';
        visType = 'bar';
        chartType = 'horizontal-bars';
      }
      if (type === 'Numerical') {
        result = this.genSummaryNumData(field);
        percentagesCounts = '';
        chartTitle = `Count of occurrences by range of '${field}'`;
        chartID = `summary-number-${field}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens
        analysisType = 'numberDistribution';
        visType = 'line';
        chartType = 'area';
      }

      const data = result.data;
      const labels = result.labels;


      // Create and add the chart
      const newChartObject = new ChartObject(
        analysisType,
        visType,
        chartType,
        chartTitle,
        chartID,
        data,
        labels,
        percentagesCounts,
        [],
        [],
        field,
        this.filteredBy,
        null,
        null,
        null,
        null,
        null
      ); //value= the current item in the summaryValue foreach loop
      newChartObject.chartType = chartType;
      this.chartObjects.push(newChartObject); // add the new chart object at the end of the analysis object's charts array

    })

    this.prepChartContainer('summary');
  }

  beginComparisonChartGenerationProcess() {
    this.chartObjects = []; // Clear any pre-existing charts before creating new ones
    let chartTitle = '';
    let chartID = '';
    let chartType = '';
    let visType = '';
    let analysisType = '';
    let result = '';
    const percentagesCounts = null;
    let sumsPercentages = [];
    const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();


    if (this.compareType === 'Count of occurrences') {
      chartTitle = `Count of occurrences by '${this.compareFieldA}' and '${this.compareFieldB}'`;
      chartID = `comparison-count-of-occurrences-by-${this.compareFieldA}-and-${this.compareFieldB}-filtered-by-${filteredByString}`;
      analysisType = 'countOfOccurrencesComparison';
      visType = 'bar';
      chartType = 'horizontal-clusters';
      result = this.genCountABData();
    }

    if (this.compareType === 'Sum of') {

      if (this.compareFieldB === null) { //if only field A is selected
        chartTitle = `Sum of '${this.compareBy}' by '${this.compareFieldA}'`;
        chartID = `comparison-sum-${this.compareBy}-by-${this.compareFieldA}-filtered-by-${filteredByString}`;
        analysisType = 'sumComparisonOneField';
        visType = 'bar';
        chartType = 'horizontal-bars';
        result = this.genSumAData(this.compareBy, this.compareFieldA);
        sumsPercentages = result.sumsPercentages;

      }

      else { //if both field a and b are selected
        chartTitle = `Sum of '${this.compareBy}' by '${this.compareFieldA}' and '${this.compareFieldB}'`;
        chartID = `comparison-sum-${this.compareBy}-by-${this.compareFieldA}-and-${this.compareFieldB}-filtered-by-${filteredByString}`;
        analysisType = 'sumComparisonTwoFields';
        visType = 'bar';
        chartType = 'horizontal-clusters';
        result = this.gensumABData();

      }
    }
    if (this.compareType === 'Average of') {

      if (this.compareFieldB === null) { //if only field A is selected
        chartTitle = `Average of '${this.compareBy}' by '${this.compareFieldA}'`;
        chartID = `comparison-avg-${this.compareBy}-by-${this.compareFieldA}-filtered-by-${filteredByString}`;
        analysisType = 'avgComparisonOneField';
        visType = 'bar';
        chartType = 'horizontal-bars';
        result = this.genAvgAData(this.compareBy, this.compareFieldA);
      }

      else { //if both field a and b are selected
        chartTitle = `Average of '${this.compareBy}' by '${this.compareFieldA}' and '${this.compareFieldB}'`;
        chartID = `comparison-avg-${this.compareBy}-by-${this.compareFieldA}-and-${this.compareFieldB}-filtered-by-${filteredByString}`;
        analysisType = 'avgComparisonTwoFields';
        visType = 'bar';
        chartType = 'horizontal-clusters';
        result = this.genavgABData();
      }
    }
    const data = result.data;
    const labels = result.labels;
    const heatmapData = result.heatmapData;

    // Create and add the chart
    const newChartObject = new ChartObject(
      analysisType,
      visType,
      chartType,
      chartTitle,
      chartID,
      data,
      labels,
      percentagesCounts,
      sumsPercentages,
      data,
      '',
      this.filteredBy,
      this.compareType,
      this.compareBy,
      this.compareFieldA,
      this.compareFieldB,
      heatmapData
    ); //value= the current item in the summaryValue foreach loop
    this.chartObjects.push(newChartObject); // add the new chart object at the end of the analysis object's charts array

    console.log('comparison chart data', this);

    if (this.compareFieldA !== null && (this.compareType === "Sum of" || this.compareType === "Average of" ) || (this.compareType==="Count of occurrences" && this.compareFieldA !== null && this.compareFieldB !==null )) {
      this.prepChartContainer('advanced');
    }
  }

  // Function to render all chart objects
  prepChartContainer(summaryOrAdvanced) {
    // Find the step-body container where the cards will be appended
    const TabContent = document.getElementById(`${summaryOrAdvanced}-tab-content`);
    let cardsContainer = document.getElementById(`${summaryOrAdvanced}-tab-cards-container`);

    if (cardsContainer) {
      //if the cards container was created in a previous call, empty it.
      cardsContainer.innerHTML = '';
    } else {
      //if the cards container doesn't exist, create it within the stepbody div
      cardsContainer = document.createElement('div');
      cardsContainer.id = `${summaryOrAdvanced}-tab-cards-container`;
      TabContent.appendChild(cardsContainer);
    }


    this.chartObjects.forEach(chart => {
      renderChartInCard(chart, cardsContainer);
    });


  }

  addComparativeChartObjects() {
    this.chartObjects = []; // Clear existing charts
    this.summaryValue.forEach(value => {
      // Generate data, labels, and cluster labels for the clustered chart
      const result = this.genPercentageCountABData(
        value,
        this.groupedBy,
        this.filteredBy
      );

      const data = result.data;
      const labels = result.labels;
      const clusterLabels = result.clusterLabels;
      const percentagesCounts = result.percentagesCounts;
      const summaryValueType = dropdownState.find(obj => obj.header === value);
      let chartTitle = '';

      chartTitle = `Count of occurrences by '${value}' grouped by '${this.groupedBy}' `;


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
    this.prepChartContainer(); // render clustered once the code and data is ready
  }


  genSummaryCatData(header) {

    // Count the occurrences of each unique value for the specified header
    let countMap = {}; // Initialize an empty object for counting
    for (let i = 0; i < filteredData.length; i++) {
      let item = filteredData[i]; // Get the current item from the filtered array
      let value = item[header]; // Get the value from the curent item's summaryValue header
      if (countMap[value]) {
        // If the value is already in countMap, increment its count
        countMap[value]++;
      } else {
        // Otherwise, add the value to countMap with a count of 1
        countMap[value] = 1;
      }
    }

    // Calculate the percentage for each unique value
    let totalCount = filteredData.length; // Get the total count of filtered items
    let data = []; // Initialize an array for the data
    let labels = []; // Initialize an array for the labels
    let PercentagesCounts = [];

    // Get an array of keys from the countMap object - these are the unique values of the items in the summaryValue array
    let keys = Object.keys(countMap);

    // Use a standard for loop to iterate through the keys
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i]; // Get the current key
      let count = countMap[key]; // Get the count for the current key
      let percentage = Math.round(count / totalCount * 100); // Calculate the percentage
      let percentageCount = `${count} (${percentage}%)`; //merge percentage and count - useful for data labels later
      data.push(count); // Add the percentage to the data array
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

  genSummaryNumData(header) {
    const numbers = filteredData.map(obj => Number(obj[header].trim()));

    // Step 1: Calculate the range of the data
    const minValue = Math.min(...numbers);
    const maxValue = Math.max(...numbers);
    const dataRange = maxValue - minValue;

    // Handle edge case where all numbers are the same
    if (dataRange === 0) {
      return {
        data: [numbers.length], // All values fall into one bin
        labels: [`${minValue}`], // Single bin with the value itself
      };
    }

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

    return {
      data: frequencies,
      labels: binRanges,
    };
  }

  genPercentageCountABData(header, groupedBy) {

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

  genSumAData(header, groupedBy) {

    const headerType = dropdownState.find(item => item.header === header).value;

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



    const groupNames = new Set(filteredData.map(row => row[groupedBy]));
    groupNames.forEach(group => {
      groupSums[group] = Math.round(groupSums[group] * 100) / 100;     //round as needed to the nearest decimal if applicable

    })

    let sumTotal = Object.values(groupSums).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    let groupSumsPercentages = {};

    Object.keys(groupSums).forEach(group => {
      groupSumsPercentages[group] = groupSums[group] + ' (' + Math.round(groupSums[group] / sumTotal * 100) + '%)';
    })

    // Prepare labels and data arrays
    const labels = Object.keys(groupSums); // Unique groups for cluster labels
    const data = labels.map(groupKey => groupSums[groupKey]); // Sums for each group
    const sumsPercentages = labels.map(groupKey => groupSumsPercentages[groupKey]);

    return {
      data, // Array with sums for each group
      labels,
      sumsPercentages
    };

  }

  genCountABData() {

    this.compareHeatmapDataArray = [];

    const uniqueA = [...new Set(filteredData.map(row => row[this.compareFieldA]))].sort();
    const uniqueB = [...new Set(filteredData.map(row => row[this.compareFieldB]))].sort();
    const labels = uniqueB;
    const data = [];


    uniqueA.forEach(valueA => {
      const clusterData = [];
      uniqueB.forEach(valueB => {
        //filter my data so that it only has rows with both value a and b
        const compareFilteredData = filteredData.filter(row => row[this.compareFieldA] === valueA && row[this.compareFieldB] === valueB)
        //make an array with the compareBy field's contents
        const countAB = compareFilteredData.length;
        this.compareHeatmapDataArray.push({ A: valueA, B: valueB, value: countAB });
        clusterData.push(countAB);
      })
      data.push({ label: valueA, data: clusterData });
    })

    const heatmapData = this.compareHeatmapDataArray;
    return { labels, data, heatmapData }; // Return for clustered bar chart

  }

  gensumABData() {

    this.compareHeatmapDataArray = [];

    const uniqueA = [...new Set(filteredData.map(row => row[this.compareFieldA]))].sort();
    const uniqueB = [...new Set(filteredData.map(row => row[this.compareFieldB]))].sort();
    const labels = uniqueB;
    const data = [];


    uniqueA.forEach(valueA => {
      const clusterData = [];
      uniqueB.forEach(valueB => {
        //filter my data so that it only has rows with both value a and b
        const compareFilteredData = filteredData.filter(row => row[this.compareFieldA] === valueA && row[this.compareFieldB] === valueB)
        //make an array with the compareBy field's contents
        const compareByFilteredData = compareFilteredData.map(row => row[this.compareBy]);
        //sum the contents
        const sumValue = Math.round((compareByFilteredData.reduce(
          (accumulator, currentValue) => accumulator + (Number(currentValue) || 0), 0))*100)/100;
        
        this.compareHeatmapDataArray.push({ A: valueA, B: valueB, value: sumValue });
        clusterData.push(sumValue);
      })
      data.push({ label: valueA, data: clusterData });
    })

    const heatmapData = this.compareHeatmapDataArray;
    return { labels, data, heatmapData }; // Return for clustered bar chart

  }

  genAvgAData(header, groupedBy) {

    const headerType = dropdownState.find(item => item.header === header).value;

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

    return {
      data, // Array with sums for each group
      labels,
    };
  }

  genavgABData() {

    this.compareHeatmapDataArray = [];

    const uniqueA = [...new Set(filteredData.map(row => row[this.compareFieldA]))].sort();
    const uniqueB = [...new Set(filteredData.map(row => row[this.compareFieldB]))].sort();
    const labels = uniqueB;
    const data = [];


    uniqueA.forEach(valueA => {
      const clusterData = [];
      uniqueB.forEach(valueB => {
        // Filter my data so that it only has rows with both valueA and valueB
        const compareFilteredData = filteredData.filter(row => row[this.compareFieldA] === valueA && row[this.compareFieldB] === valueB);
        // Make an array with the compareBy field's contents
        const compareByFilteredData = compareFilteredData.map(row => row[this.compareBy]);
        // Calculate the average of the contents
        const total = compareByFilteredData.reduce(
          (accumulator, currentValue) => accumulator + (Number(currentValue) || 0), 0);

        const avgValue = compareByFilteredData.length > 0 ? total / compareByFilteredData.length : 0; // To avoid division by zero
        // Round the average to 2 decimal places
        const roundedAvgValue = Math.round(avgValue * 100) / 100;
        this.compareHeatmapDataArray.push({ A: valueA, B: valueB, value: roundedAvgValue });
        clusterData.push(roundedAvgValue);
      });
      data.push({ label: valueA, data: clusterData });
    });

    const heatmapData = this.compareHeatmapDataArray;
    return { labels, data, heatmapData }; // Return for clustered bar chart
  }

}


// Function to update an existing AnalysisObject by ID


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
}

// boilerplate for charts we create via the generic dropdown option.
class ChartObject {
  constructor(analysisType, visType, chartType, title, id, data, labels, percentagesCounts, sumsPercentages, clusterLabels, summaryValue, filteredBy, compareType, comparedBy, compareFieldA, compareFieldB, compareHeatmapDataArray) {
    this.analysisType = analysisType; //to know what type of visTypes we can offer (e.g. categoryDistribution, numberDistribution)
    this.visType = visType; //for charts.js to render the right chart type (e.g. bar, pie, line)
    this.chartType = chartType; // for cuadro to load the right chart options (e.g. horizontal bar or vertical columns) 
    this.title = title; // Title of the chart
    this.id = id;
    this.data = data; // Data required for chart generation
    this.labels = labels; // Data required for chart generation
    this.percentagesCounts = percentagesCounts; // Labels for the data points
    this.sumsPercentages = sumsPercentages;
    this.clusterLabels = clusterLabels; // New property for cluster labels
    this.summaryValue = summaryValue;
    this.filteredBy = filteredBy;
    this.compareType = compareType; // count/sum/avg...
    this.comparedBy = comparedBy; //either null or a numerical value if sum/avg
    this.compareFieldA = compareFieldA; //compare field A
    this.compareFieldB = compareFieldB; //compare field B
    this.compareHeatmapDataArray = compareHeatmapDataArray;
    this.backgroundColor = 'rgba(36, 123, 160, 0.2)'; //
    this.borderColor = 'rgba(36, 123, 160, 1)'; //
    this.borderWidth = 1;
    this.bookmarked = false;

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
          formatter: (value, context) => {
            // Use percentagesCounts based on the index of the current data point
            return this.sumsPercentages[context.dataIndex];
          }
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
          formatter: (value, context) => {
            // Use percentagesCounts based on the index of the current data point
            return this.sumsPercentages[context.dataIndex];
          }
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
      indexAxis: 'y', // Horizontal bars
      scales: {
        x: {
          stacked: false, // Grouped bars, not stacked
          ticks: {
          },
          title: {
            display: false,
            text: '', // Add a descriptive title
          },
        },
        y: {
          stacked: false,
          beginAtZero: true, // Start y-axis at 0
          title: {
            display: false,
            text: '',
          },
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5, // Optional styling for rounded bars
        },
      },
      plugins: {
        datalabels: {
          rotation: 0, // Horizontal orientation for data labels
          color: 'black',
          anchor: 'start',
          align: 'end', // Align data labels properly with horizontal bars
        },
        legend: {
          position: 'top', // Move legend to the top
          labels: {
            boxWidth: 12, // Adjust box size for clarity
            usePointStyle: true, // Use circular markers instead of squares
          },
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`; // Format tooltip for grouped data
            },
          },
        },
      },
    };


    this.verticalClusteredColumnChartOptions = {
      responsive: true,
      indexAxis: 'x', // Vertical bars
      scales: {
        y: {
          stacked: false, // Grouped bars, not stacked
          ticks: {

          },
          beginAtZero: true, // Start y-axis at 0
          title: {
            display: false,
            text: '', // Add a descriptive title
          },
        },
        x: {
          stacked: false,
          title: {
            display: false,
            text: '', // Label for uniqueA
          },
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5, // Optional styling for rounded bars
        },
      },
      plugins: {
        datalabels: {
          rotation: 90, // Vertical orientation for data labels
          color: 'black',
          anchor: 'start',
          align: 'end', // Align data labels properly with vertical bars
        },
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
            },
          },
        },
      },
    };

  }
}

function // Function to create and render a chart in a Bootstrap card component and append to 'step-body'
  renderChartInCard(chartObject, container) {

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
  card.appendChild(cardBody);
  container.appendChild(card);

  const cardOptionsColumn = document.createElement('div');
  cardOptionsColumn.classList.add(
    'col-md-12',
    'd-flex',
    'justify-content-end'
  );
  const cardTitleColumn = document.createElement('div');
  cardTitleColumn.classList.add('col-12', 'mt-2');
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
  if (chartObject.chartType === 'area') {
    dropdownButton.textContent = 'Area';
  }
  if (chartObject.chartType === "horizontal-clusters") {
    dropdownButton.textContent = 'Horizontal Clusters';
  }

  // Create the dropdown menu with items
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.classList.add('dropdown-menu');

  //generic function to create menu items
  function createMenuItem(chartType, text) {
    const DropdownLink = document.createElement('li');
    dropdownMenu.appendChild(DropdownLink);
    const linkAnchor = document.createElement('a');
    linkAnchor.id = chartType + chartObject.id;
    linkAnchor.textContent = text;
    linkAnchor.className = 'dropdown-item';
    DropdownLink.appendChild(linkAnchor);

    //create listener function that recreates the canvas upon updating the option
    linkAnchor.addEventListener('click', function () {
      dropdownButton.textContent = text;
      chartObject.chartType = chartType;
      createCanvas();
      //if applicable, update the corresponding bookmark's charttype attribute 
      const bookmark = bookmarks.find(bookmark => bookmark.id === chartObject.id);
      if (bookmark) {
        bookmark.chartType = chartObject.chartType;
      }
    })
  }

  //determine which menu items to populate with
  if (chartObject.analysisType === 'categoryDistribution' || chartObject.analysisType === 'sumComparisonOneField' || chartObject.analysisType === 'avgComparisonOneField') {
    createMenuItem('horizontal-bars', 'Horizontal Bars');
    createMenuItem('vertical-columns', 'Vertical Columns');
  }
  if (chartObject.analysisType === 'numberDistribution') {
    createMenuItem('area', 'Area');
  }
  if (chartObject.analysisType === 'sumComparisonTwoFields' || chartObject.analysisType === 'avgComparisonTwoFields' || chartObject.analysisType === "countOfOccurrencesComparison") {
    createMenuItem('horizontal-clusters', 'Horizontal Clusters');
    createMenuItem('vertical-clusters', 'Vertical Clusters');
    createMenuItem('heatmap', 'Heatmap');

  }

  dropdownWrapper.appendChild(dropdownButton);
  dropdownWrapper.appendChild(dropdownMenu);
  cardOptionsColumn.appendChild(dropdownWrapper);


  //create the bookmark button and set whether it is active or not
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

    if (container.id === 'advanced-tab-cards-container') {
      canvas.id = 'canvas-' + chartObject.id;
    }
    if (container.id === 'bookmarksBodyColumn') {
      canvas.id = 'bookmarked-canvas-' + chartObject.id;
    }
    if (container.id === 'summary-tab-cards-container') {
      canvas.id = 'summary-canvas-' + chartObject.id;
    }
    canvas.style.width = '100%'; // Full width


    //analysis type specificities
    let yMaxValue;

    if (chartObject.analysisType === 'numberDistribution') {

      let minDataValue = Math.min(...chartObject.data);
      yMinValue = minDataValue > 100 ? minDataValue * 0.9 : 0; // Adjusts to 90% of the min value, or 0 if min is small
      yMaxValue = Math.ceil(Math.max(...chartObject.data) * 1.1);
    }

    //chart type specificities
    let chartOptions = '';
    canvas.style.height = '300px'; //default height
    if (chartObject.chartType === 'horizontal-bars' && chartObject.analysisType === 'categoryDistribution') {
      canvas.style.height = `${chartObject.data.length * 40 + 50}px`; // Set the height dynamically
      chartOptions = chartObject.horizontalBarChartOptions;
    }
    if (chartObject.chartType === 'vertical-columns' && chartObject.analysisType === 'categoryDistribution') {
      chartOptions = chartObject.verticalColumnChartOptions;
    }
    if (chartObject.chartType === 'horizontal-bars' && (chartObject.analysisType === "sumComparisonOneField" || chartObject.analysisType === "avgComparisonOneField")) {
      canvas.style.height = `${chartObject.data.length * 40 + 50}px`; // Set the height dynamically
      chartOptions = chartObject.horizontalCalculationBarChartOptions;
    }
    if (chartObject.chartType === 'vertical-columns' && (chartObject.analysisType === "sumComparisonOneField" || chartObject.analysisType === "avgComparisonOneField")) {
      chartOptions = chartObject.verticalCalculationBarChartOptions;
    }

    if (chartObject.chartType === 'horizontal-clusters') {
      canvas.style.height = `${chartObject.data.length * chartObject.data[0].data.length * 40 + 50}px`; // Set the height dynamically
      chartOptions = chartObject.horizontalClusteredBarChartOptions;
    }
    if (chartObject.chartType === 'vertical-clusters') {
      chartOptions = chartObject.verticalClusteredColumnChartOptions;
    }

    if (chartObject.chartType === 'area') {
      chartOptions = {
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
            max: yMaxValue,
            ticks: {
              stepSize: 1, // Set tick interval to 1
              callback: function (value) {
                return Number.isInteger(value) ? value : null; // Show only integer values
              }
            }
          }
        }
      }
    }

    // Append the canvas to the card body
    cardBody.appendChild(canvas);

    // Render the chart on the canvas
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    new Chart(ctx, { //new chart in canvas
      //create a new chart using the properties of the chartObject being called as an argument in the function
      type: chartObject.visType,
      data: {
        labels: chartObject.labels,
        datasets: createDatasets(chartObject)
      },
      options: chartOptions,
    });

  }
  function createDatasets(chartObject) {
    // Check if the chart type includes 'clusters'
    if (chartObject.chartType.includes('clusters')) {
      // Map through the data and return a dataset for each item
      return chartObject.data.map((dataItem, index) => {
        const colorIndex = index % colorPalette.length;
        const backgroundColor = colorPaletteWithOpacity[colorIndex];
        const borderColor = colorPalette[colorIndex];

        return {
          label: dataItem.label,  // The label for each dataset (e.g., 'Alex\r')
          data: dataItem.data,    // The data array corresponding to uniqueB for this label
          backgroundColor: backgroundColor, // Color for the dataset
          borderColor: borderColor, // Border color for the dataset
          borderWidth: chartObject.borderWidth || 1, // Border width, defaulting to 1 if not set
          maxBarThickness: chartObject.chartMaxBarThickness || 50, // Max thickness of bars
          fill: false, // No filling under the bars for clustered charts
        };
      });
    }

    // Fallback for non-clustered charts
    return [
      {
        data: chartObject.data,
        backgroundColor: chartObject.backgroundColor,
        borderColor: chartObject.borderColor,
        borderWidth: chartObject.borderWidth,
        maxBarThickness: 50,
        tension: 0.4,
        fill: true, // Apply fill for non-clustered charts
      },
    ];
  }


  createCanvas();

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
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));


    //if you're ractivating from bookmarks overlay, we should reactivate any simple or advanced chart object
    const analysisIds = [1, 2]; // List of analysis object ids

    // Loop through each id and apply the logic
    analysisIds.forEach((id) => {
      const analysisObject = analysisObjects.find(obj => obj.id === id); // Find the analysis object for the current id

      for (let i = 0; i < analysisObject.chartObjects.length; i++) { // Loop through the chart objects
        if (analysisObject.chartObjects[i].id === chart.id) { // Check if the chart id matches
          analysisObject.chartObjects[i].bookmarked = true; // Unbookmark the chart object
          break; // Exit the loop as the chart object is found
        }
      }
    });


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
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    console.log('bookmarks: ', bookmarks);

    const analysisIds = [1, 2]; // List of analysis object ids

    // Loop through each id and apply the logic
    analysisIds.forEach((id) => {
      const analysisObject = analysisObjects.find(obj => obj.id === id); // Find the analysis object for the current id

      for (let i = 0; i < analysisObject.chartObjects.length; i++) { // Loop through the chart objects
        if (analysisObject.chartObjects[i].id === chart.id) { // Check if the chart id matches
          analysisObject.chartObjects[i].bookmarked = false; // Deactivate the bookmark
          break; // Exit the loop as the chart object is found
        }
      }
    });

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
      emptyBookmarksContainer.style.backgroundColor = 'rgba(36, 123, 160, 0.2)';
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
        renderChartInCard(bookmarks[i], bookmarksBodyColumn);
  
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

        // Maximum dimensions for the image in inches
        const maxWidth = 7;  // Maximum width in inches
        const maxHeight = 5;  // Maximum height in inches

        // Convert canvas dimensions from pixels to inches (96 DPI)
        let imgWidth = canvas.width / 96;
        let imgHeight = canvas.height / 96;

        // Calculate aspect ratio
        const aspectRatio = imgWidth / imgHeight;

        // Adjust dimensions while maintaining aspect ratio
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = maxWidth / aspectRatio;
        }
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = maxHeight * aspectRatio;
        }

        // Create a new slide
        const slide = pptx.addSlide();
        let slideWidth = 10;
        let slideHeight = 5.63;

        // Calculate X and Y positions to center the image
        let xPos = (slideWidth - imgWidth) / 2;
        let yPos = (slideHeight - imgHeight) / 2;

        // Add the centered image using percentage for positioning
        slide.addImage({
          data: imgData,
          x: xPos,
          y: yPos,
          w: imgWidth,
          h: imgHeight,
          sizing: {
            type: 'contain', // 'contain', 'cover', or 'crop'
            w: imgWidth, // Width in inches
            h: imgHeight // Height in inches
          }
        });

        // Move to the next card
        cardIndex++;
        processNextCard();
      });
    } else {
      // Once all cards are processed, save the PPTX
      pptx.writeFile({ fileName: 'charts.pptx' });
    }
  }

  // Start processing the first card
  processNextCard();
}
