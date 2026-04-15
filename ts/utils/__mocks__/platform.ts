// eslint-disable-next-line functional/no-let
let isIos = true;
// eslint-disable-next-line functional/no-let
let isAndroid = true;

function test_setPlatform(p: "ios" | "android") {
  isIos = p === "ios";
  isAndroid = p === "android";
}

export { isIos, isAndroid, test_setPlatform };
