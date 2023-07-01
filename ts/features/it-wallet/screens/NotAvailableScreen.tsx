import * as React from "react";
import { View, StyleSheet } from "react-native";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Pictogram } from "../../../components/core/pictograms";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H2 } from "../../../components/core/typography/H2";
import I18n from "../../../i18n";

/**
 * Temporary not avaialble screen for working in progress features which might depend from other changes.
 */
const NotAvailableScreen = () => (
  <React.Fragment>
    <View style={styles.contentContainerStyle}>
      <View style={IOStyles.alignCenter}>
        <VSpacer size={40} />
        <Pictogram name="notAvailable" />
        <VSpacer size={40} />
        <View style={IOStyles.alignCenter}>
          <H2 weight="Bold">{I18n.t("global.remoteStates.notAvailable")}</H2>
        </View>
        <VSpacer size={40} />
      </View>
    </View>
  </React.Fragment>
);

const styles = StyleSheet.create({
  contentContainerStyle: { flexGrow: 1, justifyContent: "center" }
});

export default NotAvailableScreen;
