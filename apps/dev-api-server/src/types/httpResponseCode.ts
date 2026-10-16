import * as t from "io-ts";

/* general http response codes */
export const HttpResponseCode = t.union([
  t.literal(200),
  t.literal(400),
  t.literal(401),
  t.literal(404),
  t.literal(429),
  t.literal(500)
]);

export const FailureHttpResponseCode = t.union([
  t.literal(400), // Bad Request
  t.literal(401), // Unauthorized
  t.literal(402), // Payment Required
  t.literal(403), // Forbidden
  t.literal(404), // Not Found
  t.literal(405), // Method Not Allowed
  t.literal(406), // Not Acceptable
  t.literal(407), // Proxy Authentication Required
  t.literal(408), // Request Timeout
  t.literal(409), // Conflict
  t.literal(410), // Gone
  t.literal(411), // Length Required
  t.literal(412), // Precondition Failed
  t.literal(413), // Payload Too Large
  t.literal(414), // URI Too Long
  t.literal(415), // Unsupported Media Type
  t.literal(416), // Range Not Satisfiable
  t.literal(417), // Expectation Failed
  t.literal(418), // I'm a teapot
  t.literal(421), // Misdirected Request
  t.literal(422), // Unprocessable Content
  t.literal(423), // Locked
  t.literal(424), // Failed Dependency
  t.literal(425), // Too Early
  t.literal(426), // Upgrade Required
  t.literal(428), // Precondition Required
  t.literal(429), // Too Many Requests
  t.literal(431), // Request Header Fields Too Large
  t.literal(451), // Unavailable For Legal Reasons
  t.literal(500), // Internal Server Error
  t.literal(501), // Not Implemented
  t.literal(502), // Bad Gateway
  t.literal(503), // Service Unavailable
  t.literal(504), // Gateway Timeout
  t.literal(505), // HTTP Version Not Supported
  t.literal(506), // Variant Also Negotiates
  t.literal(507), // Insufficient Storage
  t.literal(508), // Loop Detected
  t.literal(510), // Not Extended
  t.literal(511) // Network Authentication Required
]);
