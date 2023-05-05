import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useSelector } from "react-redux";
import { useIODispatch } from "../../../../store/hooks";
import {
  idPayInitiativesFromInstrumentRefreshStop,
  idPayInitiativesFromInstrumentRefreshStart
} from "../store/actions";
import { idPayEnabledInitiativesFromInstrumentSelector } from "../store/reducers";

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
      dispatch(
        idPayInitiativesFromInstrumentRefreshStart({
          idWallet
        })
      );
      return () => {
        dispatch(idPayInitiativesFromInstrumentRefreshStop());
      };
    }, [idWallet, dispatch])
  );

  return {
    initiativesList
  };
};
