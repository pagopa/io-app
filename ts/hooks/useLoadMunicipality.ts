import { useEffect } from "react";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { profileFiscalCodeSelector } from "../features/settings/common/store/selectors";
import { CodiceCatastale } from "../types/MunicipalityCodiceCatastale";
import { contentMunicipalityLoad } from "../store/actions/content";

/**
 * A custom hook use to load content municipality when needed,
 * @description This hook is part of old implementation of `ts/screens/profile/FiscalCodeScreen.tsx`. It's been extracted in a custom hook to keep the functionality available in case of need.
 */
export const useLoadMunicipality = () => {
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);
  const dispatch = useIODispatch();

  useEffect(() => {
    if (fiscalCode !== undefined) {
      const maybeCodiceCatastale = CodiceCatastale.decode(
        fiscalCode.substring(11, 15)
      );
      pipe(
        maybeCodiceCatastale,
        E.map(code => dispatch(contentMunicipalityLoad.request(code)))
      );
    }
  }, [fiscalCode, dispatch]);
};
