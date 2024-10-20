
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
let CategoricalArray = []; //global array that saves all unique values of columns tagged as Categorical - useful for filters
let parsedCSVData = []; // global array that stores the uploaded csv's data
let analysisObjects = []; // Array to store analysis object instances
let nextAnalysisId = 1; // Unique ID counter
let currentAnalysisId = 1; //what analysis object the user is currently analyzing. set to 1 as the default, will update later.
let colorPalette = ['#247ba0', '#f25f5c', '#ffe066','#50514f', '#70c1b3', '#6a4c93', '#0ead69', '#ffa5ab', '#1982c4', '#f3722c'];
let colorPaletteWithOpacity = ['rgba(36, 123, 160, 0.4)', 'rgba(242, 95, 92, 0.4)', 'rgba(255, 224, 102, 0.4)', 'rgba(80, 81, 79, 0.4)', 'rgba(112, 193, 179, 0.4)', 'rgba(106, 76, 147, 0.4)', 'rgba(14, 173, 105, 0.4)', 'rgba(255, 165, 171, 0.4)', 'rgba(25, 130, 196, 0.4)', 'rgba(243, 114, 44, 0.4)'];

let bookmarks = [];

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
  uploadContainer.classList.add(
    'container',
    'd-flex',
    'flex-column',
    'align-items-center',
    'justify-content-center',
    'text-center'
  );
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
  uploadText.innerHTML = 'Upload the CSV file you wish to analyze.';
  uploadText.classList.add('my-3'); // Added margin for spacing
  uploadContainer.appendChild(uploadText);



  // Create and add the "Choose file" button
  const chooseFileButton = document.createElement('button');
  chooseFileButton.className = 'btn btn-secondary';
  chooseFileButton.textContent = 'Choose file';
  chooseFileButton.id = 'chooseFileButton';
  uploadContainer.appendChild(chooseFileButton);

  const sampleFile = document.createElement('a');
  sampleFile.classList.add('text-decoration-none','small','mt-3','sample-data-link');
sampleFile.href = `../Football player stats.csv`; // Path to the file
sampleFile.download = 'Football player stats.csv'; // Suggest the filename for download
sampleFile.innerHTML = '<i class="fa-solid fa-download"></i> Sample data : Football Player Stats'; // Text for the link
uploadContainer.appendChild(sampleFile);

  // Clear existing content and append the upload container and its content to the step body
  stepBody.innerHTML = '';
  stepBody.appendChild(uploadContainer);
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
      // Update UI with the name of the selected file
      initializeReviewStep();
    };
    reader.readAsText(file); // Reads the content of the file as a text string
  };
}


//REVIEW STEP

// Function to initialize the "Review" step
function initializeReviewStep() {

   // Add the event listener that triggers a warning message whenever the user tries to close or refresh the tab
   window.addEventListener('beforeunload', alertUnsavedChanges);

  // Clear step body content
  const stepBody = document.getElementById('step-body');
  stepBody.innerHTML = '';

  //clear the bottom panels
  const panelButtonContainer1 = document.getElementById(
    'panel-button-container-1'
  );
  const panelButtonContainer2 = document.getElementById(
    'panel-button-container-2'
  );
  panelButtonContainer1.innerHTML = `<button id="restart-button" class="btn btn-secondary"><i class="fas fa-arrow-left" style="padding-right:0.2rem"></i>Restart</button>`;
  panelButtonContainer2.innerHTML = `  
  <button id="analyze-button" class="btn btn-primary">Analyze<i class="fas fa-arrow-right" style="padding-left:0.2rem"></i></button>`;

  // Create the restart button and add to bottom panel
  const restartButton = document.getElementById('restart-button');
  restartButton.addEventListener('click', () => {
    location.reload();
  }); // a confirmation dialog will appear due to a function above

  // Call to setup the analyze button listener
  setupAnalyzeStep();

  // Update stepper styling
  const stepperUpload = document.getElementById('stepper-upload');
  stepperUpload.classList.remove('stepper-primary');
  const stepperReview = document.getElementById('stepper-review');
  stepperReview.classList.add('stepper-primary');

  //Reset Analyze stepper button style in case you're coming back from Analyze
  const stepperAnalyze = document.getElementById('stepper-analyze');
  stepperAnalyze.classList.remove('stepper-primary');

  //call fctn to delete any existing analysis objects in case you're coming back from Analyze
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
                Review each of your fields' data types
            </button>
        </h2>
        <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
            <div class="accordion-body">
                Please take a minute to map your data. This will help us give you the best outputs for your needs.
                <ul>
                    <li><strong>Categorical (default):</strong> Also known as discrete data. Use this for fields where a restricted set of possible values is expected. A field with unique values doesn't fall into Categorical - it should be set to Ignore.</li>
                    <li><strong>Numerical:</strong> This is for any field containing numerical values. We will compute these by summing them, rather than counting them.</li>
                                        <li><strong>Date / Time:</strong> This is for any field containing timestamps. This is especially useful for generating time-based comparisons, such as line charts and so on.</li>
                    <li><strong>Ignore:</strong> Assign this to any field that doesn't fall into the above categories. e.g. comments, names, unique identifiers, etc.</li>

                </ul>
            </div>
        </div>
    </div>
`;

  stepBody.appendChild(accordion);

  //this triggers a cascade of functions...transform csv into array and generate the review table
  parseCSVToArray(selectedFile);
}

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

  //if the data type dropdowns had been configured already (i.e user accessed the review step via the back button in analyze step...)
  if (dropdownState.length > 0) {
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
      cell3.appendChild(select);
      row.appendChild(cell3);

      tbody.appendChild(row);
    });

    //if the previous rule failed and the csv has data in it...it should...
  } else if (parsedCSVData.length > 0) {
    const headers = Object.keys(parsedCSVData[0]); // use the keys from the 1st object in the array as the headers

    headers.forEach(header => {
      //for each header
      const row = document.createElement('tr'); //create a row

      const cell1 = document.createElement('td');
      cell1.style.width = '25%';
      cell1.textContent = header; //the first column will display the header
      row.appendChild(cell1);

      // Data sample
      const cell2 = document.createElement('td');
      cell2.style.width = '50%';
      const samples = parsedCSVData
        .slice(0, 3)
        .map(data => data[header])
        .join(', '); //get the first three obj in the array, extract the data that matches the header, and display that data in the col
      cell2.textContent = samples;
      row.appendChild(cell2);

      // Data type dropdown
      const cell3 = document.createElement('td');
      cell3.style.width = '25%';
      const select = document.createElement('select'); //third row will be a dropdown
      select.classList.add('form-select', 'data-type-dropdown');
      const options = [
        'Categorical',
        'Numerical',
        'Date / Time',
        'Ignore'
      ]; //here are the options
      options.forEach(option => {
        //for each option...
        const optionElement = document.createElement('option'); //create a menu option
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      });
      select.addEventListener('change', function () {
        if (select.value === 'Numerical') {
          NumberFormattingWarning(header);
        }
        unsupportedDataTypesToast(select.value);
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

    // Log the parsed data for testing
    console.log('Parsed CSV Data:', parsedCSVData);

    // Call generateReviewTable here to ensure it's called after parsing
    generateReviewTable(document.getElementById('step-body'));
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

function NumberFormattingWarning(event) {
  for (let i = 0; i < parsedCSVData.length; i++) {
    const numberCheck = Number(parsedCSVData[i][event].trim());
    if (isNaN(numberCheck)) {
      alert('At least one of the values in this field is not a number. Please review your data or select another data type.');
      break;
    }
  }
}

function unsupportedDataTypesToast(value) {
  if (value === 'Date / Time') {
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
}

// ANALYZE STEP

// Function to setup the analaysis step
function setupAnalyzeStep() {
  const analyzeButton = document.getElementById('analyze-button');
  analyzeButton.addEventListener('click', () => {
    //save the review table's configuration into an array
    saveDataTypestoArray();

    //adjust the steppers
    document.getElementById('stepper-review').classList.remove('stepper-primary');
    document.getElementById('stepper-analyze');
    document.getElementById('stepper-analyze').classList.add('stepper-primary');

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
    //update the step body. will keep as a separate function because this is going to be big
    //updateStepBody();
    displayAnalysisOptions();

    //update the bottom panel. will keep as a separate function because this is going to be big
    const panelButtonContainer1 = document.getElementById(
      'panel-button-container-1'
    );
    const panelButtonContainer2 = document.getElementById(
      'panel-button-container-2'
    );
    panelButtonContainer1.innerHTML = `
          <button id="review-button" class="btn btn-secondary"><i class="fas fa-arrow-left" style="padding-right:0.2rem"></i>Review</button>`;
    panelButtonContainer2.innerHTML = '';

    // Add event listener to the review button
    document.getElementById('review-button').addEventListener('click', () => {
      initializeReviewStep();
    });

    // run the function that creates the Categorical array, which is needed for the filter panel
    createCategoricalArrayForFilterPanel();

    //create a new analysis object
    createAnalysisObject()
  });
}


// Function to create a new array to generate the filters dropdown
function createCategoricalArrayForFilterPanel() {

  // Extract headers marked as "Categorical"
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

// new function to clear and uppdate the stepper body with analysis options
function displayAnalysisOptions() {
  const stepBody = document.getElementById('step-body');
  stepBody.classList.remove('mt-5');
  stepBody.classList.remove('mt-2');
  stepBody.classList.add('mt-3');
  // Clear any existing content
  stepBody.innerHTML = '';

  // Create the "i want to text", col and row
  const analysisOptionTextRow = document.createElement('div');
  analysisOptionTextRow.classList.add('row');
  analysisOptionTextRow.id = 'analysis-option-text-row';
  const analysisOptionTextColumn = document.createElement('div');
  analysisOptionTextColumn.classList.add('col-12');
  const analysisOptionText = document.createElement('h5');
  analysisOptionText.textContent = 'What do you want to see?';
  analysisOptionTextColumn.appendChild(analysisOptionText);
  analysisOptionTextRow.appendChild(analysisOptionTextColumn);
  stepBody.appendChild(analysisOptionTextRow);

  // Create the analysis option cards, cols, and row
  const analysisOptionCardsRow1 = document.createElement('div');
  analysisOptionCardsRow1.classList.add('row');
  const analysisOptionCardsRow2 = document.createElement('div');
  analysisOptionCardsRow2.classList.add('row');

  // Helper function to create a card in a column
  function createCardInCol(cardID, column, title, description, iconHTML) {
    const card = document.createElement('button');
    card.classList.add(
      'card',
      'h-100',
      'border-0',
      'shadow-sm',
      'rounded-3',
      'card-hover'
    );
    card.style.margin = '5px'; // Add some margin for spacing
    card.id = cardID;

    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'text-start');

    // Add the icon
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('mb-2');
    iconContainer.innerHTML = iconHTML;
    cardBody.appendChild(iconContainer);

    // Add the title
    const titleDiv = document.createElement('h5');
    titleDiv.classList.add('card-title');
    titleDiv.textContent = title;
    cardBody.appendChild(titleDiv);

    // Add the description
    const descriptionDiv = document.createElement('p');
    descriptionDiv.classList.add('card-text');
    descriptionDiv.textContent = description;
    cardBody.appendChild(descriptionDiv);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the column
    column.appendChild(card);
  }

  // Create the simple analysis column and card
  const analysisOptionCardBasicCol = document.createElement('div');
  analysisOptionCardBasicCol.classList.add('col-12', 'col-sm-4', 'mb-2');
  createCardInCol(
    'simple-analysis-option',
    analysisOptionCardBasicCol,
    'Category Frequencies',
    `Display categories and their frequency of occurrence in a bar chart.`,
    '<i class="fas fa-chart-bar"></i>'
  );

  // Create the numerical analysis column and card
  const analysisOptionCardNumCol = document.createElement('div');
  analysisOptionCardNumCol.classList.add('col-12', 'col-sm-4', 'mb-2');
  createCardInCol(
    'number-analysis-option',
    analysisOptionCardNumCol,
    'Number Frequencies',
    `Group numbers into ranges and display their distribution in an area chart.`,
    '<i class="fa-solid fa-chart-area"></i>'
  );

  // Create the comparative analysis column and card
  const analysisOptionCardCompareCol = document.createElement('div');
  analysisOptionCardCompareCol.classList.add('col-12', 'col-sm-4', 'mb-2');
  createCardInCol(
    'comparative-analysis-option',
    analysisOptionCardCompareCol,
    'Sub-category Frequencies',
    `Distribute fields into sub-categories within a clustered chart.`,
    '<i class="fas fa-table"></i>'
  );

  // Create the comparative analysis column and card
  const analysisOptionCardNumCompareCol = document.createElement('div');
  analysisOptionCardNumCompareCol.classList.add('col-12', 'col-sm-4', 'offset-sm-2', 'mb-2');
  createCardInCol(
    'number-comparative-analysis-option',
    analysisOptionCardNumCompareCol,
    'Sum by Category',
    'Add up numbers and group them into categories within a bar chart.',
    '<i class="fa-solid fa-calculator"></i>'
  );

  // Create the trend analysis column and card
  const analysisOptionCardTrendCol = document.createElement('div');
  analysisOptionCardTrendCol.classList.add('col-12', 'col-sm-4', 'mb-2');
  createCardInCol(
    'trend-analysis-option',
    analysisOptionCardTrendCol,
    'Trend Analysis',
    'Uncover patterns and changes over time.',
    '<i class="fas fa-chart-line"></i><span class="badge" style="background-color: #f4b400; margin-left:0.2rem; color: white; font-size: 0.875rem;">Coming Soon!</span>'
  );

  // Append analysis columns to the row
  analysisOptionCardsRow1.appendChild(analysisOptionCardBasicCol);
  analysisOptionCardsRow1.appendChild(analysisOptionCardNumCol);
  analysisOptionCardsRow1.appendChild(analysisOptionCardCompareCol);
  analysisOptionCardsRow2.appendChild(analysisOptionCardNumCompareCol);
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

  const numberComparativeCard = document.getElementById('number-comparative-analysis-option');
  numberComparativeCard.addEventListener('click', function () { handleIWantTo('number-comparative') });
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
  stepBody.classList.remove('mt-3');
  stepBody.classList.add('mt-2');
  // Clear any existing content
  stepBody.innerHTML = '';

  //create the back to start button, row and col
  const backRow = document.createElement('div');
  backRow.className = 'row';
  const backCol = document.createElement('div');
  backCol.classList.add('col-12');
  const backButton = document.createElement('button');
  backButton.classList.add('btn', 'btn-tertiary', 'text-muted');
  backButton.innerHTML =
    ' <i class="fas fa-arrow-left" style="padding-right:0.2rem"></i> Back to types';

  backCol.appendChild(backButton);
  backRow.appendChild(backCol);
  stepBody.appendChild(backRow);

  backButton.addEventListener('click', displayAnalysisOptions);

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
  iWantText.textContent = 'What do you want to see?';

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
  simpleListAnchorText.textContent = 'category frequencies';
  simpleListAnchor.setAttribute('data-value', 'simple');

  const numberListItem = document.createElement('li');
  const numberListAnchor = document.createElement('a');
  numberListAnchor.classList.add('dropdown-item');
  const numberListAnchorText = document.createElement('label');
  numberListAnchorText.textContent = 'number frequencies';
  numberListAnchor.setAttribute('data-value', 'number');

  const compareListItem = document.createElement('li');
  const compareListAnchor = document.createElement('a');
  compareListAnchor.classList.add('dropdown-item');
  const compareListAnchorText = document.createElement('label');
  compareListAnchorText.textContent = 'sub-category frequencies';
  compareListAnchor.setAttribute('data-value', 'comparative');

  const numberCompareListItem = document.createElement('li');
  const numberCompareListAnchor = document.createElement('a');
  numberCompareListAnchor.classList.add('dropdown-item');
  const numberCompareListAnchorText = document.createElement('label');
  numberCompareListAnchorText.textContent = 'sum by category';
  numberCompareListAnchor.setAttribute('data-value', 'number-comparative');

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

  numberCompareListAnchor.appendChild(numberCompareListAnchorText);
  numberCompareListItem.appendChild(numberCompareListAnchor);
  iWantMenu.appendChild(numberCompareListItem);

  // Append elements to the dropdown container
  iWantdropdownContainer.appendChild(iWantSelect);
  iWantdropdownContainer.appendChild(iWantMenu);

  // place the select dropdown to colDiv1
  typeColumn.appendChild(iWantText);
  typeColumn.appendChild(iWantdropdownContainer);



  if (event === 'simple') {
    // Update select.textContent
    iWantSelect.textContent = 'category frequencies';

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
    iWantSelect.textContent = 'number frequencies';

    //hide group column
    if (groupColumn) {
      groupColumn.style.display = 'none';
    }

    // Create and append the required dropdowns
    createUsingTheseDropdown(event);
    createFilterButton();
  }

  if (event === 'comparative' || event === 'number-comparative') {
    // Update select.textContent
    if (event === 'comparative') {
      iWantSelect.textContent = 'sub-category frequencies';
    }
    if (event === 'number-comparative') {
      iWantSelect.textContent = 'sum by category';
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
    if (target.innerText === 'category frequencies') {
      analysisType = 'simple';
    }
    if (target.innerText === 'number frequencies') {
      analysisType = 'number';
    }
    if (target.innerText === 'sub-category frequencies') {
      analysisType = 'comparative';
    }
    if (target.innerText === 'sum by category') {
      analysisType = 'number-comparative';
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
  span.textContent = 'Using these fields';

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
      ((event === 'number' || event === 'number-comparative') && value === 'Numerical')
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
    if (
      this.usingThese.length > 0 &&
      (this.analysisType === 'comparative' || this.analysisType === 'number-comparative') &&
      this.groupedBy != ''
    ) {
      this.addComparativeChartObjects();
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
      const chartTitle = `Percentage breakdown of '${value}' categories`;
      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `advanced-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens


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
      const chartTitle = `Count of '${value}' divided into ranges`;
      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `advanced-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens

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
      if (UsingTheseType.value === "Categorical") {
        chartTitle = `Percentage breakdown of '${value}-${this.groupedBy}' sub-categories`;
      }
      if (UsingTheseType.value === "Numerical") {
        chartTitle = `Sum of '${value}' by '${this.groupedBy}'`;
      }
      const filteredByString = this.filteredBy.map(item => `${item.header}-${item.value}`).join();
      const chartID = `advanced-${value}-grouped-by-${this.groupedBy}-filtered-by-${filteredByString}`.replace(/[^a-zA-Z0-9]/g, '-'); // Create the id based on the title, replacing spaces with hyphens

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
    console.log('filtered csv array', filteredCSVArray);

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

    const headerType = dropdownState.find(item => item.header === header).value;
    console.log('dropdownState: ', dropdownState);


    if (headerType === 'Categorical') {

      // Create a map to count occurrences for each group
      const groupCounts = {};
      const valueCounts = {}; // To store total counts for each value across all groups

      for (let i = 0; i < filteredData.length; i++) {
        let item = filteredData[i];
        let group = item[groupedBy];
        let value = item[header];

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

    if (headerType === 'Numerical') {
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
    if (this.analysisType === 'comparative' || this.analysisType ==='number-comparative') {
      this.chartObjects.forEach(chart => {
        renderComparativeChartInCard(chart, cardsContainer);
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

    this.barChartOptions = {
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

    this.numberBarChartOptions = {
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
  chartButton.textContent = 'Bars';
  cardOptionsColumn.appendChild(chartButton);

  //create the bookmark button and set whether it's active or not
  const bookmarkButton = document.createElement('button');
  bookmarkButton.classList.add('btn', 'btn-secondary');
  bookmarkButton.setAttribute('bookmarkButtonIdentifier', chartObject.id);
  const isChartBookmarked = bookmarks.some(obj => obj.id === chartObject.id);
  if (isChartBookmarked) {
    bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'true');
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
    options: chartObject.barChartOptions,
  });

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

  //create the chart type button
  const chartButton = document.createElement('button');
  chartButton.classList.add('btn', 'btn-secondary', 'me-2', 'disabled');
  if (UsingTheseType.value === 'Categorical') {
    chartButton.textContent = 'Clusters';
  }
  if (UsingTheseType.value === 'Numerical') {
    chartButton.textContent = 'Bars';
  }

  cardOptionsColumn.appendChild(chartButton);


  //create the bookmark button and set whether it's active or not
  const bookmarkButton = document.createElement('button');
  bookmarkButton.classList.add('btn', 'btn-secondary');
  bookmarkButton.setAttribute('bookmarkButtonIdentifier', chartObject.id);
  const isChartBookmarked = bookmarks.some(obj => obj.id === chartObject.id);
  if (isChartBookmarked) {
    bookmarkButton.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
    bookmarkButton.setAttribute('isActive', 'true');
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
  let totalArrayValues = 0;
  chartObject.data.forEach(subArray => {
    totalArrayValues += subArray.length;
  });
  canvas.style.height = `350px`; //will be 100px if filters return no data and 125px if they return 1 bar

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
  if (UsingTheseType.value === 'Categorical') {
    new Chart(ctx, { //new chart in canvas
      type: 'bar', // Use 'bar' type for horizontal bar chart
      data: {
        labels: chartObject.labels,
        datasets: datasets,
      },
      options: chartObject.clusteredBarChartOptions,
    });
  }
  if (UsingTheseType.value === 'Numerical') {

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
      options: chartObject.numberBarChartOptions,
    });

  }



}

function addRemoveBookmark(target, chart) {
  const bookmarkButton = target;
  let isActive = bookmarkButton.getAttribute('isActive');

  //if bookmark is activated
  if (isActive === 'false') {

    //update the button
    bookmarkButton.setAttribute('isActive', 'true');
    bookmarkButton.innerHTML =
      '<i class="fa-solid fa-bookmark"></i>'; //change the icon
    bookmarkButton.classList.remove('btn-secondary');
    bookmarkButton.classList.add('btn-primary');

    //update chartobject and push to bookmarks array
    chart.bookmarked = true;
    bookmarks.push(chart);

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
      if (index !== -1) {
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
    bookmarksBodyContainer.classList.add('container', 'col-md-8', 'offset-md-2', 'mt-2');
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
    <i class="fas fa-exclamation-triangle"></i>
  </div>
  <div class="bookmark-title" style="font-weight: bold; margin-top: 10px;">
    No bookmarks to display
  </div>
  <div class="bookmark-description" style="margin-top: 5px;">
    Save your favorite charts by clicking the bookmark icon in the top-right corner of their card.
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
      if (bookmarks[i].analysisType === 'number-comparative') {
        renderComparativeChartInCard(bookmarks[i], bookmarksBodyColumn);
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
