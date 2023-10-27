import { Credential } from "@pagopa/io-react-native-wallet";

export type PidResponse = Awaited<
  ReturnType<Credential.Issuance.ObtainCredential>
>;

// Alias for RequestObject
// It is not exposed from the wallet package, so we extract the type
// from the operation description.
// Consider add the type into the package public interface
export type RequestObject = Awaited<
  ReturnType<Credential.Presentation.GetRequestObject>
>["requestObject"];
