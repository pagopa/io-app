import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StyleSheet } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H5 } from "../../../../components/core/typography/H5";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import IconFont from "../../../../components/ui/IconFont";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import I18n from "../../../../i18n";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../../store/reducers/wallet/wallets";
import variables from "../../../../theme/variables";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { TestID } from "../../../../types/WithTestID";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";
import { buildExpirationDate } from "../../../../utils/stringBuilder";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import { BlurredPan } from "../../component/card/BlurredPan";
import { BrandImage } from "../../component/card/BrandImage";

type OwnProps = {
  creditCard: CreditCardPaymentMethod;
} & TestID;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

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
  const isCardExpired = isPaymentMethodExpired(creditCard).getOrElse(false);

  return (
    <View style={styles.row}>
      <View style={IOStyles.flex}>
        <BlurredPan>{creditCard.caption}</BlurredPan>
        <View spacer={true} small={true} />
        <H5 color={isCardExpired ? "red" : "bluegreyDark"} weight={"Regular"}>
          {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
        </H5>
      </View>
      {pot.getOrElse(favorite, false) && (
        <IconFont name={"io-filled-star"} color={variables.brandPrimary} />
      )}
    </View>
  );
};

/**
 * The digital representation of the credit card, displaying the pan last 4 digit, the owner name and the expiring date
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
      topLeftCorner={topLeft(props.creditCard, favorite)}
      bottomLeftCorner={<Body>{props.nameSurname?.toLocaleUpperCase()}</Body>}
      bottomRightCorner={
        <BrandImage image={getCardIconFromBrandLogo(props.creditCard.info)} />
      }
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state),
  favoriteWalletId: getFavoriteWalletId(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardComponent);
