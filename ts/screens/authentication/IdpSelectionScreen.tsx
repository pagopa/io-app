import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useEffect, useState } from "react";
import AdviceComponent from "../../components/AdviceComponent";
import IdpsGrid from "../../components/IdpsGrid";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { idpSelected } from "../../store/actions/authentication";
import variables from "../../theme/variables";
import { GlobalState } from "../../store/reducers/types";
import { idpsSelector, idpsStateSelector } from "../../store/reducers/content";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { LocalIdpsFallback } from "../../utils/idps";
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
import { H1 } from "../../components/core/typography/H1";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { VSpacer } from "../../components/core/spacer/Spacer";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const TAPS_TO_OPEN_TESTIDP = 5;

const styles = StyleSheet.create({
  gridContainer: {
    flex: 1
  },
  footerAdviceContainer: {
    backgroundColor: IOColors.white,
    paddingVertical: variables.spacerLargeHeight,
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

  const onIdpSelected = (idp: LocalIdpsFallback) => {
    setSelectedIdp(idp);
    handleSendAssistanceLog(choosenTool, `IDP selected: ${idp.id}`);
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_AUTH_SESSION
    });
  };

  const evokeLoginScreenCounter = () => {
    if (counter < TAPS_TO_OPEN_TESTIDP) {
      const newValue = (counter + 1) % (TAPS_TO_OPEN_TESTIDP + 1);
      setCounter(newValue);
    }
  };

  useEffect(() => {
    requestIdps();
  }, [requestIdps]);

  useEffect(() => {
    if (counter === TAPS_TO_OPEN_TESTIDP) {
      setCounter(0);
      navigation.navigate(ROUTES.AUTHENTICATION, {
        screen: ROUTES.AUTHENTICATION_IDP_TEST
      });
    }
  }, [counter, setSelectedIdp, navigation]);

  const headerComponent = () => <VSpacer size={24} />;

  const footerComponent = () => (
    <View>
      <VSpacer size={24} />
      <View style={IOStyles.horizontalContentPadding}>
        <ButtonDefaultOpacity
          block={true}
          light={true}
          bordered={true}
          onPress={navigation.goBack}
        >
          <NBButtonText>{I18n.t("global.buttons.cancel")}</NBButtonText>
        </ButtonDefaultOpacity>
      </View>
      <View
        style={[
          styles.footerAdviceContainer,
          IOStyles.horizontalContentPadding
        ]}
      >
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
      <LoadingSpinnerOverlay isLoading={props.isIdpsLoading}>
        {/* Custom ScreenContentHeader with secret login */}
        <View style={IOStyles.horizontalContentPadding}>
          <VSpacer size={16} />
          <Pressable accessible={false} onPress={evokeLoginScreenCounter}>
            {/* Add `accessible=false` 'cause it useful only
            for debug mode (stores reviewers).
            Original issue: https://www.pivotaltracker.com/story/show/172082895 */}
            <H1
              accessible={true}
              accessibilityRole="header"
              weight="Bold"
              testID={"screen-content-header-title"}
              color={"bluegreyDark"}
            >
              {I18n.t("authentication.idp_selection.contentTitle")}
            </H1>
          </Pressable>
          <VSpacer size={24} />
        </View>

        <View style={styles.gridContainer}>
          <IdpsGrid
            idps={[...props.idps]}
            onIdpSelected={onIdpSelected}
            headerComponent={headerComponent}
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