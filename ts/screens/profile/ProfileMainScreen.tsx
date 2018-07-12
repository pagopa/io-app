import { Option } from "fp-ts/lib/Option";
import { Body, Container, Content, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { Col, Grid, Row } from "react-native-easy-grid";
import { connect } from "react-redux";

import DefaultSubscreenHeader from "../../components/DefaultScreenHeader";
import { FetchActivityIndicator } from "../../components/FetchActivityIndicator";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { logoutRequest } from "../../store/actions/authentication";
import { FetchRequestActions } from "../../store/actions/constants";
import { ReduxProps } from "../../store/actions/types";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";

type ReduxMappedProps = {
  isLoggingOut: boolean;
  logoutError: Option<string>;
};

export type Props = ReduxMappedProps & ReduxProps;

const styles = StyleSheet.create({
  gridRow: {
    paddingTop: variables.contentPadding,
    paddingBottom: variables.contentPadding,
    alignItems: "center"
  }
});

export class ProfileMainScreen extends React.Component<Props, never> {
  public render() {
    const { isLoggingOut } = this.props;

    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{DeviceInfo.getApplicationName()}</Text>
          </Body>
        </AppHeader>

        <Content>
          <FetchActivityIndicator show={isLoggingOut} />
          <View>
            <DefaultSubscreenHeader
              screenTitle={I18n.t("profile.main.screenTitle")}
              icon={require("../../../img/icons/gears.png")}
            />

            <Text>{I18n.t("profile.main.screenSubtitle")}</Text>
            <Grid>
              {/* Logout/Exit */}
              <Row style={styles.gridRow}>
                <Col size={10}>
                  <H3>{I18n.t("profile.main.logout")}</H3>
                </Col>
                <Col size={2}>
                  <IconFont
                    name="io-right"
                    color={variables.contentPrimaryBackground}
                    onPress={() => this.props.dispatch(logoutRequest())}
                  />
                </Col>
              </Row>
            </Grid>
          </View>
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoggingOut: createLoadingSelector([FetchRequestActions.LOGOUT])(state),
  logoutError: createErrorSelector([FetchRequestActions.LOGOUT])(state)
});

export default connect(mapStateToProps)(ProfileMainScreen);
