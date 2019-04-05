import {
  Container,
  Content,
  H3,
  Left,
  List,
  ListItem,
  Right,
  Text,
  View
} from "native-base";
import React from "react";
import { BackHandler, StyleSheet } from "react-native";
import { connect } from "react-redux";

import I18n from "../i18n";
import variables from "../theme/variables";

import IconFont from "../components/ui/IconFont";
import { LogoutMethod } from "../store/actions/authentication";
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
  onMethodSelected: (_: LogoutMethod) => void;
  header?: React.ReactNode;
};

/**
 * A modal that allow the user to select the logout method of choice
 */
class SelectLogoutMethod extends React.PureComponent<Props> {
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
            <ListItem
              first={true}
              onPress={() =>
                this.props.onMethodSelected({ keepUserData: true })
              }
            >
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("profile.logout.cta.keepData.title")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("profile.logout.cta.keepData.description")}
                </Text>
              </Left>
              <Right>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Right>
            </ListItem>
            <ListItem
              onPress={() =>
                this.props.onMethodSelected({ keepUserData: false })
              }
            >
              <Left style={styles.itemLeft}>
                <H3>{I18n.t("profile.logout.cta.resetData.title")}</H3>
                <Text style={styles.itemLeftText}>
                  {I18n.t("profile.logout.cta.resetData.description")}
                </Text>
              </Left>
              <Right>
                <IconFont
                  name="io-right"
                  color={variables.contentPrimaryBackground}
                />
              </Right>
            </ListItem>
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

export default connect()(SelectLogoutMethod);
