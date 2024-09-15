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
let colorPalette = ['#264653', '#e76f51', '#2a9d8f', '#f4a261', '#e9c46a'];
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

  // Clear existing content and append the upload container and its content to the step body
  stepBody.innerHTML = '';
  stepBody.appendChild(uploadContainer);

  // Function to create and insert the Review button.
  function createReviewButton() {
    // Insert the review button into the bottom panel
    const panelButtonContainer2 = document.getElementById('panel-button-container-2');
    panelButtonContainer2.innerHTML = `  
    <button id="review-button" class="btn btn-primary disabled">Review<i class="fas fa-arrow-right" style="padding-left:0.2rem"></i></button>`;

    const reviewButton = document.getElementById('review-button');
    reviewButton.addEventListener('click', initializeReviewStep);
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
      updateUploadStepUI(file.name);
    };
    reader.readAsText(file); // Reads the content of the file as a text string
  };
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
        'Text string',
        'Numerical',
        'Date / Time',
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
        'Text string',
        'Numerical',
        'Date / Time',
      ]; //here are the options
      options.forEach(option => {
        //for each option...
        const optionElement = document.createElement('option'); //create a menu option
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      });
      select.addEventListener('change', function () {
        dataTypesToast(select.value);
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

// Function to convert CSV string to an array of objects
function csvToArray(csv) {
  // Split the CSV into lines and filter out any empty lines
  const lines = csv.split('\n').filter(line => line.trim() !== '');

  // Split the first line into headers
  const headers = lines[0].split(',');

  // Map the remaining lines to objects with keys from headers
  const data = lines.slice(1).map(line => {
    const values = line.split(','); // Split each line into values
    let obj = {}; // Initialize an empty object

    // Assign each value to the corresponding header in the object
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index].trim(); // Trim any extra whitespace
    });

    return obj; // Return the constructed object
  });

  return data; // Return the array of objects
}

// Function to read a CSV file and convert it to an array
function readAndConvertCSV(file) {
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

// Function to initialize the "Review" step
function initializeReviewStep() {
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
                Review the data types for each of your CSV file's columns
            </button>
        </h2>
        <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#dataTypeAccordion">
            <div class="accordion-body">
                Please take a minute to map your data. This will help us give you the best outputs for your needs.
                <ul>
                    <li><strong>Categorical (default):</strong> Also known as discrete data. Use this for fields where a restricted set of possible values is expected. </li>
                    <li><strong>Text string:</strong> Use this for qualitative / open-ended fields (e.g., comments, names, descriptions). </li>
                    <li><strong>Numerical:</strong> This is for any field containing numerical values. We will compute these by summing them, rather than counting them.</li>
                                        <li><strong>Date / Time:</strong> This is for any field containing timestamps. This is especially useful for generating time-based comparisons, such as line charts and so on.</li>

                </ul>
            </div>
        </div>
    </div>
`;

  stepBody.appendChild(accordion);

  //this triggers a cascade of functions...transform csv into array and generate the review table
  readAndConvertCSV(selectedFile);
}

// Function to save the state of the dropdowns - useful for Analysis step and triggered when click on Analyze
function saveDropdownState() {
  dropdownState = []; //reset dropdown state to empty

  // Select all rows in the table body and iterate over each row
  document.querySelectorAll('tbody tr').forEach(row => {
    const header = row.children[0].textContent; // Get the text content of the first cell (header) in the current row
    const dropdown = row.querySelector('.data-type-dropdown'); // Select the dropdown element within the current row

    // Add an object with the header and the selected dropdown value to the dropdownState array
    dropdownState.push({ header: header, value: dropdown.value });
  });
}

//v1 won't really support any data other than Categorical. I want to notify our users about that
function dataTypesToast(value) {
  if (value !== 'Categorical') {
    const parentDiv = document.getElementById('toastContainer'); // Replace with your parent div ID
    parentDiv.innerHTML = ''; // Clear any existing content

    const toastHtml = `
            <div aria-live="polite" aria-atomic="true" style="position: fixed; top: 1rem; right: 1rem; z-index: 1050;">
                <div class="toast" style="background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    <div class="toast-header" style="background-color: #ffce44;">
                        <strong class="mr-auto">Coming soon</strong>
                    </div>
                    <div class="toast-body">
                    We do not yet support data types other than "Categorical".
                    <br> Data associated to all other types will be ignored.
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

// a boilerplate for analysis objects. users will be able to create many of them
class AnalysisObject {
  constructor() {
    //create a new empty object
    this.id = nextAnalysisId++; // Assign a unique ID that increments by 1 each time a new one is created
    this.type = ''; // basic chart, comparison...
    this.usingThese = []; // the main column being processed
    this.groupedBy = ''; // sometimes the data will be sliced by this column and displayed in the chart
    this.filteredBy = []; // sometimes the data will be filtered by these values
    this.chartObjects = []; // the array storing the charts created by the above parameters
    this.label = ''; // Optional label for user naming
  }

  //update the object and its parameters
  update(
    type = this.type,
    usingThese = this.usingThese,
    groupedBy = this.groupedBy,
    filteredBy = this.filteredBy,
    label = this.label
  ) {
    this.type = type; //update the parameter to what's passed as an argument
    this.usingThese = usingThese; //update the parameter to what's passed as an argument
    this.groupedBy = groupedBy; //update the parameter to what's passed as an argument
    this.filteredBy = filteredBy; //update the parameter to what's passed as an argument
    this.label = label; //update the parameter to what's passed as an argument
  }
  watchChanges() {
    //meant as a router that chooses what charts to produce depending on the inputs
    // Check if usingThese is not empty and analysisobject's type is 'generic'
    if (this.usingThese.length > 0 && this.type === 'simple') {
      this.addGenericCharts();
    }
    if (
      this.usingThese.length > 0 &&
      this.type === 'comparative' &&
      this.groupedBy != ''
    ) {
      this.addClusteredCharts();
    }
  }

  // Function to render all chart objects
  prepChartContainer() {
    // Find the container where the cards will be appended
    const stepBody = document.getElementById('step-body');
    let cardsContainer = document.getElementById('cards-container');

    if (cardsContainer) {
      //if the cards container was created in a previous call, empty it.
      cardsContainer.innerHTML = '';
    } else {
      //if the cards container doesn't exist, create it within the stepbody div
      cardsContainer = document.createElement('div');
      cardsContainer.id = 'cards-container';
      stepBody.appendChild(cardsContainer);
    }

    if (this.groupedBy === '') {
      // Iterate over each chart in the charts array of the analysis object being called / passed as an argument
      this.chartObjects.forEach(chart => {
        this.renderGenericChartInCard(chart);
      });
    } else {
      this.chartObjects.forEach(chart => {
        this.renderClusteredChartInCard(chart);
      });
    }
  }

  addGenericCharts() {
    //produces the data, labels and charts
    this.chartObjects = []; // Clear any pre-existing charts before creating new ones
    this.usingThese.forEach(value => {
      //iterates over each element in the this.usingThese array.
      // get the data we need to produce the chart
      const result = this.generateGenericDataArrayAndLabels(
        value,
        this.filteredBy
      ); // Get the result from the generateGenericDataArrayAndLabels method

      // Extract data and labels from the result object
      const data = result.data;
      const labels = result.labels;
      const percentagesCounts = result.PercentagesCounts;
      const chartTitle = `Summary of ${value} data`;
      const chartID = `advanced-${chartTitle.replace(/ /g, '-')}`; // Create the id based on the title, replacing spaces with hyphens


      // Create and add the chart
      const newChartObject = new ChartObject(
        chartTitle,
        chartID,
        'bar',
        data,
        labels,
        percentagesCounts
      ); //value= the current item in the usingthese foreach loop
      this.chartObjects.push(newChartObject); // add the new chart object at the end of the analysis object's charts array
    });
    this.prepChartContainer(); // render all charts once their code and data is ready
  }

  generateGenericDataArrayAndLabels(header, filteredBy) {
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



  // Function to create and render a chart in a Bootstrap card component and append to 'step-body'
  renderGenericChartInCard(chartObject) {
    //pass chartObject as an argument
    // Find the container where the cards will be appended
    const container = document.getElementById('cards-container');

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
      handleBookmark(bookmarkButton, chartObject);
    });

    //create the title
    const cardTitle = document.createElement('h5');
    cardTitle.textContent = chartObject.title;
    cardTitleColumn.appendChild(cardTitle);

    //create filter badges as needed
    const analysisObject = analysisObjects.find(
      obj => obj.id === currentAnalysisId
    );
    const filters = analysisObject.filteredBy;

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
    canvas.style.height = `${100 + chartObject.data.length * 50}px`; //will be 100px if filters return no data and 125px if they return 1 bar

    // Append the canvas to the card body
    cardBody.appendChild(canvas);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the container
    container.appendChild(card);

    // Render the chart on the canvas
    const ctx = canvas.getContext('2d');

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
          },
        ],
      },
      options: chartObject.barChartOptions,
    });

  }

  addClusteredCharts() {
    this.chartObjects = []; // Clear existing charts
    this.usingThese.forEach(value => {
      // Generate data, labels, and cluster labels for the clustered chart
      const result = this.generateClusteredDataArrayAndLabels(
        value,
        this.groupedBy,
        this.filteredBy
      );

      const data = result.data;
      const labels = result.labels;
      const clusterLabels = result.clusterLabels;
      const percentagesCounts = result.percentagesCounts;
      const chartTitle = `Summary of ${value} data grouped by ${this.groupedBy}`;
      const chartID = `advanced-${chartTitle.replace(/ /g, '-')}`; // Create the id based on the title, replacing spaces with hyphens

      // Create and add the chart
      const newChartObject = new ChartObject(
        chartTitle,
        chartID,
        'bar',
        data,
        labels,
        percentagesCounts,
        clusterLabels // Pass cluster labels to ChartObject
      );
      this.chartObjects.push(newChartObject);
    });
    this.prepChartContainer(); // render clustered once the code and data is ready
  }

  generateClusteredDataArrayAndLabels(header, groupedBy, filteredBy) {
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

  // Function to create and render a horizontal clustered bar chart in a Bootstrap card component and append to 'step-body'
  renderClusteredChartInCard(chartObject) {
    // Pass chartObject as an argument
    // Find the container where the cards will be appended
    const container = document.getElementById('cards-container');

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
    chartButton.textContent = 'Clusters';
    cardOptionsColumn.appendChild(chartButton);


    //create the bookmark button and set whether it's active or not
    const bookmarkButton = document.createElement('button');
    bookmarkButton.classList.add('btn', 'btn-secondary');
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
      handleBookmark(bookmarkButton, chartObject);
    });

    //create the title
    const cardTitle = document.createElement('h5');
    cardTitle.textContent = chartObject.title;
    cardTitleColumn.appendChild(cardTitle);

    //create filter badges as needed
    const analysisObject = analysisObjects.find(
      obj => obj.id === currentAnalysisId
    );
    const filters = analysisObject.filteredBy;

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
    canvas.style.height = `${100 + totalArrayValues * 25}px`; //will be 100px if filters return no data and 125px if they return 1 bar

    // Append the canvas to the card body
    cardBody.appendChild(canvas);

    // Append the card body to the card
    card.appendChild(cardBody);

    // Append the card to the container
    container.appendChild(card);

    // Render the chart on the canvas
    const ctx = canvas.getContext('2d');

    // Create the datasets for each cluster
    const datasets = chartObject.data.map((clusterData, index) => {
      // Cycle through colorPalette for background and border colors
      const colorIndex = index % colorPalette.length;
      const backgroundColor = colorPalette[colorIndex];
      const borderColor = colorPalette[colorIndex];

      return {
        label: chartObject.clusterLabels[index], // Label for the cluster
        data: clusterData,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1, // Fixed border width
      };
    });

    new Chart(ctx, { //new chart in canvas
      type: 'bar', // Use 'bar' type for horizontal bar chart
      data: {
        labels: chartObject.labels,
        datasets: datasets,
      },
      options: chartObject.clusteredBarChartOptions,
    });
  }
}

// Function to create and add a new Analysis object
function createAnalysis() {
  const newAnalysis = new AnalysisObject();
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

// boilerplate for charts we create via the generic dropdown option.
class ChartObject {
  constructor(title, id, type, data, labels, percentagesCounts, clusterLabels) {
    this.title = title; // Title of the chart
    this.id = id;
    this.type = type; // Type of the chart (e.g., 'bar', 'line')
    this.data = data; // Data required for chart generation
    this.labels = labels; // Data required for chart generation
    this.percentagesCounts = percentagesCounts; // Labels for the data points
    this.clusterLabels = clusterLabels; // New property for cluster labels
    this.backgroundColor = colorPalette[0]; //
    this.borderColor = colorPalette[0]; //
    this.borderWidth = 1;
    this.bookmarked = false;

    this.barChartOptions = {
      plugins: {
        legend: {
          display: false,
        },
        // Change options for ALL labels of THIS CHART
        datalabels: {
          color: 'white',
          anchor: 'end',
          align: 'start',
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
          // You can customize the y-axis as needed
        },
      },
      elements: {
        bar: {
          borderWidth: 1,
          borderRadius: 5,
        },
      },
      responsive: false, // Ensure the chart is not responsive
    };

    this.clusteredBarChartOptions = {
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
          color: 'white',
          anchor: 'end',
          align: 'start',
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

// Function to create a new array to generate the filters dropdown
function createCategoricalArray() {
  if (parsedCSVData.length === 0) {
    console.error('No parsed CSV data available.');
    return [];
  }

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

// new function to clear and uppdate the stepper body with analysis options
function displayAnalysisOptions() {
  const stepBody = document.getElementById('step-body');
  stepBody.classList.remove('mt-2');
  stepBody.classList.add('mt-5');
  // Clear any existing content
  stepBody.innerHTML = '';

  // Create the "i want to text", col and row
  const analysisOptionTextRow = document.createElement('div');
  analysisOptionTextRow.classList.add('row');
  analysisOptionTextRow.id = 'analysis-option-text-row';
  const analysisOptionTextColumn = document.createElement('div');
  analysisOptionTextColumn.classList.add('col-12');
  const analysisOptionText = document.createElement('h5');
  analysisOptionText.textContent = 'I want to perform a...';
  analysisOptionTextColumn.appendChild(analysisOptionText);
  analysisOptionTextRow.appendChild(analysisOptionTextColumn);
  stepBody.appendChild(analysisOptionTextRow);

  // Create the analysis option cards, cols, and row
  const analysisOptionCardsRow = document.createElement('div');
  analysisOptionCardsRow.classList.add('row');
  analysisOptionCardsRow.id = 'analysis-options-cards-row';

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
    card.style.margin = '10px'; // Add some margin for spacing
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
    'Simple Analysis',
    'Summarize and filter data within a single category.',
    '<i class="fas fa-chart-bar"></i>'
  );

  // Create the comparative analysis column and card
  const analysisOptionCardCompareCol = document.createElement('div');
  analysisOptionCardCompareCol.classList.add('col-12', 'col-sm-4', 'mb-2');
  createCardInCol(
    'comparative-analysis-option',
    analysisOptionCardCompareCol,
    'Comparative Analysis',
    'Compare and contrast data across multiple categories.',
    '<i class="fas fa-table"></i>'
  );

  // Create the trend analysis column and card
  const analysisOptionCardTrendCol = document.createElement('div');
  analysisOptionCardTrendCol.classList.add('col-12', 'col-sm-4', 'mb-2');
  const trendCard = document.createElement('div');
  trendCard.classList.add(
    'card',
    'h-100',
    'border-0',
    'shadow-sm',
    'rounded-3'
  );
  trendCard.style.backgroundColor = '#ececec';
  trendCard.style.margin = '10px';

  // trendcard body
  const trendCardBody = document.createElement('div');
  trendCardBody.classList.add('card-body', 'text-start');

  // Add the trendcard icon
  const trendIconContainer = document.createElement('div');
  trendIconContainer.classList.add('mb-2');
  trendIconContainer.innerHTML =
    '<i class="fas fa-chart-line"></i><span class="badge" style="background-color: #f4b400; margin-left:0.2rem; color: white; font-size: 0.875rem;">Coming Soon!</span>';
  trendCardBody.appendChild(trendIconContainer);

  // Add the trendcard title
  const TrendTitleDiv = document.createElement('h5');
  TrendTitleDiv.classList.add('card-title');
  TrendTitleDiv.textContent = 'Trend Analysis';
  trendCardBody.appendChild(TrendTitleDiv);

  // Add the trendcard description
  const trendDescriptionDiv = document.createElement('p');
  trendDescriptionDiv.classList.add('card-text');
  trendDescriptionDiv.textContent = 'Uncover patterns and changes over time.';
  trendCardBody.appendChild(trendDescriptionDiv);

  // Append the trend card body to the card
  trendCard.appendChild(trendCardBody);

  // Append the trend card to the column
  analysisOptionCardTrendCol.appendChild(trendCard);

  // Append analysis columns to the row
  analysisOptionCardsRow.appendChild(analysisOptionCardBasicCol);
  analysisOptionCardsRow.appendChild(analysisOptionCardCompareCol);
  analysisOptionCardsRow.appendChild(analysisOptionCardTrendCol);

  // Append the row to the step body
  stepBody.appendChild(analysisOptionCardsRow);

  const simpleCard = document.getElementById('simple-analysis-option');
  simpleCard.addEventListener('click', function () {
    handleIWantTo('simple');
  });
  const comparativeCard = document.getElementById(
    'comparative-analysis-option'
  );
  comparativeCard.addEventListener('click', function () {
    handleIWantTo('comparative');
  });
}

// Handle the select change event
function handleIWantTo(event) {
  const stepBody = document.getElementById('step-body');
  stepBody.classList.remove('mt-5');
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
  iWantText.textContent = 'I want to perform a...';

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
  simpleListAnchorText.textContent = 'simple analysis';
  simpleListAnchor.setAttribute('data-value', 'simple');

  const compareListItem = document.createElement('li');
  const compareListAnchor = document.createElement('a');
  compareListAnchor.classList.add('dropdown-item');
  const compareListAnchorText = document.createElement('label');
  compareListAnchorText.textContent = 'comparative analysis';
  compareListAnchor.setAttribute('data-value', 'comparative');

  //append options to menu
  simpleListAnchor.appendChild(simpleListAnchorText);
  simpleListItem.appendChild(simpleListAnchor);
  iWantMenu.appendChild(simpleListItem);

  compareListAnchor.appendChild(compareListAnchorText);
  compareListItem.appendChild(compareListAnchor);
  iWantMenu.appendChild(compareListItem);

  // Append elements to the dropdown container
  iWantdropdownContainer.appendChild(iWantSelect);
  iWantdropdownContainer.appendChild(iWantMenu);

  // place the select dropdown to colDiv1
  typeColumn.appendChild(iWantText);
  typeColumn.appendChild(iWantdropdownContainer);

  // If the value of the select dropdown is "generic"...
  if (event === 'simple') {
    // Update select.textContent
    iWantSelect.textContent = 'simple analysis';

    //hide group column
    if (groupColumn) {
      groupColumn.style.display = 'none';
    }

    // Create and append the required dropdowns
    createColumnDropdown();
    createFilterButton();
  }
  if (event === 'comparative') {
    // Update select.textContent
    iWantSelect.textContent = 'comparative analysis';

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
    createColumnDropdown();
    createGroupByDropdown();
    createFilterButton();
  }

  //update the current analysis object. scrap any previously existing info and give it a type
  updateAnalysisById(currentAnalysisId, {
    type: event,
    usingThese: [],
    groupedBy: '',
    filteredBy: [],
  });

  //remove any previously existing chart cards from the body
  let cardsContainer = document.getElementById('cards-container');

  if (cardsContainer) {
    cardsContainer.innerHTML = '';
  } else {
    cardsContainer = document.createElement('div');
    cardsContainer.id = 'cards-container';
    stepBody.appendChild(cardsContainer);
  }

  iWantMenu.addEventListener('click', function (event) {
    const target = event.target.closest('a.dropdown-item');
    let analysisType = '';
    if (target.innerText === 'simple analysis') {
      analysisType = 'simple';
    }
    if (target.innerText === 'comparative analysis') {
      analysisType = 'comparative';
    }

    handleIWantTo(analysisType);
  });
}

// function to Create the Using dropdown
function createColumnDropdown() {
  const usingColumn = document.getElementById('using-column');

  // Create the span element for text
  const span = document.createElement('span');
  span.id = 'using-these-values-text';
  span.textContent = 'Using these columns';

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

  // Populate the new dropdown with options from the saved dropdown state
  dropdownState.forEach(({ header, value }) => {
    if (value === 'Categorical') {
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
function updateSelectedCount() {
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
    analysis.watchChanges();
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
  span.textContent = 'Compared by';

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
    analysis.watchChanges();
    console.log(analysis);
  } else {
    console.error('AnalysisObject not found');
  }
}

// function to Create the filter dropdown using the Categorical array
function createFilterButton() {
  const CategoricalArray1 = CategoricalArray; // Call the function to get the array
  const filterColumn = document.getElementById('filter-column');

  // Create the span element for text
  const span = document.createElement('span');
  span.id = 'filtered-by-text';
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

  let itemToHeaderMap = new Map();

  // Populate the dropdown with headers and options
  CategoricalArray1.forEach(group => {
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
      analysis.watchChanges();
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

// Function to show a confirmation dialog when they hit the back button, as it will delete all analyses
function showConfirmationDialog(message, onConfirm) {
  const confirmed = window.confirm(message);

  if (confirmed) {
    onConfirm();
  }
}

// Function to initialize the back button listener, which takes the user back to the review step
function InitializeReviewButtonListener() {
  // Add event listener to the back button
  document.getElementById('review-button').addEventListener('click', () => {
    initializeReviewStep();
  });
}

// Update the Bottom Panel buttons and
function updateBottomPanel() {
  const panelButtonContainer1 = document.getElementById(
    'panel-button-container-1'
  );
  const panelButtonContainer2 = document.getElementById(
    'panel-button-container-2'
  );
  panelButtonContainer1.innerHTML = `
        <button id="review-button" class="btn btn-secondary"><i class="fas fa-arrow-left" style="padding-right:0.2rem"></i>Review</button>`;
  panelButtonContainer2.innerHTML = '';
  InitializeReviewButtonListener();
}

// Function to setup the analaysis step
function setupAnalyzeStep() {
  const analyzeButton = document.getElementById('analyze-button');
  analyzeButton.addEventListener('click', () => {
    //save the review table's configuration into an array
    saveDropdownState();

    //adjust the steppers
    document.getElementById('stepper-review').classList.remove('stepper-primary');
    document.getElementById('stepper-analyze');
    document.getElementById('stepper-analyze').classList.add('stepper-primary');

    //create the bookmarks button
    const TopNavButtonContainer = document.getElementById('top-nav-button-container');
    TopNavButtonContainer.innerHTML = `  
    <button id="bookmarks-button" class="btn btn-secondary"><i class="fa-solid fa-bookmark" style="color:var(--primary-light); padding-right:0.2rem"></i>Bookmarks</button>`;
    


    //update the step body. will keep as a separate function because this is going to be big
    //updateStepBody();
    displayAnalysisOptions();

    //update the bottom panel. will keep as a separate function because this is going to be big
    updateBottomPanel();

    // run the function that creates the Categorical array, which is needed for the filter panel
    createCategoricalArray();

    //create a new analysis object
    createAnalysis();
  });
}

function handleBookmark(target, chart) {
  const bookmarkButton = target;
  let isActive = bookmarkButton.getAttribute('isActive');

  //if bookmark is activated
  if (isActive === 'false') {

    //update the button
    bookmarkButton.setAttribute('isActive', 'true');
    bookmarkButton.innerHTML =
      '<i style="color:white" class="fa-solid fa-bookmark"></i>'; //change the icon
    bookmarkButton.classList.remove('btn-secondary');
    bookmarkButton.classList.add('btn-primary');

    //update chartobject and push to bookmarks array
    chart.bookmarked = true;
    bookmarks.push(chart);

    //notify user with success toast message
    const toastDiv = document.getElementById('toastContainer'); // Replace with your parent div ID
    toastDiv.innerHTML = ''; // Clear any existing content

    const toastHtml = `
<div aria-live="polite" aria-atomic="true" style="position: fixed; top: 1rem; right: 1rem; z-index: 1050;">
  <div class="toast border-0" style="background-color: #fff; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 0.25rem;">
    <div class="toast-body bg-success text-white" style="border-radius: 0.25rem;">
      <strong>Item successfully bookmarked for export!</strong>
    </div>
  </div>
</div>

`;
    toastDiv.innerHTML = toastHtml;
    // Initialize the toast using Bootstrap's JS API
    const toastElement = toastDiv.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    console.log('bookmarks: ', bookmarks);
  }


  //if bookmark is deactivated
  if (isActive === 'true') {

    //update the button
    bookmarkButton.setAttribute('isActive', 'false');
    bookmarkButton.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
    bookmarkButton.classList.remove('btn-primary');
    bookmarkButton.classList.add('btn-secondary');

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
  }
}
