window.addEventListener('DOMContentLoaded', (event) => {
  const mapCenter = [51.533, 9.935];

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

  // Map
  let map = L.map("map").setView(mapCenter, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);
  // Scale
  L.control.scale({imperial: false, metric: true}).addTo(map);


  // Split CSV
  let csvArr = autonomesReferatP2.replace(/\s/g, "").split(",");

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
  }
  // Iterate through all place counts and generate bubbles
  for(let i = 0; i < Object.keys(placeCounts).length; ++i) {
    let placeName = Object.keys(placeCounts)[i];
    let count = placeCounts[placeName];

    if(count > 0) {
      let radius = ((count-placeMin)/(placeMax-placeMin))*(bubbleSize.max-bubbleSize.min) + bubbleSize.min;
      L.circleMarker(indexPlaces[placeName].coords, {...{radius: radius}, ...bubbleAttributes})
        .bindTooltip(
          indexPlaces[placeName].desc
          + "<hr>Erwähnungen: " + count.toString()
        ).addTo(map);
    }
  }
});
