
import { openAuthenticationSession } from "react-native-io-login-utils";
import { mixpanelTrack } from "../../mixpanel";
import {
  isLoggedOutWithIdp,
  LoggedOutWithIdp
} from "../../store/reducers/authentication";
import { GlobalState } from "../../store/reducers/types";





export const idpAuthSession = (selectedIdp: string) => {
  //selector sullo state da passare a loggedout



  const loggedOutWithIdpAuth = (state: GlobalState) =>
    isLoggedOutWithIdp(state.authentication) ? state.authentication : undefined;

  
  // This function is executed when the native component resolve with an error. This error is a string.
  // Unless there is a problem with the phone crashing for other reasons, this is very unlikely to happen.
  const handleLoadingError = (
    error: string,
    loggedOutWithIdpAuth: LoggedOutWithIdp
  ): void => {
    void mixpanelTrack("SPID_ERROR", {
      idp: loggedOutWithIdpAuth?.idp.id,
      description: error
    });

    //naviga verso la schermata di errore con il codice che arriva dalla cosa nativa di asweb.
    //I POT NON TI SERVONO PIU', GESTISCI LE COSE DIRETTAMENTE DAL THEN CATCH, NEL CASO DI QUESTA FUNZIONE, VA SEMPLICEMENTE RICHIAMATA IN CATCH E AGGIUSTATO STA ROBA DEGLI ERRORI TIPO LA DESCRIZIONE
    // IN CATCH, CI FINISCE ANCHE SE L'UTENTE FA ANNULLA, QUINDI VA GESTITO
  };


    return openAuthenticationSession(selectedIdp, "ioit")
      .then(value => console.log("value:" + value))
      .catch(error => console.log("error:" + error));

};
