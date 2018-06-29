/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import { Body, Card, Text } from "native-base";
import * as React from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ViewStyle
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../../i18n";

import color from "color";
import { none, Option, some } from "fp-ts/lib/Option";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
import { connect, Dispatch } from "react-redux";
import {
  deleteCardRequest,
  setFavoriteCard
} from "../../../store/actions/wallet/cards";
import { GlobalState } from "../../../store/reducers/types";
import { getFavoriteCreditCardId } from "../../../store/reducers/wallet/cards";
import { makeFontStyleObject } from "../../../theme/fonts";
import variables from "../../../theme/variables";
import { CreditCard, CreditCardId } from "../../../types/CreditCard";
import ActionIcon from "./ActionIcon";
import CardBody from "./CardBody";
import Logo, { LogoPosition, shouldRenderLogo } from "./Logo";
import { CreditCardStyles } from "./style";

const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(3);

const styles = StyleSheet.create({
  cardStyle: {
    backgroundColor: color(variables.colorWhite)
      .darken(0.05)
      .string(),
    borderRadius: 10,
    marginTop: 20,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: -1
  },
  fullCard: {
    height: 184
  },
  croppedCard: {
    height: 125
  },
  headerCard: {
    height: 58
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotatedCard: {
    transform: [{ perspective: 850 }, { rotateX: "-20deg" }],
    marginBottom: -3
  },
  blueText: {
    color: variables.brandPrimary,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select)
  }
});

type ReduxMappedStateProps = Readonly<{
  isFavoriteCard: boolean;
}>;

type ReduxMappedDispatchProps = Readonly<{
  setFavoriteCard: (item: Option<CreditCardId>) => void;
  deleteCard: (item: CreditCardId) => void;
}>;

export type CardProps = Readonly<{
  item: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
  menu?: boolean;
  favorite?: boolean;
  lastUsage?: boolean;
  whiteLine?: boolean;
  logoPosition?: LogoPosition;
  mainActionNavigation?: string;
  flatBottom?: boolean;
  headerOnly?: boolean;
  rotated?: boolean;
  customStyle?: any;
}>;

type Props = CardProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

/**
 * Credit card component
 */
class CreditCardComponent extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    menu: true,
    favorite: true,
    lastUsage: true,
    whiteLine: false,
    logoPosition: LogoPosition.CENTER,
    mainActionNavigation: undefined,
    flatBottom: false,
    headerOnly: false,
    rotated: false,
    customStyle: undefined
  };

  private toggleFavorite = () => {
    if (this.props.isFavoriteCard) {
      this.props.setFavoriteCard(none);
    } else {
      this.props.setFavoriteCard(some(this.props.item.id));
    }
  };

  private topRightCorner() {
    if (this.props.logoPosition === LogoPosition.TOP) {
      return (
        <Col size={2}>
          {shouldRenderLogo(LogoPosition.TOP, this.props.logoPosition) && (
            <Logo item={this.props.item} />
          )}
        </Col>
      );
    } else {
      return [
        <Col key="favorite" size={1}>
          {this.props.favorite && (
            <TouchableOpacity onPress={this.toggleFavorite}>
              <ActionIcon
                name={
                  this.props.isFavoriteCard ? "io-filled-star" : "io-empty-star"
                }
              />
            </TouchableOpacity>
          )}
        </Col>,
        <Col key="menu" size={1}>
          {this.props.menu && (
            <Menu>
              <MenuTrigger>
                <ActionIcon name="io-more" />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={this.toggleFavorite}>
                  <Text bold={true} style={styles.blueText}>
                    {I18n.t(
                      this.props.isFavoriteCard
                        ? "creditCardComponent.unsetFavourite"
                        : "creditCardComponent.setFavourite"
                    )}
                  </Text>
                </MenuOption>
                <MenuOption
                  onSelect={() =>
                    Alert.alert(
                      I18n.t("creditCardComponent.deleteTitle"),
                      I18n.t("creditCardComponent.deleteMsg"),
                      [
                        {
                          text: I18n.t("global.buttons.cancel"),
                          style: "cancel"
                        },
                        {
                          text: I18n.t("global.buttons.ok"),
                          style: "destructive",
                          onPress: () =>
                            this.props.deleteCard(this.props.item.id)
                        }
                      ],
                      { cancelable: false }
                    )
                  }
                >
                  <Text bold={true} style={styles.blueText}>
                    {I18n.t("global.buttons.delete")}
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          )}
        </Col>
      ];
    }
  }

  public render(): React.ReactNode {
    const { item } = this.props;

    const cardStyles: ReadonlyArray<ViewStyle> = [
      styles.cardStyle,
      this.props.headerOnly
        ? styles.headerCard
        : this.props.lastUsage
          ? styles.fullCard
          : styles.croppedCard,
      this.props.flatBottom ? styles.flatBottom : {},
      this.props.rotated ? styles.rotatedCard : {},
      this.props.customStyle !== undefined ? this.props.customStyle : {}
    ];
    return (
      // tslint:disable-next-line: readonly-array
      <Card style={cardStyles as ViewStyle[]}>
        <Body>
          <Grid>
            <Col size={1} />
            <Col size={19}>
              <Grid>
                <Row size={1} />
                <Row size={6} style={CreditCardStyles.rowStyle}>
                  <Col size={7}>
                    <Text
                      style={[
                        CreditCardStyles.textStyle,
                        CreditCardStyles.largeTextStyle
                      ]}
                    >
                      {`${HIDDEN_CREDITCARD_NUMBERS}${item.pan.slice(-4)}`}
                    </Text>
                  </Col>

                  {this.topRightCorner()}
                </Row>
                {!this.props.headerOnly && <CardBody {...this.props} />}
              </Grid>
            </Col>

            <Col size={1} />
          </Grid>
        </Body>
      </Card>
    );
  }
}

const mapStateToProps = (
  state: GlobalState,
  props: CardProps
): ReduxMappedStateProps => {
  const favoriteCard = getFavoriteCreditCardId(state);
  return {
    isFavoriteCard:
      favoriteCard.isSome() && favoriteCard.value === props.item.id
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  setFavoriteCard: (item: Option<CreditCardId>) =>
    dispatch(setFavoriteCard(item)),
  deleteCard: (item: CreditCardId) => dispatch(deleteCardRequest(item))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardComponent);
