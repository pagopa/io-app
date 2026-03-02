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
import { ContentWrapper, ListItemHeader } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";

export type ItwIssuanceCredentialOfferScreenNavigationParams = {
  itwCredentialOfferUri: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_OFFER_INTRO"
>;

export const ItwIssuanceCredentialOfferIntroScreen = ({
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

const ContentView = ({ itwCredentialOfferUri }: { itwCredentialOfferUri: string }) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const resolvedCredentialOfferOption =
    ItwCredentialIssuanceMachineContext.useSelector(selectResolvedCredentialOfferOption);

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

  if (O.isNone(resolvedCredentialOfferOption)) {
    return <LoadingScreenContent title={I18n.t("global.genericWaiting")} />;
  }

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.identification.nfc.title") }}
      description={I18n.t("features.itWallet.identification.nfc.description")}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("features.itWallet.identification.nfc.primaryAction"),
          onPress: () => {
            machineRef.send({
              type: "confirm-credential-offer",
            });
          }
        }
      }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.identification.nfc.header")}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
