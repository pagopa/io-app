import * as React from "react";
import { StyleSheet } from "react-native";
import { Row, Col } from 'react-native-easy-grid';
import { CreditCardStyles } from './style';
import { Text, Right } from "native-base";
import { LastUsageRow } from './LastUsageRow';
import I18n from "../../../i18n";
import { ActionIcon } from './ActionIcon';
import Logo, { LogoPosition, shouldRenderLogo } from './Logo';
import { Props } from ".";
import variables from "../../../theme/variables";


const styles = StyleSheet.create({
  whiteBarStyle: {
    borderWidth: 0,
    borderBottomColor: variables.colorWhite,
    borderBottomWidth: 2,
    width: "100%"
  }
});

export class CardBody extends React.Component<Props> {

  private middleRightSide() {
    const { logoPosition, mainActionNavigation } = this.props;
    if (logoPosition === LogoPosition.TOP) {
      // the > can be displayed
      return (
        <Row style={CreditCardStyles.rowStyle}>
          <Right>
            <ActionIcon
              name="io-right"
              size={variables.iconSize2}
              onPress={() =>
                mainActionNavigation !== undefined ?
                this.props.navigation.navigate(mainActionNavigation) :
                undefined
              }
            />
          </Right>
        </Row>
      );
    } else {
      return  shouldRenderLogo(LogoPosition.CENTER, this.props.logoPosition) ? <Logo item={this.props.item}/> : null;
    }
  }

  private whiteLine() {
    if (this.props.lastUsage === true || this.props.whiteLine === true) {
      return (
        <Row key="whiteLine" size={2} style={styles.whiteBarStyle} />
      );
    }
    return null;
  }

  public render() {
    const { item, navigation } = this.props;
    return [
      <Row key="validity" size={4} style={CreditCardStyles.rowStyle}>
        <Text
          style={[CreditCardStyles.textStyle, CreditCardStyles.smallTextStyle]}
        >
          {`${I18n.t("creditCardComponent.validUntil")} ${item.expirationDate}`}
        </Text>
      </Row>,
      <Row key="owner" size={6} style={CreditCardStyles.rowStyle}>
        <Col size={7}>
          <Text style={CreditCardStyles.textStyle}>
            {item.owner.toUpperCase()}
          </Text>
        </Col>
        <Col size={2}>{this.middleRightSide()}</Col>
      </Row>,
      null,
      this.whiteLine(),
      <LastUsageRow {...{navigation, item, showMsg: this.props.lastUsage, key: "bottomRow"} }/>
    ];
  }
}