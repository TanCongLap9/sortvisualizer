/**
 * Returns the value(s) of the element specified by `i`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i
 * @param {{array?: HTMLElement[]}} options
 */
function getValue(i, options = {array: elements}) {
  ParamUtils.typeCheck("i", i, ...NUMELEMORARR);
  ParamUtils.typeCheck("options", options, "object");
  options = Object.assign({array: elements}, options);
  ParamUtils.typeCheck("options.array", options.array, Array);
  let iArray = [].concat(i);
  if (typeof iArray[0] === "number") iArray = ParamUtils.boundCheck(iArray, options.array, true);

  let values = iArray.map(index => parseFloat(toElement(index, options.array).style.height.slice(0, -1)));
  return Array.isArray(i) ? values : values[0];
}
/**
 * Compares the value of the element specified by `i1` with the element specified by `i2`, returning -1 if less than, 1 if greater than or 0 if equal
 * @param {number | HTMLElement} i1
 * @param {number | HTMLElement} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function compare(i1, i2, options = {sound: true, array: elements, i1IsValue: false, i2IsValue: false}, ...highlights) {
  ParamUtils.typeCheck("options", options, "object");
  ParamUtils.typeCheck("highlights", highlights, Array);
  [options, highlights] = ParamUtils.optionalParams(options, highlights, {sound: true, array: elements, i1IsValue: false, i2IsValue: false});
  ParamUtils.typeCheck("options.array", options.array, Array);
  ParamUtils.typeCheck("options.sound", options.sound, "boolean");
  if (options.i1IsValue) ParamUtils.typeCheck("i1", i1, "number");
  else {
    ParamUtils.typeCheck("i1", i1, "number", HTMLElement);
    if (typeof i1 === "number") i1 = ParamUtils.boundCheck(i1, options.array, true);
  }
  if (options.i2IsValue) ParamUtils.typeCheck("i2", i2, "number");
  else {
    ParamUtils.typeCheck("i2", i2, "number", HTMLElement);
    if (typeof i2 === "number") i2 = ParamUtils.boundCheck(i2, options.array, true);
  }
  let {sound, array, i1IsValue, i2IsValue} = options;
  let i1Elem = !i1IsValue && toElement(i1, array), i2Elem = !i2IsValue && toElement(i2, array);
  if (!highlights.length) {
    highlights = [];
    if (!i1IsValue) highlights.push([i1Elem, RED]);
    if (!i2IsValue) highlights.push([i2Elem, RED]);
  }
  else if (highlights.length === 1 && highlights[0] === null) highlights = [];

  async function func() {
    if (!running) throw new SortError("Execution stopped.");
    if (sound) {
      if (!i1IsValue) playNote(calculateFreq(i1Elem), noteDuration());
      if (!i2IsValue) playNote(calculateFreq(i2Elem), noteDuration());
    }
    if (i1IsValue && i2IsValue);
    else {
      NoQueue.highlight(array, ...highlights);
      await NoQueue.sleep(sortDelay);
      NoQueue.resetHighlight(array, ...highlights);
    }
  }
  if (sound || highlights.length)
    await addStepOrRunAsync(func);
  SortInfo.compare();
  SortInfo.time();
  let v1 = i1IsValue ? i1 : getValue(i1, {array});
  let v2 = i2IsValue ? i2 : getValue(i2, {array});
  let result = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
  SortInfo.timeEnd();
  return result;
}
/**
 * Returns whether the value of the element specified by `i1` is less than the value of the element specified by `i2`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i1
 * @param {number | HTMLElement | number[] | HTMLElement[]} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}=} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function lt(i1, i2, options, ...highlights) {
  return await compare(i1, i2, options, ...highlights) < 0;
}
/**
 * Returns whether the value of the element specified by `i1` is less than or equal to value of the the element specified by `i2`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i1
 * @param {number | HTMLElement | number[] | HTMLElement[]} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}=} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function le(i1, i2, options, ...highlights) {
  return await compare(i1, i2, options, ...highlights) <= 0;
}
/**
 * Returns whether the value of the element specified by `i1` is greater than the value of the element specified by `i2`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i1
 * @param {number | HTMLElement | number[] | HTMLElement[]} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}=} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function gt(i1, i2, options, ...highlights) {
  return await compare(i1, i2, options, ...highlights) > 0;
}
/**
 * Returns whether the value of the element specified by `i1` is greater than or equal to the value of the element specified by `i2`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i1
 * @param {number | HTMLElement | number[] | HTMLElement[]} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}=} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function ge(i1, i2, options, ...highlights) {
  return await compare(i1, i2, options, ...highlights) >= 0;
}
/**
 * Returns whether the value of the element specified by `i1` is equal to the value of the element specified by `i2`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i1
 * @param {number | HTMLElement | number[] | HTMLElement[]} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}=} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function eq(i1, i2, options, ...highlights) {
  return await compare(i1, i2, options, ...highlights) === 0;
}
/**
 * Returns whether the value of the element specified by `i1` is not equal to the value of the element specified by `i2`
 * @param {number | HTMLElement | number[] | HTMLElement[]} i1
 * @param {number | HTMLElement | number[] | HTMLElement[]} i2
 * @param {{sound?: boolean, array?: HTMLElement[]}=} options
 * @param {...HighlightSingle | HighlightRange} highlights
 */
async function ne(i1, i2, options, ...highlights) {
  return await compare(i1, i2, options, ...highlights) !== 0;
}
function toIndex(i) {
  return typeof i === "object" ? Array.from(i.parentElement.querySelectorAll(".element")).indexOf(i) : i;
}
function toValue(v, array = elements) {
  return typeof v === "object" ? getValue(v, {array: array}) : v;
}
function toElement(e, array = elements) {
  ParamUtils.typeCheck("e", e, "number", HTMLElement);
  ParamUtils.typeCheck("array", array, Array);
  return typeof e === "object" ? e : array[e];
}
function findArray(e) {
  return [elements].concat(auxElements).find(arr => arr.includes(e));
}
async function sweep() {
  if (!sortCheck) return;
  running = true;
  let trace = Math.floor(elements.length / 6);
  
  let values = getValue(elements);

  let start = Date.now();
  let getElapsed = () => Date.now() - start;
  let currentI = () => Math.floor(Math2.clamp(getElapsed() / sortDelay, 0, elements.length));
  
  let unsortedAt;
  let oldI = 0;
  for (let i = 1; i < elements.length; i++)
    if (values[i - 1] > values[i]) {
      unsortedAt = i;
      break;
    }
  let checkProcess = new Promise(res => {
    let timeId = setInterval(() => {
      let i = currentI();
      if (i >= elements.length || !running) {
        clearInterval(timeId);
        res();
        return;
      }
      
      if (i === oldI) return; // Avoid setting multiple colors for the same element
      
      if (i) playNote(calculateFreq([elements[i], elements[i - 1]]), noteDuration());
      NoQueue.highlight(elements, [oldI, Math.min(unsortedAt || Infinity, i + 1), GREEN]);
      if (unsortedAt && i >= unsortedAt)
        NoQueue.highlight(elements, [Math.max(unsortedAt, oldI), i + 1, RED]);
      oldI = i;
    }, sortDelay);
  });
  await checkProcess;
  NoQueue.resetColors(elements);
  running = false;
}
const SortVisualizerRead = {getValue, compare, lt, le, gt, ge, eq, ne, toIndex, toValue, toElement, sweep};