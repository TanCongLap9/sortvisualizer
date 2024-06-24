/**
 * Returns the numerical value associated with the DOM object, given its index or the object.
 * @param {HTMLElement[]} array
 * @param {(number)=} index1
 * @param {(number)=} index2
 * @param {(number)=} index3
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function updateBox(array, index1, index2, index3, ...highlights) {
  ParamUtils.typeCheck("array", array, Array);
  ParamUtils.typeCheck("index1", index1, undefined, "number");
  ParamUtils.typeCheck("index2", index2, undefined, "number");
  ParamUtils.typeCheck("index3", index3, undefined, "number");
  ParamUtils.typeCheck("highlights", highlights, Array);
  if (typeof index1 === "number") index1 = ParamUtils.boundCheck(index1, array, true);
  if (typeof index2 === "number") index2 = ParamUtils.boundCheck(index2, array, true);
  if (typeof index3 === "number") index3 = ParamUtils.boundCheck(index3, array, true);
  async function func() {
    if (!running) throw new SortError("Execution stopped.");
    let size = 100 / array.length;
    let indexes = [index1, index2, index3];
    let colors = [RED, GREEN, BLUE];
    if (highlights.length === 1 && highlights[0] === null) highlights = [];
    let elems = indexes.map(i => i === undefined ? undefined : toElement(i, array));
    for (let i = 0; i < indexes.length; i++)
      if (elems[i]) {
        elems[i].style.left = indexes[i] * size + "%"; // Rearrange elements
        playNote(calculateFreq(elems[i]), noteDuration());
        NoQueue.changeColor(elems[i], colors[i]);
      }
    NoQueue.highlight(array, ...highlights);
    await NoQueue.sleep(sortDelay);
    for (let elem of elems) if (elem !== undefined) NoQueue.resetColor(elem);
    NoQueue.resetHighlight(array, ...highlights);
  }
  await addStepOrRunAsync(func);
}
/**
 * Changes the color of a single element specified by `i`
 * @param {number | HTMLElement} i
 * @param {string} color
 * @param {array?: HTMLElement[]]} options
 */
function changeColor(i, color, options = {array: elements}) {
  ParamUtils.typeCheck("i", i, "number", HTMLElement);
  ParamUtils.typeCheck("color", color, "string");
  ParamUtils.typeCheck("options", options, "object");
  options = Object.assign({array: elements}, options);
  ParamUtils.typeCheck("options.array", options.array, Array);
  if (typeof i === "number") i = ParamUtils.boundCheck(i, options.array, true);
  let {array} = options;
  function func() {NoQueue.changeColor(toElement(i, array), color);}
  addStepOrRun(func);
}
/**
 * Changes the color of multiple elements, ranging from `start` to `end` (exclusive)
 * @param {number} start
 * @param {number} end
 * @param {string} color
 * @param {{array?: HTMLElement[]}} options
 */
function changeColors(start, end, color, options = {array: elements}) {
  ParamUtils.typeCheck("start", start, "number");
  ParamUtils.typeCheck("end", end, "number");
  ParamUtils.typeCheck("color", color, "string");
  ParamUtils.typeCheck("options", options, "object");
  options = Object.assign({array: elements}, options);
  ParamUtils.typeCheck("options.array", options.array, Array);
  [start, end] = ParamUtils.rangeCheck(start, end, array, true);
  let {array} = options;
  function func() {for (let i = start; i < end; i++) {
    NoQueue.changeColor(toElement(i, array), color);
  }}
  addStepOrRun(func);
}
/**
 * Changes the color of multiple elements, using highlight array
 * @param {HTMLElement[]} array
 * @param {...HighlightSingle | HighlightRange} highlights
 */
function highlight(array, ...highlights) {
  ParamUtils.typeCheck("array", array, Array);
  ParamUtils.typeCheck("highlights", highlights, Array);
  function func() {NoQueue.highlight(array, ...highlights);}
  addStepOrRun(func);
}
/**
 * Resets the color of multiple elements, using highlight array
 * @param {HTMLElement[]} array
 * @param {...HighlightSingle | HighlightRange} highlights
 */
function resetHighlight(array, ...highlights) {
  ParamUtils.typeCheck("array", array, Array);
  ParamUtils.typeCheck("highlights", highlights, Array);
  function func() {NoQueue.resetHighlight(array, ...highlights);}
  addStepOrRun(func);
}
/**
 * Resets the color of a single element specified by `i`
 * @param {number | HTMLElement} i
 * @param {HTMLElement[]} array
 */
function resetColor(i, options = {array: elements}) {
  ParamUtils.typeCheck("i", i, "number", HTMLElement);
  ParamUtils.typeCheck("options", options, "object");
  options = Object.assign({array: elements}, options);
  ParamUtils.typeCheck("options.array", options.array, Array);
  let {array} = options;
  if (typeof i === "number") i = ParamUtils.boundCheck(i, options.array, true);
  function func() {NoQueue.resetColor(toElement(i, array));}
  addStepOrRun(func);
}
/**
 * Resets the color of all elements in an array
 * @param {HTMLElement[]} array
 */
function resetColors(array = elements) {
  ParamUtils.typeCheck("array", array, Array);
  function func() {NoQueue.resetColors(array);}
  addStepOrRun(func);
}
NoQueue.changeColor = function changeColor(e, color) {
  ParamUtils.typeCheck("e", e, HTMLElement);
  ParamUtils.typeCheck("color", color, "string");
  e.classList.add(color);
};
NoQueue.resetColor = function resetColor(e) {
  ParamUtils.typeCheck("e", e, HTMLElement);
  e.classList.remove(RED, BLUE, GREEN);
};
NoQueue.resetColors = function resetColors(array) {
  for (let i = 0; i < array.length; i++)
    NoQueue.resetColor(toElement(i, array));
};
NoQueue.highlight = function highlight(array, ...highlights) {
  ParamUtils.typeCheck("array", array, Array);
  ParamUtils.typeCheck("highlights", highlights, Array);
  for (let [param1, param2, param3] of highlights)
    if (typeof param2 === "number") { // Range
      ParamUtils.typeCheck("start", param1, "number");
      ParamUtils.typeCheck("end", param2, "number");
      let start = param1, end = param2;
      if (start < 0) start = array.length + start;
      if (end < 0) end = array.length + end;
      if (start < 0 || start >= array.length) return;
      end = Math2.clamp(end, 0, array.length);
      for (let i = start; i < end; i++)
        NoQueue.changeColor(toElement(i, array), param3);
    }
    else { // Index
      ParamUtils.typeCheck("index", param1, "number", HTMLElement);
      let i = param1;
      if (typeof i === "number" && i < 0) i = array.length + i;
      if (i < 0 || i >= array.length) return;
      NoQueue.changeColor(toElement(i, array), param2);
    }
};
NoQueue.resetHighlight = function resetHighlight(array, ...highlights) {
  for (let [param1, param2] of highlights)
    if (typeof param2 === "number") { // Range
      ParamUtils.typeCheck("start", param1, "number");
      ParamUtils.typeCheck("end", param2, "number");
      let start = param1, end = param2;
      if (start < 0) start = array.length + start;
      if (end < 0) end = array.length + end;
      if (start < 0 || start >= array.length) return;
      end = Math2.clamp(end, 0, array.length);
      for (let i = start; i < end; i++)
        NoQueue.resetColor(toElement(i, array));
    }
    else { // Index
      ParamUtils.typeCheck("index", param1, "number", HTMLElement);
      let i = param1;
      if (typeof i === "number" && i < 0) i = array.length + i;
      if (i < 0 || i >= array.length) return;
      NoQueue.resetColor(toElement(i, array));
    }
};
const SortVisualizerColor = {updateBox, changeColor, changeColors, highlight, resetHighlight, resetColor, resetColors, RED: "element-red", BLUE: "element-blue", GREEN: "element-green"};