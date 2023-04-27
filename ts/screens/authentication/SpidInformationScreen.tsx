/**
 * A screen where the user can know more about spid and access to spid.gov.it
 */
import { Col, Content, Grid, Row, Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { openLink } from "../../components/ui/Markdown/handlers/link";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { AuthenticationParamsList } from "../../navigation/params/AuthenticationParamsList";

type Props = IOStackNavigationRouteProps<
  AuthenticationParamsList,
  "AUTHENTICATION_SPID_INFORMATION"
>;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8
  }
});

const browseToLink = () => openLink("https://www.spid.gov.it");

class SpidInformationScreen extends React.Component<Props, never> {
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

  public render() {
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("authentication.spid_information.headerTitle")}
      >
        <Content>
          <H1
            accessible={true}
            weight="Bold"
            testID={"screen-content-header-title"}
          >
            {I18n.t("authentication.spid_information.contentTitle")}
          </H1>

          <VSpacer size={16} />
          <Body>{I18n.t("authentication.spid_information.paragraph1")}</Body>
          <VSpacer size={40} />

          <H1>{I18n.t("authentication.spid_information.subtitle")}</H1>
          <VSpacer size={16} />
          <Body>
            {I18n.t("authentication.spid_information.paragraph2-part1")}
            <Body weight="SemiBold">
              {I18n.t("authentication.spid_information.paragraph2-bold")}
            </Body>
            <Body>
              {` ${I18n.t("authentication.spid_information.paragraph2-part2")}`}
            </Body>
          </Body>
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

        <View style={IOStyles.footer}>
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            onPress={browseToLink}
          >
            <NBButtonText>
              {I18n.t("authentication.spid_information.knowMore")}
            </NBButtonText>
          </ButtonDefaultOpacity>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default connect()(SpidInformationScreen);
