import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { Route, useRoute } from "@react-navigation/core";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { PidData } from "@pagopa/io-react-native-cie-pid";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwPid } from "../../store/actions/credentials";
import { itwPidSelector } from "../../store/reducers/itwPid";
import { InfoScreenComponent } from "../../../fci/components/InfoScreenComponent";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { mapRequirementsError } from "../../utils/errors/itwErrorsMapping";
import { Pictogram } from "../../../../components/core/pictograms";
import ItwLoadingSpinnerOverlay from "../../components/ItwLoadingSpinnerOverlay";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { itwActivationStop } from "../../store/actions";

/**
 * ItwPidRequestScreen's navigation params.
 * The pidData consists of the data needed to request a PID.
 */
export type ItwPidRequestScreenNavigationParams = {
  pidData: PidData;
};

/**
 * Renders a preview screen which requests a PID.
 */
const ItwPidRequestScreen = () => {
  const route =
    useRoute<
      Route<"ITW_ACTIVATION_PID_REQUEST", ItwPidRequestScreenNavigationParams>
    >();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwPidSelector);

  /**
   * Dispatches the PID request on first render.
   */
  useOnFirstRender(() => {
    dispatch(itwPid.request(route.params.pidData));
  });

  /**
   * Navigates to the PID preview screen when the PID is available.
   * This prevents the "cannot update a component while rendering a different component" error
   * if the navigation is called directly during the pot fold.
   */
  useEffect(() => {
    if (pot.isSome(pid)) {
      navigation.navigate(ITW_ROUTES.ISSUING.PID_PREVIEW);
    }
  }, [navigation, pid]);

  /**
   * Renders the error view.
   */
  const ErrorView = (error: ItWalletError) => {
    const mappedError = mapRequirementsError(error);
    const cancelButtonProps = {
      block: true,
      light: false,
      bordered: true,
      onPress: () => dispatch(itwActivationStop()),
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
  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t("features.itWallet.issuing.loading.title")}
      isLoading
      captionSubtitle={I18n.t("features.itWallet.issuing.loading.subtitle")}
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  const RenderMask = () =>
    pot.fold(
      pid,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => ErrorView(err),
      () => <LoadingView />,
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

export default ItwPidRequestScreen;
