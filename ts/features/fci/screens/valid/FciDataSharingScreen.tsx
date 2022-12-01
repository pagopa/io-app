import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull } from "fp-ts/lib/function";
import { List } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import { IOColors } from "../../../../components/core/variables/IOColors";
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
  topSubtitle: {
    fontSize: customVariables.fontSizeBase,
    fontFamily: customVariables.fontFamily,
    lineHeight: customVariables.lineHeightBase,
    color: customVariables.textColor
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
  linkDecoration: {
    textDecorationLine: "underline",
    color: IOColors.blue
  },
  paddingTextLarge: {
    paddingLeft: 14
  },
  paddingText: {
    paddingLeft: 4
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
      <IconFont name={"io-notice"} size={iconSize} color={IOColors.bluegrey} />
      <Text style={[styles.topSubtitle, styles.paddingTextLarge]}>
        {I18n.t("features.fci.shareDataScreen.alertText")}
        <View style={styles.paddingText} />
        <Text style={styles.linkDecoration}>
          {I18n.t("features.fci.shareDataScreen.alertLink")}
        </Text>
      </Text>
    </View>
  );

  return (
    <BaseScreenComponent
      headerTitle={I18n.t("features.fci.title")}
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
                <Text style={styles.topSubtitle}>
                  {I18n.t("features.fci.shareDataScreen.content")}
                </Text>
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
