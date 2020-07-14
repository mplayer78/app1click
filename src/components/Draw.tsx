import React from "react";
import { frameDetails } from "../types/drawTypes";

// function will return an array of arrays with the first in the array being the
// overall frame dimensions and all subsequent arrays being apretures cut from the overall
function createFrameDims(
  details: frameDetails
): Array<Array<[number, number]>> {
  const { offset, frameDims, areas } = details;
  const drawingOutline = createCoords(offset, frameDims);
  const allApertures = areas.map((val) => {
    const aper = createAperture({ ...details, areas: [val] });
    return createCoords([aper[0], aper[1]], [aper[2], aper[3]]);
  });
  return [drawingOutline, ...allApertures];
}

interface shadingType {
  shadingWidth: number;
  // | [number, number, number, number];
  shadingColor:
    | String
    | [[String, String, String, String], [String, String, String, String]];
}

// creates an svg element including outer & all cutouts
// takes an array of arrays with the 1st item being the overall size
// and subsequent being cutouts.
function drawFrame(
  frameDims: Array<Array<[number, number]>>,
  shading?: shadingType
): JSX.Element {
  const pathString = frameDims.reduce((accRect, rect) => {
    const rects =
      rect.reduce(
        (rAcc, rVal, rInd) =>
          `${rAcc}${rInd === 0 ? "M" : "L"}${rVal[0]} ${rVal[1]}`,
        ""
      ) + "z";
    return `${accRect}${rects}`;
  }, "");
  const outerShadings = shading
    ? frameDims[0].map(
        (val, ind) => `M
  ${val[0]} ${val[1]}
  L${frameDims[0][ind + 1][0]} ${frameDims[0][ind + 1][1]}
  L${frameDims[0][ind + 1][0] + shading.shadingWidth} ${
          frameDims[0][ind + 1][1]
        }
  `
      )
    : null;
  console.log("outerShadings", outerShadings);
  return (
    <svg key={pathString}>
      <path
        d={pathString}
        style={{ stroke: "#bada55", strokeWidth: "2", fillRule: "evenodd" }}
      />
    </svg>
  );
}

// creates an array of a set of coordinates to make a rectangle from dims & offset
function createCoords(
  offset: [number, number],
  dimensions: [number, number]
): Array<[number, number]> {
  return [
    offset,
    [offset[0] + dimensions[0], offset[1]],
    [offset[0] + dimensions[0], offset[1] + dimensions[1]],
    [offset[0], offset[1] + dimensions[1]],
  ];
}

// returns [startX, startY, width, height]
function createAperture(details: frameDetails): Array<number> {
  const { frameDims, divisions, areas, offset } = details;
  const cumulativeX: Array<number> = [
    ...divisions[0].reduce((acc, val) => [...acc, acc[acc.length - 1] + val], [
      0,
    ]),
    frameDims[0],
  ];

  const cumulativeY: Array<number> = [
    ...divisions[1].reduce((acc, val) => [...acc, acc[acc.length - 1] + val], [
      0,
    ]),
    frameDims[1],
  ];
  return [
    // startpointX
    cumulativeX[areas[0][0]] + (areas[0][0] === 0 ? 52 : 35) + offset[0],
    // startpointY
    cumulativeY[areas[0][1]] + (areas[0][1] === 0 ? 52 : 35) + offset[1],
    // width
    // cumulativeX at the end position - cumulativeX at the start position
    cumulativeX[areas[0][2] + areas[0][0]] -
      cumulativeX[areas[0][0]] -
      //lhs is edge?
      (areas[0][0] === 0 ? 52 : 35) -
      //rhs is edge?
      (areas[0][0] + areas[0][2] === cumulativeX.length - 1 ? 52 : 35),
    // height
    cumulativeY[areas[0][3] + areas[0][1]] -
      cumulativeY[areas[0][1]] -
      // top is an edge
      (areas[0][1] === 0 ? 52 : 35) -
      // bottom is an edge
      (areas[0][1] + areas[0][3] === cumulativeY.length - 1 ? 52 : 35),
  ];
}

// takes the frame dimensions object
// maps through the sashes creating a new frame for each
function drawSashes(frameDetails: frameDetails): Array<JSX.Element> {
  if (frameDetails && frameDetails.sashes) {
    const drawnSashes: Array<JSX.Element> = frameDetails.sashes.map((val) => {
      const { divisions, frameDims } = frameDetails;
      const cumulativeX: Array<number> = [
        ...divisions[0].reduce(
          (acc, val) => [...acc, acc[acc.length - 1] + val],
          [0]
        ),
        frameDims[0],
      ];

      const cumulativeY: Array<number> = [
        ...divisions[1].reduce(
          (acc, val) => [...acc, acc[acc.length - 1] + val],
          [0]
        ),
        frameDims[1],
      ];
      const sashDims: frameDetails = {
        frameDims: [
          cumulativeX[val[0] + val[2]] - cumulativeX[val[0]] - 20 - 20,
          cumulativeY[val[1] + val[3]] - cumulativeY[val[1]] - 20 - 20,
        ],
        offset: [cumulativeX[val[0]] + 20, cumulativeY[val[1]] + 20],
        // dimensions (not including start & end) of transom / mullions
        divisions: [[], []], // [[mullion1, mullion2],[transom1, transom2]
        // areas: [startX, startY, spanX, spanY]
        areas: [[0, 0, 1, 1]],
      };
      return drawFrame(createFrameDims(sashDims));
    });
    return drawnSashes;
  }
  return [];
}

export default function Draw({ windowSpec }: drawProps) {
  const outerFrame = drawFrame(createFrameDims(windowSpec));
  const sashes = drawSashes(windowSpec);
  return (
    <svg viewBox="-100 -100 2600 1100">
      {outerFrame}
      {sashes}
    </svg>
  );
}

interface drawProps {
  windowSpec: frameDetails;
}
