/**
 * A screen where the user can know more about SPID, CIE and access to spid.gov.it
 */
import {
  Button,
  Col,
  Container,
  Content,
  Grid,
  H2,
  Row,
  Tab,
  Tabs,
  Text,
  Toast,
  View
} from "native-base";
import * as React from "react";
import { Linking } from "react-native";
import { StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import variables from "../../theme/variables";

type Props = {
  navigation: NavigationScreenProp<NavigationState>;
};

const styles = StyleSheet.create({
  value: {
    alignSelf: "flex-start",
    color: variables.brandPrimary,
    paddingTop: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  tabBarContainer: {
    elevation: 0
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.brandPrimary,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  viewStyle: {
    padding: customVariables.contentPadding
  },
  activeTextStyle: {
    fontSize: 14,
    color: customVariables.brandPrimary
  }
});

class SpidCIEInformationScreen extends React.Component<Props, never> {
  private getValueContent(value: string, content: string) {
    return (
      <Row style={styles.row}>
        <Col size={1}>
          <H2 style={styles.value}>{value}</H2>
        </Col>
        <Col size={5}>
          <Text>{content}</Text>
        </Col>
        <Col size={2} />
      </Row>
    );
  }

  private browseToLink(url: string) {
    Linking.openURL(url).catch(() => {
      Toast.show({ text: I18n.t("genericError") });
    });
  }

  public render() {
    return (
      <BaseScreenComponent goBack={true}>
        <Container>
          <View style={styles.viewStyle}>
            <H2>{I18n.t("authentication.spid_information.contentTitleCie")}</H2>

            <View spacer={true} large={true} />
            <Text>{I18n.t("authentication.spid_or_cie")}</Text>
          </View>
          <Tabs
            tabBarUnderlineStyle={styles.tabBarUnderline}
            tabContainerStyle={styles.tabBarContainer}
          >
            <Tab heading={I18n.t("authentication.spid")}>
              <Content>
                <Markdown>
                  {I18n.t("authentication.spid_information.spid")}
                </Markdown>
                <Grid>
                  {this.getValueContent(
                    I18n.t("authentication.spid_information.point1-value"),
                    I18n.t("authentication.spid_information.point1-content")
                  )}

                  {this.getValueContent(
                    I18n.t("authentication.spid_information.point2-value"),
                    I18n.t("authentication.spid_information.point2-content")
                  )}

                  {this.getValueContent(
                    I18n.t("authentication.spid_information.point3-value"),
                    I18n.t("authentication.spid_information.point3-content")
                  )}

                  {this.getValueContent(
                    I18n.t("authentication.spid_information.point4-value"),
                    I18n.t("authentication.spid_information.point4-content")
                  )}
                </Grid>
                <View spacer={true} extralarge={true} />
              </Content>
              <View footer={true}>
                <Button
                  block={true}
                  primary={true}
                  onPress={() => this.browseToLink("https://www.spid.gov.it")}
                >
                  <Text>
                    {I18n.t("authentication.request_spid")}
                  </Text>
                </Button>
              </View>
            </Tab>
            <Tab
              heading={I18n.t("authentication.cie.cie")}
              activeTextStyle={styles.activeTextStyle}
            >
              <Content>
                <Markdown>
                  {I18n.t("authentication.cie_information_request")}
                </Markdown>
                <View spacer={true} extralarge={true} />
              </Content>
              <View footer={true}>
                <Button
                  block={true}
                  primary={true}
                  onPress={() =>
                    this.browseToLink(
                      "https://www.cartaidentita.interno.gov.it"
                    )
                  }
                >
                  <Text>{I18n.t("authentication.request_cie")}</Text>
                </Button>
              </View>
            </Tab>
          </Tabs>
        </Container>
      </BaseScreenComponent>
    );
  }
}

export default SpidCIEInformationScreen;
