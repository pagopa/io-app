import { ItwCredentialsActions } from "../../../credentials/store/actions";
import { ItwCredentialsCatalogueActions } from "../../../credentialsCatalogue/store/actions";
import { ItwIdentificationActions } from "../../../identification/common/store/actions";
import { ItwIssuanceActions } from "../../../issuance/store/actions";
import { ItwLifecycleActions } from "../../../lifecycle/store/actions";
import { ItwProximityActions } from "../../../presentation/proximity/store/actions";
import { ItwWalletInstanceActions } from "../../../walletInstance/store/actions";
import { ItwBannersActions } from "./banners";
import { ItwEnvironmentActions } from "./environment";
import { ItwPreferencesActions } from "./preferences";
import { ItwSecurePreferencesActions } from "./securePreferences";
import { ItwUiActions } from "./ui";

export type ItwActions =
  | ItwBannersActions
  | ItwCredentialsActions
  | ItwCredentialsCatalogueActions
  | ItwEnvironmentActions
  | ItwIdentificationActions
  | ItwIssuanceActions
  | ItwLifecycleActions
  | ItwPreferencesActions
  | ItwProximityActions
  | ItwSecurePreferencesActions
  | ItwUiActions
  | ItwWalletInstanceActions;
