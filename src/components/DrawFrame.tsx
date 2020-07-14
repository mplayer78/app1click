import React, { useState, Fragment, useEffect, ChangeEvent } from "react";

function createAperture(
  overallWidth: number,
  overallHeight: number,
  xDivisions: Array<number>,
  yDivisions: Array<number>,
  areas: Array<number>
): Array<number> {
  const cumulativeX: Array<number> = [
    ...xDivisions.reduce((acc, val) => [...acc, acc[acc.length - 1] + val], [
      0,
    ]),
    overallWidth,
  ];

  const cumulativeY: Array<number> = [
    ...yDivisions.reduce((acc, val) => [...acc, acc[acc.length - 1] + val], [
      0,
    ]),
    overallHeight,
  ];
  return [
    // startpointX
    cumulativeX[areas[0]],
    // startpointY
    cumulativeY[areas[1]],
    // width
    // cumulativeX at the end position - cumulativeX at the start position
    cumulativeX[areas[2] + areas[0]] - cumulativeX[areas[0]],
    // height
    cumulativeY[areas[3] + areas[1]] - cumulativeY[areas[1]],
  ];
}

// takes an aperture [startX, startY, width, height] and a 4-tuple of deductions [top, right, bottom, left] and
// applies the deductions to return a new aperture.

function offsetAperture(
  aperture: Array<number>,
  offsets = [0, 0, 0, 0]
): Array<number> {
  return [
    aperture[0] + offsets[3],
    aperture[1] + offsets[0],
    aperture[2] - offsets[1] - offsets[3],
    aperture[3] - offsets[0] - offsets[2],
  ];
}

// takes an area [startXModule, startYModule, moduleWidth, moduleHeight] and a matrix of the overall size (in modules)
// and an object with "outer" and "transom" assigned to dimensions,
// return an 4-tuple of dims [] TRBL
function createOffsetTuple(
  area = [0, 0, 1, 1],
  moduleMatrix = [1, 1],
  offsetObj = {
    outer: 70,
    transom: 35,
  }
) {
  const left = area[0] === 0 ? offsetObj["outer"] : offsetObj["transom"];
  const top = area[1] === 0 ? offsetObj["outer"] : offsetObj["transom"];
  const right =
    area[0] + area[2] === moduleMatrix[0] + 1
      ? offsetObj["outer"]
      : offsetObj["transom"];
  const bottom =
    area[1] + area[3] === moduleMatrix[1] + 1
      ? offsetObj["outer"]
      : offsetObj["transom"];
  return [top, right, bottom, left];
}

type frameObj = {
  areas: Array<Array<number>>;
  overallWidth: number;
  overallHeight: number;
  xDivisions: Array<number>;
  yDivisions: Array<number>;
};

function createFrame(frameObj: frameObj) {
  const apertures = frameObj.areas
    .map((val) =>
      createAperture(
        frameObj.overallWidth,
        frameObj.overallHeight,
        frameObj.xDivisions,
        frameObj.yDivisions,
        val
      )
    )
    // create an array of apertures not accounting for any frame thickness
    .map((val, ind) => {
      const offsetTuple = createOffsetTuple(frameObj.areas[ind], [
        frameObj.xDivisions.length,
        frameObj.yDivisions.length,
      ]);
      // map through the apertures offsetting their start position and reducing their size
      // to account for outerframe and mullion thickness.
      return offsetAperture(val, offsetTuple);
    });
  const outline = `M0 0l${frameObj.overallWidth} 0 0 ${frameObj.overallHeight} -${frameObj.overallWidth} 0z`;
  const aperturePaths = apertures.reduce(
    (acc, val) =>
      `${acc} M${val[0]} ${val[1]} l${val[2]}
   0 0 ${val[3]} -${val[2]} 0z`,
    ""
  );
  return `
  ${outline}
  ${aperturePaths}`;
}

// this function will:
// store all of the state to draw the object
// create an svg "canvas" to draw the elements onto
// concatenate all of the svg strings to create the complete svg
export default function DrawFrame(props: drawFrameProps) {
  const [winDims, setWinDims] = useState({
    overallWidth: 2400,
    overallHeight: 900,
    frameThickness: 70,
    transomThickness: 70,
    padding: 100,
    xDivisions: [550, 650, 650],
    yDivisions: [385],
    // list all of the apertures as [startX, startY, modulesWide, ModulesHigh]
    areas: [
      [0, 0, 1, 2],
      [1, 0, 1, 1],
      [2, 0, 1, 1],
      [1, 1, 2, 1],
      [3, 0, 1, 2],
    ],
    sashes: [
      [0, 0, 1, 2],
      [1, 0, 1, 1],
      [2, 0, 1, 1],
      [3, 0, 1, 2],
    ],
  });
  const [pathString, setPath] = useState("");
  const [sashArray, setSashArray] = useState([]);
  const [viewBoxString, setViewBox] = useState("");
  const viewBox = `-${winDims.padding} -${winDims.padding} ${
    +winDims.overallWidth + winDims.padding * 2
  } ${+winDims.overallHeight + winDims.padding * 2}`;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    const element = event.target as HTMLInputElement;
    if (element !== null) {
      setWinDims({ ...winDims, [element.name]: element.value });
    }
  }

  useEffect(() => {
    const windowString = createFrame(winDims);
    setViewBox(viewBox);
    setPath(windowString);
    const sashStrings = winDims.sashes.map((val) => {
      console.log("val", val);
    });
  }, [winDims]);
  return (
    <Fragment>
      <input
        type="range"
        id="width"
        name="overallWidth"
        min="400"
        max="4000"
        value={winDims.overallWidth}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
      />
      <label htmlFor="width">Width</label>
      <input
        type="range"
        id="height"
        name="overallHeight"
        min="400"
        max="4000"
        value={winDims.overallHeight}
        onChange={(e) => handleChange(e)}
      />
      <label htmlFor="height">Height</label>
      <svg
        viewBox={viewBoxString}
        xmlns="http://www.w3.org/2000/svg"
        fillRule="evenodd"
      >
        {/* Insert outerframe within a group */}
        <g className="outerframe">
          <path
            d={pathString}
            style={{ stroke: "#bada55", strokeWidth: "2" }}
          />
        </g>
        <g className="sashGroup">{}</g>
      </svg>
    </Fragment>
  );
}

interface drawFrameProps {
  winDims: {
    overallWidth: number;
    overallHeight: number;
  };
}
