import React from "react";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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
import { itwPid } from "../../store/actions/credentials";
import { ItwPidType, itwPidSelector } from "../../store/reducers/itwPid";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { InfoScreenComponent } from "../../../fci/components/InfoScreenComponent";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { mapRequirementsError } from "../../utils/errors/itwErrorsMapping";
import { Pictogram } from "../../../../components/core/pictograms";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwPidPreviewScreen = () => {
  const spacerSize = 32;
  const { present, bottomSheet } = useItwAbortFlow();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwPidSelector);

  /**
   * Temporary timeout to simulate loading, will be removed in the future.
   */
  useOnFirstRender(() => {
    dispatch(itwPid.request());
  });

  /**
   * Renders the error view.
   */
  const ErrorView = (error: ItWalletError) => {
    const mappedError = mapRequirementsError(error);
    const cancelButtonProps = {
      block: true,
      light: false,
      bordered: true,
      onPress: navigation.goBack,
      title: I18n.t("features.itWallet.generic.close")
    };
    return (
      <>
        <InfoScreenComponent
          title={mappedError.title}
          body={mappedError.body}
          image={<Pictogram name="error" />}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps}
        />
      </>
    );
  };

  /**
   * Renders the loading spinner.
   * @returns a loading spinner overlay
   */
  const LoadingView = () => <LoadingSpinnerOverlay isLoading={true} />;

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPip - the decoded PID
   */
  const ContentView = ({ decodedPid }: Pick<ItwPidType, "decodedPid">) => {
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
    const name = pipe(
      decodedPid,
      O.fold(
        () => "",
        some => some.pid.claims.givenName + " " + some.pid.claims.familyName
      )
    );

    const fiscalCode = pipe(
      decodedPid,
      O.fold(
        () => "",
        some => some.pid.claims.taxIdCode
      )
    );
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
            {pipe(
              decodedPid,
              O.fold(
                () => <></>,
                some => <ClaimsList decodedPid={some} /> // maybe add a dummy view to show the error
              )
            )}
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

  const RenderMask = () =>
    pot.fold(
      pid,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => ErrorView(err),
      some => <ContentView decodedPid={some.decodedPid} />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, err) => ErrorView(err)
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
