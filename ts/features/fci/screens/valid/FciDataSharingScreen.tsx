import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { List } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
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
  profileNameSelector,
  profileSelector
} from "../../../../store/reducers/profile";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { capitalize } from "../../../../utils/strings";
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
  paddingTextLarge: {
    paddingLeft: 14
  },
  paddingText: {
    paddingLeft: 4
  },
  alertTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  containerTitle: {
    paddingTop: customVariables.contentPadding,
    paddingBottom: customVariables.contentPadding
  },
  bottomPadding: { paddingBottom: 20 }
});

const iconSize = 24;

const FciDataSharingScreen = (): React.ReactElement => {
  const profile = useIOSelector(profileSelector);
  const name = useIOSelector(profileNameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const navigation = useNavigation();
  const familyName = pot.getOrElse(
    pot.map(profile, p => capitalize(p.family_name)),
    undefined
  );
  const birthDate = pot.getOrElse(
    pot.map(profile, p => p.date_of_birth),
    undefined
  );

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const AlertTextComponent = () => (
    <View
      style={[styles.verticalPadding, styles.alertTextContainer]}
      testID="FciDataSharingScreenAlertTextTestID"
    >
      <IconFont name={"io-notice"} size={iconSize} color={IOColors.bluegrey} />
      <H4 weight="Regular" style={styles.paddingTextLarge} color={"bluegrey"}>
        {I18n.t("features.fci.shareDataScreen.alertText")}
        <View style={styles.paddingText} />
        <Link>{I18n.t("features.fci.shareDataScreen.alertLink")}</Link>
      </H4>
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
              <View style={styles.containerTitle}>
                <H4 weight="Regular" color={"bluegrey"}>
                  {I18n.t("features.fci.shareDataScreen.content")}
                </H4>
              </View>
              <List testID="FciDataSharingScreenListTestID">
                {name && (
                  <ListItemComponent
                    testID="FciDataSharingScreenNameTestID"
                    title={I18n.t("features.fci.shareDataScreen.name")}
                    subTitle={name}
                    hideIcon
                  />
                )}
                {familyName && (
                  <ListItemComponent
                    testID="FciDataSharingScreenFamilyNameTestID"
                    title={I18n.t("features.fci.shareDataScreen.familyName")}
                    subTitle={familyName}
                    hideIcon
                  />
                )}
                {birthDate && (
                  <ListItemComponent
                    testID="FciDataSharingScreenBirthDateTestID"
                    title={I18n.t("features.fci.shareDataScreen.birthDate")}
                    subTitle={birthDate.toLocaleDateString()}
                    hideIcon
                  />
                )}
                {fiscalCode && (
                  <ListItemComponent
                    testID="FciDataSharingScreenFiscalCodeTestID"
                    title={I18n.t("profile.fiscalCode.fiscalCode")}
                    subTitle={fiscalCode}
                    hideIcon
                  />
                )}
              </List>
              <AlertTextComponent />
            </View>
          </ScreenContent>
        </SafeAreaView>
        <View
          style={styles.bottomPadding}
          testID="FciDataSharingScreenFooterTestID"
        >
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            leftButton={cancelButtonProps(
              () => present(),
              I18n.t("features.fci.shareDataScreen.cancel")
            )}
            rightButton={confirmButtonProps(
              () => navigation.navigate("FCI_QTSP_TOS"),
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
