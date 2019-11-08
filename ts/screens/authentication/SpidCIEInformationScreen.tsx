/**
 * A screen where the user can know more about SPID, CIE and access to spid.gov.it
 */
import {
  Button,
  Container,
  Content,
  H2,
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
import { connect } from "react-redux";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import variables from "../../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

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
  }
});

class SpidInformationScreen extends React.Component<Props, never> {
  private browseToLink(url: string) {
    Linking.openURL(url).catch(() => {
      Toast.show({ text: I18n.t("genericError") });
    });
  }

  public render() {
    return (
      <BaseScreenComponent goBack={true}>
        <Container>
          <View style={{ margin: 24 }}>
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
                <Markdown useCustomSortedList={true}>
                  {I18n.t("authentication.spid_information.spid")}
                </Markdown>
                <View spacer={true} extralarge={true} />
              </Content>
              <View footer={true}>
                <Button
                  block={true}
                  primary={true}
                  onPress={() => this.browseToLink("https://www.spid.gov.it")}
                >
                  <Text>
                    {I18n.t("authentication.spid_information.knowMore")}
                  </Text>
                </Button>
              </View>
            </Tab>
            <Tab
              heading={I18n.t("authentication.cie")}
              activeTextStyle={{ fontSize: 14 }}
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

export default connect()(SpidInformationScreen);
