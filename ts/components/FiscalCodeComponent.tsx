/**
 * A component to show a representation
 * of the fiscal code card of the user profile
 */
import I18n from "i18n-js";
import { Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";

import { UserProfile } from "../../definitions/backend/UserProfile";
import customVariables from "../theme/variables";

type Props = {
  profile: UserProfile;
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: customVariables.brandGray,
    borderRadius: 6,
    padding: 6,
    width: "100%"
  },

  topContainer: {
    backgroundColor: "green",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingVertical: 8
  },

  logo: {
    resizeMode: "contain",
    width: 70,
    height: 70
  },

  imageContainer: {
    justifyContent: "center",
    alignContent: "center",
    paddingHorizontal: 2
  },

  logoText: {
    lineHeight: 12,
    fontSize: 10
  },

  flexRow: {
    flexDirection: "row"
  },

  labelText: {
    lineHeight: 10,
    fontSize: 8,
    color: "green"
  },

  labelContainer: {
    paddingRight: 6
  },

  contentContainer: {
    padding: 6,
    alignItems: "center",
    justifyContent: "flex-start"
  }
});

export default class FiscalCodeComponent extends React.Component<Props> {
  private renderRow(label: string, value: string) {
    return (
      <View style={[styles.contentContainer, styles.flexRow]}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{label.split(" ").join("\n")}</Text>
        </View>
        <View>
          <Text>{value}</Text>
        </View>
      </View>
    );
  }

  public render(): React.ReactNode {
    return (
      <View style={styles.mainContainer}>
        <View style={[styles.topContainer, styles.flexRow]}>
          <View style={styles.imageContainer}>
            <Image
              style={styles.logo}
              source={require("../../img/repubblica-italiana-icon.png")}
            />
          </View>

          <View>
            <Text white={true} style={styles.logoText}>
              {I18n.t("profile.fiscalCode.header1")
                .split(" ")
                .join("\n")}
            </Text>
            <View spacer={true} />
            <Text white={true} style={styles.logoText}>
              {I18n.t("profile.fiscalCode.header2")
                .split(" ")
                .join("\n")}
            </Text>
          </View>
        </View>

        {this.renderRow(
          I18n.t("profile.fiscalCode.fiscalCode"),
          this.props.profile.fiscal_code
        )}
        {this.renderRow(
          I18n.t("profile.fiscalCode.name"),
          this.props.profile.name
        )}
        {this.renderRow(
          I18n.t("profile.fiscalCode.familyName"),
          this.props.profile.family_name
        )}
      </View>
    );
  }
}
