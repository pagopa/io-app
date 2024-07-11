import { Credential, Trust } from "@pagopa/io-react-native-wallet";
import { CredentialCatalogDisplay } from "./itwMocksUtils";

/**
 * Alias type for the return type of the start issuance flow operation.
 */
export type StartIssuanceFlow = Awaited<
  ReturnType<Credential.Issuance.StartFlow>
>;

/** The definition of the credential we are about to request.
 * It will include data from the Issuer configuration.
 * For now it's fetched from a static catalog
 */
export type CredentialDefinition = {
  displayData: CredentialCatalogDisplay;
};

/** Alias for RequestObject
 * It is not exposed from the wallet package, so we extract the type
 * from the operation description.
 * Consider add the type into the package public interface
 */
export type RequestObject = Awaited<
  ReturnType<Credential.Presentation.GetRequestObject>
>["requestObject"];

/**
 * Alias type for the relying party entity configuration.
 */
export type RpEntityConfiguration =
  Trust.RelyingPartyEntityConfiguration["payload"]["metadata"];

/**
 * Alias for the IssuerConfiguration type
 */
export type IssuerConfiguration = Awaited<
  ReturnType<typeof Credential.Issuance.evaluateIssuerTrust>
>["issuerConf"];

/**
 * Alias for the ParseCredential type
 */
export type ParsedCredential = Awaited<
  ReturnType<typeof Credential.Issuance.verifyAndParseCredential>
>["parsedCredential"];

/**
 * Type for a stored credential.
 */
export type StoredCredential = {
  keyTag: string;
  credential: string;
  format: string;
  parsedCredential: ParsedCredential;
  credentialType: string;
  issuerConf: IssuerConfiguration;
} & CredentialDefinition;
