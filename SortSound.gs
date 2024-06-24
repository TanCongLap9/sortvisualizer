/**
 * Calculates frequency. The output varies with the selected theme
 * 
 * The output will be an array if `e` is also an array
 * @param {HTMLElement | HTMLElement[]} e
 * @param {boolean} isSwap Indicates whether the frequency is calculated when swapping 2 elements. The output may differ with the one without swapping for some themes
 * @return {number | number[]}
 */
function calculateFreq(e, isSwap = false) {
  ParamUtils.typeCheck("e", e, ...ELEMORARR);
  ParamUtils.typeCheck("isSwap", isSwap, "boolean");
  let result;
  switch (theme) {
    case "classic":
      result = getValue([].concat(e)).map(v => 120 + 1200 * Math.pow(v / max, 2));
      break;
    default:
      if (isSwap) result = [Math.floor((getValue(e[0]) + getValue(e[1])) / 200 * (FREQ_MAX - FREQ_MIN) + FREQ_MIN)];
      else result = getValue([].concat(e)).map(v => v / 100 * (FREQ_MAX - FREQ_MIN) + FREQ_MIN);
  }
  return Array.isArray(e) ? result : result[0];
}
/**
 * Plays a sound
 * @param {number} frequency In hertz
 * @param {number} duration In milliseconds
 */
function playNote(frequency, duration) {
  ParamUtils.typeCheck("frequency", frequency, ...NUMORARR);
  ParamUtils.typeCheck("duration", duration, "number");
  if (!audio) return;
  let frequencies = [].concat(frequency);
  let durationSec = duration / 1000;
  let oscs = [];
  let sustain;
  let gainNode = new GainNode(audioCtx, {gain: 1});
  for (let i = 0; i < frequencies.length; i++) {
    oscs[i] = new OscillatorNode(audioCtx, {
      type: theme === "classic" ? "triangle" : "square",
      frequency: frequencies[i]
    });
    oscs[i].connect(gainNode).connect(masterGain).connect(audioCtx.destination);
    oscs[i].start();
  }
  switch (theme) {
    case "classic":
      sustain = 3.9;
      gainNode.gain.setValueCurveAtTime([1, 0],
        audioCtx.currentTime + durationSec * sustain - 1/4 * durationSec,
        1/4 * durationSec
      );
      break;
    default:
      sustain = 1;
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + durationSec * sustain);
  }
  setTimeout(() => {
    for (let i = 0; i < oscs.length; i++)
      oscs[i].stop();
  }, duration * sustain + 500);
}
function noteDuration() {
  switch (theme) {
    case "classic":
      return sortDelay;
    default:
      return 50;
  }
}
const SortVisualizerSound = {calculateFreq, playNote, noteDuration};