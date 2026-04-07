import {
  Banner,
  Divider,
  ListItemInfo,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ComponentProps, ReactElement } from "react";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { formatFiscalCodeBirthdayAsShortFormat } from "../../../../utils/dates";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { capitalize } from "../../../../utils/strings";
import { SETTINGS_ROUTES } from "../../../settings/common/navigation/routes";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSelector
} from "../../../settings/common/store/selectors";
import {
  trackFciChangeEmail,
  trackFciUserDataConfirmed,
  trackFciUserDataShare
} from "../../analytics";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";

const FciDataSharingScreen = (): ReactElement => {
  const profile = useIOSelector(profileSelector);
  const name = useIOSelector(profileNameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const navigation = useIONavigation();
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

  useOnFirstRender(() => {
    trackFciUserDataShare();
  });

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
      actions={actions}
      contextualHelp={emptyContextualHelp}
      description={I18n.t("features.fci.shareDataScreen.content")}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins={true}
      testID={"FciDataSharingScreenListTestID"}
      title={{
        label: I18n.t("features.fci.shareDataScreen.title")
      }}
    >
      {name && (
        <ListItemInfo
          label={I18n.t("features.fci.shareDataScreen.name")}
          testID="FciDataSharingScreenNameTestID"
          value={name}
        />
      )}
      <Divider />
      {familyName && (
        <ListItemInfo
          label={I18n.t("features.fci.shareDataScreen.familyName")}
          testID="FciDataSharingScreenFamilyNameTestID"
          value={familyName}
        />
      )}
      <Divider />
      {birthDate && (
        <ListItemInfo
          label={I18n.t("features.fci.shareDataScreen.birthDate")}
          testID="FciDataSharingScreenBirthDateTestID"
          value={formatFiscalCodeBirthdayAsShortFormat(birthDate)}
        />
      )}
      <Divider />
      {fiscalCode && (
        <ListItemInfo
          label={I18n.t("profile.fiscalCode.fiscalCode")}
          testID="FciDataSharingScreenFiscalCodeTestID"
          value={fiscalCode}
        />
      )}
      <Divider />
      {O.isSome(email) && (
        <VStack space={16}>
          <ListItemInfo
            label={I18n.t("profile.data.list.email")}
            testID="FciDataSharingScreenEmailTestID"
            value={email.value}
          />

          <Banner
            action={I18n.t("features.fci.shareDataScreen.alertLink")}
            color="neutral"
            content={I18n.t("features.fci.shareDataScreen.alertText")}
            onPress={() => {
              trackFciChangeEmail();
              navigation.navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
                screen: SETTINGS_ROUTES.INSERT_EMAIL_SCREEN,
                params: {
                  isOnboarding: false,
                  isFciEditEmailFlow: true
                }
              });
            }}
            pictogramName="emailDotNotif"
            testID="FciDataSharingScreenAlertTextTestID"
          />
        </VStack>
      )}

      {fciAbortSignature}
    </IOScrollViewWithLargeHeader>
  );
};

export default FciDataSharingScreen;
