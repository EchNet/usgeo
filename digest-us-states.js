"use strict";

// Find the bounding boxes of the US states and territories, and that of the 48 continental states.

const fs = require("fs");

const CONTINENTAL_STATES_HASH = {};
[
  "AL", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI",
  "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
  "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
].forEach((s) => CONTINENTAL_STATES_HASH[s] = s);


const findUsStateBounds = (uss, accum={}) => {
  traverseUsStateCoords(uss.st_asgeojson.geometry.coordinates, (coord) => expandBounds(coord, accum));
  return accum;
}

const expandBounds = (coord, accum) => {
  const [ lng, lat ] = coord;
  accum.minlat = Math.min(lat, accum.minlat !== undefined ? accum.minlat : lat);
  accum.maxlat = Math.max(lat, accum.maxlat !== undefined ? accum.maxlat : lat);
  accum.minlng = Math.min(lng, accum.minlng !== undefined ? accum.minlng : lng);
  accum.maxlng = Math.max(lng, accum.maxlng !== undefined ? accum.maxlng : lng);
}

const traverseUsStateCoords = (list, callback) => {
  if (list.length === 2 && !isNaN(list[0])) {
    callback(list);
  }
  else {
    list.forEach((sublist) => traverseUsStateCoords(sublist, callback));
  }
};

const rawdata = fs.readFileSync("us-state-boundaries.json");
const ussInfo = JSON.parse(rawdata);
const continental = {};
const result = {};
ussInfo.forEach((uss) => {
  const stateCode = uss.stusab;
  result[stateCode] = findUsStateBounds(uss);
  if (stateCode in CONTINENTAL_STATES_HASH) {
    findUsStateBounds(uss, continental);
  }
});
result.continental = continental;
console.log(JSON.stringify(result, null, 3));
