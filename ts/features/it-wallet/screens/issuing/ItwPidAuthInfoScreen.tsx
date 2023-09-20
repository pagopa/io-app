import * as React from "react";
import { Image, View, SafeAreaView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { H4 } from "../../../../components/core/typography/H4";
import ItwFooterInfoBox from "../../components/ItwFooterInfoBox";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import authInfoCie from "../../../../../img/features/it-wallet/auth-info-cie.png";
import { Link } from "../../../../components/core/typography/Link";
import { openWebUrl } from "../../../../utils/url";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import {
  profileBirthDateSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSurnameSelector
} from "../../../../store/reducers/profile";
import { pidDataMock } from "../../utils/mocks";
import { formatDateToYYYYMMDD } from "../../../../utils/dates";
import { isIos } from "../../../../utils/platform";
import ItwErrorView from "../../components/ItwErrorView";
import { cancelButtonProps } from "../../utils/itwButtonsUtils";
import { itwWiaStateSelector } from "../../store/reducers/itwWiaReducer";
import { itwWiaRequest } from "../../store/actions/itwWiaActions";

/**
 * Delay in milliseconds to bypass the CIE authentication process.
 */
const MS_TO_BYPASS = 1500;

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
    navigation.navigate(ITW_ROUTES.ISSUING.PID_REQUEST, {
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
   * Containts the content of the screen when the requirements are satisfied.
   */
  const ContentView = () => {
    const continueButtonProps = {
      block: true,
      primary: true,
      onPress: () =>
        isIos
          ? bypassCieLogin()
          : navigation.navigate(ITW_ROUTES.ISSUING.CIE.PIN_SCREEN),
      title: I18n.t("features.itWallet.infoAuthScreen.confirm")
    };
    return (
      <>
        <ScreenContent
          title={I18n.t("features.itWallet.infoAuthScreen.title")}
          subtitle={I18n.t("features.itWallet.infoAuthScreen.subTitle")}
        >
          <View style={IOStyles.horizontalContentPadding}>
            <H4 weight={"Regular"} color={"bluegrey"}>
              {I18n.t("features.itWallet.infoAuthScreen.noCieInfo")}
              <Link
                onPress={() =>
                  openWebUrl(
                    I18n.t("features.itWallet.infoAuthScreen.readMoreUrl")
                  )
                }
              >
                {I18n.t("features.itWallet.infoAuthScreen.noCieCta")}
              </Link>
            </H4>

            {/* Wallet cards image */}
            <Pressable
              accessible={false}
              onLongPress={bypassCieLogin}
              delayLongPress={MS_TO_BYPASS}
            >
              <Image
                source={authInfoCie}
                resizeMode={"contain"}
                style={{ width: "100%", height: 200 }}
              />
            </Pressable>
            {/* Info activation */}
            <H4 weight={"Regular"} color={"bluegrey"}>
              {I18n.t("features.itWallet.infoAuthScreen.howAuth")}
            </H4>
          </View>

          {/* Footer Info Box */}
          <ItwFooterInfoBox
            content={I18n.t("features.itWallet.infoAuthScreen.footerBox")}
            infoIcon
          />
          <VSpacer size={48} />
        </ScreenContent>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </>
    );
  };

  const RenderMask = () =>
    pot.fold(
      wia,
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
      _ => <ContentView />,
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

export default ItwPidAuthInfoScreen;
