function parseChronologyMd(dataMd, map) {
  let chronology = {
    list: new Map(),
    minYear: undefined,
    maxYear: undefined,
    hideAll: () => {
      chronology.markers.forEach((e) => {
        // e.remove();
        chronology.markerCluster.removeLayer(e);
      });
    },
    display: (year) => {
      chronology.hideAll();
      if(chronology.list.has(year)) {
        chronology.list.get(year).forEach((e) => {
          // e.marker.addTo(map);
          chronology.markerCluster.addLayer(e.marker);
        });
      }
    },
    displayAll: () => {
      chronology.markers.forEach((e) => {
        // e.addTo(map);
        chronology.markerCluster.addLayer(e);
      });
    },
    markers: [],
    markerCluster: L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 10})
  };

  let markerIcon = L.icon({
    iconUrl: "marker.svg",
    iconSize: [40,40],
    iconAnchor: [20, 40],
    popupAnchor: [15, -27],
    tooltipAnchor: [15, -27]
  });

  dataMd.split("\n").forEach((e) => {
    if(e === "") return;
    let entryArr = e.split("|");
    const year = entryArr[1].replace(/\s/g, "");
    const coordinates = entryArr[6].replace(/\s/g, "").split(",");
    const entry = {
      date: entryArr[2].trim(),
      title: entryArr[3],
      description: entryArr[4],
      source: entryArr[5],
      coordinates: coordinates,
      categories: entryArr[7].replace(/\s/g, "").split(","),
      marker: undefined
    };
    entry.marker = L.marker(coordinates, {icon: markerIcon}).bindTooltip(entry.title + "<hr>" + entry.date);
    chronology.markers.push(entry.marker);

    // if year is not in map, add new array
    if(!chronology.list.has(year)) {
      chronology.list.set(year, []);
      let numYear = parseInt(year);
      if(chronology.minYear === undefined) {
        chronology.minYear = numYear;
        chronology.maxYear = numYear;
      } else {
        if(chronology.minYear > numYear) chronology.minYear = numYear;
        if(chronology.maxYear < numYear) chronology.maxYear = numYear;
      }
    }
    chronology.list.get(year).push(entry);
  });

  chronology.markers.forEach((e) => {
    chronology.markerCluster.addLayer(e);
  });
  map.addLayer(chronology.markerCluster);

  return chronology;
}

function generateTableFromChronology(chronology) {
  let table = document.createElement("table");
  let header = table.createTHead();
  let body = table.createTBody();

  let headerRow = header.insertRow();
  headerRow.insertCell().appendChild(document.createTextNode("Datum"));
  headerRow.insertCell().appendChild(document.createTextNode("Eregnis"));
  headerRow.insertCell().appendChild(document.createTextNode("Beschreibung"));
  headerRow.insertCell().appendChild(document.createTextNode("Quelle"));

  let regexDDMMYYYY = new RegExp("[0-9]+\.[0-9]+\.[0-9]{4}");
  let regexTextYYYY = new RegExp("^[^0-9].*[0-9]{4}");

  const chronologyArray = [];
  chronology.list.forEach((val, key) => {
    // Sort array by date , with non-standard dates sorted to the end
    const yearArray = [...val].sort((a, b) => {
      if(regexDDMMYYYY.test(a.date) && regexDDMMYYYY.test(b.date)) {
        const aSplitDate = a.date.split(".");
        const bSplitDate = b.date.split(".");
        const aDate = new Date(aSplitDate[2] + "-" + aSplitDate[1] + "-" + aSplitDate[0]);
        const bDate = new Date(bSplitDate[2] + "-" + bSplitDate[1] + "-" + bSplitDate[0]);
        if(aDate > bDate) return 1;
        if(aDate < bDate) return -1;
        return 0;
      }
      if(regexTextYYYY.test(a.date)) return 1;
      if(regexTextYYYY.test(b.date)) return 0;
      if(regexDDMMYYYY.test(a.date)) return -1;
      return 1;
    });
    // By using the year (key) as the array index for inserting, we
    // automatically end up with an array sorted by year
    chronologyArray[key] = yearArray;
  });

  chronologyArray.forEach((e) => {
    e.forEach((e) => {
      let row = body.insertRow();
      row.insertCell().appendChild(document.createTextNode(e.date));
      row.insertCell().appendChild(document.createTextNode(e.title));
      row.insertCell().appendChild(document.createTextNode(e.description));
      let src = document.createElement("code");
      src.appendChild(document.createTextNode(e.source));
      row.insertCell().appendChild(src);
    });
  });

  return table;
}

function setupYearRangeControls(minYear, maxYear, chronology) {
  let yearRangeInput = document.getElementById("yearRangeInput");
  yearRangeInput.setAttribute("min", minYear);
  yearRangeInput.setAttribute("max", maxYear);

  const mid = Math.round((minYear+maxYear)/2);
  yearRangeInput.value = mid;
  yearRangeInput.nextElementSibling.innerText = mid;

  yearRangeInput.oninput = function() {
    this.nextElementSibling.innerText = this.value;
    chronology.display(this.value);
  };

  let showAllYears = document.getElementById("showAllYears");
  showAllYears.onchange = function() {
    yearRangeInput.disabled = !yearRangeInput.disabled;
    yearRangeInput.nextElementSibling.style.color = !yearRangeInput.disabled ? "#000000" : "#999999";
    if(yearRangeInput.disabled) {
      chronology.displayAll();
    } else {
      chronology.display(yearRangeInput.value);
    }
  };
}

/**
 * Generates bubbles on a map from a string of CSV data
 * @param {array} csvDataString An arrays containing strings containing the CSV data
 * @param {object} map The map the CSV data should be added to
 * @param {object} bubbleSize The min and max size of the bubbles
 * @param {object} bubbleAttributes Attributes of the bubbles for drawing
 */
function generateBubblesFromCSV(csvDataStrings, map, bubbleSize, bubbleAttributes) {
  // Split CSV
  let csvArr = csvDataStrings.join(",").replace(/\s/g, "").split(",");

  // Count all occurences of places first so we can create a scale
  let placeCounts = {};
  for(let i = 0; i < Object.keys(indexPlaces).length; ++i) {
    let placeName = Object.keys(indexPlaces)[i];
    placeCounts[placeName] = 0

    for(let j = 0; j < csvArr.length; ++j) {
      if(csvArr[j] === placeName) {
        placeCounts[placeName] += 1;
      }
    }
  }

  // Get min and max count
  let placeMin = 0;
  let placeMax = 0;
  {
    let placeCountArr = Object.values(placeCounts);
    placeMin = Math.min(...placeCountArr);
    placeMax = Math.max(...placeCountArr);
    if(placeMax > bubbleSize.cutoff) {
      placeMax = bubbleSize.cutoff;
    }
  }
  // Iterate through all place counts and generate bubbles
  for(let i = 0; i < Object.keys(placeCounts).length; ++i) {
    let placeName = Object.keys(placeCounts)[i];
    let realCount = placeCounts[placeName];
    let count = realCount > bubbleSize.cutoff ? bubbleSize.cutoff : realCount;


    if(count > 0) {
      let radius = ((count-placeMin)/(placeMax-placeMin))*(bubbleSize.max-bubbleSize.min) + bubbleSize.min;
      L.circleMarker(indexPlaces[placeName].coords, {...{radius: radius}, ...bubbleAttributes})
        .bindTooltip(
          indexPlaces[placeName].desc
          + "<hr>Erwähnungen: " + realCount.toString()
        ).addTo(map);
    }
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
  const mapCenter = [51.538, 9.935];

  // Constants
  const bubbleSize = {
    "min": 15,
    "max": 35,
    "cutoff": 10
  };
  const bubbleAttributes = {
    "stroke": false,
    "fill": true,
    "fillColor": "#A50062",
    "fillOpacity": 0.5
  }

  // Map
  let map = L.map("map").setView(mapCenter, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  // Scale
  L.control.scale({imperial: false, metric: true}).addTo(map);


  let chronology = parseChronologyMd(chronologyMd, map);
  let table = generateTableFromChronology(chronology);
  document.getElementById("chronology-table-container").appendChild(table);

  setupYearRangeControls(chronology.minYear, chronology.maxYear, chronology);

  let hideMapButton = document.getElementById("hideMap");
  hideMapButton.addEventListener("click", function() {
    let mapContainer = document.getElementsByClassName("map-container")[0];
    if(mapContainer.style.display === "none") {
      mapContainer.style.display = "flex";
      this.innerText = "Karte verbergen";
    } else {
      mapContainer.style.display = "none";
      this.innerText = "Karte anzeigen";
    }
  });

  generateBubblesFromCSV(
    [mentions_flz, mentions_autonomesReferatP1, mentions_autonomesReferatP2,
    mentions_agilWalpFidl, mentions_c, mentions_j],
    map, bubbleSize, bubbleAttributes);


  // Charts

  // stupa
  const stupaData = {
    labels: [
      "LB",
      "GAL",
      "Wehrt Euch!",
      "SHB",
      "Juso-HSG",
      "RUFUS",
      "UFO",
      "RCDS",
      "DUG"
    ],
    datasets: [{
      label: "StuPa 1987 Sitzverteilung",
      data: [7, 12, 5, 1, 7, 1, 12, 12, 1],
      backgroundColor: [
        "#8a000a",
        "#3e9b39",
        "#8a000a",
        "#8a000a",
        "#e30013",
        "#ffed00",
        "#ffed00",
        "#0170b9",
        "#41a0e9"
      ]
    }]
  };
  const stupaConfig = {
    type: "doughnut",
    data: stupaData,
    options: {
      rotation: -90,
      circumference: 180,
      plugins: {
        legend: {
          onClick: null
        }
      }
    }
  }
  const stupaPieChart = new Chart(
    document.getElementById("stupaPieChart"),
    stupaConfig
  );


  // Collapsibles
  const collapsibles = document.getElementsByClassName("collapsible-button");
  Array.prototype.forEach.call(collapsibles, (e) => {
    e.addEventListener("click", function() {
      let content = this.nextElementSibling;
      if(content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  });

});
