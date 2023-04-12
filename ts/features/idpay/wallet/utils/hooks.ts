import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useSelector } from "react-redux";
import { useIODispatch } from "../../../../store/hooks";
import { idPayInitiativesFromInstrumentGet } from "../store/actions";
import {
  idPayAreInitiativesFromInstrumentErrorSelector,
  idPayEnabledInitiativesFromInstrumentSelector
} from "../store/reducers";

export const useIDPayInitiativesFromInstrument = (idWallet: string) => {
  const dispatch = useIODispatch();
  const namedInitiativesList = useSelector(
    idPayEnabledInitiativesFromInstrumentSelector
  );
  const areInitiativesInError = useSelector(
    idPayAreInitiativesFromInstrumentErrorSelector
  );
  React.useEffect(() => {
    // required to clear any old data
    dispatch(
      idPayInitiativesFromInstrumentGet.request({
        idWallet,
        isRefreshCall: false
      })
    );
  }, [idWallet, dispatch]);
  useFocusEffect(() => {
    // will be removed in #IODPAY-207 in favor of saga logic
    const timer = setInterval(
      () => {
        dispatch(
          idPayInitiativesFromInstrumentGet.request({
            idWallet,
            isRefreshCall: true
          })
        );
      },
      areInitiativesInError ? 6000 : 3000
    );
    return () => clearInterval(timer);
  });

  return {
    namedInitiativesList
  };
};
