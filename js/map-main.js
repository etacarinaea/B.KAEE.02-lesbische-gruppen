window.addEventListener('DOMContentLoaded', (event) => {
  const mapCenter = [51.533, 9.935];
  const index = {
    "asta": {
      "desc": "Allgemeiner Studierendenausschuss (AStA)",
      "coords": [51.54357860280159, 9.937440528630368]
    },
    "zhg": {
      "desc": "Zentrales Hörsaalgebäude",
      "coords": [51.54137440896165, 9.93569491281671]
    },
    "sub-neu": {
      "desc": "Staats- und Universitätsbibliothek (Neubau)",
      "coords": [51.53949026115184, 9.935934984512004]
    }
  };

  // Constants
  const bubbleSize = {
    "min": 20,
    "max": 30
  };
  const bubbleAttributes = {
    "stroke": false,
    "fill": true,
    "fillColor": "#A50062",
    "fillOpacity": 0.5
  }


  // Sample data
  const sampleCSV = "asta, asta, asta, zhg, zhg, asta, zhg, sub-neu"

  // Map
  let map = L.map("map").setView(mapCenter, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  // Scale
  L.control.scale({imperial: false, metric: true}).addTo(map);


  // Split CSV
  let csvArr = sampleCSV.replace(/\s/g, "").split(",");

  // Count all occurences of places first so we can create a scale
  let placeCounts = {};
  for(let i = 0; i < Object.keys(index).length; ++i) {
    let placeName = Object.keys(index)[i];
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
  }
  // Iterate through all place counts and generate bubbles
  for(let i = 0; i < Object.keys(placeCounts).length; ++i) {
    let placeName = Object.keys(placeCounts)[i];
    let count = placeCounts[placeName];

    if(count > 0) {
      let radius = ((count-placeMin)/(placeMax-placeMin))*(bubbleSize.max-bubbleSize.min) + bubbleSize.min;
      L.circleMarker(index[placeName].coords, {...{radius: radius}, ...bubbleAttributes})
        .bindTooltip(
          index[placeName].desc
          + "<hr>Erwähnungen: " + count.toString()
        ).addTo(map);
    }
  }
});
