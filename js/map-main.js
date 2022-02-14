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
  let table = generateTableFromChronology(chronology, map);
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
        "#aa2224",
        "#3e9b39",
        "#9a000a",
        "#b8003a",
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
