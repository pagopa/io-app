import * as React from "react";

import {
  idPayAreInitiativesFromInstrumentErrorSelector,
  idPayEnabledInitiativesFromInstrumentSelector
} from "../store/reducers";
import {
  idPayInitiativesFromInstrumentGet,
  idpayInitiativesFromInstrumentRefreshEnd,
  idpayInitiativesFromInstrumentRefreshStart
} from "../store/actions";

import { useFocusEffect } from "@react-navigation/native";
import { useIODispatch } from "../../../../store/hooks";
import { useSelector } from "react-redux";

export const useIDPayInitiativesFromInstrument = (idWallet: string) => {
  const dispatch = useIODispatch();
  const initiativesList = useSelector(
    idPayEnabledInitiativesFromInstrumentSelector
  );
  // const areInitiativesInError = useSelector(
  // idPayAreInitiativesFromInstrumentErrorSelector
  // );
  useFocusEffect(
    React.useCallback(() => {
      console.log("CALLBACK HOOOOK!!!!!");
      dispatch(
        idpayInitiativesFromInstrumentRefreshStart({
          idWallet,
          isRefreshCall: false
        })
      );
      return () => {
        dispatch(idpayInitiativesFromInstrumentRefreshEnd);
      };
    }, [idWallet, dispatch])
  );

  return {
    initiativesList
  };
};
