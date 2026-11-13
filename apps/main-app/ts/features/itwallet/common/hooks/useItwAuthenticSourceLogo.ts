import { useIOSelector } from "../../../../store/hooks";
import { itwAuthenticSourceSelector } from "../../credentialsCatalogue/store/selectors";
import { useItwVerifiedImage } from "./useItwVerifiedImage";

export const useItwAuthenticSourceLogo = (
  credentialType: string
): string | undefined => {
  const authenticSource = useIOSelector(
    itwAuthenticSourceSelector(credentialType)
  );

  const verifiedLogo = useItwVerifiedImage(
    authenticSource?.dataset_logo_uri,
    authenticSource?.["dataset_logo_uri#integrity"]
  );

  return verifiedLogo;
};
