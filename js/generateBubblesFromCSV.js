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
