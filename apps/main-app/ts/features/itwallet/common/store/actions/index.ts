import { ItwCredentialsActions } from "../../../credentials/store/actions";
import { ItwCredentialsCatalogueActions } from "../../../credentialsCatalogue/store/actions";
import { ItwIdentificationActions } from "../../../identification/common/store/actions";
import { ItwIssuanceActions } from "../../../issuance/store/actions";
import { ItwLifecycleActions } from "../../../lifecycle/store/actions";
import { ItwDebugActions } from "../../../playgrounds/store/actions";
import { ItwProximityActions } from "../../../presentation/proximity/store/actions";
import { ItwWalletInstanceActions } from "../../../walletInstance/store/actions";
import { ItwBannersActions } from "./banners";
import { ItwEnvironmentActions } from "./environment";
import { ItwPreferencesActions } from "./preferences";
import { ItwSecurePreferencesActions } from "./securePreferences";

export type ItwActions =
  | ItwBannersActions
  | ItwCredentialsActions
  | ItwCredentialsCatalogueActions
  | ItwDebugActions
  | ItwEnvironmentActions
  | ItwIdentificationActions
  | ItwIssuanceActions
  | ItwLifecycleActions
  | ItwPreferencesActions
  | ItwProximityActions
  | ItwSecurePreferencesActions
  | ItwWalletInstanceActions;
