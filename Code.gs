const LANGUAGE_REF_ID = "1gvF8i3VzLZMLxOQle1-dzwrNQjIUKP42CaW-fgNLotI";
const NoQueue = {};
NoQueue[Symbol.toStringTag] = "NoQueue";
/**
 * @class
 */
class HTMLElement {}

/**
 * @typedef {[index: number, color: string]} HighlightSingle
 * @typedef {[start: number, end: number, color: string]} HighlightRange
 */

/**
 * @param {object} e Event
 * @param {object} e.parameter URL parameters
 * @param {string} e.parameter.language Code language
 * @param {string} e.parameter.sheet Sheet name where the code is placed
 * @param {string} e.parameter.range Range (in A1 notation) where the code is placed
 * @return {HtmlOutput}
 */
const doGet = ({pathInfo, parameter}) => {
  return HtmlLib.tryDo(() => {
    switch (pathInfo) {
      case "customsort":
        return HtmlLib.toHtmlOutput(HtmlService, {language: "html", file: "sort.html", params: {SortVisualizerWrite, SortVisualizerColor, SortVisualizerCode, SortVisualizerInit, SortVisualizerUtils, NoQueue, SortVisualizerStep, SortVisualizerMisc, SortVisualizerRead, code: parameter.code, entry: parameter. entry}});
      case "docs":
        return HtmlLib.toHtmlOutput(HtmlService, {language: "html", file: "sort_docs.html", params: {}});
    }
  });
};