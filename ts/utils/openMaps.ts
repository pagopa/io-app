import { Linking, Platform } from "react-native";

export function openMaps(
  streetName: string,
  latitude?: number,
  longitude?: number
) {
  const intentScheme = Platform.select({
    ios: "maps:0,0?q=",
    android: "geo:0,0?q="
  });
  const latitudeLongitude = `${latitude},${longitude}`;
  const label = streetName;
  if (latitude && longitude) {
    const url = Platform.select({
      ios: `${intentScheme}${label}@${latitudeLongitude}`,
      android: `${intentScheme}${latitudeLongitude}(${label})`
    });
    // tslint:disable no-floating-promises
    Linking.openURL(url);
  } else {
    const url = Platform.select({
      ios: `${intentScheme}${label}`,
      android: `${intentScheme}${label}`
    });
    // tslint:disable no-floating-promises
    Linking.openURL(url);
  }
}
