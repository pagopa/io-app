/**
 * this modal shows a warning to the user that some IO systems (backend side) could
 * not work properly. This is due to avoid user tries to access features or services potentially can't work
 * as expected
 */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Container } from "native-base";
import * as React from "react";
import { View, Image, Modal, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { Body } from "../../components/core/typography/Body";
import { H1 } from "../../components/core/typography/H1";
import { IOStyles } from "../../components/core/variables/IOStyles";
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
              <View style={IOStyles.alignCenter}>
                <H1>{I18n.t("systemsOff.title")}</H1>
              </View>
              <VSpacer size={16} />
              <View style={IOStyles.alignCenter}>
                {message && <Body>{message}</Body>}
                <Body weight="SemiBold">{I18n.t("systemsOff.closeApp")}</Body>
              </View>
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
