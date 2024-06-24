function fillBox(length = Number(document.querySelector("#elements .value").value), auxArrayId) {
  ParamUtils.typeCheck("length", length, "number");
  ParamUtils.typeCheck("auxArrayId", auxArrayId, undefined, "number");
  let isAux = auxArrayId !== undefined;
  let box = isAux ? byId(`sort-container-${auxArrayId}`) : byId("sort-container");
  let elementsArray;
  let size = 100 / length;
  let {name, params} = equalValues;
  let type = params ? params.type : undefined;
  let dist = max - min;
  box.innerHTML = "";
  function height(i) {
    let ratio;
    switch (name) {
      case "each":
        let sameValues = params.sameValues;
        ratio = Math.floor(i / sameValues) * sameValues / (length - 1);
        return decimal ? min + ratio * dist : Math.round(min + ratio * dist);
      case "poly":
        let exp = {quadratic: 2, cubic: 3, quaric: 4, quintic: 5}[type];
        ratio = Math.pow(i, exp) / Math.pow(length - 1, exp);
        return decimal ? min + ratio * dist : Math.floor(min + ratio * dist);
      case "root":
        switch (type) {
          case "square":
            ratio = Math.sqrt(i) / Math.sqrt(length - 1);
            break;
          case "cube":
            ratio = Math.cbrt(i) / Math.cbrt(length - 1);
            break;
          case "forth":
            ratio = Math.pow(i, 0.25) / Math.pow(length - 1, 0.25);
            break;
          case "fifth":
            ratio = Math.pow(i, 0.2) / Math.pow(length - 1, 0.2);
            break;
        }
        return decimal ? min + ratio * dist : Math.floor(min + ratio * dist);
      case "random-values":
        ratio = Math.random();
        return decimal ? min + ratio * dist : Math.round(min + ratio * dist);
      case "trig":
        switch (type) {
          case "sin":
            ratio = 0.5 + Math.sin(i / (length - 1) * 2 * Math.PI) * 0.5;
            break;
          case "cos":
            ratio = 0.5 + Math.cos(i / (length - 1) * 2 * Math.PI) * 0.5;
            break;
          case "tan":
            ratio = 0.5 + Math2.clamp(Math.tan(i / (length - 1) * 2 * Math.PI), -10, 10) * 0.5 / 10;
            break;
          case "csc":
            ratio = 0.5 + Math2.clamp(Math2.csc(i / (length - 1) * 2 * Math.PI), -10, 10) * 0.5 / 10;
            break;
          case "sec":
            ratio = 0.5 + Math2.clamp(Math2.sec(i / (length - 1) * 2 * Math.PI), -10, 10) * 0.5 / 10;
            break;
          case "cot":
            ratio = 0.5 + Math2.clamp(Math2.cot(i / (length - 1) * 2 * Math.PI), -10, 10) * 0.5 / 10;
            break;
        }
        return decimal ? min + ratio * dist : Math.floor(min + ratio * dist);
      case "custom":
        let values = equalValues.params.values;
        let repeatedValues = Array.from({length}).map((_, i) => values[i % values.length]);
        return repeatedValues[i];
      case "nearly-all":
        ratio = i === 0 ? 0 : i === length - 1 ? 1 : 0.5;
        return decimal ? min + ratio * dist : Math.round(min + ratio * dist);
      case "all":
        ratio = 0.5;
        return decimal ? min + ratio * dist : Math.round(min + ratio * dist);
      default:
        ratio = i / (length - 1);
        return decimal ? min + ratio * dist : Math.round(min + ratio * dist);
      
    }
  }
  if (name !== "perlin") for (let i = 0; i < length; i++) {
    let element = Object.assign(document.createElement("div"), {className: "element"});
    Object.assign(element.style, {
      left: i*size + "%",
      width: size + "%",
      height: isAux ? 0 : height(i) + "%",
      fontSize: Math.min(size / 4 * 28, 28) + "pt"
    })
    box.append(element);
  }
  else {
    // JS version of ArrayV's Perlin Noise algorithm
    // Sources:
    //   utils/PerlinNoise.java: https://github.com/Gaming32/ArrayV/blob/main/src/main/java/io/github/arrayv/utils/PerlinNoise.java
    //   utils/Distributions.java: https://github.com/Gaming32/ArrayV/blob/main/src/main/java/io/github/arrayv/utils/Distributions.java
    const PERM = [
      151, 160, 137, 91, 90, 15,
      131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
      190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
      88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
      77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
      102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
      5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
      223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
      251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
      49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
      138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
      151
    ];
    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function grad(hash, x) {
      return (hash & 1) === 0 ? x : -x;
    }
    function lerp(t, a, b) {
      return a + t * (b - a);
    }
    function returnNoise(x) {
      let index = Math.floor(x) & 0xff;
      x -= Math.floor(x);
      let u = fade(x);
      return lerp(u, grad(PERM[index], x), grad(PERM[index + 1], x - 1)) * 2;
    }
    function returnFracBrownNoise(x, octave) {
      let f = 0.0;
      let w = 0.5;
      for (let i = 0; i < octave; i++) {
        f += w * returnNoise(x);
        x *= 2.0;
        w *= 0.5;
      }
      return f;
    }
    let perlinNoise = new Array(length);
    let step = 1 / length;
    let randomStart = Math.floor(Math.random() * length);
    let octave = Math.floor(Math.log(length) / Math.log(2));

    for (let i = 0; i < length; i++) {
      let value = Math.floor(returnFracBrownNoise(randomStart, octave) * length);
      perlinNoise[i] = value;
      randomStart += step;
    }
    let minimum = Math.abs(Math.min(...perlinNoise));
    for (let i = 0; i < length; i++) perlinNoise[i] += minimum;
    let maximum = Math.max(...perlinNoise);
    let scale = length / maximum;
    if (scale < 1.0 || scale > 1.8)
      for (let i = 0; i < length; i++)
        perlinNoise[i] = Math.floor(perlinNoise[i] * scale);
    for (let i = 0; i < length; i++) {
      let element = Object.assign(document.createElement("div"), {className: "element"});
      Object.assign(element.style, {
        left: i*size + "%",
        width: size + "%",
        height: isAux ? 0 : Math.min(perlinNoise[i], length-1) * 100 / length + "%",
        fontSize: Math.min(size / 4 * 28, 28) + "pt"
      })
      box.append(element);
    }
  }
  if (isAux) elementsArray = auxElements[auxArrayId] = Array.from(box.children);
  else elementsArray = elements = Array.from(box.children);
  for (let i = 0; i < elementsArray.length; i++) label(elementsArray[i]);
}
async function shuffle(array = elements) {
  ParamUtils.typeCheck("elementsArray", array, ELEMARR);
  byId("step").style.display = "none";
  let isAux = array !== elements;
  disableButtons();
  
  function partition(first, last, decreasing) {
    var pivotIndex = first, pivot = getValue(pivotIndex), lower = first;
    for (var higher = lower; higher <= last; higher++)
      if (!decreasing ? getValue(higher) < pivot : getValue(higher) > pivot) {
        lower++;
        NoQueue.swap(elements[lower], elements[higher]);
      }
    NoQueue.swap(elements[lower], elements[pivotIndex]);
    return lower;
  }
  function sort(first = 0, last = array.length - 1, decreasing = false) {
    if (isSorted(undefined, decreasing)) return;
    if (first >= last) return;
    var sortedElemIndex = partition(first, last, decreasing);
    sort(first, sortedElemIndex - 1, decreasing);
    sort(sortedElemIndex + 1, last, decreasing);
  }
  let indicesToRandom, valuesToRandom, sortedLength, setIndex, values, parts;
  switch (presort.name) {
    case "asc-desc":
      switch (presort.params.type) {
        case "asc":
          sort();
          break;
        case "desc":
          sort(undefined, undefined, true);
          break;
        case "asc-desc":
          sort();
          for (let i = 2; i < array.length; i += 2)
            NoQueue.swap(elements[i / 2], elements[i]);
          sort(Math.floor(array.length / 2), undefined, true);
          break;
        case "desc-asc":
          sort(undefined, undefined, true);
          for (let i = 2; i < array.length; i += 2)
            NoQueue.swap(elements[i / 2], elements[i]);
          sort(Math.floor(array.length / 2));
          break;
      }
      values = getValue(array);
      let segment = Math.min(presort.params.segment, array.length);
      for (let i = 0; i < segment; i++)
        for (let setIndex = Math.floor(array.length * i / segment), j = i; j < array.length; setIndex++, j += segment)
          NoQueue.setValue(toElement(setIndex, array), values[j]);
      break;
    case "random-part":
      indicesToRandom = Array(Math.round(
        presort.params.unit === "element" ?
          presort.params.amount :
          presort.params.amount / 100 * array.length
      )), valuesToRandom = Array(indicesToRandom);
      sortedLength = array.length - indicesToRandom.length;
      
      sort();
      for (let i = 0; i < indicesToRandom.length; i++) {
        let indexToRandom = Math.floor(i / indicesToRandom.length * array.length);
        indicesToRandom[i] = indexToRandom;
        valuesToRandom[i] = getValue(indexToRandom);
      }
      valuesToRandom.sort((a, b) => 0.5 - Math.random());
      switch (presort.params.type) {
        case "first":
          setIndex = array.length - 1;
          for (let i = array.length - 1; i >= 0; i--) {
            if (!indicesToRandom.includes(i)) {
              NoQueue.setValue(toElement(setIndex, array), getValue(i, array));
              setIndex--;
            }
            if (i < indicesToRandom.length)
              NoQueue.setValue(toElement(i, array), valuesToRandom[i]);
          }
          break;
        case "last":
          setIndex = 0;
          for (let i = 0; i < array.length; i++) {
            if (!indicesToRandom.includes(i)) {
              NoQueue.setValue(toElement(setIndex, array), getValue(i, array));
              setIndex++;
            }
            if (i >= sortedLength) {
              let j = i - sortedLength;
              NoQueue.setValue(toElement(i, array), valuesToRandom[j]);
            }
          }
          break;
      }
      break;
    case "adversary":
      switch (presort.params.type) {
        case "quicksort":
          // JS version of ArrayV's Quicksort Adversary shuffle
          // Source:
          //   utils/Shuffles.java: https://github.com/Gaming32/ArrayV/blob/main/src/main/java/io/github/arrayv/utils/Shuffles.java)
          let currentLen = array.length;
          for (let j = currentLen - currentLen % 2 - 2, i = j - 1; i >= 0; i -= 2, j--)
            NoQueue.swap(elements[i], elements[j]);
          break;
        case "grailsort":
          // JS version of ArrayV's Grailsort Adversary shuffle
          // Source:
          //   utils/Shuffles.java: https://github.com/Gaming32/ArrayV/blob/main/src/main/java/io/github/arrayv/utils/Shuffles.java
          /*
          function shuffleArray(int[] array, ArrayVisualizer arrayVisualizer, Delays Delays, Highlights Highlights, Writes Writes) {
            int currentLen = arrayVisualizer.getCurrentLength();
            boolean delay = arrayVisualizer.shuffleEnabled();

            if (currentLen <= 16) Writes.reversal(array, 0, currentLen-1, delay ? 1 : 0, true, false);
            else {
              int blockLen = 1;
              while (blockLen * blockLen < currentLen) blockLen *= 2;

              int numKeys = (currentLen - 1) / blockLen + 1;
              int keys = blockLen + numKeys;

              shuffle(array, 0, currentLen, delay ? 0.25 : 0, Writes);
              sort(array, 0, keys, delay ? 0.25 : 0, Writes);
              Writes.reversal(array, 0, keys-1, delay ? 0.25 : 0, true, false);
              Highlights.clearMark(2);
              sort(array, keys, currentLen, delay ? 0.25 : 0, Writes);

              push(array, keys, currentLen, blockLen, delay ? 0.25 : 0, Writes);
            }
          }

          function rotate(int[] array, int a, int m, int b, double sleep, Writes Writes) {
            Writes.reversal(array, a, m-1, sleep, true, false);
            Writes.reversal(array, m, b-1, sleep, true, false);
            Writes.reversal(array, a, b-1, sleep, true, false);
          }

          function push(int[] array, int a, int b, int bLen, double sleep, Writes Writes) {
            int len = b-a,
                b1 = b - len%bLen, len1 = b1-a;
            if (len1 <= 2*bLen) return;

            int m = bLen;
            while (2*m < len) m *= 2;
            m += a;

            if (b1-m < bLen) push(array, a, m, bLen, sleep, Writes);
            else {
                m = a+b1-m;
                rotate(array, m-(bLen-2), b1-(bLen-1), b1, sleep, Writes);
                Writes.multiSwap(array, a, m, sleep/2, true, false);
                rotate(array, a, m, b1, sleep, Writes);
                m = a+b1-m;

                push(array, a, m, bLen, sleep/2, Writes);
                push(array, m, b, bLen, sleep/2, Writes);
            }
          }
          */
          break;
      }
      break;
    case "random":
      // let randomSorted = getValue(elementsArray).sort(() => 0.5 - Math.random());
      // NoQueue.setValue(i, randomSorted[i]);
      for (let i = 0; i < array.length; i++) {
        let randIndex = Math.floor(Math.random() * array.length);
        NoQueue.swap(elements[i], elements[randIndex]);
      }
      break;
    case "noisy":
      // JS version of ArrayV's Noisy shuffle
      // Source:
      //   utils/Shuffles.java: https://github.com/Gaming32/ArrayV/blob/main/src/main/java/io/github/arrayv/utils/Shuffles.java)
      function shuffle(start, end) {
        for (let i = start; i < end; i++) {
          let randIndex = Math.floor(start + Math.random() * (end - start));
          NoQueue.swap(elements[i], elements[randIndex]);
        }
      }
      let i, size = Math.max(4, Math.floor(Math.sqrt(array.length) / 2));
      for (i = 0; i + size <= array.length; i += Math.floor(Math.random() * (size - 1)) + 1)
        shuffle(i, i + size);
      shuffle(i, array.length);
      break;
  }
  if (realtime) valuesBeforeSort = getValue(elements);
  activateButtons();
}
/**
 * Indicates that the algorithm uses zero or more aux arrays
 * @param {number} amount
 * @param {...number} sizes
 */
function useAuxArrays(amount, ...sizes) {
  ParamUtils.typeCheck("amount", amount, "number");
  ParamUtils.typeCheck("sizes", sizes, ["number"]);
  auxElements = [];
  for (let auxContainer of document.querySelectorAll("#arrays .aux-sort-container"))
    auxContainer.remove();
  byId("sort-write-aux").innerHTML = "";

  let height = 78 /* vh (from CSS) */ / (1 + amount);
  byId("sort-container").style.height = `${height}vh`;
  if (amount) byId("sort-write-aux").innerHTML = "Written to aux array:<br>";

  for (let auxArrayId = 0; auxArrayId < amount; auxArrayId++) {
    let element = Object.assign(document.createElement("div"));
    Object.assign(element, {id: `sort-container-${auxArrayId}`, className: "aux-sort-container"});
    Object.assign(element.style, {height: `${height}vh`});
    let sortWriteAux = document.createElement("span");
    sortWriteAux.innerHTML = `[${auxArrayId}]: <span id="sort-write-aux${auxArrayId}">0</span><br>`;
    Object.assign(sortWriteAux.style, {paddingLeft: "15px"});
    byId("arrays").append(element);
    fillBox(typeof sizes[auxArrayId] !== "undefined" ? sizes[auxArrayId] : elements.length, auxArrayId);
    byId("sort-write-aux").append(sortWriteAux);
  };
  return auxElements;
}
const SortVisualizerInit = {fillBox, shuffle, useAuxArrays};