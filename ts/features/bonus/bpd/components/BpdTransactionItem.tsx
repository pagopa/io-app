import * as React from "react";
import { StyleSheet } from "react-native";
import { BpdTransaction } from "../store/actions/transactions";
import { BaseBpdTransactionItem } from "./BaseBpdTransactionItem";

type Props = {
  transaction: BpdTransaction;
};

const styles = StyleSheet.create({});

export const BpdTransactionItem: React.FunctionComponent<Props> = props => (
  <BaseBpdTransactionItem
    image={}
    title={}
    subtitle={props.transaction.amount.toString()}
    rightText={props.transaction.cashback.toString()}
  />
);
