import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import {
  Banner,
  Body,
  ButtonSolidProps,
  H2,
  IOStyles,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { sequenceS } from "fp-ts/lib/Apply";
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { ItwDecodedPidPotSelector } from "../../../../store/reducers/itwPidDecodeReducer";
import ItwPidClaimsList from "../../../../components/ItwPidClaimsList";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { itwDecodePid } from "../../../../store/actions/itwCredentialsActions";
import { itwPidValueSelector } from "../../../../store/reducers/itwPidReducer";
import ItwCredentialCard from "../../../../components/ItwCredentialCard";
import { ForceScrollDownView } from "../../../../../../components/ForceScrollDownView";
import ItwFooterVerticalButtons from "../../../../components/ItwFooterVerticalButtons";
import { showCancelAlert } from "../../../../utils/alert";
import ROUTES from "../../../../../../navigation/routes";
import { CredentialType, getPidDisplayData } from "../../../../utils/mocks";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import ItwLoadingSpinnerOverlay from "../../../../components/ItwLoadingSpinnerOverlay";
import ItwKoView from "../../../../components/ItwKoView";
import { getItwGenericMappedError } from "../../../../utils/errors/itwErrorsMapping";
import { ItWalletError } from "../../../../utils/errors/itwErrors";
import { PidResponse } from "../../../../utils/types";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwPidPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwPidValueSelector);
  const decodedPidPot = useIOSelector(ItwDecodedPidPotSelector);
  const pidDisplayData = getPidDisplayData();
  const pidType = CredentialType.PID;

  /**
   * Dispatches the action to decode the PID on first render.
   */
  useOnFirstRender(() => {
    dispatch(itwDecodePid.request(pid));
  });

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPid - the decoded PID
   */
  const ContentView = ({
    decodedPid,
    entityConfiguration
  }: {
    decodedPid: PidWithToken;
    entityConfiguration: PidResponse["entityConfiguration"];
  }) => {
    const bannerViewRef = React.useRef(null);
    const toast = useIOToast();
    const alertOnPress = () => {
      toast.info(
        I18n.t("features.itWallet.issuing.credentialsChecksScreen.toast.cancel")
      );
      navigation.navigate(ROUTES.MAIN, { screen: ROUTES.MESSAGES_HOME });
    };

    const bottomButtonProps: ButtonSolidProps = {
      fullWidth: true,
      color: "contrast",
      label: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.cancel"
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.cancel"
      ),
      onPress: () => showCancelAlert(alertOnPress)
    };

    const topButtonProps: ButtonSolidProps = {
      color: "primary",
      fullWidth: true,
      accessibilityLabel: I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.buttons.add"
      ),
      onPress: () => navigation.navigate(ITW_ROUTES.ISSUING.PID.ADDING),
      label: I18n.t("features.itWallet.issuing.pidPreviewScreen.buttons.add")
    };

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("features.itWallet.issuing.title")}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ForceScrollDownView>
            <VSpacer />
            <View style={IOStyles.horizontalContentPadding}>
              <H2>
                {I18n.t("features.itWallet.issuing.pidPreviewScreen.title")}
              </H2>
              <VSpacer size={16} />
              <Body>
                {I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.checkNotice"
                )}
              </Body>
              <VSpacer size={24} />
              <ItwCredentialCard
                pidClaims={decodedPid.pid.claims}
                display={pidDisplayData}
                type={pidType}
              />
              <VSpacer />
              <ItwPidClaimsList
                decodedPid={decodedPid}
                entityConfiguration={entityConfiguration}
                claims={["givenName", "familyName", "taxIdCode"]}
                expiryDate
                securityLevel
                onLinkPress={() =>
                  navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
                }
                issuerInfo
              />
              <VSpacer />
              <Banner
                color="neutral"
                pictogramName="security"
                title={I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.banner.title"
                )}
                size="big"
                content={I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.banner.content"
                )}
                action={I18n.t(
                  "features.itWallet.issuing.pidPreviewScreen.banner.actionTitle"
                )}
                onPress={() =>
                  navigation.navigate(ITW_ROUTES.GENERIC.NOT_AVAILABLE)
                }
                viewRef={bannerViewRef}
              />
              <VSpacer />
            </View>
            <ItwFooterVerticalButtons
              bottomButtonProps={bottomButtonProps}
              topButtonProps={topButtonProps}
            />
          </ForceScrollDownView>
        </SafeAreaView>
      </BaseScreenComponent>
    );
  };

  const getDecodedPidOrErrorView = (optionDecodedPid: O.Option<PidWithToken>) =>
    pipe(
      sequenceS(O.Applicative)({ optionDecodedPid, pid }),
      O.fold(
        () => <ErrorView />,
        some => (
          <ContentView
            decodedPid={some.optionDecodedPid}
            entityConfiguration={some.pid.entityConfiguration}
          />
        )
      )
    );

  /**
   * Loading view component.
   */
  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.loading.title"
      )}
      captionSubtitle={I18n.t(
        "features.itWallet.issuing.pidPreviewScreen.loading.subtitle"
      )}
      isLoading
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  const RenderMask = () =>
    pot.fold(
      decodedPidPot,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      some => getDecodedPidOrErrorView(some.decodedPid),
      () => <LoadingView />,
      () => <LoadingView />,
      (_, someErr) => <ErrorView error={someErr} />
    );

  return <RenderMask />;
};

export default ItwPidPreviewScreen;
