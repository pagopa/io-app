import { Text as NBText } from "native-base";
import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeModules, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useEffect, useState } from "react";
import AdviceComponent from "../../components/AdviceComponent";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import IdpsGrid from "../../components/IdpsGrid";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import I18n from "../../i18n";
import { idpSelected } from "../../store/actions/authentication";
import variables from "../../theme/variables";
import { GlobalState } from "../../store/reducers/types";
import { idpsSelector, idpsStateSelector } from "../../store/reducers/content";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { LocalIdpsFallback, testIdp } from "../../utils/idps";
import { loadIdps } from "../../store/actions/content";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { isLoading } from "../../features/bonus/bpd/model/RemoteValue";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import ROUTES from "../../navigation/routes";
import { IOStackNavigationProp } from "../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import { IOColors } from "../../components/core/variables/IOColors";
import { getMajorIosVersion, isIos } from "../../utils/platform";
import { IO_INTERNAL_LINK } from "../../utils/navigation";
import {
  getIdpLoginUri,
  LOGIN_FAILURE_PAGE,
  LOGIN_SUCCESS_PAGE
} from "../../utils/login";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type profileOrErrorUrlType = { profileOrErrorUrl: string; loginUri?: never };
type loginUri = { loginUri: string; profileOrErrorUrl?: never };

export type navigationLoginUri = profileOrErrorUrlType | loginUri;

const TAPS_TO_OPEN_TESTIDP = 5;

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1
  },
  footerAdviceContainer: {
    backgroundColor: IOColors.white,
    paddingHorizontal: variables.contentPadding,
    paddingVertical: variables.spacerExtralargeHeight,
    marginTop: variables.contentPadding
  },
  footerCancelButton: {
    marginTop: variables.spacerHeight,
    marginHorizontal: variables.contentPadding
  },
  ipdsGridColumnStyle: {
    paddingHorizontal: variables.contentPadding
  },
  ipdsGridContentContainerStyle: {
    backgroundColor: IOColors.greyUltraLight
  },
  ipdsGridHeaderComponentStyle: {
    marginTop: variables.contentPadding
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "authentication.idp_selection.contextualHelpTitle",
  body: "authentication.idp_selection.contextualHelpContent"
};

/**
 * A screen where the user choose the SPID IPD to login with.
 */
const IdpSelectionScreen = (props: Props): React.ReactElement => {
  const [counter, setCounter] = useState(0);
  const { requestIdps, setSelectedIdp } = props;
  const choosenTool = assistanceToolRemoteConfig(props.assistanceToolConfig);

  const navigation =
    useNavigation<
      IOStackNavigationProp<
        AuthenticationParamsList,
        "AUTHENTICATION_IPD_SELECTION"
      >
    >();

  const navigationTypedParams = (url: string): navigationLoginUri =>
    url.includes(IO_INTERNAL_LINK)
      ? {
          profileOrErrorUrl: url
        }
      : {
          loginUri: url
        };
  const navigate = (profileOrErrorUrlOrLoginUri: string) => {
    const parameters: navigationLoginUri = navigationTypedParams(
      profileOrErrorUrlOrLoginUri
    );
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_IDP_LOGIN,
      params: parameters
    });
  };

  const [secureLoginNativeModuleIsLoading,setSecureLoginNativeModuleIsLoading] = useState(false);

  const onIdpSelected = (idp: LocalIdpsFallback) => {
    if (idp.isTestIdp === true && counter < TAPS_TO_OPEN_TESTIDP) {
      const newValue = (counter + 1) % (TAPS_TO_OPEN_TESTIDP + 1);
      setCounter(newValue);
    } else {
      props.setSelectedIdp(idp);
      handleSendAssistanceLog(choosenTool, `IDP selected: ${idp.id}`);

      const loginUri = getIdpLoginUri(idp.id);

      if (isIos && getMajorIosVersion() >= 13) {
        try{
          setSecureLoginNativeModuleIsLoading(true)
          NativeModules.secureLogin.signIn(
            loginUri,
            IO_INTERNAL_LINK,
            (responseUrl: string) => {
              setSecureLoginNativeModuleIsLoading(false)
              // if user press "Cancel", don't navigate
              if (responseUrl.includes("com.apple")) {
                return;
              } else if (
                responseUrl.includes(LOGIN_SUCCESS_PAGE) ||
                responseUrl.includes(LOGIN_FAILURE_PAGE)
              ) {
                // responseUrl is always a string, if includes a known parameter, let the old page handle it
                navigate(responseUrl);
              } else {
                // this is the case when something goes wrong with the authentication session module. It returns an error code (string) in "responseUrl".
                navigate(loginUri);
                return;
              }
            }
          );
        }
        catch(e){
          setSecureLoginNativeModuleIsLoading(false)
          navigate(loginUri);  
        }
      } else {
        navigate(loginUri);
      }
    }
  };

  

  useEffect(() => {
    requestIdps();
  }, [requestIdps]);

  useEffect(() => {
    if (counter === TAPS_TO_OPEN_TESTIDP) {
      setCounter(0);
      setSelectedIdp(testIdp);
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_TEST
      });
    }
  }, [counter, setSelectedIdp, navigation]);

  const headerComponent = () => <View />;

  const footerComponent = () => (
    <View>
      <ButtonDefaultOpacity
        block={true}
        light={true}
        bordered={true}
        onPress={navigation.goBack}
        style={styles.footerCancelButton}
      >
        <NBText>{I18n.t("global.buttons.cancel")}</NBText>
      </ButtonDefaultOpacity>
      <View style={styles.footerAdviceContainer}>
        <AdviceComponent
          text={I18n.t("login.expiration_info")}
          iconColor={"black"}
        />
      </View>
    </View>
  );

  return (
    <BaseScreenComponent
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["authentication_IPD_selection"]}
      goBack={true}
      headerTitle={I18n.t("authentication.idp_selection.headerTitle")}
    >
      <LoadingSpinnerOverlay isLoading={props.isIdpsLoading || secureLoginNativeModuleIsLoading}>
        <ScreenContentHeader
          title={I18n.t("authentication.idp_selection.contentTitle")}
        />
        <View style={styles.gridContainer}>
          <IdpsGrid
            idps={[...props.idps, testIdp]}
            onIdpSelected={onIdpSelected}
            columnWrapperStyle={styles.ipdsGridColumnStyle}
            contentContainerStyle={styles.ipdsGridContentContainerStyle}
            headerComponent={headerComponent}
            headerComponentStyle={styles.ipdsGridHeaderComponentStyle}
            footerComponent={footerComponent}
          />
        </View>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  idps: idpsSelector(state),
  isIdpsLoading: isLoading(idpsStateSelector(state)),
  assistanceToolConfig: assistanceToolConfigSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestIdps: () => dispatch(loadIdps.request()),
  setSelectedIdp: (idp: SpidIdp) => dispatch(idpSelected(idp))
});

export default connect(mapStateToProps, mapDispatchToProps)(IdpSelectionScreen);
