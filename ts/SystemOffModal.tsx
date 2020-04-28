/**
 * this modal shows a warning to the user that some IO systems (backend side) could
 * not work properly. This is due to avoid user tries to access features or services potentially can't work
 * as expected
 */
import I18n from "i18n-js";
import { Content, H2, Text, View } from "native-base";
import * as React from "react";
import { Image, Modal, StyleSheet } from "react-native";
import { connect } from "react-redux";
import BaseScreenComponent from "./components/screens/BaseScreenComponent";
import { backendServicesStatusSelector } from "./store/reducers/backendStatus";
import { GlobalState } from "./store/reducers/types";
import customVariables from "./theme/variables";

type Props = ReturnType<typeof mapStateToProps>;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: customVariables.contentPadding,
    alignSelf: "center"
  },
  title: {
    textAlign: "center"
  },
  subTitle: {
    textAlign: "center"
  },
  image: {
    alignSelf: "center"
  }
});

class SystemOffModal extends React.PureComponent<Props> {
  public render() {
    const locale = I18n.currentLocale() === "en" ? "en-EN" : "it-IT";
    const message = this.props.backendStatus.status
      .map(
        s =>
          s.message[locale] !== undefined && s.message[locale].length > 0
            ? s.message[locale]
            : undefined
      )
      .getOrElse(undefined);
    return (
      <Modal>
        <BaseScreenComponent appLogo={true} goBack={false}>
          <Content>
            <Image
              style={styles.image}
              source={require("../img/servicesStatus/error-detail-icon.png")}
            />
            <View spacer={true} extralarge={true} />
            <H2 style={styles.title}>{I18n.t("systemsOff.title")}</H2>
            <View spacer={true} />
            {message && <Text style={styles.subTitle}>{message}</Text>}
            <Text style={styles.subTitle} bold={true}>
              {I18n.t("systemsOff.closeApp")}
            </Text>
          </Content>
        </BaseScreenComponent>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  backendStatus: backendServicesStatusSelector(state)
});

export default connect(mapStateToProps)(SystemOffModal);
