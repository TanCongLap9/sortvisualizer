
/**
 * Copy an array to another array at specified index
 * @param {number[] | HTMLElement[]} array1 Destination array
 * @param {number[] | HTMLElement[]} array2 Source array
 * @param {number} index Starting index of `array1` to which the values of `array2` is copied
 * @param {string} color
 */
async function copyArray(array1, array2, index = 0, options = {color: RED}) {
  ParamUtils.typeCheck("array1", array1, ["number"], Array);
  ParamUtils.typeCheck("array2", array2, ["number"], Array);
  ParamUtils.typeCheck("index", index, "number");
  options = Object.assign({color: RED}, options);
  ParamUtils.typeCheck("options.color", options.color, "string");
  ParamUtils.boundCheck(index + array2 - 1, array1);
  let {color} = options;
  let iArray2 = Math2.range(index, index + array2.length);
  await setValue(iArray2, array2, {sound: false, array: array1}, [index, index + array2.length, color]);
}
/**
 * Sets all values of an array to 0
 * @param {HTMLElement[][]} arrays
 */
async function clearArray(...arrays) {
  ParamUtils.typeCheck("arrays", arrays, [ELEMARR]);
  for (let array of arrays) {
    SortInfo.revokeArrayWrite(array);
    await setValue(array, array.slice().fill(0), {sound: false, array}, null);
  }
}
/**
 * Swaps 2 values
 * @param {number | HTMLElement} i
 * @param {number | HTMLElement} j
 * @param {number} delay
 * @param {HTMLElement[]} j
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function swap(i, j, options = {sound: true, array: elements, delay: undefined}, ...highlights) {
  ParamUtils.typeCheck("i", i, "number", HTMLElement);
  ParamUtils.typeCheck("j", j, "number", HTMLElement);
  [options, highlights] = ParamUtils.optionalParams(options, highlights, {sound: true, array: elements, delay: undefined});
  ParamUtils.typeCheck("options.sound", options.sound, "boolean");
  ParamUtils.typeCheck("options.array", options.array, Array);
  ParamUtils.typeCheck("options.delay", options.delay, undefined, "number");
  if (typeof i === "number") i = ParamUtils.boundCheck(i, options.array, true);
  if (typeof j === "number") j = ParamUtils.boundCheck(j, options.array, true);
  let {sound, array, delay} = options;

  let iIndex = toIndex(i), jIndex = toIndex(j);
  let iElem = toElement(i, array), jElem = toElement(j, array);
  if (!highlights.length) highlights = [[iElem, RED], [jElem, RED]];
  async function func() {
    if (!running) throw new SortError("Execution stopped.");
    let oldSortDelay;
    if (delay !== undefined) {
      oldSortDelay = sortDelay;
      document.querySelector("#delay .value").value = delay;
    }
    if (sound) playNote(calculateFreq([iElem, jElem], true), noteDuration());
    NoQueue.highlight(array, ...highlights);
    for (let elem of [iElem, jElem]) {
      if (anim) Object.assign(elem.style, {transition: `left ${sortDelay}ms`, zIndex: "1"});
      elem.classList.add("swapping");
    }
    [iElem.style.left, jElem.style.left] = [jElem.style.left, iElem.style.left];
    
    await NoQueue.sleep(sortDelay);
    
    if (realtime) {
      SortInfo.time();
      NoQueue.swap(iElem, jElem);
      SortInfo.timeEnd();
    }
    else {
      NoQueue.swap(iElem, jElem);
    }
    
    [iElem.style.left, jElem.style.left] = [jElem.style.left, iElem.style.left];
    if (delay !== undefined) {
      document.querySelector("#delay .value").value = oldSortDelay;
    }
    NoQueue.resetHighlight(array, ...highlights);
    for (let elem of [iElem, jElem]) {
      if (anim) Object.assign(elem.style, {transition: "", zIndex: ""});
      elem.classList.remove("swapping");
    }
    
  }
  SortInfo.swap(array);
  await addStepOrRunAsync(func, array === elements ? (() => {  // Needs to fix
    let arrOld = {}, arrNew = {};
    arrOld[iIndex] = getValue(iElem);
    arrOld[jIndex] = getValue(jElem);
    arrNew[iIndex] = getValue(jElem);
    arrNew[jIndex] = getValue(iElem);
    return {old: arrOld, new: arrNew};
  })() : undefined, array !== elements ? (() => {
    let arrOld = {}, arrNew = {};
    arrOld[iIndex] = getValue(iElem);
    arrOld[jIndex] = getValue(jElem);
    arrNew[iIndex] = getValue(jElem);
    arrNew[jIndex] = getValue(iElem);
    let oldNew = {old: [], new: []};
    let arrayIndex = auxElements.indexOf(array);
    oldNew.old[arrayIndex] = arrOld;
    oldNew.new[arrayIndex] = arrNew;
    return oldNew;
  })() : undefined);
  if (!realtime) {
    SortInfo.time();
    NoQueue.swap(iElem, jElem);
    SortInfo.timeEnd();
  }
}
/**
 * Reverses an array
 * @param {number} start
 * @param {number} end
 * @param {{array?: HTMLElement[], color?: string}} options
 * @param {HighlightSingle | HighlightRange} highlights
 */
async function reverse(start = 0, end, options = {array: elements, color: RED}, ...highlights) {
  ParamUtils.typeCheck("start", start, "number");
  ParamUtils.typeCheck("end", end, undefined, "number");
  ParamUtils.typeCheck("options", options, undefined, "object");
  [options, highlights] = ParamUtils.optionalParams(options, highlights, {array: elements, color: RED});
  ParamUtils.typeCheck("options.array", options.array, Array);
  ParamUtils.typeCheck("options.color", options.color, "string");
  let {array, color} = options;
  if (end === undefined) end = array.length;
  [start, end] = ParamUtils.rangeCheck(start, end, array, true);

  let elems = array.filter((_, i) => i >= start && i < end);
  if (!highlights.length) highlights = elems.map(v => [v, options.color]);
  async function func() {
    if (!running) throw new SortError("Execution stopped.");
    
    NoQueue.highlight(array, ...highlights);
    for (let elem of elems) {
      if (anim) Object.assign(elem.style, {transition: `left ${sortDelay}ms`, zIndex: "1"});
      elem.classList.add("swapping");
    }
    for (let i = start, j = end - 1; i < j; i++, j--)
      [array[i].style.left, array[j].style.left] = [array[j].style.left, array[i].style.left];
    
    await NoQueue.sleep(sortDelay);
    
    if (realtime) {
      SortInfo.time();
      for (let i = start, j = end - 1; i < j; i++, j--)
        NoQueue.swap(array[i], array[j]);
      SortInfo.timeEnd();
    }
    else {
      for (let i = start, j = end - 1; i < j; i++, j--)
        NoQueue.swap(array[i], array[j]);
    }
    
    for (let i = start, j = end - 1; i < j; i++, j--)
      [array[i].style.left, array[j].style.left] = [array[j].style.left, array[i].style.left];
    NoQueue.resetHighlight(array, ...highlights);
    for (let elem of elems) {
      if (anim) Object.assign(elem.style, {transition: "", zIndex: ""});
      elem.classList.remove("swapping");
    }
  }

  SortInfo.reverse(array);
  await addStepOrRunAsync(func, array === elements ? (() => {
    let arrOld = {}, arrNew = {};
    for (let i = start, j = end - 1; i < j; i++, j--) {
      arrOld[i] = getValue(array[i]);
      arrNew[i] = getValue(array[j]);
    }
    return {old: arrOld, new: arrNew};
  })() : undefined, array !== elements ? (() => {
    let arrOld = {}, arrNew = {};
    for (let i = start, j = end - 1; i < j; i++, j--) {
      arrOld[i] = getValue(array[i]);
      arrNew[i] = getValue(array[j]);
    }
    let oldNew = {old: [], new: []};
    let arrayIndex = auxElements.indexOf(array);
    oldNew.old[arrayIndex] = arrOld;
    oldNew.new[arrayIndex] = arrNew;
    return oldNew;
  })() : undefined);
  if (!realtime) {
    SortInfo.time();
    for (let i = start, j = end - 1; i < j; i++, j--)
      NoQueue.swap(array[i], array[j]);
    SortInfo.timeEnd();
  }
}
/**
 * Set value or values of an array
 * @param {number | HTMLElement | number[] | HTMLElement[]} i
 * @param {number | HTMLElement | number[] | HTMLElement[]} v
 * @param {{sound?: boolean, array?: HTMLElement[]}} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function setValue(i, v, options = {sound: true, array: elements}, ...highlights) {
  ParamUtils.typeCheck("i", i, ...NUMELEMORARR);
  ParamUtils.typeCheck("v", v, ...NUMELEMORARR);
  [options, highlights] = ParamUtils.optionalParams(options, highlights, {sound: true, array: elements});
  ParamUtils.typeCheck("options.sound", options.sound, "boolean");
  ParamUtils.typeCheck("options.array", options.array, Array);
  
  let [iArray, vArray] = [[].concat(i), [].concat(v)];
  if (typeof iArray[0] === "number") iArray = ParamUtils.boundCheck(iArray, options.array, true);
  if (iArray.length !== vArray.length) throw new Error(`Different array length of i and v pair: i has ${iArray.length}, whereas v has ${vArray.length}`);
  let {sound, array} = options;
  
  let [iIndexes, iElems, vValues] = [
    iArray.map(i => toIndex(i)),
    iArray.map(i => toElement(i, array)),
    vArray.map(v => toValue(v, array))
  ];
  if (!highlights.length) highlights = iElems.map(elem => [elem, RED]);
  if (highlights.length === 1 && highlights[0] === null) highlights = [];
  async function func() {
    if (!running) throw new SortError("Execution stopped.");
    NoQueue.highlight(array, ...highlights);

    for (let i = 0; i < iArray.length; i++) {
      if (sound) playNote(calculateFreq(iElems[i]), noteDuration());
      if (anim) iElems[i].style.transition = `height ${sortDelay}ms`;
    }

    if (realtime) {
      SortInfo.time();
      NoQueue.setValue(iElems, vValues);
      SortInfo.timeEnd();
    }
    else NoQueue.setValue(iElems, vValues);

    await NoQueue.sleep(sortDelay);
    for (let i = 0; i < iArray.length; i++)
      if (anim) iElems[i].style.transition = "";
    NoQueue.resetHighlight(array, ...highlights);
  }
  for (let elem of iElems) SortInfo.write(elem);
  await addStepOrRunAsync(func, (() => {
    let arrOld = {}, arrNew = {};
    for (let i = 0; i < iArray.length; i++) if (elements.includes(iElems[i])) {
      arrOld[iIndexes[i]] = getValue(iElems[i]);
      arrNew[iIndexes[i]] = vValues[i];
    }
    return {old: arrOld, new: arrNew};
  })(), (() => {
    let oldNew = {old: [], new: []};
    for (let iAux in auxElements) {
      let arrOld = {}, arrNew = {};
      for (let i = 0; i < iArray.length; i++) if (auxElements[iAux].includes(iElems[i])) {
        arrOld[iIndexes[i]] = getValue(iElems[i]);
        arrNew[iIndexes[i]] = vValues[i];
      }
      oldNew.old[iAux] = arrOld;
      oldNew.new[iAux] = arrNew;
    }
    return oldNew;
  })());
  if (!realtime) {
    SortInfo.time();
    NoQueue.setValue(iElems, vValues);
    SortInfo.timeEnd();
  }
}
/**
 * @param {HTMLElement} i
 * @param {HTMLElement} j
 */
NoQueue.swap = function swap(i, j) {
  ParamUtils.typeCheck("i", i, HTMLElement);
  ParamUtils.typeCheck("j", j, HTMLElement);
  /*[array[i].style.left, array[j].style.left] = [array[j].style.left, array[i].style.left];
  [array[i], array[j]] = [array[j], array[i]];*/
  let iValue = getValue(i), jValue = getValue(j);
  NoQueue.setValue(i, jValue);
  NoQueue.setValue(j, iValue);
};
/**
 * @param {HTMLElement | HTMLElement[]} i
 * @param {number | number[]} v
 */
NoQueue.setValue = function setValue(i, v) {
  ParamUtils.typeCheck("i", i, ...ELEMORARR);
  ParamUtils.typeCheck("v", v, ...NUMORARR);
  let
    iArray = [].concat(i),
    vArray = [].concat(v);
  for (let i = 0; i < iArray.length; i++) {
    iArray[i].style.height = vArray[i] + "%";
    label(iArray[i]);
  }
};
const SortVisualizerWrite = {copyArray, clearArray, swap, reverse, setValue};