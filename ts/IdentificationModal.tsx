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
import variables from "./theme/variables";

type ReduxMappedStateProps = {
  identificationState: IdentificationState;
};

type Props = ReduxMappedStateProps & ReduxProps;

/**
 * Type used in the local state to save the result of Pinpad PIN matching.
 * State is "unstarted" if the user still need to insert the PIN.
 * State is "failure" when the PIN inserted by the user do not match the
 * stored one.
 */
type IdentificationByPinState = "unstarted" | "failure";

type State = {
  identificationByPinState: IdentificationByPinState;
};

const contextualHelp = {
  title: I18n.t("pin_login.unlock_screen.help.title"),
  body: () => I18n.t("pin_login.unlock_screen.help.content")
};

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

const onRequestCloseHandler = () => undefined;

/**
 * A component used to identify the the user.
 * The identification process can be activated calling a saga or dispatching the
 * requestIdentification redux action.
 */
class IdentificationModal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      identificationByPinState: "unstarted"
    };
  }

  public render() {
    const { identificationState, dispatch } = this.props;

    if (identificationState.kind !== "started") {
      return null;
    }

    // The identification state is started we need to show the modal
    const {
      pin,
      identificationCancelData,
      identificationSuccessData
    } = identificationState;

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
      <Modal onRequestClose={onRequestCloseHandler} animationType="none">
        <BaseScreenComponent primary={true} contextualHelp={contextualHelp}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={variables.contentPrimaryBackground}
          />
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
                <Button block={true} primary={true} onPress={onPinResetHandler}>
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

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  identificationState: state.identification
});

export default connect(mapStateToProps)(IdentificationModal);
