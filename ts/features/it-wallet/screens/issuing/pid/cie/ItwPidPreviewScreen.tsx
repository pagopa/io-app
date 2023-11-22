import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { constNull, pipe } from "fp-ts/lib/function";
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
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import LoadingSpinnerOverlay from "../../../../../../components/LoadingSpinnerOverlay";
import { ItwDecodedPidPotSelector } from "../../../../store/reducers/itwPidDecodeReducer";
import ItwErrorView from "../../../../components/ItwErrorView";
import { cancelButtonProps } from "../../../../utils/itwButtonsUtils";
import ItwPidClaimsList from "../../../../components/ItwPidClaimsList";
import { useOnFirstRender } from "../../../../../../utils/hooks/useOnFirstRender";
import { itwDecodePid } from "../../../../store/actions/itwCredentialsActions";
import { itwPidValueSelector } from "../../../../store/reducers/itwPidReducer";
import ItwCredentialCard from "../../../../components/ItwCredentialCard";
import { ForceScrollDownView } from "../../../../../../components/ForceScrollDownView";
import ItwFooterVerticalButtons from "../../../../components/ItwFooterVerticalButtons";
import { showCancelAlert } from "../../../../utils/alert";
import ROUTES from "../../../../../../navigation/routes";
import { getPidDisplayData } from "../../../../utils/mocks";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";

type ContentViewProps = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwPidPreviewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwPidValueSelector);
  const decodedPidPot = useIOSelector(ItwDecodedPidPotSelector);

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
  const ContentView = ({ decodedPid }: ContentViewProps) => {
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

    const pidDisplayData = getPidDisplayData();

    return (
      <>
        <ForceScrollDownView>
          <VSpacer />
          <View style={IOStyles.horizontalContentPadding}>
            <H2>
              {I18n.t("features.itWallet.issuing.pidPreviewScreen.title")}
            </H2>
            <VSpacer size={16} />
            <Body>
              {I18n.t("features.itWallet.issuing.pidPreviewScreen.checkNotice")}
            </Body>
            <VSpacer size={24} />
            <ItwCredentialCard
              pidClaims={decodedPid.pid.claims}
              display={pidDisplayData}
            />
            <VSpacer />
            <ItwPidClaimsList
              decodedPid={decodedPid}
              claims={["givenName", "familyName", "taxIdCode"]}
              expiryDate
              securityLevel
              onLinkPress={() => null}
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
              onClose={constNull}
              labelClose={I18n.t(
                "features.itWallet.issuing.pidPreviewScreen.banner.closeTitle"
              )}
              viewRef={bannerViewRef}
            />
            <VSpacer />
          </View>
          <ItwFooterVerticalButtons
            bottomButtonProps={bottomButtonProps}
            topButtonProps={topButtonProps}
          />
        </ForceScrollDownView>
      </>
    );
  };

  const getDecodedPidOrErrorView = (optionDecodedPid: O.Option<PidWithToken>) =>
    pipe(
      optionDecodedPid,
      O.fold(
        () => (
          <ItwErrorView
            type="SingleButton"
            leftButton={cancelButtonProps(navigation.goBack)}
          />
        ),
        decodedPid => <ContentView decodedPid={decodedPid} />
      )
    );

  const RenderMask = () =>
    pot.fold(
      decodedPidPot,
      () => <LoadingSpinnerOverlay isLoading />,
      () => <LoadingSpinnerOverlay isLoading />,
      () => <LoadingSpinnerOverlay isLoading />,
      err => (
        <ItwErrorView
          type="SingleButton"
          leftButton={cancelButtonProps(navigation.goBack)}
          error={err}
        />
      ),
      some => getDecodedPidOrErrorView(some.decodedPid),
      () => <LoadingSpinnerOverlay isLoading />,
      () => <LoadingSpinnerOverlay isLoading />,
      (_, someErr) => (
        <ItwErrorView
          type="SingleButton"
          leftButton={cancelButtonProps(navigation.goBack)}
          error={someErr}
        />
      )
    );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.issuing.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>{RenderMask()}</SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwPidPreviewScreen;
