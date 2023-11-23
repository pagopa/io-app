import * as React from "react";
import { SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { openWebUrl } from "../../../../../utils/url";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import {
  profileBirthDateSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSurnameSelector
} from "../../../../../store/reducers/profile";
import { pidDataMock } from "../../../utils/mocks";
import { formatDateToYYYYMMDD } from "../../../../../utils/dates";
import { isIos } from "../../../../../utils/platform";
import ItwErrorView from "../../../components/ItwErrorView";
import { cancelButtonProps } from "../../../utils/itwButtonsUtils";
import { itwWiaStateSelector } from "../../../store/reducers/itwWiaReducer";
import { itwWiaRequest } from "../../../store/actions/itwWiaActions";
import ItwContinueView from "../../../components/ItwContinueView";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";

/**
 * Renders the screen which displays the information about the authentication process to obtain a Wallet Instance.
 */
const ItwPidAuthInfoScreen = () => {
  const navigation = useNavigation();
  const dispatch = useIODispatch();
  const wia = useIOSelector(itwWiaStateSelector);
  const name = useIOSelector(profileNameSelector);
  const surname = useIOSelector(profileSurnameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const birthDate = useIOSelector(profileBirthDateSelector);

  useOnFirstRender(() => {
    dispatch(itwWiaRequest.request());
  });

  /**
   * Bypass the CIE authentication process and navigate to the PID preview screen by sending
   * PID data from the profile store or a mock if the data is not available.
   */
  const bypassCieLogin = () => {
    navigation.navigate(ITW_ROUTES.ISSUING.PID.REQUEST, {
      pidData: {
        name: name ?? pidDataMock.name,
        surname: surname ?? pidDataMock.surname,
        birthDate: birthDate
          ? formatDateToYYYYMMDD(birthDate)
          : pidDataMock.birthDate,
        fiscalCode: fiscalCode ?? pidDataMock.fiscalCode
      }
    });
  };

  /**
   * Loading view component.
   */
  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay isLoading>
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  /**
   * Containts the content of the screen when the requirements are satisfied.
   */
  const ContentView = () => (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.itWallet.issuing.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ItwContinueView
          title={I18n.t("features.itWallet.infoAuthScreen.title")}
          subtitle={I18n.t("features.itWallet.infoAuthScreen.subTitle")}
          pictogram="identityAdd"
          action={{
            label: I18n.t("global.buttons.confirm"),
            accessibilityLabel: I18n.t("global.buttons.confirm"),
            onPress: () =>
              isIos
                ? bypassCieLogin()
                : navigation.navigate(ITW_ROUTES.ISSUING.PID.CIE.PIN_SCREEN)
          }}
          secondaryAction={{
            label: I18n.t("features.itWallet.infoAuthScreen.noCieInfo"),
            accessibilityLabel: I18n.t(
              "features.itWallet.infoAuthScreen.noCieInfo"
            ),
            onPress: () =>
              openWebUrl(I18n.t("features.itWallet.infoAuthScreen.readMoreUrl"))
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  const RenderMask = () =>
    pot.fold(
      wia,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => (
        <ItwErrorView
          type="SingleButton"
          leftButton={cancelButtonProps(navigation.goBack)}
          error={err}
        />
      ),
      _ => <ContentView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, someErr) => (
        <ItwErrorView
          type="SingleButton"
          leftButton={cancelButtonProps(navigation.goBack)}
          error={someErr}
        />
      )
    );

  return <RenderMask />;
};

export default ItwPidAuthInfoScreen;
