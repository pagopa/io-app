import I18n from "i18n-js";
import { Content, H3, Text, View } from "native-base";
import * as React from "react";
import { Image, Keyboard } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import DonationVideoWebView from "../../../components/donations/DonationVideoWebView";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import H5 from "../../../components/ui/H5";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import customVariables from "../../../theme/variables";
import { mockedItem } from "./DonationsHomeScreen";
import BlockButtons from '../../../components/ui/BlockButtons';
import { AmountInEuroCents } from 'italia-pagopa-commons/lib/pagopa';

type NavigationParams = Readonly<{
  item: mockedItem;
}>;

type Props = NavigationInjectedProps<NavigationParams> &
  LightModalContextInterface;

class DonationDetailScreen extends React.PureComponent<Props> {
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

  private startDonation = (amount: AmountInEuroCents) => {
    /** 
     * TODO: 
     * - request payment identificator and 
     * - then proceed as a traditional payment
     * - mark the transaction as donation (if not provided by the payment manager)
     */
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
            <Image
              source={{ uri: this.item.cover }}
              style={{
                width: "100%",
                height: 210
              }}
            />
          </TouchableDefaultOpacity>
          <View spacer={true} />
          <Text style={{ paddingHorizontal: customVariables.contentPadding }}>
            {this.item.description}
          </Text>
          <View spacer={true}/> 
        </Content>
        <View footer={true}>
          <BlockButtons 
            type={'ThreeButtonsInLine'}
            leftButton={{
              title: I18n.t('donations.detail.donate', {amount: this.item.amounts[0]}),
              onPress: () => this.startDonation(this.item.amounts[0])
            }}
            midButton={{
              title: I18n.t('donations.detail.donate', {amount: this.item.amounts[1]}),
              onPress: () => this.startDonation(this.item.amounts[1])
            }}
            rightButton={{
              title: I18n.t('donations.detail.donate', {amount: this.item.amounts[2]}),
              onPress: () => this.startDonation(this.item.amounts[2])
            }}
          />
          <View spacer={true}/>
          <BlockButtons 
            type={'SingleButton'} 
            leftButton={{
              bordered: true,
              title: I18n.t('donations.detail.choose')
            }}
          />
        </View>
      </BaseScreenComponent>
    );
  }
}

export default withLightModalContext(DonationDetailScreen);
