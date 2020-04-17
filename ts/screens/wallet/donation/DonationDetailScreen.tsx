import I18n from "i18n-js";
import { AmountInEuroCents } from "italia-pagopa-commons/lib/pagopa";
import { Content, H3, Text, View } from "native-base";
import * as React from "react";
import {
  EmitterSubscription,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import DonationVideoWebView from "../../../components/donations/DonationVideoWebView";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import BlockButtons from "../../../components/ui/BlockButtons";
import H5 from "../../../components/ui/H5";
import IconFont from "../../../components/ui/IconFont";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import customVariables from "../../../theme/variables";
import { mockedItem } from "./DonationsHomeScreen";

type NavigationParams = Readonly<{
  item: mockedItem;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  LightModalContextInterface;

type State = Readonly<{
  showCustomDonationInput: boolean;
  keyboardKey: number;
}>;

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    height: 210
  }
});

class DonationDetailScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showCustomDonationInput: false,
      keyboardKey: 0
    };
  }

  get item(): mockedItem {
    return this.props.navigation.getParam("item");
  }

  private renderHeader = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between"
      }}
    >
      <View style={{ flex: 1 }}>
        <H5>{this.item.organization_name}</H5>
        <Text>{this.item.department_name}</Text>
      </View>
      <Image
        source={{ uri: this.item.service_icon }}
        style={{
          resizeMode: "contain",
          height: 48,
          width: 60,
          alignSelf: "flex-start"
        }}
      />
    </View>
  );

  private showVideo = () => {
    Keyboard.dismiss();
    this.props.showAnimatedModal(
      <DonationVideoWebView onClose={this.props.hideModal} item={this.item} />
    );
  };

  private inputRef = React.createRef<TextInput>();
  private manageKeyboard = () => {
    this.setState({ showCustomDonationInput: true });
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  };

  private startDonation = (amount: AmountInEuroCents) => {
    /**
     * TODO:
     * - request payment identificator and
     * - then proceed as a traditional payment
     * - mark the transaction as donation (if not provided by the payment manager)
     */
  };

  private InputContent = (
    // TODO: add control on value: it should be >= to 1000 euros
    <View
      footer={true}
      style={{
        width: "100%",
        paddingHorizontal: customVariables.contentPadding
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <H5>{I18n.t("donations.detail.choose")}</H5>
        <IconFont
          name={"io-close"}
          color={customVariables.brandDarkGray}
          onPress={() => this.setState({ showCustomDonationInput: false })}
        />
      </View>

      <View spacer={true} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "100%"
          }}
        >
          <TextInput
            ref={this.inputRef}
            keyboardType={"number-pad"}
            maxLength={4}
            style={{
              borderRadius: 8,
              flex: 1,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: customVariables.brandPrimary,
              height: customVariables.btnHeight,
              fontSize: 24,
              lineHeight: 30,
              textAlign: "right",
              fontWeight: "700",
              paddingHorizontal: customVariables.btnXSmallLineHeight
            }}
          />
          <View hspacer={true} />
          <Text
            style={{
              lineHeight: customVariables.btnHeight,
              fontSize: 24,
              color: customVariables.colorBlack
            }}
            bold={true}
          >
            {I18n.t("global.symbols.euro")}
          </Text>
          <View hspacer={true} extralarge={true} />
        </View>
        <ButtonDefaultOpacity
          style={{ flex: 1 }}
          onPress={
            () =>
              this.startDonation(
                "123" as AmountInEuroCents
              ) /** take the input content and proceed */
          }
        >
          <Text>{I18n.t("global.buttons.continue")}</Text>
        </ButtonDefaultOpacity>
      </View>
    </View>
  );

  private FooterButtons = (
    <View footer={true}>
      <BlockButtons
        type={"ThreeButtonsInLine"}
        leftButton={{
          title: I18n.t("donations.detail.donate", {
            amount: this.item.amounts[0]
          }),
          onPress: () => this.startDonation(this.item.amounts[0])
        }}
        midButton={{
          title: I18n.t("donations.detail.donate", {
            amount: this.item.amounts[1]
          }),
          onPress: () => this.startDonation(this.item.amounts[1])
        }}
        rightButton={{
          title: I18n.t("donations.detail.donate", {
            amount: this.item.amounts[2]
          }),
          onPress: () => this.startDonation(this.item.amounts[2])
        }}
      />
      <View spacer={true} />
      <BlockButtons
        type={"SingleButton"}
        leftButton={{
          bordered: true,
          title: I18n.t("donations.detail.choose"),
          onPress: this.manageKeyboard
        }}
      />
    </View>
  );

  public componentDidUpdate(_: Props, prevState: State) {
    // manage visibility of the custom donation text input
    if (
      this.state.showCustomDonationInput !==
        prevState.showCustomDonationInput &&
      this.inputRef.current
    ) {
      if (this.state.showCustomDonationInput === true) {
        this.inputRef.current.focus();
      } else {
        Keyboard.dismiss();
      }
    }

    // grant the text input is hidden when the keyboard lost the focus
    if (this.state.keyboardKey !== prevState.keyboardKey) {
      this.setState({ showCustomDonationInput: false });
    }
  }

  private keyboardHideListener?: EmitterSubscription;

  private updateKeyboardKey = () => {
    const currentKey = this.state.keyboardKey;
    this.setState({
      keyboardKey: currentKey + 1
    });
  };

  public componentDidMount() {
    // tslint:disable-next-line:no-object-mutation
    this.keyboardHideListener = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      this.updateKeyboardKey.bind(this)
    );
  }

  public componentWillUnmount() {
    if (this.keyboardHideListener) {
      this.keyboardHideListener.remove();
    }
  }

  public render() {
    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("donations.detail.header")}
      >
        <Content noPadded={true}>
          <View style={{ paddingHorizontal: customVariables.contentPadding }}>
            <View spacer={true} extralarge={true} />
            {this.renderHeader()}
            <View spacer={true} extralarge={true} />

            <H3>{this.item.service_name}</H3>
          </View>

          <View spacer={true} />

          <TouchableDefaultOpacity onPress={this.showVideo}>
            {/** TODO: add icon for representing reproducible video */}
            <Image source={{ uri: this.item.cover }} style={styles.cover} />
          </TouchableDefaultOpacity>
          <View spacer={true} />
          <Text style={{ paddingHorizontal: customVariables.contentPadding }}>
            {this.item.description}
          </Text>
          <View spacer={true} />
        </Content>

        {this.state.showCustomDonationInput
          ? this.InputContent
          : this.FooterButtons}
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "height" : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: customVariables.contentPadding
          })}
          key={this.state.keyboardKey}
        />
      </BaseScreenComponent>
    );
  }
}

export default withLightModalContext(DonationDetailScreen);
