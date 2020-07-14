import React from "react";
import Draw from "./components/Draw";
import { frameDetails } from "./types/drawTypes";

const win: frameDetails = {
  frameDims: [2400, 900],
  offset: [0, 0],
  divisions: [[600, 1200], [385]],
  areas: [
    [0, 0, 1, 2],
    [1, 0, 1, 1],
    [1, 1, 1, 1],
    [2, 0, 1, 2],
  ],
  sashes: [
    [0, 0, 1, 2],
    [1, 0, 1, 1],
    [2, 0, 1, 2],
  ],
};

export default function App() {
  return (
    <div>
      <Draw windowSpec={win}></Draw>
    </div>
  );
}
