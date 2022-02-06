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
    markerCluster: L.markerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 40})
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
      title: entryArr[3].trim(),
      description: entryArr[4].trim(),
      source: entryArr[5].trim(),
      coordinates: coordinates,
      categories: entryArr[7].replace(/\s/g, "").split(","),
      id: undefined,
      marker: undefined
    };
    entry.id = year + "-" + entry.title.replace(/\s/g, "-") + "-" + coordinates.join("-");
    entry.marker = L.marker(coordinates, {icon: markerIcon}).bindTooltip(entry.title + "<hr>" + entry.date);
    entry.marker.on("click", (e) => {
      let row = document.getElementById(entry.id);
      row.scrollIntoView({block: "center"});
      let focusedRows = document.getElementsByClassName("focused-row");
      [...focusedRows].forEach((e) => {
        e.classList.remove("focused-row");
      });
      row.classList.add("focused-row");
    });
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
