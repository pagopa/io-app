import { View } from "native-base";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../components/core/typography/Body";
import { H5 } from "../../../../components/core/typography/H5";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import I18n from "../../../../i18n";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { isPaymentMethodExpired } from "../../../../utils/paymentMethod";
import { buildExpirationDate } from "../../../../utils/stringBuilder";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import { BlurredPan } from "../../component/card/BlurredPan";
import { BrandImage } from "../../component/card/BrandImage";

type OwnProps = {
  creditCard: CreditCardPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const topLeft = (creditCard: CreditCardPaymentMethod) => {
  const expirationDate = buildExpirationDate(creditCard.info);
  const isCardExpired = isPaymentMethodExpired(creditCard).getOrElse(false);

  return (
    <>
      <BlurredPan>{creditCard.caption}</BlurredPan>
      <View spacer={true} small={true} />
      <H5 color={isCardExpired ? "red" : "bluegreyDark"} weight={"Regular"}>
        {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
      </H5>
    </>
  );
};

const CreditCardComponent = (props: Props): React.ReactElement => (
  <BaseCardComponent
    topLeftCorner={topLeft(props.creditCard)}
    bottomLeftCorner={<Body>{props.nameSurname?.toLocaleUpperCase()}</Body>}
    bottomRightCorner={
      <BrandImage image={getCardIconFromBrandLogo(props.creditCard.info)} />
    }
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  nameSurname: profileNameSurnameSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditCardComponent);
