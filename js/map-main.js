function parseChronologyMd(dataMd, map) {
  let chronology = {
    list: new Map(),
    minYear: undefined,
    maxYear: undefined,
    hideAll: () => {
      chronology.markers.forEach((e) => {
        e.remove();
      });
    },
    display: (year) => {
      chronology.hideAll();
      if(chronology.list.has(year)) {
        chronology.list.get(year).forEach((e) => {
          e.marker.addTo(map);
        });
      }
    },
    displayAll: () => {
      chronology.markers.forEach((e) => {
        e.addTo(map);
      });
    },
    markers: []
  };

  dataMd.split("\n").forEach((e) => {
    if(e === "") return;
    let entryArr = e.split("|");
    const year = entryArr[1].replace(/\s/g, "");
    const coordinates = entryArr[6].replace(/\s/g, "").split(",");
    const entry = {
      date: entryArr[2],
      title: entryArr[3],
      description: entryArr[4],
      source: entryArr[5],
      coordinates: coordinates,
      categories: entryArr[7].replace(/\s/g, "").split(","),
      marker: undefined
    };
    entry.marker = L.marker(coordinates).bindTooltip(entry.title + "<hr>" + entry.date).addTo(map);
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

  return chronology;
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
    "min": 10,
    "max": 30,
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
    [mentions_flz, mentions_autonomesReferatP2,
    mentions_agilWalpFidl, mentions_c],
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
      circumference: 180
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
