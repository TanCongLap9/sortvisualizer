/**
 * Go to step `step`
 * @param {number} step
 * @param {boolean} newValues Use new values to set the array, usually when increasing step
 */
function goToStep(step, newValues) {
  ParamUtils.typeCheck("step", step, "number");
  ParamUtils.typeCheck("newValues", newValues, "boolean");;
  let {values, auxValues} = sortQueue[step];
  if (values) {
    resetColors(elements);
    values = newValues ? values.new : values.old;
    for (let i in values) {
      if (getValue(elements[i]) !== values[i])
        NoQueue.setValue(elements[i], values[i]);
    }
  }
  if (auxValues) {
    auxValues = newValues ? auxValues.new : auxValues.old;
    for (let iAux in auxValues) {
      resetColors(auxElements[iAux]);
      for (let i in auxValues[iAux])
        if (getValue(auxElements[iAux][i]) !== auxValues[iAux][i])
          NoQueue.setValue(auxElements[iAux][i], auxValues[iAux][i]);
    }
  }
}
/**
 * Automatically executed when a step slider changes
 * @param {Event} e
 */
async function stepChange(e) {
  ParamUtils.typeCheck("e", e, undefined, Event);
  let value = updateInput(e, 0,
    query("#step .slider"),
    query("#step .value")
  );
  if (oldValue === undefined) {
    goToStep(value, false);
    oldValue = value;
    return;
  }
  let deltaValue = value - oldValue;
  for (let relStep = deltaValue >= 0 ? 1 : 0; deltaValue >= 0 ? relStep < deltaValue : relStep >= deltaValue; deltaValue >= 0 ? relStep++ : relStep--)
    goToStep(relStep + oldValue, deltaValue >= 0);
  let {callback} = sortQueue[value];
  oldValue = value;
  running = true;
  if (callback) await callback();
  running = false;
}
/**
 * Enqueues an execution step, or run the callback directly if in realtime mode
 * @param {(() => undefined)=} callback
 * @param {number[] | "ORIG"=} values
 * @param {number[] | "ORIG"=} auxValues
 */
function addStepOrRun(callback, values, auxValues) {
  ParamUtils.typeCheck("callback", callback, undefined, "function");
  ParamUtils.typeCheck("values", values, undefined, null, "string", ["number"], "object");
  ParamUtils.typeCheck("auxValues", auxValues, undefined, null, "string", ["number"], "object");
  if (realtime) {callback(); return;}
  addStep(callback, values, auxValues);
}
/**
 * Enqueues an execution step, or run the callback directly if in realtime mode
 * @param {(async () => undefined)=} callback
 * @param {number[] | "ORIG"=} values
 * @param {number[] | "ORIG"=} auxValues
 */
async function addStepOrRunAsync(callback, values, auxValues) {
  ParamUtils.typeCheck("callback", callback, undefined, "function");
  ParamUtils.typeCheck("values", values, undefined, null, "string", ["number"], "object");
  ParamUtils.typeCheck("auxValues", auxValues, undefined, null, "string", ["number"], "object");
  if (realtime) {await callback(); return;}
  addStep(callback, values, auxValues);
}
/**
 * Enqueues an execution step
 * @param {(async () => undefined)=} callback
 * @param {number[] | "ORIG"=} values
 * @param {number[] | "ORIG"=} auxValues
 */
function addStep(callback, values, auxValues) {
  if (values === "ORIG") {
    values = {};
    values.old = values.new = getValue(elements);
  }
  if (auxElements.length && auxValues === "ORIG") {
    auxValues = {};
    auxValues.old = auxValues.new = auxElements.map(aux => getValue(aux));
  }
  sortQueue.push({
    values: values,
    auxValues: auxElements.length ? auxValues : undefined,
    callback
  });
}
const SortVisualizerStep = {goToStep, stepChange, addStepOrRun, addStep, addStepOrRunAsync};
SortVisualizerStep.onload = () => {
  byId("step").oninput = stepChange;
};