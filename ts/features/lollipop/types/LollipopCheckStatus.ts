// Type used to handle the LolliPOP checks.
import * as O from "fp-ts/lib/Option";

// None means that the component state is ready to start a
// verification process if a SAMLRequest query parameter is detected
// Checking means that LolliPOP signature verification is happening
// and the WebView shall not process any request (especially not
// the one containing the SAMLRequest query parameter)
// Trusted means that LolliPOP signature checking was successfull
// and the normal login flow can be done
// Untrusted means that LolliPOP signature checking has failed
// and the user cannot proceed with the login
export type LollipopCheckStatus = {
  status: "none" | "checking" | "trusted" | "untrusted";
  url: O.Option<string>;
};
