/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Body, Container, List, ListItem, Spinner, Text } from "native-base";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import _ from "lodash";
import { isSome } from "fp-ts/lib/Option";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { startApplicationInitialization } from "../../store/actions/application";
import { ReduxProps } from "../../store/actions/types";
import {
  sessionInfoSelector,
  sessionTokenSelector
} from "../../store/reducers/authentication";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import SectionStatusComponent from "../../components/SectionStatus";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { getDeviceId } from "../../utils/device";
import { OPERISSUES_10_track } from "../../sagas/startup";
import { IngressCheckBox } from "./CheckBox";

type Props = ReduxProps & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: variables.contentPaddingLarge,
    backgroundColor: variables.brandPrimary
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "startup.contextualHelp.title",
  body: "startup.contextualHelp.body"
};

class IngressScreen extends React.PureComponent<Props> {
  public componentDidMount() {
    // Dispatch START_APPLICATION_INITIALIZATION to initialize the app
    this.props.dispatch(startApplicationInitialization());
  }

  public componentDidUpdate(prevProps: Readonly<Props>) {
    if (!_.isEqual(prevProps, this.props)) {
      OPERISSUES_10_track("Ingress_potProfile", {
        kind: this.props.potProfile.kind
      });
      OPERISSUES_10_track("Ingress_SessionInfo", {
        isSome: isSome(this.props.maybeSessionInfo)
      });
      OPERISSUES_10_track("Ingress_SessionToken", {
        isDefined: this.props.maybeSessionInfo !== undefined
      });
    }
  }

  public render() {
    const items = [
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
    ];
    const showDeviceIdButton = _.isEqual(
      [
        this.props.hasSessionToken,
        this.props.hasSessionInfo,
        this.props.hasProfile,
        this.props.isProfileEnabled
      ],
      [false, false, true, false]
    );
    return (
      <BaseScreenComponent
        goBack={false}
        contextualHelpMarkdown={contextualHelpMarkdown}
        primary={true}
        headerBackgroundColor={variables.brandPrimary}
        appLogo={false}
      >
        <Container style={styles.container}>
          <Text white={true} alignCenter={true}>
            {I18n.t("startup.title")}
          </Text>
          <Spinner color="white" />

          <List withContentLateralPadding={true}>
            {items.map((item, index) => (
              <ListItem key={`item-${index}`}>
                <IngressCheckBox checked={item.enabled} />
                <Body>
                  <Text white={true} bold={item.enabled}>
                    {item.label}
                  </Text>
                </Body>
              </ListItem>
            ))}
          </List>
          <View style={{ marginTop: 48 }}>
            {showDeviceIdButton && (
              <ButtonDefaultOpacity
                style={{ alignSelf: "center" }}
                primary={false}
                bordered={true}
                onPress={() => clipboardSetStringWithFeedback(getDeviceId())}
              >
                <Text>{"copia l'ID per l'assistenza"}</Text>
              </ButtonDefaultOpacity>
            )}
            <SectionStatusComponent sectionKey={"ingress"} />
          </View>
        </Container>
      </BaseScreenComponent>
    );
  }
}

function mapStateToProps(state: GlobalState) {
  const maybeSessionToken = sessionTokenSelector(state);
  const maybeSessionInfo = sessionInfoSelector(state);
  const potProfile = profileSelector(state);
  return {
    hasSessionToken: maybeSessionToken !== undefined,
    hasSessionInfo: maybeSessionInfo.isSome(),
    hasProfile: potProfile !== null,
    potProfile,
    maybeSessionInfo,
    isProfileEnabled:
      pot.isSome(potProfile) &&
      potProfile.value.has_profile &&
      potProfile.value.is_inbox_enabled
  };
}

export default connect(mapStateToProps)(IngressScreen);
