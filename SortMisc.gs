/**
 * Prevents execution for a specified amount of time
 * @param {number} delay Duration in milliseconds
 */
async function sleep(delay = sortDelay) {
  ParamUtils.typeCheck("delay", delay, "number");
  function func() {return NoQueue.sleep(delay);}
  await addStepOrRunAsync(func);
}
/**
 * Add/Updates text representing value of an array element
 * @param {HTMLElement} e
 */
function label(e) {
  ParamUtils.typeCheck("e", e, HTMLElement);
  let value = getValue(e);
  e.innerHTML = Number.isInteger(value) ? value : value.toFixed(2);
}
class SortError extends Error {
  constructor(...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SortError)
    }

    this.name = 'SortError'
  }
}
NoQueue.sleep = function sleep(delay) {
  return delay ? new Promise(resolve => setTimeout(resolve, delay)) : Promise.resolve();
}
const SortVisualizerMisc = {sleep, label, SortError};
SortVisualizerMisc.SortInfo = () => ({
  infoElems: {},
  started: 0,
  timeElapsed: 0,
  swap(array) {
    let writeInfoElem = array === elements ? byId("sort-write-main") : byId(`sort-write-aux${auxElements.indexOf(array)}`);
    writeInfoElem.innerHTML = Number(writeInfoElem.innerHTML) + 2;
    byId("sort-swaps").innerHTML++;
  },
  write(elem) {
    let writeInfoElem = elem.parentElement.id === "sort-container" ? byId("sort-write-main") : byId(`sort-write-aux${elem.parentElement.id.match(/\d+/)[0]}`);
    writeInfoElem.innerHTML = Number(writeInfoElem.innerHTML) + 1;
  },
  revokeArrayWrite(array) {
    let writeInfoElem = array === elements ? byId("sort-write-main") : byId(`sort-write-aux${auxElements.indexOf(array)}`);
    writeInfoElem.innerHTML = Number(writeInfoElem.innerHTML) - array.length;
  },
  time() {SortInfo.started = audioCtx.currentTime;},
  timeEnd() {
    SortInfo.timeElapsed += audioCtx.currentTime - SortInfo.started;
    this.infoElems.time.innerHTML = Math.floor(SortInfo.timeElapsed * 1000);
  },
  reverse() {

  },
  reset() {
    byId("sort-write-main").innerHTML = byId("sort-swaps").innerHTML = byId("sort-comps").innerHTML = byId("sort-time").innerHTML = 0;
    byId("sort-datetime").innerHTML = new Date().toLocaleTimeString();
    SortInfo.timeElapsed = 0;
  },
  compare() {byId("sort-comps").innerHTML++;},
  [Symbol.toStringTag]: "SortInfo"
});
SortVisualizerMisc.onload = () => {
  SortInfo.infoElems = {
    comps: byId("sort-comps"),
    swaps: byId("sort-swaps"),
    time: byId("sort-time"),
    dateTime: byId("sort-datetime"),
    writeMain: byId('sort-write-main')
  };
}