import * as React from "react";
import { StyleSheet } from "react-native";
import pagoBancomatImage from "../../../../../../img/wallet/cards-icons/pagobancomat.png";
import { Body } from "../../../../../components/core/typography/Body";
import { EnhancedBancomat } from "../../../../../store/reducers/wallet/wallets";
import { CardPreview } from "../../../component/CardPreview";

type Props = { bancomat: EnhancedBancomat };

const styles = StyleSheet.create({});

export const BancomatWalletPreview: React.FunctionComponent<Props> = props => (
  <CardPreview
    left={<Body>{props.bancomat.abiInfo?.name}</Body>}
    image={pagoBancomatImage}
  />
);
