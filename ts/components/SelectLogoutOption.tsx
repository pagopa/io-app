import {
  Container,
  Content,
  List,
  View
} from "native-base";
import React from "react";
import { BackHandler, StyleSheet } from "react-native";

import I18n from "../i18n";
import variables from "../theme/variables";
import { LogoutOption } from "../store/actions/authentication";
import ListItemComponent from "./screens/ListItemComponent";
import FooterWithButtons from "./ui/FooterWithButtons";

const styles = StyleSheet.create({
  content: {
    padding: variables.contentPadding,
    paddingTop: 48
  },
  separator: {
    height: 40,
    width: "100%"
  },
  itemLeft: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  itemLeftText: {
    alignSelf: "flex-start"
  }
});

type Props = {
  onCancel: () => void;
  onOptionSelected: (_: LogoutOption) => void;
  header?: React.ReactNode;
};

/**
 * A modal that allow the user to select the logout method of choice
 */
class SelectLogoutOption extends React.PureComponent<Props> {
  private onBackPress = () => {
    this.props.onCancel();
    // Returning true is mandatory to avoid the default press action to be
    // triggered as if the modal was not visible
    return true;
  };

  public render() {
    return (
      <Container>
        <Content style={styles.content}>
          {this.props.header || null}
          <List>
            <ListItemComponent
              title={I18n.t("profile.logout.cta.keepData.title")}
              subTitle={I18n.t("profile.logout.cta.keepData.description")}
              onPress={() =>
                this.props.onOptionSelected({ keepUserData: true })
              }
              extendedSubTitle={true}
            />

            <ListItemComponent
              title={I18n.t("profile.logout.cta.resetData.title")}
              subTitle={I18n.t("profile.logout.cta.resetData.description")}
              onPress={() =>
                this.props.onOptionSelected({ keepUserData: false })
              }
              extendedSubTitle={true}
            />
          </List>
          <View style={styles.separator} />
        </Content>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            bordered: true,
            onPress: this.props.onCancel,
            title: I18n.t("global.buttons.cancel"),
            block: true
          }}
        />
      </Container>
    );
  }

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }
}

export default SelectLogoutOption;
