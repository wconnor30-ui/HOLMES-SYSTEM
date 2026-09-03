// Initial State & Data Persistence
let database = JSON.parse(localStorage.getItem('HOLMES_DB')) || [
  {
    id: "REC-001",
    title: "Project HOLMES Initialization",
    category: "SYSTEM",
    details: "Core archive terminal online. Local storage active."
  }
];

let entryMode = false;
let tempEntry = {};
let entryStep = 0;

const output = document.getElementById('output');
const input = document.getElementById('command-input');
const fileInput = document.getElementById('import-file');

// Boot Sequence Output
printLine("==================================================");
printLine("  H.O.L.M.E.S. ARCHIVE SYSTEM - V2.06");
printLine("  LOCAL DATABASE READY. SYSTEM SECURE.");
printLine("  TYPE 'HELP' FOR COMMAND DIRECTORY.");
printLine("==================================================\n");

// Keep focus on terminal input
document.addEventListener('click', () => input.focus());

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const value = input.value.trim();
    printLine(`> ${value}`);
    input.value = '';

    if (entryMode) {
      handleAddProcess(value);
    } else {
      processCommand(value);
    }
    window.scrollTo(0, document.body.scrollHeight);
  }
});

function printLine(text) {
  const line = document.createElement('div');
  line.textContent = text;
  output.appendChild(line);
}

function saveData() {
  localStorage.setItem('HOLMES_DB', JSON.stringify(database));
}

// Main Command Processor
function processCommand(cmdStr) {
  const parts = cmdStr.split(' ');
  const command = parts[0].toUpperCase();
  const args = parts.slice(1).join(' ');

  switch (command) {
    case 'HELP':
      printLine("COMMANDS:");
      printLine("  LIST            - Display all records");
      printLine("  SEARCH <query>  - Search titles, categories, and details");
      printLine("  VIEW <id>       - View full record by ID (e.g., VIEW REC-001)");
      printLine("  ADD             - Launch interactive prompt to add an entry");
      printLine("  DELETE <id>     - Remove a record by ID");
      printLine("  EXPORT          - Save database to a downloadable JSON file");
      printLine("  IMPORT          - Restore database from a JSON file");
      printLine("  CLEAR           - Clear terminal screen");
      break;

    case 'LIST':
      if (database.length === 0) {
        printLine("NO RECORDS FOUND IN ARCHIVE.");
      } else {
        printLine(`TOTAL RECORDS: ${database.length}`);
        database.forEach(item => {
          printLine(`[${item.id}] ${item.title} | Cat: ${item.category}`);
        });
      }
      break;

    case 'SEARCH':
      if (!args) {
        printLine("ERROR: Specify search query. Usage: SEARCH <query>");
        return;
      }
      const matches = database.filter(item => 
        item.title.toLowerCase().includes(args.toLowerCase()) ||
        item.category.toLowerCase().includes(args.toLowerCase()) ||
        item.details.toLowerCase().includes(args.toLowerCase())
      );
      printLine(`FOUND ${matches.length} RECORD(S):`);
      matches.forEach(m => printLine(`[${m.id}] ${m.title} (${m.category})`));
      break;

    case 'VIEW':
      const target = database.find(item => item.id.toUpperCase() === args.toUpperCase());
      if (!target) {
        printLine("ERROR: Record ID not found.");
      } else {
        printLine("--------------------------------------------------");
        printLine(`ID:       ${target.id}`);
        printLine(`TITLE:    ${target.title}`);
        printLine(`CATEGORY: ${target.category}`);
        printLine("--------------------------------------------------");
        printLine(`DETAILS:\n${target.details}`);
        printLine("--------------------------------------------------");
      }
      break;

    case 'ADD':
      entryMode = true;
      entryStep = 1;
      tempEntry = {};
      printLine("[ADD MODE] Enter Record Title:");
      break;

    case 'DELETE':
      const initialCount = database.length;
      database = database.filter(item => item.id.toUpperCase() !== args.toUpperCase());
      if (database.length < initialCount) {
        saveData();
        printLine(`RECORD ${args.toUpperCase()} DELETED SUCCESSFULLY.`);
      } else {
        printLine("ERROR: Record ID not found.");
      }
      break;

    case 'EXPORT':
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `holmes_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      printLine("DATABASE EXPORTED SUCCESSFULLY.");
      break;

    case 'IMPORT':
      fileInput.click();
      break;

    case 'CLEAR':
      output.innerHTML = '';
      break;

    case '':
      break;

    default:
      printLine(`UNKNOWN COMMAND: '${command}'. TYPE 'HELP' FOR COMMANDS.`);
  }
}

// Multi-step Interactive ADD process
function handleAddProcess(inputVal) {
  if (entryStep === 1) {
    if (!inputVal) return printLine("Title cannot be empty. Enter Title:");
    tempEntry.title = inputVal;
    entryStep = 2;
    printLine("Enter Category:");
  } else if (entryStep === 2) {
    tempEntry.category = inputVal || "UNASSIGNED";
    entryStep = 3;
    printLine("Enter Record Details:");
  } else if (entryStep === 3) {
    tempEntry.details = inputVal || "No details provided.";
    
    // Generate simple ID
    const nextNum = String(database.length + 1).padStart(3, '0');
    tempEntry.id = `REC-${nextNum}`;

    database.push(tempEntry);
    saveData();

    printLine(`[SUCCESS] RECORD SAVED AS ${tempEntry.id}`);
    entryMode = false;
    entryStep = 0;
    tempEntry = {};
  }
}

// File Import Handler
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (Array.isArray(importedData)) {
        database = importedData;
        saveData();
        printLine("DATABASE IMPORT SUCCESSFUL. RECORDS UPDATED.");
      } else {
        printLine("ERROR: Invalid file format. Expected a JSON array.");
      }
    } catch (err) {
      printLine("ERROR: Failed to parse backup file.");
    }
  };
  reader.readAsText(file);
});