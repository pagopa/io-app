import {
  Body,
  FooterActionsInline,
  H2,
  H6,
  HSpacer,
  IOStyles,
  IconButton,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIOSelector } from "../../../../store/hooks";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSelector
} from "../../../../store/reducers/profile";
import { formatFiscalCodeBirthdayAsShortFormat } from "../../../../utils/dates";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { capitalize } from "../../../../utils/strings";
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

const FciDataSharingScreen = (): React.ReactElement => {
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
        <H6 color={"bluegrey"}>
          {I18n.t("features.fci.shareDataScreen.alertText")}
          <HSpacer size={8} />
          <Body
            weight="Semibold"
            asLink
            onPress={() => {
              trackFciUserExit(route.name, fciEnvironment, "modifica_email");
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.INSERT_EMAIL_SCREEN,
                params: {
                  isOnboarding: false,
                  isFciEditEmailFlow: true
                }
              });
            }}
          >
            {I18n.t("features.fci.shareDataScreen.alertLink")}
          </Body>
        </H6>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView
        style={IOStyles.horizontalContentPadding}
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
