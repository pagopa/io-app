import {
  Body,
  CheckBox,
  Container,
  ListItem,
  Spinner,
  Text
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { connect } from "react-redux";

import I18n from "../i18n";

import { startApplicationInitialization } from "../store/actions/application";
import { ReduxProps } from "../store/actions/types";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../store/reducers/authentication";
import { profileSelector } from "../store/reducers/profile";
import { GlobalState } from "../store/reducers/types";

import variables from "../theme/variables";

type ReduxMappedProps = {
  hasSessionToken: boolean;
  hasSessionInfo: boolean;
  hasProfile: boolean;
  isProfileEnabled: boolean;
};

type Props = ReduxProps & ReduxMappedProps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: variables.contentPadding,
    backgroundColor: variables.brandPrimary
  }
});

/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
class IngressScreen extends React.PureComponent<Props> {
  public componentDidMount() {
    // Dispatch START_APPLICATION_INITIALIZATION to initialize the app
    this.props.dispatch(startApplicationInitialization());

    // Hide splash screen
    SplashScreen.hide();
  }

  public render() {
    const items = Array(
      {
        enabled: this.props.hasSessionToken,
        label: I18n.t("startup.authentication")
      },
      {
        enabled: this.props.hasSessionInfo,
        label: I18n.t("startup.sessionInfo")
      },
      { enabled: this.props.hasProfile, label: I18n.t("startup.profileInfo") },
      {
        enabled: this.props.isProfileEnabled,
        label: I18n.t("startup.profileEnabled")
      }
    );
    return (
      <Container style={styles.container}>
        <Text white={true} alignCenter={true}>
          {I18n.t("startup.title")}
        </Text>
        <Spinner color="white" />
        {items.map((item, index) => (
          <ListItem key={`item-${index}`}>
            <CheckBox checked={item.enabled} />
            <Body>
              <Text white={true} bold={item.enabled}>
                {item.label}
              </Text>
            </Body>
          </ListItem>
        ))}
      </Container>
    );
  }
}

// <ActivityIndicator color={variables.brandPrimaryInverted} />

function mapStateToProps(state: GlobalState): ReduxMappedProps {
  const maybeSessionToken = sessionTokenSelector(state);
  const maybeSessionInfo = sessionInfoSelector(state);
  const maybeProfile = profileSelector(state);
  return {
    hasSessionToken: maybeSessionToken !== undefined,
    hasSessionInfo: maybeSessionInfo.isSome(),
    hasProfile: maybeProfile !== null,
    isProfileEnabled:
      maybeProfile !== null &&
      maybeProfile.extended !== undefined &&
      maybeProfile.extended.is_inbox_enabled
  };
}

export default connect(mapStateToProps)(IngressScreen);
