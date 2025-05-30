import {
  Body,
  FooterActionsInline,
  H2,
  HSpacer,
  IOVisualCostants,
  IconButton,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";

import { ComponentProps, ReactElement } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { formatFiscalCodeBirthdayAsShortFormat } from "../../../../utils/dates";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { capitalize } from "../../../../utils/strings";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSelector
} from "../../../settings/common/store/selectors";
import { trackFciUserDataConfirmed, trackFciUserExit } from "../../analytics";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";

const styles = StyleSheet.create({
  alertTextContainer: {
    flexDirection: "row",
    alignItems: "center"
  }
});

const iconSize = 24;

const FciDataSharingScreen = (): ReactElement => {
  const profile = useIOSelector(profileSelector);
  const name = useIOSelector(profileNameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const navigation = useIONavigation();
  const route = useRoute();
  const familyName = pot.getOrElse(
    pot.map(profile, p => capitalize(p.family_name)),
    undefined
  );
  const birthDate = pot.getOrElse(
    pot.map(profile, p => p.date_of_birth),
    undefined
  );
  const email = useIOSelector(profileEmailSelector);

  useHeaderSecondLevel({
    title: I18n.t("features.fci.title"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const cancelButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["startAction"] = {
    color: "primary",
    onPress: () => present(),
    label: I18n.t("features.fci.shareDataScreen.cancel")
  };

  const confirmButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    onPress: () => {
      trackFciUserDataConfirmed(fciEnvironment);
      navigation.navigate(FCI_ROUTES.MAIN, {
        screen: FCI_ROUTES.QTSP_TOS
      });
    },
    label: I18n.t("features.fci.shareDataScreen.confirm")
  };

  const AlertTextComponent = () => (
    <View
      testID="FciDataSharingScreenAlertTextTestID"
      style={styles.alertTextContainer}
    >
      <IconButton
        icon="notice"
        iconSize={iconSize}
        color="neutral"
        disabled
        accessibilityLabel={I18n.t("features.fci.shareDataScreen.alertText")}
        onPress={() => undefined}
      />
      <HSpacer size={8} />
      <View style={{ flex: 1 }}>
        <Body weight="Semibold">
          {I18n.t("features.fci.shareDataScreen.alertText")}
          <HSpacer size={8} />
          <Body
            weight="Semibold"
            asLink
            onPress={() => {
              trackFciUserExit(route.name, fciEnvironment, "modifica_email");
              navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
                screen: SETTINGS_ROUTES.INSERT_EMAIL_SCREEN,
                params: {
                  isOnboarding: false,
                  isFciEditEmailFlow: true
                }
              });
            }}
          >
            {I18n.t("features.fci.shareDataScreen.alertLink")}
          </Body>
        </Body>
      </View>
    </View>
  );

  return (
    <>
      {/* TODO: Replace with `IOScrollView` and `FooterActions` component. */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
        testID={"FciDataSharingScreenListTestID"}
      >
        <H2>{I18n.t("features.fci.shareDataScreen.title")}</H2>
        <VSpacer size={16} />
        <Body>{I18n.t("features.fci.shareDataScreen.content")}</Body>
        {name && (
          <ListItemNav
            testID="FciDataSharingScreenNameTestID"
            value={I18n.t("features.fci.shareDataScreen.name")}
            description={name}
            accessibilityLabel={I18n.t("features.fci.shareDataScreen.name")}
            onPress={() => undefined}
            hideChevron
          />
        )}
        {familyName && (
          <ListItemNav
            testID="FciDataSharingScreenFamilyNameTestID"
            value={I18n.t("features.fci.shareDataScreen.familyName")}
            description={familyName}
            onPress={() => undefined}
            hideChevron
            accessibilityLabel={I18n.t(
              "features.fci.shareDataScreen.familyName"
            )}
          />
        )}
        {birthDate && (
          <ListItemNav
            testID="FciDataSharingScreenBirthDateTestID"
            value={I18n.t("features.fci.shareDataScreen.birthDate")}
            description={formatFiscalCodeBirthdayAsShortFormat(birthDate)}
            hideChevron
            accessibilityLabel={I18n.t(
              "features.fci.shareDataScreen.birthDate"
            )}
            onPress={() => undefined}
          />
        )}
        {fiscalCode && (
          <ListItemNav
            testID="FciDataSharingScreenFiscalCodeTestID"
            value={I18n.t("profile.fiscalCode.fiscalCode")}
            description={fiscalCode}
            hideChevron
            accessibilityLabel={I18n.t("profile.fiscalCode.fiscalCode")}
            onPress={() => undefined}
          />
        )}
        {O.isSome(email) && (
          <>
            <ListItemNav
              testID="FciDataSharingScreenEmailTestID"
              value={I18n.t("profile.data.list.email")}
              description={email.value}
              hideChevron
              accessibilityLabel={I18n.t("profile.data.list.email")}
              onPress={() => undefined}
            />
            <AlertTextComponent />
          </>
        )}
      </ScrollView>
      <FooterActionsInline
        testID="FciDataSharingScreenFooterTestID"
        startAction={cancelButtonProps}
        endAction={confirmButtonProps}
      />

      {fciAbortSignature}
    </>
  );
};

export default FciDataSharingScreen;
