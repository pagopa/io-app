import I18n from "i18next";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import {
  StartupStatusEnum,
  isStartupLoaded
} from "../../../../../store/reducers/startup";
import { ItwRemoteLoadingScreen } from "../../../presentation/remote/components/ItwRemoteLoadingScreen";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { selectResolvedCredentialOfferOption } from "../../../machine/credential/selectors";
import { ItwGenericErrorContent } from "../../../common/components/ItwGenericErrorContent";
import { itwSetSpecsVersion } from "../../../common/store/actions/environment";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";

export type ItwIssuanceCredentialOfferValidationScreenNavigationParams = {
  /**
   * From QR code scan (already normalized by the scanner flow)
   * → full credential offer URI string
   */
  itwCredentialOfferUri?: string;
  /**
   * From HTTPS universal link OR from custom scheme normalized to an internal path
   * (openid-credential-offer://, haip-vci://)
   * → offer by reference
   */
  credential_offer_uri?: string;
  /**
   * From HTTPS universal link OR from custom scheme normalized to an internal path
   * (openid-credential-offer://, haip-vci://)
   * → offer by value (encoded JSON)
   */
  credential_offer?: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_OFFER_VALIDATION"
>;

export const ItwIssuanceCredentialOfferValidationScreen = ({
  route
}: ScreenProps) => {
  const startupStatus = useIOSelector(isStartupLoaded);

  const itwCredentialOfferUri =
    route.params?.itwCredentialOfferUri ??
    route.params?.credential_offer_uri ??
    route.params?.credential_offer;

  if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
    return (
      // TODO: evaluate if we can have a more specific loading screen for this case, or use the same one for all the remote loading phases
      <ItwRemoteLoadingScreen
        title={I18n.t(
          "features.itWallet.presentation.remote.loadingScreen.request"
        )}
      />
    );
  }

  if (!itwCredentialOfferUri) {
    // This should never happen — all entry points provide at least one URI param
    return <ItwGenericErrorContent />;
  }

  return <ContentView itwCredentialOfferUri={itwCredentialOfferUri} />;
};

const ContentView = ({
  itwCredentialOfferUri
}: {
  itwCredentialOfferUri: string;
}) => {
  const dispatch = useIODispatch();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const itwSpecsVersion = useIOSelector(selectItwSpecsVersion);

  const resolvedCredentialOfferOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectResolvedCredentialOfferOption
    );

  useFocusEffect(
    useCallback(() => {
      // Credential Offer flow is supported only with IT-Wallet specs v1.3.3.
      if (itwSpecsVersion !== "1.3.3") {
        dispatch(itwSetSpecsVersion("1.3.3"));
        return;
      }

      if (O.isNone(resolvedCredentialOfferOption)) {
        machineRef.send({
          type: "start-credential-offer",
          itwCredentialOfferUri
        });
      }
    }, [
      dispatch,
      itwSpecsVersion,
      machineRef,
      itwCredentialOfferUri,
      resolvedCredentialOfferOption
    ])
  );

  return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
};
