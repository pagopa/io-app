import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { View } from "react-native";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../components/core/typography/Body";
import { H5 } from "../../../../components/core/typography/H5";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../../store/reducers/wallet/wallets";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { TestID } from "../../../../types/WithTestID";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";
import { buildExpirationDate } from "../../../../utils/stringBuilder";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import { BlurredPan } from "../../component/card/BlurredPan";
import { BrandImage } from "../../component/card/BrandImage";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Icon } from "../../../../components/core/icons/Icon";

type OwnProps = {
  creditCard: CreditCardPaymentMethod;
} & TestID;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

/**
 * Generate the accessibility label for the card.
 */
const getAccessibilityRepresentation = (
  creditCard: CreditCardPaymentMethod
) => {
  const cardRepresentation = I18n.t("wallet.accessibility.folded.creditCard", {
    brand: creditCard.info.brand,
    blurredNumber: creditCard.info.blurredNumber
  });

  const validity = `${I18n.t("cardComponent.validUntil")} ${buildExpirationDate(
    creditCard.info
  )}`;

  const computedHolder =
    creditCard.info?.holder !== undefined
      ? `, ${I18n.t("wallet.accessibility.cardHolder")} ${
          creditCard.info.holder
        }`
      : "";

  return `${cardRepresentation}, ${validity}${computedHolder}`;
};

/**
 * Add a row; on the left the blurred pan + expire date, on the right the favourite star icon
 * @param creditCard
 * @param favorite
 */
const topLeft = (
  creditCard: CreditCardPaymentMethod,
  favorite: pot.Pot<boolean, Error>
) => {
  const expirationDate = buildExpirationDate(creditCard.info);
  const isCardExpired = pipe(
    isPaymentMethodExpired(creditCard),
    E.getOrElse(() => false)
  );

  return (
    <View style={IOStyles.rowSpaceBetween}>
      <View style={IOStyles.flex}>
        <BlurredPan>{creditCard.caption}</BlurredPan>
        <VSpacer size={8} />
        <H5 color={isCardExpired ? "red" : "bluegreyDark"} weight={"Regular"}>
          {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
        </H5>
      </View>
      {pot.getOrElse(favorite, false) && (
        <Icon name="legStarFilled" color="blue" />
      )}
    </View>
  );
};

/**
 * The digital representation of the credit card, displaying the pan last 4 digit, the holder name and the expiring date
 * @param props
 * @constructor
 */
const CreditCardComponent = (props: Props): React.ReactElement => {
  const favorite = pot.map(
    props.favoriteWalletId,
    _ => _ === props.creditCard.idWallet
  );
  return (
    <BaseCardComponent
      testID={props.testID}
      accessibilityLabel={getAccessibilityRepresentation(props.creditCard)}
      topLeftCorner={topLeft(props.creditCard, favorite)}
      bottomLeftCorner={
        <Body>{props.creditCard?.info?.holder?.toUpperCase() ?? ""}</Body>
      }
      bottomRightCorner={
        <BrandImage image={getCardIconFromBrandLogo(props.creditCard.info)} />
      }
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  favoriteWalletId: getFavoriteWalletId(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardComponent);
