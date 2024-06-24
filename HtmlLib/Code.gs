/**
 * Process `htmlOutput` by setting their title, favicon and metas
 * @param {HtmlService.HtmlOutput} htmlOutput `HTMLOutput` for adding title, favicon and metas
 * @return {HtmlService.HtmlOutput} Processed `HTMLOutput` with title, favicon and metas added
 */
const processHtml = (htmlOutput) => {
  const content = htmlOutput.getContent(); 
  const [titles, faviconUrls, metasByName, metasByHttpEquiv] = [
    /<title>(.*)<\/title>/g,
    /<link .*rel=".*icon.*".*href="(.+)".*(?:\>|\/\>)/g,
    /<meta.*name="(.+?)".*content="(.+?)".*(?:\>|\/\>)/g,
    /<meta.*http-equiv="(.+?)".*content="(.+?)".*(\>|\/\>)/g
  ].map(regExp => content.matchAll(regExp));
  for (const title of titles)
    htmlOutput.setTitle(title[1]);
  for (const faviconUrl of faviconUrls)
    htmlOutput.setFaviconUrl(faviconUrl[1]);
  for (const meta of metasByName)
    htmlOutput.addMetaTag(meta[1], meta[2]);
  return htmlOutput;
}
/** Convert a `code` or a `file` to a processed `HTMLOutput`
 * @param {HtmlService} htmlServiceClass Put `HtmlService` here
 * @param {object} args
 * @param {string} args.code A code specified by `language`
 * @param {string} args.language Language of the `code`
 * @param {string} args.file File that resolves to an `HTMLOutput` or an `HTMLTemplate`
 * @param {object} args.params Parameters for the `HTMLTemplate` resolved from a file
 * @return {HtmlService.HtmlOutput} Processed `HTMLOutput` with title, favicon and metas added
 */
function toHtmlOutput (htmlServiceClass, {code, file, language, params}) {
  return processHtml(
    file
      ? params
      ? Object.assign(htmlServiceClass.createTemplateFromFile(file), params).evaluate()
      : htmlServiceClass.createHtmlOutputFromFile(file)
    : language === "html"
    ? htmlServiceClass.createHtmlOutput(code)
    : language === "js"
    ? Object.assign(htmlServiceClass.createTemplateFromFile("jsRunTemplate"), {code}).evaluate()
    : htmlServiceClass.createHtmlOutput("<p>Missing <code>language</code> parameter!</p>")
  );
}
/**
 * Returns the `HtmlOutput` for file `htmlErrorTemplate`
 * @param {e} error
 */
function getErrorHtml(err) {
  return toHtmlOutput(HtmlService, {
    language: "html", 
    file: "htmlErrorTemplate",
    params: {err}
  })
}
/**
 * Executes the callback function to return value (which should be an `HtmlOutput` or `TextOutput`)
 * If an error occurred, an `HtmlOutput` from file `htmlErrorTemplate.html` is returned
 * This function should be used in `doGet` and `doPost` functions
 * 
 * @param {() => *} cb Callback function to be called
 */
function tryDo(cb) {
  try {
    return cb();
  }
  catch (e) {
    return getErrorHtml(e);
  }
}
/**
 * Imports a HTML file and returns the script part (content of `<script>`)
 * 
 * When used in a HTML template, be sure to surround this with <?!= and ?>
 * 
 * @param {HtmlService} htmlServiceClass Put `HtmlService` here
 * @param {string} file The file to be imported
 * @return {string}
 */
function importScript(htmlServiceClass, file) {
  return load(htmlServiceClass, file).slice(8, -9).trim();
}
/**
 * Imports a HTML file and returns the style part (content of `<style>`)
 * 
 * When used in a HTML template, be sure to surround this with <?!= and ?>
 * 
 * @param {HtmlService} htmlServiceClass Put `HtmlService` here
 * @param {string} file The file to be imported
 * @return {string}
 */
function importStyle(htmlServiceClass, file) {
  return load(htmlServiceClass, file).slice(7, -8).trim();
}
/**
 * Imports a HTML file and returns the content
 * 
 * When used in a HTML template, be sure to surround this with `<?!=` and `?>`
 * 
 * @param {HtmlService} htmlServiceClass Put `HtmlService` here
 * @param {string} file The file to be imported
 * @return {string}
 */
function load(htmlService, file) {
  return htmlService.createHtmlOutputFromFile(file).getContent();
}