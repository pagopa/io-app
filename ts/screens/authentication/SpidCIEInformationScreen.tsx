/**
 * A screen where the user can know more about SPID, CIE and access to spid.gov.it
 */
import { Col, Content, Grid, Row, Tab, Tabs } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../components/screens/ScreenContentHeader";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import { openLink } from "../../components/ui/Markdown/handlers/link";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";
import customVariables from "../../theme/variables";

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_SPID_CIE_INFORMATION"
>;

type State = {
  currentTab: number;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  },
  tabBarContainer: {
    elevation: 0
  },
  tabBarUnderline: {
    borderBottomColor: customVariables.brandPrimary,
    borderBottomWidth: customVariables.tabUnderlineHeight
  },
  activeTextStyle: {
    color: customVariables.brandPrimary
  }
});

class SpidCIEInformationScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTab: 0
    };
  }

  private getValueContent(value: string, content: string) {
    return (
      <Row style={styles.row}>
        <Col size={1}>
          <H1 color={"blue"}>{value}</H1>
        </Col>
        <Col size={5}>
          <Body>{content}</Body>
        </Col>
        <Col size={2} />
      </Row>
    );
  }

  private getFooterButton = () => {
    const link =
      this.state.currentTab === 0
        ? "https://www.spid.gov.it"
        : "https://www.prenotazionicie.interno.gov.it/cittadino/n/sc/wizardAppuntamentoCittadino/sceltaComune";
    const text =
      this.state.currentTab === 0
        ? I18n.t("authentication.landing.request_spid")
        : I18n.t("authentication.landing.request_cie");
    return (
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={{
          primary: true,
          title: text,
          onPress: () => openLink(link)
        }}
      />
    );
  };

  public render() {
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("authentication.landing.infoSpidCie")}
      >
        <ScreenContentHeader
          title={I18n.t("authentication.landing.contentTitleCie")}
          subtitle={I18n.t("authentication.landing.spid_or_cie")}
        />
        <Tabs
          tabBarUnderlineStyle={styles.tabBarUnderline}
          tabContainerStyle={styles.tabBarContainer}
          onChangeTab={(e: any) => this.setState({ currentTab: e.i })}
        >
          <Tab
            heading={I18n.t("authentication.spid")}
            activeTextStyle={styles.activeTextStyle}
          >
            <Content>
              <Markdown>
                {I18n.t("authentication.spid_information.spid")}
              </Markdown>
              <VSpacer size={16} />
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
              <VSpacer size={40} />
            </Content>
          </Tab>
          <Tab
            heading={I18n.t("authentication.cie.cie")}
            activeTextStyle={styles.activeTextStyle}
          >
            <Content>
              <Markdown>
                {I18n.t("authentication.landing.cie_information_request")}
              </Markdown>
              <VSpacer size={40} />
            </Content>
          </Tab>
        </Tabs>
        {this.getFooterButton()}
      </BaseScreenComponent>
    );
  }
}

export default SpidCIEInformationScreen;
