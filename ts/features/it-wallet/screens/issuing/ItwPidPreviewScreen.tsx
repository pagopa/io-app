import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { PidWithToken } from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import {
  ButtonOutline,
  FeatureInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ScreenContent from "../../../../components/screens/ScreenContent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useItwAbortFlow } from "../../hooks/useItwAbortFlow";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ItwDecodedPidPotSelector } from "../../store/reducers/itwPidDecodeReducer";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import { H4 } from "../../../../components/core/typography/H4";
import ItwPidClaimsList from "../../components/ItwPidClaimsList";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { itwDecodePid } from "../../store/actions/itwCredentialsActions";
import { itwPidValueSelector } from "../../store/reducers/itwPidReducer";
import ItwCredentialCard from "../../components/ItwCredentialCard";

type ContentViewProps = {
  decodedPid: PidWithToken;
};

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwPidPreviewScreen = () => {
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
      onPress: () => navigation.navigate(ITW_ROUTES.ISSUING.PID_ADDING),
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
            <ItwCredentialCard
              credential={I18n.t(
                "features.itWallet.verifiableCredentials.type.digitalCredential"
              )}
              name={name}
              fiscalCode={fiscalCode}
              backgroundImage={require("../../assets/img/pidCredentialCard.png")}
            />
            <VSpacer />
            <FeatureInfo
              body={I18n.t(
                "features.itWallet.issuing.pidPreviewScreen.checkNotice"
              )}
              iconName="notice"
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
            <H4 weight={"SemiBold"} color={"bluegreyDark"}>
              {I18n.t(
                "features.itWallet.verifiableCredentials.unrecognizedData.title"
              )}
            </H4>
            <VSpacer />
            <H4 weight={"Regular"} color={"bluegrey"}>
              {I18n.t(
                "features.itWallet.verifiableCredentials.unrecognizedData.body",
                {
                  issuer:
                    decodedPid.pid.verification.evidence[0].record.source
                      .organization_name
                }
              )}
            </H4>
            <VSpacer />
            <ButtonOutline
              fullWidth
              accessibilityLabel="ClamListButton"
              label={I18n.t(
                "features.itWallet.verifiableCredentials.unrecognizedData.cta"
              )}
              onPress={() => null}
            />
            <VSpacer />
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
