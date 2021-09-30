import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useEffect, useState } from "react";
import { instabugLog, TypeLogs } from "../../boot/configureInstabug";
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
import {
  navigateBack,
  navigateToSPIDLogin,
  navigateToSPIDTestIDP
} from "../../store/actions/navigation";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { isLoading } from "../../features/bonus/bpd/model/RemoteValue";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const TAPS_TO_OPEN_TESTIDP = 5;

const styles = StyleSheet.create({
  gridContainer: {
    padding: variables.contentPadding,
    flex: 1,
    backgroundColor: variables.brandGray
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
  const { requestIdps, setSelectedIdp, navigateToIdpTest } = props;

  const onIdpSelected = (idp: LocalIdpsFallback) => {
    if (idp.isTestIdp === true && counter < TAPS_TO_OPEN_TESTIDP) {
      const newValue = (counter + 1) % (TAPS_TO_OPEN_TESTIDP + 1);
      setCounter(newValue);
    } else {
      props.setSelectedIdp(idp);
      instabugLog(`IDP selected: ${idp.id}`, TypeLogs.DEBUG, "login");
      props.navigateToIdpSelection();
    }
  };

  useEffect(() => {
    requestIdps();
  }, [requestIdps]);

  useEffect(() => {
    if (counter === TAPS_TO_OPEN_TESTIDP) {
      setCounter(0);
      setSelectedIdp(testIdp);
      navigateToIdpTest();
    }
  }, [counter, setSelectedIdp, navigateToIdpTest]);

  return (
    <BaseScreenComponent
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["authentication_IPD_selection"]}
      goBack={true}
      headerTitle={I18n.t("authentication.idp_selection.headerTitle")}
    >
      <LoadingSpinnerOverlay isLoading={props.isIdpsLoading}>
        <Content noPadded={true} overScrollMode={"never"} bounces={false}>
          <ScreenContentHeader
            title={I18n.t("authentication.idp_selection.contentTitle")}
          />
          <View style={styles.gridContainer} testID={"idps-view"}>
            <IdpsGrid
              idps={[...props.idps, testIdp]}
              onIdpSelected={onIdpSelected}
            />

            <View spacer={true} />
            <ButtonDefaultOpacity
              block={true}
              light={true}
              bordered={true}
              onPress={props.goBack}
            >
              <Text>{I18n.t("global.buttons.cancel")}</Text>
            </ButtonDefaultOpacity>
          </View>
          <View style={{ padding: variables.contentPadding }}>
            <View spacer={true} />
            <AdviceComponent
              text={I18n.t("login.expiration_info")}
              iconColor={"black"}
            />
          </View>
        </Content>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  idps: idpsSelector(state),
  isIdpsLoading: isLoading(idpsStateSelector(state))
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToIdpSelection: () => dispatch(navigateToSPIDLogin()),
  navigateToIdpTest: () => dispatch(navigateToSPIDTestIDP()),
  goBack: () => dispatch(navigateBack()),
  requestIdps: () => dispatch(loadIdps.request()),
  setSelectedIdp: (idp: SpidIdp) => dispatch(idpSelected(idp))
});

export default connect(mapStateToProps, mapDispatchToProps)(IdpSelectionScreen);
