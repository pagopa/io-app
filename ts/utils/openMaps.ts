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
  const url =
    latitude && longitude
      ? Platform.select({
          ios: `${intentScheme}${label}@${latitudeLongitude}`,
          android: `${intentScheme}${latitudeLongitude}(${label})`
        })
      : Platform.select({
          ios: `${intentScheme}${label}`,
          android: `${intentScheme}${label}`
        });
  // tslint:disable no-floating-promises
  Linking.openURL(url);
}
