import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import PidCredential from "../../components/PidCredential";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { FeatureInfo } from "../../../../components/FeatureInfo";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import ClaimsList from "../../components/ClaimsList";
import { useItwAbortFlow } from "../../hooks/useItwAbortFlow";
import { ITW_ROUTES } from "../../navigation/routes";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ItwParamsList } from "../../navigation/params";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwDecodePid } from "../../store/actions/credentials";
import { itwPidValueSelector } from "../../store/reducers/itwPid";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ItwDecodedPidPotSelector } from "../../store/reducers/itwPidDecode";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";

type ContentViewProps = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwPidPreviewScreen = () => {
  const spacerSize = 32;
  const { present, bottomSheet } = useItwAbortFlow();
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
   * @param decodedPip - the decoded PID
   */
  const ContentView = ({ decodedPid }: ContentViewProps) => {
    const cancelButtonProps = {
      block: true,
      bordered: true,
      onPress: present,
      title: I18n.t("features.itWallet.issuing.pidPreviewScreen.buttons.notNow")
    };
    const saveButtonProps = {
      block: true,
      primary: true,
      onPress: () => navigation.navigate(ITW_ROUTES.ACTIVATION.PID_ISSUING),
      title: I18n.t("features.itWallet.issuing.pidPreviewScreen.buttons.add")
    };
    const name =
      decodedPid.pid.claims.givenName + " " + decodedPid.pid.claims.familyName;
    const fiscalCode = decodedPid.pid.claims.taxIdCode;
    return (
      <>
        <ScreenContent
          title={I18n.t("features.itWallet.issuing.pidPreviewScreen.title")}
        >
          <VSpacer />
          <View style={IOStyles.horizontalContentPadding}>
            <PidCredential name={name} fiscalCode={fiscalCode} />
            <VSpacer />
            <FeatureInfo
              body={I18n.t(
                "features.itWallet.issuing.pidPreviewScreen.checkNotice"
              )}
              iconName="notice"
            />
            <VSpacer />
            <ClaimsList decodedPid={decodedPid} />
            <VSpacer size={spacerSize} />
          </View>
        </ScreenContent>

        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={saveButtonProps}
        />
        {bottomSheet}
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
