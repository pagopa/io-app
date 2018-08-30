import { Option } from "fp-ts/lib/Option";
import { Content, H3, Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import TopScreenComponent from "../../components/screens/TopScreenComponent";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { logoutRequest } from "../../store/actions/authentication";
import { FetchRequestActions } from "../../store/actions/constants";
import { startPinReset } from "../../store/actions/pinset";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type ReduxMappedProps = {
  isLoggingOut: boolean;
  logoutError: Option<string>;
};

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedProps & ReduxProps;

const styles = StyleSheet.create({
  gridRow: {
    paddingTop: variables.contentPadding,
    alignItems: "center"
  }
});

/**
 * A component to show the main screen of the Profile section
 */
export class ProfileMainScreen extends React.Component<Props, never> {
  public render() {
    return (
      <TopScreenComponent
        title={I18n.t("profile.main.screenTitle")}
        icon={require("../../../img/icons/gears.png")}
        subtitle={I18n.t("profile.main.screenSubtitle")}
      >
        <Content>
          <Grid>
            {/* Privacy */}
            <Row
              style={styles.gridRow}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PROFILE_PRIVACY_MAIN)
              }
            >
              <Col size={10}>
                <H3>{I18n.t("profile.main.privacy.title")}</H3>
                <Text>{I18n.t("profile.main.privacy.description")}</Text>
              </Col>
              <Col size={2}>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Col>
            </Row>
            {/* Terms & conditions */}
            <Row
              style={styles.gridRow}
              onPress={() =>
                this.props.navigation.navigate(ROUTES.PROFILE_TOS, {
                  isProfile: true
                })
              }
            >
              <Col size={10}>
                <H3>{I18n.t("profile.main.termsAndConditions.title")}</H3>
                <Text>
                  {I18n.t("profile.main.termsAndConditions.description")}
                </Text>
              </Col>
              <Col size={2}>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Col>
            </Row>

            {/* Reset PIN */}
            <Row
              style={styles.gridRow}
              onPress={() => this.props.dispatch(startPinReset)}
            >
              <Col size={10}>
                <H3>{I18n.t("pin_login.pin.reset.button_short")}</H3>
                <Text>{I18n.t("pin_login.pin.reset.tip_short")}</Text>
              </Col>
              <Col size={2}>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Col>
            </Row>

            {/* Logout/Exit */}
            <Row
              style={styles.gridRow}
              onPress={() => this.props.dispatch(logoutRequest())}
            >
              <Col size={10}>
                <H3>{I18n.t("profile.main.logout")}</H3>
              </Col>
              <Col size={2}>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Col>
            </Row>
          </Grid>
        </Content>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoggingOut: createLoadingSelector([FetchRequestActions.LOGOUT])(state),
  logoutError: createErrorSelector([FetchRequestActions.LOGOUT])(state)
});

export default connect(mapStateToProps)(ProfileMainScreen);
