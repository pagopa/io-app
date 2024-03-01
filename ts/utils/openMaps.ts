import { Linking, Platform } from "react-native";
import { IOToast } from "../components/Toast";
import I18n from "../i18n";

export function openMaps(
  streetName: string,
  latitude?: number,
  longitude?: number
) {
  const intentScheme = Platform.select({
    ios: "maps:0,0?q=",
    android: "geo:0,0?q="
  });
  const label = streetName;
  const url =
    latitude && longitude
      ? Platform.select({
          ios: `${intentScheme}${label}@${latitude},${longitude}`,
          android: `${intentScheme}${latitude},${longitude}(${label})`
        })
      : Platform.select({
          ios: `${intentScheme}${label}`,
          android: `${intentScheme}${label}`
        });

  if (url !== undefined) {
    Linking.openURL(url).catch(() =>
      IOToast.error(I18n.t("openMaps.genericError"))
    );
  }
}
