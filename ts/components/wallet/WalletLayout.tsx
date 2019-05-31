/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { 
  Animated,
  StyleProp, 
  StyleSheet, 
  ViewStyle 
} from "react-native";
import { NavigationEvents } from "react-navigation";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";
import AppHeader from "../ui/AppHeader";
import IconFont from "../ui/IconFont";
import PagoPALogo from "./PagoPALogo";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },

  noalias: {
    marginRight: 0
  },

  white: {
    color: variables.colorWhite
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },

  animatedSubHeader: {
    position: "absolute",
    top: 90, // header height TODO: get as variables if possible
    left: 0,
    right: 0,
    backgroundColor: variables.colorWhite,
    overflow: "hidden"
  },

  animatedSubHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: variables.contentPadding
  },

  level1: {
    zIndex: 100
  },

  level2: {
    zIndex: -50
  },

  level3: {
    zIndex: -100  
  }
});

type Props = Readonly<{
  title: string;
  headerContents?: React.ReactNode;
  onNewPaymentPress?: () => void;
  allowGoBack: boolean;
  displayedWallets?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  fixedSubHeader?: React.ReactNode;
  interpolationVars?: ReadonlyArray<number>;
}>;

type State = Readonly<{
  scrollY: Animated.Value;
}>;

const INITIAL_STATE = {
  scrollY: new Animated.Value(0)
};

export default class WalletLayout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private scrollableContentRef = React.createRef<any>();

  private scrollToTop = () => {
    this.scrollableContentRef.current.getNode().scrollTo({ y: 0 });
  };

  public render(): React.ReactNode {
    const { interpolationVars } = this.props;

    const subHeaderTranslaction =
      interpolationVars && interpolationVars.length === 3
        ? this.state.scrollY.interpolate({
            inputRange: [
              0,
              interpolationVars[1] - interpolationVars[2],
              interpolationVars[1] + interpolationVars[2]
            ],
            outputRange: [-interpolationVars[0], 0, 0],
            extrapolate: "clamp"
          })
        : 0;

    return (
      <Container>
        <AppHeader
          style={[styles.darkGrayBg, styles.level1]}
          noLeft={!this.props.allowGoBack}
        >
          {this.props.allowGoBack && (
            <Left>
              <GoBackButton white={true} style={styles.noalias} />
            </Left>
          )}
          <Body>
            <PagoPALogo />
          </Body>
          <Right>
            <InstabugButtons color={variables.colorWhite} />
          </Right>
        </AppHeader>

        <Animated.ScrollView
          bounces={false}
          style={[
            styles.level3,
            this.props.contentStyle ? this.props.contentStyle : styles.whiteBg
          ]}
          ref={this.scrollableContentRef}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          <NavigationEvents onWillFocus={this.scrollToTop} />
          <Content
            scrollEnabled={false}
            style={[styles.darkGrayBg, styles.noBottomPadding]}
          >
            {this.props.headerContents}
            {this.props.displayedWallets}
          </Content>
          {this.props.children}
        </Animated.ScrollView>

        <Animated.View
          style={[
            styles.level2,
            styles.animatedSubHeader,
            {
              transform: [
                {
                  translateY: subHeaderTranslaction
                }
              ]
            }
          ]}
        >
          {this.props.fixedSubHeader}
        </Animated.View>

        {this.props.onNewPaymentPress && (
          <View footer={true}>
            <Button block={true} onPress={this.props.onNewPaymentPress}>
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}
