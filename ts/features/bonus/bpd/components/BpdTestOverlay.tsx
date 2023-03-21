import * as React from "react";
import { useState } from "react";
import { View, Platform, StyleSheet } from "react-native";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { Body } from "../../../../components/core/typography/Body";
import { Label } from "../../../../components/core/typography/Label";
import {
  IOColors,
  hexToRgba
} from "../../../../components/core/variables/IOColors";
import {
  bpdApiSitUrlPrefix,
  bpdApiUatUrlPrefix,
  bpdApiUrlPrefix,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../../../../config";
import { getAppVersion } from "../../../../utils/appVersion";

const opaqueBgColor = hexToRgba(IOColors.white, 0.67);

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: Platform.select({
      ios: 20 + (isIphoneX() ? getStatusBarHeight() : 0),
      android: 0
    }),
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },
  versionText: {
    padding: 2,
    backgroundColor: opaqueBgColor
  }
});

/**
 * Temp overlay created to avoid ambiguity when test bpd versions are released.
 * TODO: remove after the release of bpd
 * @constructor
 */
export const BpdTestOverlay: React.FunctionComponent = () => {
  const [enabled, setEnabled] = useState(true);
  const bpdEndpointStr =
    bpdApiUrlPrefix === bpdApiSitUrlPrefix
      ? "SIT"
      : bpdApiUrlPrefix === bpdApiUatUrlPrefix
      ? "UAT"
      : "PROD";

  const pmEndpointStr =
    pagoPaApiUrlPrefix === pagoPaApiUrlPrefixTest ? "UAT" : "PROD";

  return (
    <View style={styles.versionContainer} pointerEvents="box-none">
      {enabled ? (
        <>
          <Label
            style={styles.versionText}
            onPress={() => setEnabled(!enabled)}
          >{`🛠️ BPD TEST VERSION 🛠️`}</Label>
          <Body
            style={styles.versionText}
            onPress={() => setEnabled(!enabled)}
          >{`${getAppVersion()} - bpd: ${bpdEndpointStr} - PM: ${pmEndpointStr}`}</Body>
        </>
      ) : null}
    </View>
  );
};
