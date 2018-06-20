/**
 *  This screen asks to insert the verification code received by SMS.
 *  TODO:
 *  - integrate the TRansaction summary Banner introduced with @https://github.com/teamdigitale/italia-app/pull/213
 *  - check styles @https://www.pivotaltracker.com/n/projects/2048617/stories/158456772
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Icon,
  Input,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import variables from "../../theme/variables";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const styles = StyleSheet.create({
  contentPadding: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },
  textRight: {
    textAlign: "right"
  },
  borded: {
    borderBottomWidth: 1
  }
});

export class VerifyTransactionBySMSScreen extends React.Component<
  Props,
  never
> {
  constructor(props: Props) {
    super(props);
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.sms.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true}>
          <Text> INSERT THE BANNER HERE </Text>
          <View style={styles.contentPadding}>
            <View spacer={true} large={true} />
            <H1>{I18n.t("wallet.sms.title")}</H1>
            <View spacer={true} large={true} />

            <Grid>
              <Col>
                <Text bold={true} note={true}>
                  {I18n.t("wallet.sms.header")}
                </Text>
              </Col>
              <Col>
                <Text note={true} link={true} style={styles.textRight}>
                  {I18n.t("wallet.sms.newCode")}
                </Text>
              </Col>
            </Grid>
            <View spacer={true} />
            <Input style={styles.borded} keyboardType={"numeric"} />
            <View spacer={true} />
            <Text>{I18n.t("wallet.sms.info")}</Text>
          </View>
        </Content>

        <View footer={true}>
          <Button block={true} primary={true}>
            <Text>{I18n.t("wallet.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => this.goBack()}
          >
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
