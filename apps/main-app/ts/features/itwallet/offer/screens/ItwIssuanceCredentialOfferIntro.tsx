import { Body, H2, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback } from "react";

import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import {
  IOStackNavigationProp,
  IOStackNavigationRouteProps
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { ItwCredentialIssuanceMachineContext } from "../../machine/credential/provider";
import {
  selectCredentialIntroContentOption,
  selectCredentialTypeOption,
  selectResolvedCredentialOfferOption
} from "../../machine/credential/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwRemoteLoadingScreen } from "../../presentation/remote/components/ItwRemoteLoadingScreen";

export type ItwIssuanceCredentialOfferScreenNavigationParams = {
  itwCredentialOfferUri: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_CREDENTIAL_OFFER_INTRO"
>;

const ItwIssuanceCredentialOfferIntroScreen = ({ route }: ScreenProps) => {
  useItwDisableGestureNavigation();

  const startupStatus = useIOSelector(isStartupLoaded);

  if (startupStatus !== StartupStatusEnum.AUTHENTICATED) {
    return <ItwRemoteLoadingScreen title={I18n.t("global.genericWaiting")} />;
  }

  return (
    <ContentView credentialOfferUri={route.params.itwCredentialOfferUri} />
  );
};

type ContentViewProps = {
  credentialOfferUri: string;
};

const ContentView = ({ credentialOfferUri }: ContentViewProps) => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const resolvedCredentialOfferOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectResolvedCredentialOfferOption
    );
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );
  const introductionContentOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectCredentialIntroContentOption
    );

  useHeaderSecondLevel({
    title: "",
    goBack: () => {
      machineRef.send({ type: "close" });
      navigation.goBack();
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (O.isNone(resolvedCredentialOfferOption)) {
        machineRef.send({
          type: "start-credential-offer",
          itwCredentialOfferUri: credentialOfferUri
        });
      }
    }, [machineRef, credentialOfferUri, resolvedCredentialOfferOption])
  );

  const handleContinue = useCallback(() => {
    machineRef.send({ type: "confirm-credential-offer" });
  }, [machineRef]);

  if (
    O.isNone(resolvedCredentialOfferOption) ||
    O.isNone(credentialTypeOption)
  ) {
    return <ItwRemoteLoadingScreen title={I18n.t("global.genericWaiting")} />;
  }

  const fallbackTitle = I18n.t(
    "features.itWallet.issuance.credentialOffer.intro.fallbackTitle"
  );
  const title = getCredentialNameFromType(
    credentialTypeOption.value,
    false,
    fallbackTitle
  );

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: handleContinue
        }
      }}
    >
      <VStack>
        <H2>{title}</H2>
        <Body>
          {I18n.t("features.itWallet.issuance.credentialIntro.subtitle")}
        </Body>
      </VStack>
      {O.isSome(introductionContentOption) && (
        <>
          <VSpacer size={16} />
          <IOMarkdown content={introductionContentOption.value} />
        </>
      )}
    </IOScrollView>
  );
};

export { ItwIssuanceCredentialOfferIntroScreen };
