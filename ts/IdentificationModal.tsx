import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { Modal, StatusBar } from "react-native";
import { connect } from "react-redux";

import Pinpad from "./components/Pinpad";
import BaseScreenComponent from "./components/screens/BaseScreenComponent";
import IconFont from "./components/ui/IconFont";
import TextWithIcon from "./components/ui/TextWithIcon";
import I18n from "./i18n";
import {
  identificationCancel,
  identificationFailure,
  identificationPinReset,
  identificationSuccess
} from "./store/actions/identification";
import { ReduxProps } from "./store/actions/types";
import { IdentificationState } from "./store/reducers/identification";
import { GlobalState } from "./store/reducers/types";

type MapStateToProps = {
  identification: IdentificationState;
};

type Props = MapStateToProps & ReduxProps;

type IdentificationByPinState = "unstarted" | "failure";

type State = {
  identificationByPinState: IdentificationByPinState;
};

const contextualHelp = {
  title: I18n.t("pin_login.unlock_screen.help.title"),
  body: () => I18n.t("pin_login.unlock_screen.help.content")
};

const onRequestCloseHandler = () => undefined;

const renderIdentificationByPinState = (
  identificationByPinState: IdentificationByPinState
) => {
  if (identificationByPinState === "failure") {
    return (
      <React.Fragment>
        <View spacer={true} extralarge={true} />
        <TextWithIcon danger={true}>
          <IconFont name="io-close" color={"white"} />
          <Text white={true}>{I18n.t("pin_login.pin.confirmInvalid")}</Text>
        </TextWithIcon>
      </React.Fragment>
    );
  }

  return null;
};

class IdentificationModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      identificationByPinState: "unstarted"
    };
  }

  public render() {
    const { identification, dispatch } = this.props;

    // If the identification state is started we need to show the modal
    if (identification.kind === "started") {
      const {
        pin,
        identificationCancelData,
        identificationSuccessData
      } = identification;

      const { identificationByPinState } = this.state;

      /**
       * Create handlers merging default internal actions (to manage the identification state)
       * with, if available, custom actions passed as props.
       */
      const onIdentificationCancelHandler = () => {
        if (identificationCancelData) {
          dispatch(identificationCancelData.action);
        }
        dispatch(identificationCancel());
      };

      const onIdentificationSuccessHandler = () => {
        if (identificationSuccessData) {
          dispatch(identificationSuccessData.action);
        }
        dispatch(identificationSuccess());
      };

      const onIdentificationFailureHandler = () => {
        dispatch(identificationFailure());
      };

      const onPinResetHandler = () => {
        dispatch(identificationPinReset());
      };

      return (
        <Modal
          visible={true}
          transparent={true}
          onRequestClose={onRequestCloseHandler}
        >
          <BaseScreenComponent primary={true} contextualHelp={contextualHelp}>
            <StatusBar barStyle="light-content" />
            <Content primary={true}>
              <View spacer={true} extralarge={true} />
              <Text white={true} alignCenter={true}>
                {I18n.t("pin_login.pin.pinInfo")}
              </Text>
              <Pinpad
                compareWithCode={pin as string}
                activeColor={"white"}
                inactiveColor={"white"}
                onFulfill={(_: string, __: boolean) =>
                  this.onPinFullfill(
                    _,
                    __,
                    onIdentificationSuccessHandler,
                    onIdentificationFailureHandler
                  )
                }
                clearOnInvalid={true}
              />
              {renderIdentificationByPinState(identificationByPinState)}
              <View spacer={true} extralarge={true} />
              <View>
                {identificationCancelData !== undefined && (
                  <Button
                    block={true}
                    primary={true}
                    onPress={onIdentificationCancelHandler}
                  >
                    <Text>{identificationCancelData.label}</Text>
                  </Button>
                )}
                {identificationCancelData === undefined && (
                  <Button
                    block={true}
                    primary={true}
                    onPress={onPinResetHandler}
                  >
                    <Text>{I18n.t("pin_login.pin.reset.button")}</Text>
                  </Button>
                )}
                <View spacer={true} />
                <Text white={true}>{I18n.t("pin_login.pin.reset.tip")}</Text>
              </View>
            </Content>
          </BaseScreenComponent>
        </Modal>
      );
    }

    return null;
  }

  private onPinFullfill = (
    _: string,
    isValid: boolean,
    onIdentificationSuccessHandler: () => void,
    onIdentificationFailureHandler: () => void
  ) => {
    if (isValid) {
      this.setState({
        identificationByPinState: "unstarted"
      });
      onIdentificationSuccessHandler();
    } else {
      this.setState({
        identificationByPinState: "failure"
      });

      onIdentificationFailureHandler();
    }
  };
}

const mapStateToProps = (state: GlobalState): MapStateToProps => ({
  identification: state.identification
});

export default connect(mapStateToProps)(IdentificationModal);
