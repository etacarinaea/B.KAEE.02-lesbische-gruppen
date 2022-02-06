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
