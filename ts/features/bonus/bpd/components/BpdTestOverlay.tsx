import { View } from "native-base";
import { useState } from "react";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { Body } from "../../../../components/core/typography/Body";
import { Label } from "../../../../components/core/typography/Label";
import {
  bpdApiSitUrlPrefix,
  bpdApiUatUrlPrefix,
  bpdApiUrlPrefix,
  bpdEnabled,
  pagoPaApiUrlPrefix,
  pagoPaApiUrlPrefixTest
} from "../../../../config";

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
    backgroundColor: "#ffffffaa"
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
          >{`🛠️BPD TEST VERSION🛠️`}</Label>
          <Body
            style={styles.versionText}
            onPress={() => setEnabled(!enabled)}
          >{`${
            bpdEnabled ? "active" : "not active"
          } - bpd: ${bpdEndpointStr} - PM: ${pmEndpointStr}`}</Body>
        </>
      ) : null}
    </View>
  );
};
