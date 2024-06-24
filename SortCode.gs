async function injectSort(code, entryPoint) {
  try {
    useAuxArrays(0);
    eval(code);
    if (realtime)
      valuesBeforeSort = getValue(elements);
    else {
      sortQueue = [];
      addStepOrRun(undefined, "ORIG");
      SortInfo.reset();
      await eval(entryPoint)(elements);
      
      await addStepOrRunAsync(async () => await sweep());
      if (auxElements.length){
        let auxValues = auxElements.map(aux => aux.slice().fill(0));
        sortQueue[0].auxValues = {old: auxValues, new: auxValues}; 
      }
      let slider = document.querySelector("#step .slider");
      let spinbox = document.querySelector("#step .value");
      document.querySelector("#step .max").innerHTML = slider.max = spinbox.max = sortQueue.length - 1;
      slider.value = 0;
      oldValue = undefined;
      document.querySelector("#step").style.display = "block";
      stepChange();
    }
    async function customSort(elements) {
      try {
        byId("error-title").style.opacity = byId("error").style.opacity = 0;
        query("#error pre code").innerHTML = "";
        
        if (realtime) {
          NoQueue.setValue(elements, valuesBeforeSort);
          SortInfo.reset();
          await eval(entryPoint)(elements);
          await sweep();
        }
        else {
          let slider = document.querySelector("#step .slider");
          if (slider.value === slider.max) {
            slider.value = 0;
            oldValue = undefined;
          }
          for (let i = Number(slider.value); i <= Number(slider.max); i++) {
            if (!autoRunning) throw new SortError("Execution stopped.");
            slider.value = i;
            await stepChange();
          }
        }
      }
      catch (e) {
        if (!(e instanceof SortError)) {
          byId("error-title").style.opacity = byId("error").style.opacity = 1;
          query("#error pre code").textContent = e.name + ":\n" + e.message + "\n" + e.stack;
          hljs.highlightElement(query("#error pre code"));
          location.href = '#error';
          throw e;
        }
      }
    }
    run = async () => {
      if (realtime) running = true;
      else autoRunning = true;
      disableButtons();
      await customSort(elements);
      NoQueue.resetColors(elements);
      activateButtons();
      if (realtime) running = false;
      else autoRunning = false;
    }
    byId("run-btn").onclick = run;
  }
  catch (e) {
    if (!(e instanceof SortError)) {
      byId("error-title").style.opacity = byId("error").style.opacity = 1;
      query("#error pre code").textContent = e.name + ":\n" + e.message + "\n" + e.stack;
      hljs.highlightElement(query("#error pre code"));
      location.href = '#error';
      throw e;
    }
  }
};
const SampleCode = () => ({
  current: "instructions",
  instructions: {
    code: `\/\/ Write an async function that sorts a list of DOM elements by their value,
\/\/ available with getValue(element).

\/\/ For more information, check the documentation: https://www.sortvisualizer.com/docs

\/\/ Here's an example implementation of the Selection Sort algorithm visualization using the API.

async function selectionSort(elements) {
    let min_idx;
    \/\/ Loop over all the elements
    for (let i = 0; i < elements.length; i++) {
        min_idx = i;
    
        \/\/ Find the index of the minimum element in the unsorted part
        for (let j = i+1; j < elements.length; j++) {
            if (await gt(min_idx, j, [i, RED], [j, RED], [min_idx, GREEN])) {
                min_idx = j;
            }
        }

        \/\/ Swap the current index and the minimum index
        await swap(i, min_idx, [i, RED], [min_idx, GREEN]);
    }
}`,
    entryPoint: "selectionSort"
  },
  selectionSort: {
    code: `async function getMinIndex(arr, first, last) {
  var min = first;
  for (var i = first + 1; i <= last; i++)
    if (await gt(min, i, [first, BLUE], [i, RED], [min, GREEN]))
      min = i;
  return min;
}
async function selectionSort(arr) {
  for (var i = 0; i < arr.length - 1; i++) {
    var min = await getMinIndex(arr, i, arr.length - 1);
    if (min != i) await swap(min, i, [i, GREEN], [min, BLUE]);
  }
}`,
    entryPoint: "selectionSort"
  },
  insertionSort: {
    code: `async function insertionSort(arr) {
  for (var i = 1; i < arr.length; i++)
    for (var j = i; j > 0; j--)
      if (await gt(j - 1, j, [j - 1, RED], [j, RED], [i, BLUE]))
        await swap(j - 1, j, [j - 1, RED], [j, RED], [i, BLUE]);
      else break;
}`,
    entryPoint: "insertionSort"
  },
  bubbleSort: {
    code: `async function bubbleSort(arr) {
  for (var i = arr.length - 1; i >= 1; i--)
    for (var j = 1; j <= i; j++)
      if (await gt(j - 1, j, [j - 1, RED], [j, RED], [i + 1, arr.length, BLUE]))
        await swap(j - 1, j, [j - 1, RED], [j, RED], [i + 1, arr.length, BLUE]);
}`,
    entryPoint: "bubbleSort"
  },
  timSort: {
    code: ``,
    entryPoint: "timSort"
  },
  mergeSort: {
    code: `async function merge(arr, arrL, arrR, first, mid, last) {
  var
    sizeL = mid - first + 1, sizeR = last - mid,
    indexL = 0, indexR = 0, indexM = first;
  await updateBox(arr, undefined, undefined, undefined, [first, first + sizeL, GREEN]);
  await copyArray(arrL, arr.slice(first, first + sizeL), 0, GREEN);
  await updateBox(arr, undefined, undefined, undefined, [mid + 1, mid + 1 + sizeR, GREEN]);
  await copyArray(arrR, arr.slice(mid + 1, mid + 1 + sizeR), 0, GREEN);
  for (; indexL < sizeL && indexR < sizeR; indexM++)
    if (await lt(arrL[indexL], arrR[indexR], [arrL[indexL], BLUE], [arrR[indexR], BLUE])) {
      await updateBox(arrL, indexL);
      await setValue(indexM, arrL[indexL++]);
    }
    else {
      await updateBox(arrR, indexR);
      await setValue(indexM, arrR[indexR++]);
    }
  if (sizeL - indexL > 0) {
    await updateBox(arrL, undefined, undefined, undefined, [indexL, sizeL, GREEN]);
    await copyArray(arr, arrL.slice(indexL, sizeL), indexM, GREEN);
  }
  if (sizeR - indexR > 0) {
    await updateBox(arrR, undefined, undefined, undefined, [indexR, sizeR, GREEN]);
    await copyArray(arr, arrR.slice(indexR, sizeR), indexM, GREEN);
  }
  await clearArray(arrL, arrR);
}
async function mergeSortRec(arr, arrL, arrR, first, last) {
  if (first >= last) return;
  var mid = Math.floor(first + (last - first) / 2);
  await updateBox(arr, undefined, undefined, undefined, [first, last + 1, RED]);
  await mergeSortRec(arr, arrL, arrR, first, mid);
  await mergeSortRec(arr, arrL, arrR, mid + 1, last);
  await updateBox(arr, undefined, undefined, undefined, [first, last + 1, BLUE]);
  await merge(arr, arrL, arrR, first, mid, last);
}
async function mergeSort(arr) {
  const [arrL, arrR] = useAuxArrays(2);
  await mergeSortRec(arr, arrL, arrR, 0, arr.length - 1);
}`,
    entryPoint: "mergeSort"
  },
  gnomeSort: {
    code: "a",
    entryPoint: "b"
  },
  shakerSort: {
    code: `async function bubbleSort(arr, first, last, toLeft) {
  var swapped = false;
  for (var i = toLeft ? last : first + 1; toLeft ? i >= first + 1 : i <= last; toLeft ? i-- : i++) {
    if (await gt(i - 1, i, [i - 1, RED], [i, RED], [0, first, BLUE], [last + 1, arr.length, BLUE])) {
      await swap(i - 1, i, [i - 1, RED], [i, RED], [0, first, BLUE], [last + 1, arr.length, BLUE]);
      swapped = true;
    }
  }
  return swapped;
}
async function shakerSort(arr) {
  var swapped = true, first = 0, last = arr.length - 1;
  while (swapped) {
    swapped = await bubbleSort(arr, first, last, false);
    if (!swapped) break;
    last--;
    swapped = await bubbleSort(arr, first, last, true);
    first++;
  }
}`,
    entryPoint: "shakerSort"
  },
  oddEvenSort: {
    code: "a",
    entryPoint: "b"
  },
  pancakeSort: {
    code: "a",
    entryPoint: "b"
  },
  quickSort: {
    code: `async function partition(arr, first, last) {
  var pivotIndex = first, lower = first;
  for (var higher = lower; higher <= last; higher++) {
    if (await lt(higher, pivotIndex, [lower, RED], [higher, GREEN], [pivotIndex, BLUE])) {
      lower++;
      await swap(lower, higher, [lower, GREEN], [higher, RED], [pivotIndex, BLUE]);
    }
  }
  await swap(lower, pivotIndex, [lower, RED], [higher, GREEN], [pivotIndex, BLUE]);
  return lower;
}
async function quickSortRec(arr, first, last) {
  if (first >= last) return;
  var pivotIndex = await partition(arr, first, last);
  for (var i in [0, 0]) await updateBox(arr, undefined, undefined, undefined, [first, pivotIndex, RED], [pivotIndex, BLUE], [pivotIndex + 1, last + 1, GREEN]);
  await quickSortRec(arr, first, pivotIndex - 1);
  await quickSortRec(arr, pivotIndex + 1, last);
}
async function quickSort(arr) {
  await quickSortRec(arr, 0, arr.length - 1);
}`,
    entryPoint: "quickSort"
  },
  heapSort: {
    code: "a",
    entryPoint: "b"
  },
  bitonicSort: {
    code: `\/\/ This algorithm only sorts array having size of the power of 2
async function bitonicMerge(arr, first, length, decreasing) {
  function middle(start) {return start + half;}
  if (length <= 1) return;
  var half = Math.floor(length / 2);
  for (var i = first; i < middle(first); i++)
    if (await gt(i, middle(i)) !== decreasing) await swap(i, middle(i));
  await bitonicMerge(arr, first, half, decreasing);
  await bitonicMerge(arr, middle(first), half, decreasing);
}
async function bitonicSort(arr, first, length, decreasing) {
  if (length <= 1) return;
  var half = Math.floor(length / 2);
  await updateBox(arr, undefined, undefined, undefined, [first, first + length, RED]);
  await bitonicSort(arr, first, half, false);
  await bitonicSort(arr, first + half, half, true);
  await updateBox(arr, undefined, undefined, undefined, [first, first + length, BLUE]);
  await bitonicMerge(arr, first, length, decreasing);
}
async function main(arr) {
  if (!Number.isInteger(Math.log2(arr.length))) {
    alert("Your array has " + arr.length + " elements, which is invalid for this algorithm.\\nThis algorithm requires the array size to be the power of 2.");
    return;
  }
  await bitonicSort(arr, 0, arr.length, false);
}`,
    entryPoint: "main"
  },
  radixSort: {
    code: "a",
    entryPoint: "b"
  },
  shellSort: {
    code: "a",
    entryPoint: "b"
  },
  combSort: {
    code: "a",
    entryPoint: "b"
  },
  bogoSort: {
    code: "a",
    entryPoint: "b"
  },
  bozoSort: {
    code: "a",
    entryPoint: "b"
  },
  countingSort: {
    code: `\/\/ This algorithm cannot contain negative and float numbers (numbers with decimal part)
async function countingSort(array, count, output) {
  const varray = ValuesArray(array);
  const vcount = ValuesArray(count);
  const voutput = ValuesArray(output);
  var i;
  for (i in array) {
    await updateBox(array, undefined, undefined, Number(i));
    await vcount[varray[i].get()].postInc();
  }
  for (i in count) if (i >= 1) await vcount[i].set(vcount[i].get() + vcount[i - 1].get());
  for (i = array.length - 1; i >= 0; i--) {
    var v = varray[i].get();
    await voutput[await vcount[v].preDec()].set(v);
  }
  await updateBox(output, undefined, undefined, undefined, [0, output.length, GREEN]);
  await copyArray(array, output, undefined, GREEN);
  await clearArray(count, output);
}
async function main(arr) {
  for (var i = 0; i < arr.length; i++) if (!Number.isInteger(getValue(arr[i])) || getValue(arr[i]) < 0) {
    alert("Your array contains " + getValue(arr[i]) + ", which is invalid for this algorithm.");
    return;
  }
  var [count, output] = useAuxArrays(2, Math.max(...getValue(arr)) + 1);
  await countingSort(arr, count, output);
}`,
    entryPoint: "main"
  },
  stoogeSort: {
    code: "a",
    entryPoint: "b"
  }
});








const SortVisualizerCode = {injectSort, SampleCode};