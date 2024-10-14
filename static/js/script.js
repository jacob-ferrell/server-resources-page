
async function fetchStats() {
    const apiUrl = window.location.origin + "/api/system";
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function bytesToMegabytes(bytes) {
    const megabytes = (bytes / (1024 * 1024));
    if (megabytes.toString().indexOf('.') <= 2 ) {
        return megabytes.toFixed(2) + 'mb'; 
    }
    return (megabytes / 1024).toFixed(2) + 'gb';
}

function createDiv(text) {
    const newDiv = document.createElement('div');
    newDiv.textContent = text;
    return newDiv;
}
function createStatusBar(percentage) {
    percentage = Math.max(0, Math.min(100, percentage));

    const statusBarContainer = document.createElement('div');
    statusBarContainer.classList.add('status-bar-container');
    
    const statusBar = document.createElement('div');
    statusBar.classList.add('status-bar');
    statusBar.style.width = percentage + '%';
    
    statusBarContainer.appendChild(statusBar);
    
    return statusBarContainer;
}

function createThermometerSvg() {
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
svg.setAttribute("viewBox", "0 0 24 24");
svg.setAttribute('width', '1.25rem');
svg.setAttribute('height', '1.25rem');


// Create the title element
const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
title.textContent = "thermometer-lines";

// Create the path element
const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
path.setAttribute("d", "M17 3H21V5H17V3M17 7H21V9H17V7M17 11H21V13H17.75L17 12.1V11M21 15V17H19C19 16.31 18.9 15.63 18.71 15H21M7 3V5H3V3H7M7 7V9H3V7H7M7 11V12.1L6.25 13H3V11H7M3 15H5.29C5.1 15.63 5 16.31 5 17H3V15M15 13V5C15 3.34 13.66 2 12 2S9 3.34 9 5V13C6.79 14.66 6.34 17.79 8 20S12.79 22.66 15 21 17.66 16.21 16 14C15.72 13.62 15.38 13.28 15 13M12 4C12.55 4 13 4.45 13 5V8H11V5C11 4.45 11.45 4 12 4Z");
path.setAttribute('fill', 'white')

// Append the title and path to the SVG
svg.appendChild(title);
svg.appendChild(path);
return svg;
}

function createTempElement(temp) {
    const tempElement = document.createElement('div');
    tempElement.appendChild(createThermometerSvg());
    const tempText = document.createElement('span');
    tempText.textContent = temp + '°C';
    tempElement.appendChild(tempText);
    tempElement.classList.add('temp');
    return tempElement;
}

function createUsageElement(percent) {
    const container = createDiv();
    container.classList.add('usage');
    const text = document.createElement('span');
    text.textContent = percent + '%';
    const icon = document.querySelector('.meter').cloneNode(true);
    icon.style.display = "block";
    container.appendChild(icon);
    container.appendChild(text);
    return container;
}

async function populateStats() {
    const stats = await fetchStats();
    if (!stats) return;
    const cpu = document.querySelector('.cpu');
    const { temp, cpu_percent } = stats;
    cpu.appendChild(createUsageElement(cpu_percent));
    cpu.appendChild(createTempElement(temp));
    
    const ram = document.querySelector('.ram');
    let { available, free, used, percent, total } = stats.memory;
    ram.appendChild(createUsageElement(percent));
    ram.appendChild(createDiv(`${bytesToMegabytes(used)}/${bytesToMegabytes(total)}`));
    ({free, percent, total, used } = stats.disk); 
    const disk = document.querySelector('.disk');
    disk.appendChild(createDiv(`${bytesToMegabytes(used)}/${bytesToMegabytes(total)}`));

    ({free, percent, total, used } = stats.external_disk); 
    const extDisk = document.querySelector('.ext-disk');
    extDisk.appendChild(createDiv(`${bytesToMegabytes(used)}/${bytesToMegabytes(total)}`));

}

populateStats();

