/**
 * A screen where the user can know more about spid and access to spid.gov.it
 */
import { Col, Content, Grid, H1, H2, Row, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { openLink } from "../../components/ui/Markdown/handlers/link";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type Props = NavigationInjectedProps;

const styles = StyleSheet.create({
  value: {
    alignSelf: "flex-start",
    color: variables.brandPrimary,
    paddingTop: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});

const browseToLink = () => openLink("https://www.spid.gov.it");

class SpidInformationScreen extends React.Component<Props, never> {
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

  public render() {
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("authentication.spid_information.headerTitle")}
      >
        <Content>
          <H1>{I18n.t("authentication.spid_information.contentTitle")}</H1>

          <View spacer={true} large={true} />
          <Text>{I18n.t("authentication.spid_information.paragraph1")}</Text>
          <View spacer={true} extralarge={true} />

          <H1>{I18n.t("authentication.spid_information.subtitle")}</H1>
          <View spacer={true} />
          <Text>
            {I18n.t("authentication.spid_information.paragraph2-part1")}
            <Text bold={true}>
              {I18n.t("authentication.spid_information.paragraph2-bold")}
            </Text>
            <Text>
              {` ${I18n.t("authentication.spid_information.paragraph2-part2")}`}
            </Text>
          </Text>
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
          <ButtonDefaultOpacity
            block={true}
            primary={true}
            onPress={browseToLink}
          >
            <Text>{I18n.t("authentication.spid_information.knowMore")}</Text>
          </ButtonDefaultOpacity>
        </View>
      </BaseScreenComponent>
    );
  }
}

export default connect()(SpidInformationScreen);
