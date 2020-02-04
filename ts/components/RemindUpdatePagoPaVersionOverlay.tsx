import I18n from "i18n-js";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, Linking, Platform, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { navigateBack } from "../store/actions/navigation";
import { Dispatch } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";
import { getPagoPaMinAppVersion } from "../utils/appVersion";

type OwnProp = {
  onClose?: () => void;
};
type Props = ReturnType<typeof mapStateToProps> & OwnProp;

type State = { hasError: boolean };

const styles = StyleSheet.create({
  imageChecked: {
    alignSelf: "center"
  },
  emailTitle: {
    textAlign: "center"
  },
  textDanger: {
    marginTop: customVariables.contentPadding,
    fontSize: 18,
    textAlign: "center",
    color: customVariables.brandDanger
  }
});

const timeoutErrorMsg: Millisecond = 5000 as Millisecond;

const storeUrl = Platform.select({
  ios: "itms-apps://itunes.apple.com/it/app/testflight/id899247664?mt=8",
  android: "market://details?id=it.teamdigitale.app.italiaapp"
});

class RemindUpdatePagoPaVersionOverlay extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  private idTimeout?: number;

  public componentWillUnmount() {
    if (this.idTimeout) {
      clearTimeout(this.idTimeout);
    }
  }

  private openAppStore = () => {
    // the error is already displayed
    if (this.state.hasError) {
      return;
    }
    Linking.openURL(storeUrl).catch(() => {
      // Change state to show the error message
      this.setState({
        hasError: true
      });
      // After 5 seconds restore state
      // tslint:disable-next-line: no-object-mutation
      this.idTimeout = setTimeout(() => {
        this.setState({
          hasError: false
        });
      }, timeoutErrorMsg);
    });
  };

  public render() {
    return (
      <Content style={{ flex: 1 }}>
        <React.Fragment>
          <Image
            style={styles.imageChecked}
            source={require("../../img/icons/update-icon.png")}
          />
          <View spacer={true} extralarge={true} />
        </React.Fragment>
        <H2 style={styles.emailTitle}>
          {I18n.t("wallet.alert.titlePagoPaUpdateApp")}
        </H2>
        <View spacer={true} />

        <Text>{I18n.t("wallet.alert.messagePagoPaUpdateApp")}</Text>

        {this.state.hasError && (
          <React.Fragment>
            <View spacer={true} />
            <Text style={styles.textDanger}>
              {I18n.t("wallet.alert.msgErrorUpdateApp")}
            </Text>
          </React.Fragment>
        )}

        <View spacer={true} />

        <Button
          block={true}
          light={true}
          bordered={true}
          disabled={false}
          onPress={this.openAppStore}
        >
          <Text>{I18n.t("wallet.alert.btnUpdateApp")}</Text>
        </Button>
      </Content>
    );
  }
}

const mapStateToProps = (state: GlobalState) => {
  const minPagoPaVersion = getPagoPaMinAppVersion(state);
  return {
    minPagoPaVersion
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateBack: () => dispatch(navigateBack())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemindUpdatePagoPaVersionOverlay);
