import I18n from "i18next";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  StartupStatusEnum,
  isStartupLoaded
} from "../../../../../store/reducers/startup";
import { ItwRemoteLoadingScreen } from "../../../presentation/remote/components/ItwRemoteLoadingScreen";
import { useIOSelector } from "../../../../../store/hooks";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { selectResolvedCredentialOfferOption } from "../../../machine/credential/selectors";
import * as O from "fp-ts/lib/Option";

export type ItwIssuanceCredentialOfferValidationScreenNavigationParams = {
  itwCredentialOfferUri: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_OFFER_VALIDATION"
>;

export const ItwIssuanceCredentialOfferValidationScreen = ({
  route
}: ScreenProps) => {
  const startupStatus = useIOSelector(isStartupLoaded);

  if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
    return (
      <ItwRemoteLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.remote.loadingScreen.request"
        )}
      />
    );
  }

  return (
    <ContentView itwCredentialOfferUri={route.params.itwCredentialOfferUri} />
  );
};

const ContentView = ({
  itwCredentialOfferUri
}: {
  itwCredentialOfferUri: string;
}) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const resolvedCredentialOfferOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectResolvedCredentialOfferOption
    );

  useFocusEffect(
    useCallback(() => {
      if (O.isNone(resolvedCredentialOfferOption)) {
        machineRef.send({
          type: "start-credential-offer",
          itwCredentialOfferUri
        });
      }
    }, [machineRef, itwCredentialOfferUri, resolvedCredentialOfferOption])
  );

  return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
};
