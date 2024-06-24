const SortVisualizerUtils = {};
SortVisualizerUtils.Math2 = () => ({
  clamp: function clamp(value, min = -Infinity, max = Infinity) {
    return Math.max(Math.min(value, max), min);
  },
  csc: function csc(x) {
    return 1 / Math.sin(x);
  },
  sec: function sec(x) {
    return 1 / Math.cos(x);
  },
  cot: function cot(x) {
    return 1/ Math.tan(x);
  },
  /**
   * @param {number=} start
   * @param {number} stop
   * @param {number=} [step = 1]
   */
  range: function range(start, stop, step) {
    let array = [];
    if (stop === undefined) { // 1 param (stop)
      stop = start;
      start = 0;
    }
    if (step === undefined) step = 1;
    if (step >= 0)
      for (let i = start; i < stop; i += step)
        array.push(i);
    else
      for (let i = start; i > stop; i += step)
        array.push(i);
    return array;
  },
  [Symbol.toStringTag]: "Math2"
});
SortVisualizerUtils.ParamUtils = () => ({
  /**
   * Checks a parameter type and errors if the type does not match
   * @param {string} name The name of the parameter, used for displaying when error occurs
   * @param {value} value The value of the parameter
   * @param {Array<string | object | Array>} types The types to check for the value, each of which can be a scalar type (like "number", HTMLElement) or array type (like ["number"], Array, ["number", HTMLElement]). Use type as class when the value is checked for object type
   * @example
   * typeCheck("indexes", indexes, "number", HTMLElement, ["number", HTMLElement]); // Throws error if indexes is neither a number nor an array of numbers
   */
  typeCheck: function typeCheck(name, value, ...types) {
    /*let paramExpectedTypes = [
      ["typeCheck.name", name, "string", undefined],
      ["typeCheck.value", value, "any"],
      ["typeCheck.types", types, "string", "object", Array]
    ];*/ // Disabled for performance
    function isValidType(value, type) {
      if (type === "any" || type === "unknown" || type === "void") // TypeScript special types
        return true;
      else if (type === undefined)
        return value === undefined;
      else if (type === null)
        return value === null;
      else if (typeof type === "string" && type[0].toLowerCase() + type.slice(1) === type) // "number", "string", ...
        return typeof value === type;
      else if (typeof type === "string" && type[0].toUpperCase() + type.slice(1) === type) // Uppercase types using string (like "Object", "Array") are not supported
        throw new TypeError(`Object type '${type}' (from parameter typeCheck.types) must not be specified using string`);
      else if (typeof type === "object" && type[Symbol.iterator]) // typed iterable
        return value !== undefined && value !== null && Boolean(value[Symbol.iterator]) && iterableTypeCheck(value, ...type);
      else if (typeof type === "function") // Object, Array, HTMLElement, ...
        return value instanceof type;
      else
        throw new TypeError(`Unknown type: ${type} (from parameter typeCheck.types)`);
    }
    function iterableTypeCheck(iterable, ...types) {
      let valid = false;
      for (let value of iterable[Symbol.iterator]())
        if (types.some(type => isValidType(value, type)))
          valid = true;
      if (!iterable.length || !types.length) valid = true;
      return valid;
    }
    function resolveTypeName(type) {
      if (type === "any" || type === "unknown" || type === "void") // TypeScript special types
        return "any";
      else if (type === undefined)
        return "undefined";
      else if (type === null)
        return "null";
      else if (typeof type === "string" && type[0].toLowerCase() + type.slice(1) === type) // "number", "string", ...
        return type;
      else if (typeof type === "string" && type[0].toUpperCase() + type.slice(1) === type) // Uppercase types using string (like "Object", "Array") are not supported
        return "unknown";
      else if (typeof type === "object" && type[Symbol.iterator]) // typed iterable
        return "array of " + type.map(subType => resolveTypeName(subType)).join(", ");    
      else if (typeof type === "function") // Object, Array, HTMLElement, ...
        return type.name;
      else
        return "unknown";
    }
    for (let [paramName, paramValue, ...paramTypes] of /*paramExpectedTypes*/[].concat([[name, value, ...types]])) {
      let valid = paramTypes.some(type => isValidType(paramValue, type));
      if (!valid) {
        console.error("Error at value", value, paramName ? `(from parameter '${paramName}')` : "");
        throw new TypeError(`Incompatible types: ${
          typeof paramValue === "object" ? paramValue.constructor.name : typeof paramValue === "function" ? paramValue.name : typeof paramValue
        } ${paramName ? `(from parameter '${paramName}') ` : ""}cannot be converted to ${paramTypes.length > 1 ? "one of ": ""}${
          paramTypes.map(type => "'" + resolveTypeName(type) + "'").join(", ")
        }`)
      };
    }
  },
  /**
   * Checks an array of indexes and throws error if an index is out of bounds
   * @param {number | number[]} indexes The indexes to be checked
   * @param {Array} array The array that limits the bounds of indexes
   * @param {boolean} [allowNegativeIndexes] Set this to `true` to allow negative indexes
   * @example
   * CheckUtils.boundCheck(3, [1, 2, 3]);
   * [i, j] = CheckUtils.boundCheck([i, j], array, true); // Allows negative indexes, which will be converted to non-negative ones
   */
  boundCheck: function boundCheck(indexes, array, allowNegativeIndexes = false) {
    let iArray = [].concat(indexes);
    for (let i in iArray) {
      if ((
        allowNegativeIndexes ? iArray[i] < -array.length : iArray[i] < 0
      ) || iArray[i] >= array.length)
        throw new Error(`Index ${iArray[i]} out of bounds for length ${array.length}`);
      if (iArray[i] < 0)
        iArray[i] = array.length + iArray[i];
    }
    return Array.isArray(indexes) ? iArray : iArray[0];
  },
  rangeCheck: function rangeCheck(start, end, array, allowNegativeIndexes = false) {
    [start, end] = ParamUtils.boundCheck([start, end - 1], array, allowNegativeIndexes);
    return [start, end + 1];
  },
  optionalParams: function (options2, highlights2, defaultOptions) {
    let options = options2;
    let highlights = highlights2.slice();
    if (Array.isArray(options) || !options) { // options not set => Shift options and all the next parameters to the right
      if (options !== undefined) highlights.unshift(options);
      options = defaultOptions;
    }
    else { // options set
      options = Object.assign(defaultOptions, options); //Object.assign(defaultOptions, options));
    }
    return [options, highlights];
  },
  [Symbol.toStringTag]: "ParamUtils"
});
SortVisualizerUtils.ValuesArray = function ValuesArray(array, options = {color: RED, sound: true, delay: undefined}, ...highlights) {
  ParamUtils.typeCheck("array", array, Array);
  let object = [];
  [options, highlights] = ParamUtils.optionalParams(options, highlights, {color: RED, sound: true, delay: undefined});
  ParamUtils.typeCheck("options.color", options.color, "string");
  ParamUtils.typeCheck("options.sound", options.sound, "boolean");
  ParamUtils.typeCheck("options.delay", options.delay, undefined, "number");
  Object.defineProperties(object, array.map(
    (elem, i) => ({
      get() {
        return {
          get() {return getValue(array[i]);},
          elem() {return elem;},
          async compare(j) {return await compare(array[i], j, options, ...highlights);},
          async lt(j) {return await lt(array[i], j, options, ...highlights);},
          async le(j) {return await le(array[i], j, options, ...highlights);},
          async gt(j) {return await gt(array[i], j, options, ...highlights);},
          async ge(j) {return await ge(array[i], j, options, ...highlights);},
          async eq(j) {return await eq(array[i], j, options, ...highlights);},
          async ne(j) {return await ne(array[i], j, options, ...highlights);},
          async swap(j) {await swap(array[i], j, options, ...highlights);},
          async preInc() {let oldValue = getValue(array[i]); await setValue(array[i], oldValue + 1, options, ...highlights); return oldValue + 1;},
          async postInc() {let oldValue = getValue(array[i]); await setValue(array[i], oldValue + 1, options, ...highlights); return oldValue;},
          async preDec() {let oldValue = getValue(array[i]); await setValue(array[i], oldValue - 1, options, ...highlights); return oldValue - 1;},
          async postDec() {let oldValue = getValue(array[i]); await setValue(array[i], oldValue - 1, options, ...highlights); return oldValue;},
          async set(value) {await setValue(array[i], value, options, ...highlights);},
        };
      },
      set() {
        throw new Error(`Assigning value to values array is deprecated, use valuesArray[${i}].set(value) instead`);
      },
      enumerable: true,
      configurable: true
    })
  ));
  Object.assign(object, {
    length: array.length,
    async splice(index, length, ...values) {
      if (length !== values.length) throw new Error(`Removing element is not implemented yet (different length parameter and length of values, got ${length}, ${values.length})`);
      setValue(Array.from({length}, (_, i) => index + i), values, setColor, array);
    },
    push() {throw new Error("Adding element is not implemented yet");},
    pop() {throw new Error("Removing element is not implemented yet");},
    shift() {throw new Error("Removing element is not implemented yet");},
    unshift() {throw new Error("Adding element is not implemented yet");},
    async reverse() {await reverse(0, this.length, options, ...highlights); return this;}
  });
  return object;
};
SortVisualizerUtils.ELEMARR = () => [HTMLElement];
SortVisualizerUtils.NUMELEMARR = () => ["number", HTMLElement];
SortVisualizerUtils.ELEMORARR = () => [HTMLElement, [HTMLElement]];
SortVisualizerUtils.NUMORARR = () => ["number", ["number"]];
SortVisualizerUtils.NUMELEMORARR = () => ["number", HTMLElement, ["number"], [HTMLElement]];