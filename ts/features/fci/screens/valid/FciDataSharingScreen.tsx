import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull } from "fp-ts/lib/function";
import { List } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import { BaseTypography } from "../../../../components/core/typography/BaseTypography";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import ScreenContent from "../../../../components/screens/ScreenContent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import {
  profileFiscalCodeSelector,
  profileSelector
} from "../../../../store/reducers/profile";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topScreenContainer: {
    flex: 1,
    justifyContent: "flex-end"
  },
  padded: {
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding
  },
  verticalPadding: {
    paddingTop: customVariables.spacerHeight,
    paddingBottom: customVariables.spacerHeight
  },
  paragraph: {
    fontSize: 14,
    textAlign: "left",
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding
  }
});

const iconSize = 24;

const FciDataSharingScreen = (): React.ReactElement => {
  const profile = useIOSelector(profileSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const AlertTextComponent = () => (
    <View
      style={[
        styles.verticalPadding,
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }
      ]}
    >
      <IconFont name={"io-notice"} size={iconSize} />
      <BaseTypography
        weight="Regular"
        color="bluegreyDark"
        style={styles.paragraph}
      >
        {I18n.t("features.fci.shareDataScreen.alertText")}
      </BaseTypography>
    </View>
  );

  return (
    <BaseScreenComponent
      headerTitle="Condividi questi dati"
      contextualHelp={emptyContextualHelp}
      goBack
    >
      <View style={styles.topScreenContainer}>
        <SafeAreaView style={styles.container}>
          <ScreenContent title={I18n.t("features.fci.shareDataScreen.title")}>
            <View style={styles.padded}>
              <View
                style={{
                  paddingTop: customVariables.contentPadding,
                  paddingBottom: customVariables.contentPadding
                }}
              >
                <BaseTypography
                  weight={"Regular"}
                  color={"bluegreyDark"}
                  font={"TitilliumWeb"}
                  style={{
                    fontSize: 16
                  }}
                >
                  {I18n.t("features.fci.shareDataScreen.content", {
                    issuer: "Comune di Roma"
                  })}
                </BaseTypography>
              </View>
              <List>
                <ListItemComponent
                  title={I18n.t("features.fci.shareDataScreen.name")}
                  subTitle={pot.isSome(profile) ? profile.value.name : ""}
                  hideIcon
                />
                <ListItemComponent
                  title={I18n.t("features.fci.shareDataScreen.familyName")}
                  subTitle={
                    pot.isSome(profile) ? profile.value.family_name : ""
                  }
                  hideIcon
                />
                <ListItemComponent
                  title={I18n.t("features.fci.shareDataScreen.birthDate")}
                  subTitle={
                    pot.isSome(profile)
                      ? profile.value.date_of_birth?.toLocaleDateString()
                      : ""
                  }
                  hideIcon
                />
                <ListItemComponent
                  title={I18n.t("profile.fiscalCode.fiscalCode")}
                  subTitle={fiscalCode}
                  hideIcon
                />
              </List>
              <AlertTextComponent />
            </View>
          </ScreenContent>
        </SafeAreaView>
        <View style={{ paddingBottom: 20 }}>
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={cancelButtonProps(
              () => present(),
              I18n.t("features.fci.shareDataScreen.cancel")
            )}
            rightButton={confirmButtonProps(
              () => constNull,
              `${I18n.t("features.fci.shareDataScreen.confirm")}`
            )}
          />
        </View>
      </View>
      {fciAbortSignature}
    </BaseScreenComponent>
  );
};

export default FciDataSharingScreen;
