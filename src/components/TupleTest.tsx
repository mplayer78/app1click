import React from "react";

type props = {
  message: String;
  otherStuff: {
    numbers: [number, number][];
  };
};
export default function TupleTest(props: props) {
  return <div>Hello From Tuple Test</div>;
}
