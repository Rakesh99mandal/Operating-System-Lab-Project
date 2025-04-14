let processes = [];
let processId = 1;

document.getElementById("algorithm").addEventListener("change", function () {
    document.getElementById("timeQuantum").disabled = this.value !== "rr";
});

function addProcess() {
    const table = document.getElementById("processTable").getElementsByTagName("tbody")[0];
    let arrivalTime = parseInt(prompt("Enter Arrival Time:"));
    let burstTime = parseInt(prompt("Enter Burst Time:"));
    let priority = parseInt(prompt("Enter Priority (if applicable, else enter 0):"));

    if (isNaN(arrivalTime) || isNaN(burstTime) || isNaN(priority)) {
        alert("Invalid input!");
        return;
    }

    let process = {
        id: processId,
        arrivalTime,
        burstTime,
        priority,
        remainingTime: burstTime,
        completionTime: 0,
        turnaroundTime: 0,
        waitingTime: 0,
        responseTime: -1
    };

    processes.push(process);

    let row = table.insertRow();
    row.innerHTML = `<td>P${processId}</td><td>${arrivalTime}</td><td>${burstTime}</td><td>${priority}</td>
                     <td><button onclick="removeProcess(${processId})">Remove</button></td>`;

    processId++;
}

function removeProcess(id) {
    processes = processes.filter(p => p.id !== id);
    updateProcessTable();
}

function updateProcessTable() {
    const tableBody = document.getElementById("processTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";
    
    processes.forEach(p => {
        let row = tableBody.insertRow();
        row.innerHTML = `<td>P${p.id}</td><td>${p.arrivalTime}</td><td>${p.burstTime}</td><td>${p.priority}</td>
                         <td><button onclick="removeProcess(${p.id})">Remove</button></td>`;
    });
}

function simulate() {
    let algorithm = document.getElementById("algorithm").value;
    let timeQuantum = parseInt(document.getElementById("timeQuantum").value);

    if (algorithm === "fcfs") fcfs();
    else if (algorithm === "sjf") sjf();
    else if (algorithm === "priority") priorityScheduling();
    else if (algorithm === "rr") roundRobin(timeQuantum);
}

function fcfs() {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    executeProcesses();
}

function sjf() {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.burstTime - b.burstTime);
    executeProcesses();
}

function priorityScheduling() {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority);
    executeProcesses();
}

function roundRobin(timeQuantum) {
    let queue = [...processes];
    let time = 0;
    let executed = [];

    while (queue.length > 0) {
        let p = queue.shift();

        if (p.responseTime === -1) {
            p.responseTime = time - p.arrivalTime; // First execution
        }

        if (p.remainingTime > timeQuantum) {
            executed.push({ id: p.id, start: time, end: time + timeQuantum });
            time += timeQuantum;
            p.remainingTime -= timeQuantum;
            queue.push(p);
        } else {
            executed.push({ id: p.id, start: time, end: time + p.remainingTime });
            time += p.remainingTime;
            p.remainingTime = 0;
            p.completionTime = time; // Completion Time when process finishes
        }
    }

    displayGanttChart(executed);
    calculateResults();
}

function executeProcesses() {
    let time = 0;
    let executed = [];

    processes.forEach(p => {
        if (p.responseTime === -1) {
            p.responseTime = time - p.arrivalTime; // First execution
        }

        executed.push({ id: p.id, start: time, end: time + p.burstTime });
        time += p.burstTime;
        p.completionTime = time; // Completion Time
    });

    displayGanttChart(executed);
    calculateResults();
}

function displayGanttChart(executed) {
    let chart = document.getElementById("ganttChart");
    chart.innerHTML = "";

    executed.forEach(e => {
        let div = document.createElement("div");
        div.classList.add("gantt-block");
        div.innerText = `P${e.id} (${e.start}-${e.end})`;
        chart.appendChild(div);
    });
}

function calculateResults() {
    let totalTAT = 0;
    let totalWT = 0;

    processes.forEach(p => {
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;

        totalTAT += p.turnaroundTime;
        totalWT += p.waitingTime;
    });

    let avgTAT = (totalTAT / processes.length).toFixed(2);
    let avgWT = (totalWT / processes.length).toFixed(2);

    updateResultsTable(avgTAT, avgWT);
}

function updateResultsTable(avgTAT, avgWT) {
    let tableBody = document.getElementById("resultsTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    processes.forEach(p => {
        let row = tableBody.insertRow();
        row.innerHTML = `<td>P${p.id}</td><td>${p.completionTime}</td><td>${p.turnaroundTime}</td><td>${p.waitingTime}</td><td>${p.responseTime}</td>`;
    });

    // Add average row
    let avgRow = tableBody.insertRow();
    avgRow.innerHTML = `<td colspan="2"><strong>Average</strong></td>
                        <td><strong>${avgTAT}</strong></td>
                        <td><strong>${avgWT}</strong></td>
                        <td>-</td>`;
}
