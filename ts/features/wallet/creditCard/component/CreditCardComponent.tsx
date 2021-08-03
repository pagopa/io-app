import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../components/core/typography/Body";
import { getCardIconFromBrandLogo } from "../../../../components/wallet/card/Logo";
import { profileNameSurnameSelector } from "../../../../store/reducers/profile";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import BaseCardComponent from "../../component/card/BaseCardComponent";
import { BlurredPan } from "../../component/card/BlurredPan";
import { BrandImage } from "../../component/card/BrandImage";

type OwnProps = {
  creditCard: CreditCardPaymentMethod;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const CreditCardComponent = (props: Props): React.ReactElement => (
  <BaseCardComponent
    topLeftCorner={<BlurredPan>{props.creditCard.caption}</BlurredPan>}
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
