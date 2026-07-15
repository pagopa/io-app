// eslint-disable-next-line functional/no-let
let isIos = true;
// eslint-disable-next-line functional/no-let
let isAndroid = true;

function test_setPlatform(p: "android" | "ios") {
  isIos = p === "ios";
  isAndroid = p === "android";
}

export { isAndroid, isIos, test_setPlatform };
