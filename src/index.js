const loaderUtils = require('loader-utils');
const fs = require('fs');
const path = require('path');

const pre = '[match-json-loader]';

function getEtalonNameFromQuery({ etalon }) {
  if (!etalon || typeof etalon !== 'string') {
    throw new Error(`${pre}: etalon is mandatory parameter and should be valid file name`);
  }

  const dotIdx = etalon.indexOf('.');
  if (dotIdx === -1) {
    // Etalon file name does not contain extension, add it
    return `${etalon}.json`;
  }

  if (etalon.substr(dotIdx) !== '.json') {
    throw new Error(`${pre}: etalon should be a json file name`);
  }

  return etalon;
}

function loadEtalonJSON(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`${pre}: can not find etalon in "${path}"`);
  }

  return JSON.parse(fs.readFileSync(path));
}

function matchJSON(etalon, other, opts) {
  const { matchTypes } = opts;
  const eKeys = Object.keys(etalon);
  const mismatches = { absentKeys: [], typeMismatches: [] };

  for (let eKey of eKeys) {
    if (!other.hasOwnProperty(eKey)) {
      mismatches.absentKeys.push(eKey);
      continue;
    }

    if (matchTypes) {
      const eVal = etalon[eKey];
      const oVal = other[eKey];

      const eValType = typeof eVal;
      const oValType = typeof oVal;

      if (eValType !== oValType) {
        mismatches.typeMismatches.push([eKey, eValType, oValType]);
        continue;
      }
    }
  }

  return mismatches;
}

function isMatch(mismatches) {
  return mismatches.absentKeys.length === 0 && mismatches.typeMismatches.length === 0;
}

function formatMessage(mismatches) {
  const messages = [];
  if (mismatches.absentKeys.length > 0) {
    messages.push(`absent keys:\n${mismatches.absentKeys.join('\n')}`);
  }
  if (mismatches.typeMismatches.length > 0) {
    const list = mismatches.typeMismatches.reduce(
        (all, [key, expected, got]) => `${key} expected to be ${expected}, but got ${got}\n`,
      ''
  );
    messages.push(`type mismatches:\n${list}`);
  }

  return messages;
}

/**
 *  Webpack loader to match JSON against given etalon.
 *  Does not change a source.
 *  It is convenient to use it as pre loader.
 */
module.exports = function matchJSONLoader(source) {
  if (this.cacheable instanceof Function) {
    this.cacheable();
  }

  const query = loaderUtils.parseQuery(this.query);
  const sourceJSON = typeof source === 'string' ? JSON.parse(source) : source;

  const etalonPath = path.join(path.dirname(this.resourcePath), getEtalonNameFromQuery(query));

  // Do not match etalon
  if (etalonPath !== this.resourcePath) {
    const etalonJSON = loadEtalonJSON(etalonPath);

    const mismatches = matchJSON(etalonJSON, sourceJSON, { matchTypes: true });

    if (!isMatch(mismatches)) {
      throw new Error(
        `${pre}:\nresource ${this.resourcePath}\netalon ${etalonPath}\nmatch failed due to:\n${formatMessage(mismatches)}`
      );
    }
  }

  return source;
};
