import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView, StyleSheet, View, ScrollView } from "react-native";
import * as O from "fp-ts/lib/Option";
import {
  Body,
  ButtonSolidProps,
  FooterWithButtons,
  H2,
  H6,
  HSpacer,
  HeaderSecondLevel,
  IOStyles,
  IconButton,
  LabelLink,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSelector
} from "../../../../store/reducers/profile";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { capitalize } from "../../../../utils/strings";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import ROUTES from "../../../../navigation/routes";
import { withValidatedEmail } from "../../../../components/helpers/withValidatedEmail";
import { trackFciUserDataConfirmed, trackFciUserExit } from "../../analytics";
import { localeDateFormat } from "../../../../utils/locale";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";

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
  const navigation = useNavigation();
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

  const startSupportRequest = useStartSupportRequest({
    contextualHelp: emptyContextualHelp
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          goBack={navigation.goBack}
          title={I18n.t("features.fci.title")}
          type={"singleAction"}
          backAccessibilityLabel={I18n.t("global.buttons.back")}
          firstAction={{
            icon: "help",
            onPress: startSupportRequest,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            )
          }}
        />
      )
    });
  }, [navigation, startSupportRequest]);

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const cancelButtonProps: ButtonSolidProps = {
    onPress: () => present(),
    label: I18n.t("features.fci.shareDataScreen.cancel"),
    accessibilityLabel: I18n.t("features.fci.shareDataScreen.cancel")
  };

  const confirmButtonProps: ButtonSolidProps = {
    onPress: () => {
      trackFciUserDataConfirmed(fciEnvironment);
      navigation.navigate("FCI_QTSP_TOS");
    },
    label: I18n.t("features.fci.shareDataScreen.confirm"),
    accessibilityLabel: I18n.t("features.fci.shareDataScreen.confirm")
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
        <H6 weight="Regular" color={"bluegrey"}>
          {I18n.t("features.fci.shareDataScreen.alertText")}
          <HSpacer size={8} />
          <LabelLink
            onPress={() => {
              trackFciUserExit(route.name, fciEnvironment, "modifica_email");
              navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
                screen: ROUTES.INSERT_EMAIL_SCREEN
              });
            }}
          >
            {I18n.t("features.fci.shareDataScreen.alertLink")}
          </LabelLink>
        </H6>
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={IOStyles.flex}>
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
              description={localeDateFormat(
                birthDate,
                I18n.t("global.dateFormats.shortFormat")
              )}
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
        <View testID="FciDataSharingScreenFooterTestID">
          <FooterWithButtons
            type={"TwoButtonsInlineThird"}
            secondary={{ type: "Solid", buttonProps: confirmButtonProps }}
            primary={{ type: "Outline", buttonProps: cancelButtonProps }}
          />
        </View>
      </SafeAreaView>

      {fciAbortSignature}
    </>
  );
};

export default withValidatedEmail(FciDataSharingScreen);
