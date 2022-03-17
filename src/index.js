const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const copyDir = require('copy-dir');
const uglifycss = require('uglifycss');
const walkFolderSync = require('./utils/walkFolderSync');
const deleteFolderSync = require('./utils/deleteFolderSync');
const Logger = require('./utils/Logger');

module.exports = function uglifyAll(inFolder, outFolder, opts) {
  opts = opts || {};

  const hideLog = opts.log === false;
  const logger = new Logger(!hideLog);

  if (inFolder === outFolder) {
    logger.log(`OutFolder:'${outFolder}' is same as inFolder:'${inFolder}', files will be overwrite`);
  } else {
    if (fs.existsSync(outFolder)) {
      logger.log(`Outcome Folder:'${outFolder}' has existed, and will be deleted`);
      deleteFolderSync(outFolder);
      logger.log(`Outcome Folder:'${outFolder}' had been deleted`);
    }
    fs.mkdirSync(outFolder);
    copyDir.sync(inFolder, outFolder, {});
    logger.log(`All files have been copied from '${inFolder}' to '${outFolder}'`);
  }

  let failedList = [];
  walkFolderSync(outFolder, filePath => {
    try {
      dealJs(filePath, logger, opts);
      dealHtml(filePath, logger, opts);
      dealCss(filePath, logger, opts);
    } catch (e) {
      failedList.push({ file: filePath, e: e });
    }
  });
  logger.log('All done');
  if (failedList.length) {
    logger.log('There may be some error as follows:');
    logger.log(JSON.stringify(failedList));
  }
};

function dealJs(filePath, logger, opts) {
  if (filePath.endsWith('.js') && !filePath.endsWith('.min.js')) {
    let inText = fs.readFileSync(filePath, 'utf8');
    if (opts?.js?.beforeDeal && typeof opts?.js?.beforeDeal === 'function') {
      inText = opts?.js?.beforeDeal(inText);
    }
    fs.writeFileSync(filePath, JavaScriptObfuscator.obfuscate(inText).getObfuscatedCode(), 'utf8');
    logger.log('succeed: ', filePath);
  }
}

function dealHtml(filePath, logger, opts) {
  if (filePath.endsWith('.html')) {
    let inText = fs.readFileSync(filePath, 'utf-8');
    debugger;
    if (opts?.html?.beforeDeal && typeof opts?.html?.beforeDeal === 'function') {
      inText = opts?.html?.beforeDeal(inText);
    }
    debugger;
    inText = escape(inText);
    inText = `document.write(unescape(\`${inText}\`));`;
    inText = JavaScriptObfuscator.obfuscate(inText).getObfuscatedCode();
    inText = `<script>${inText}</script>`;
    fs.writeFileSync(filePath, inText, 'utf-8');
    logger.log('succeed: ', filePath);
  }
}

function dealCss(filePath, logger) {
  if (filePath.endsWith('.css') && !filePath.endsWith('.min.css')) {
    let css = uglifycss.processFiles([filePath], {
      expandVars: true
    });
    fs.writeFileSync(filePath, css, 'utf-8');
    logger.log('succeed: ', filePath);
  }
}
