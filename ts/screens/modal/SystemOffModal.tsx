/**
 * this modal shows a warning to the user that some IO systems (backend side) could
 * not work properly. This is due to avoid user tries to access features or services potentially can't work
 * as expected
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Container, Text as NBText } from "native-base";
import * as React from "react";
import { View, Image, Modal, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { H1 } from "../../components/core/typography/H1";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { backendServicesStatusSelector } from "../../store/reducers/backendStatus";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";

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
    const message = pipe(
      this.props.backendStatus.status,
      O.map(s =>
        s.message[locale] !== undefined && s.message[locale].length > 0
          ? s.message[locale]
          : undefined
      ),
      O.toUndefined
    );
    return (
      <Modal>
        <BaseScreenComponent
          appLogo={true}
          goBack={false}
          accessibilityEvents={{ avoidNavigationEventsUsage: true }}
        >
          <Container>
            <View style={styles.container}>
              <React.Fragment>
                <Image
                  style={styles.image}
                  source={require("../../../img/servicesStatus/error-detail-icon.png")}
                />
                <VSpacer size={40} />
              </React.Fragment>
              <H1 style={styles.title}>{I18n.t("systemsOff.title")}</H1>
              <VSpacer size={16} />
              {message && <NBText style={styles.subTitle}>{message}</NBText>}
              <NBText style={styles.subTitle} bold={true}>
                {I18n.t("systemsOff.closeApp")}
              </NBText>
            </View>
          </Container>
        </BaseScreenComponent>
      </Modal>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  backendStatus: backendServicesStatusSelector(state)
});

export default connect(mapStateToProps)(SystemOffModal);
