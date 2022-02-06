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
      row.id = e.id;
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

