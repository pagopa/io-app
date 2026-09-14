export const getSamlRequest = (
  algorithm = "sha256",
  hash = "sha256-_2d2a89e99c7583e221b4"
) => `<?xml version="1.0"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    ID="${algorithm}-${hash}"
                    Version="2.0"
                    IssueInstant="2023-01-20T10:03:42.600Z"
                    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                    Destination="https://posteid.poste.it/jod-fs/ssoserviceredirect"
                    ForceAuthn="true"
                    AssertionConsumerServiceURL="https://app-backend.io.italia.it/assertionConsumerService"
                    AttributeConsumingServiceIndex="0"
                    >
    <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                 NameQualifier="https://app-backend.io.italia.it"
                 Format="urn:oasis:names:tc:SAML:2.0:nameid-format:entity"
                 >https://app-backend.io.italia.it</saml:Issuer>
    <samlp:NameIDPolicy xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                        Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient"
                        />
    <samlp:RequestedAuthnContext xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                                 Comparison="minimum"
                                 >
        <saml:AuthnContextClassRef xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">https://www.spid.gov.it/SpidL2</saml:AuthnContextClassRef>
    </samlp:RequestedAuthnContext>
</samlp:AuthnRequest>`;
