import React from "react";
import WebView from "react-native-webview";
import { Point, generateRandomSvgMovement } from "../utils/svgBackground";
import { playSvg } from "../components/detail/CardSvgPayload";

export function CgnAnimatedBackground({ onLoadEnd }: { onLoadEnd?(): void }) {
  return (
    <WebView
      androidCameraAccessDisabled={true}
      androidMicrophoneAccessDisabled={true}
      testID={"background-webview"}
      source={{
        html: generatedSvg
      }}
      style={{
        height: "100%",
        width: "100%"
      }}
      onLoadEnd={onLoadEnd}
    />
  );
}
const minPointA: Point = {
  x: 80,
  y: -100
};
const maxPointA: Point = {
  x: 100,
  y: 50
};
const minPointB: Point = {
  x: -80,
  y: 0
};
const maxPointB: Point = {
  x: 100,
  y: 10
};
const minPointC: Point = {
  x: -50,
  y: 50
};
const maxPointC: Point = {
  x: 50,
  y: 10
};
const MOVEMENT_STEPS = 12;
const generatedTranslationA = generateRandomSvgMovement(
  MOVEMENT_STEPS,
  minPointA,
  maxPointA
);
const generatedTranslationB = generateRandomSvgMovement(
  MOVEMENT_STEPS,
  minPointB,
  maxPointB
);
const generatedTranslationC = generateRandomSvgMovement(
  MOVEMENT_STEPS,
  minPointC,
  maxPointC
);
const generatedSvg = playSvg(
  generatedTranslationA,
  generatedTranslationB,
  generatedTranslationC
);
