export interface frameDetails {
  frameDims: [number, number];
  offset: [number, number];
  // dimensions (not including start & end) of transom / mullions
  divisions: [number[], number[]]; // [[mullion1, mullion2],[transom1, transom2]
  // areas: [startX, startY, spanX, spanY]
  areas: [number, number, number, number][];
  sashes?: [number, number, number, number][];
}
