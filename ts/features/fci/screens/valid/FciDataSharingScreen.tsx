import {
  Banner,
  Divider,
  ListItemInfo,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useRoute } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";

import I18n from "i18next";
import { ComponentProps, ReactElement } from "react";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { formatFiscalCodeBirthdayAsShortFormat } from "../../../../utils/dates";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
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

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const actions: ComponentProps<typeof IOScrollView>["actions"] = {
    testID: "FciDataSharingScreenFooterTestID",
    type: "TwoButtons",
    primary: {
      label: I18n.t("features.fci.shareDataScreen.confirm"),
      onPress: () => {
        trackFciUserDataConfirmed(fciEnvironment);
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.QTSP_TOS
        });
      }
    },
    secondary: {
      label: I18n.t("features.fci.shareDataScreen.cancel"),
      onPress: () => present()
    }
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.fci.shareDataScreen.title")
      }}
      includeContentMargins={true}
      description={I18n.t("features.fci.shareDataScreen.content")}
      testID={"FciDataSharingScreenListTestID"}
      actions={actions}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
    >
      {name && (
        <ListItemInfo
          testID="FciDataSharingScreenNameTestID"
          label={I18n.t("features.fci.shareDataScreen.name")}
          value={name}
        />
      )}
      <Divider />
      {familyName && (
        <ListItemInfo
          testID="FciDataSharingScreenFamilyNameTestID"
          label={I18n.t("features.fci.shareDataScreen.familyName")}
          value={familyName}
        />
      )}
      <Divider />
      {birthDate && (
        <ListItemInfo
          testID="FciDataSharingScreenBirthDateTestID"
          label={I18n.t("features.fci.shareDataScreen.birthDate")}
          value={formatFiscalCodeBirthdayAsShortFormat(birthDate)}
        />
      )}
      <Divider />
      {fiscalCode && (
        <ListItemInfo
          testID="FciDataSharingScreenFiscalCodeTestID"
          label={I18n.t("profile.fiscalCode.fiscalCode")}
          value={fiscalCode}
        />
      )}
      <Divider />
      {O.isSome(email) && (
        <VStack space={16}>
          <ListItemInfo
            testID="FciDataSharingScreenEmailTestID"
            label={I18n.t("profile.data.list.email")}
            value={email.value}
          />

          <Banner
            testID="FciDataSharingScreenAlertTextTestID"
            pictogramName="emailDotNotif"
            color="neutral"
            content={I18n.t("features.fci.shareDataScreen.alertText")}
            action={I18n.t("features.fci.shareDataScreen.alertLink")}
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
          />
        </VStack>
      )}

      {fciAbortSignature}
    </IOScrollViewWithLargeHeader>
  );
};

export default FciDataSharingScreen;
