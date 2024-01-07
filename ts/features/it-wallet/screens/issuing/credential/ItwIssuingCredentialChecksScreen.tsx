import React from "react";
import * as O from "fp-ts/lib/Option";
import { SafeAreaView } from "react-native";
import { IOStyles, useIOToast } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { useIOSelector } from "../../../../../store/hooks";
import {
  itwIssuanceCredentialChecksSelector,
  ItwIssuanceCredentialData
} from "../../../store/reducers/issuance/itwIssuanceCredentialReducer";
import ItwContinueScreen from "../../../components/ItwContinueView";
import { showCancelAlert } from "../../../utils/alert";
import {
  ItWalletError,
  ItWalletErrorTypes,
  ItwErrorMapping,
  getItwGenericMappedError
} from "../../../utils/itwErrorsUtils";
import ItwKoView from "../../../components/ItwKoView";
import ROUTES from "../../../../../navigation/routes";

/**
 * Screen that displays the result of the credential issuance checks
 * by folding the preliminaryChecks pot.
 */
const ItwIssuingCredentialsChecksScreen = () => {
  const toast = useIOToast();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const preliminaryChecks = useIOSelector(itwIssuanceCredentialChecksSelector);

  /**
   * When the user confirms the issuance, the user is redirected to the presentation screen.
   */
  const onUserConfirmIssuance = () => {
    navigation.navigate(ITW_ROUTES.ISSUING.CREDENTIAL.AUTH);
  };

  /**
   * When the user aborts the issuance, the user is redirected to the messages home screen.
   */
  const onUserAbortIssuance = () => {
    showCancelAlert(() => {
      navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
      toast.info(
        I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
      );
    });
  };

  /**
   * Error view component.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error }: { error?: ItWalletError }) => {
    const mappedError = getScreenError(error);
    return <ItwKoView {...mappedError} />;
  };

  /**
   * Content view which asks the user to confirm the issuance of the credential.
   * @param issuanceData - the issuance data of the credential used to display the credential title.
   */
  const ConfirmView = ({
    issuanceData
  }: {
    issuanceData: ItwIssuanceCredentialData;
  }) => (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <ItwContinueScreen
          title={I18n.t(
            "features.itWallet.issuing.credentialsChecksScreen.success.title",
            { credentialName: issuanceData.displayData.title }
          )}
          pictogram="identityAdd"
          action={{
            label: I18n.t("global.buttons.confirm"),
            accessibilityLabel: I18n.t("global.buttons.confirm"),
            onPress: onUserConfirmIssuance
          }}
          secondaryAction={{
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: onUserAbortIssuance
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  /**
   * Error mapping function for any error that can be displayed in this screen.
   * @param error - optional ItWalletError to be displayed.
   * @returns a mapped error object or a generic error object when error is not provided.
   */
  const getScreenError: ItwErrorMapping = (error?: ItWalletError) => {
    switch (error?.code) {
      case ItWalletErrorTypes.CREDENTIAL_ALREADY_EXISTING_ERROR:
        return {
          title: I18n.t(
            "features.itWallet.issuing.credentialsChecksScreen.failure.alreadyExisting.title"
          ),
          subtitle: I18n.t(
            "features.itWallet.issuing.credentialsChecksScreen.failure.alreadyExisting.subtitle"
          ),
          pictogram: "identityCheck",
          action: {
            accessibilityLabel: I18n.t(
              "features.itWallet.issuing.credentialsChecksScreen.failure.alreadyExisting.actionLabel"
            ),
            label: I18n.t(
              "features.itWallet.issuing.credentialsChecksScreen.failure.alreadyExisting.actionLabel"
            ),
            onPress: () =>
              navigation.navigate(ROUTES.MAIN, { screen: ROUTES.ITWALLET_HOME })
          }
        };
      default:
        return getItwGenericMappedError(() => navigation.goBack());
    }
  };

  const RenderMask = () =>
    pot.fold(
      preliminaryChecks,
      () => <ErrorView />,
      () => <ErrorView />,
      () => <ErrorView />,
      error => <ErrorView error={error} />,
      maybeIssuanceData =>
        pipe(
          maybeIssuanceData,
          O.fold(
            () => <ErrorView />,
            issuanceData => <ConfirmView issuanceData={issuanceData} />
          )
        ),
      () => <ErrorView />,
      () => <ErrorView />,
      (_, error) => <ErrorView error={error} />
    );

  return <RenderMask />;
};

export default ItwIssuingCredentialsChecksScreen;
