import * as t from "io-ts";

const SendPaymentConfig = t.union([
  t.literal("EXPIRED"),
  t.literal("FAILED"),
  t.literal("ONGOING"),
  t.literal("PAID"),
  t.literal("REVOKED"),
  t.literal("TOPAY"),
  t.literal("UNRELATED")
]);
export type SendPaymentConfig = t.TypeOf<typeof SendPaymentConfig>;

const SendTimelineConfig = t.union([
  t.literal("ACCEPTED"),
  t.literal("CANCELLED"),
  t.literal("DELIVERED"),
  t.literal("DELIVERING"),
  t.literal("EFFECTIVE_DATE"),
  t.literal("IN_VALIDATION"),
  t.literal("PAID"),
  t.literal("REFUSED"),
  t.literal("UNREACHABLE"),
  t.literal("VIEWED")
]);
export type SendTimelineConfig = t.TypeOf<typeof SendTimelineConfig>;

export const SendConfig = t.intersection([
  t.type({
    sendAARs: t.array(
      t.type({
        iun: t.string
      })
    ),
    sendMessages: t.array(
      t.intersection([
        t.type({
          iun: t.string
        }),
        t.partial({
          ioTitle: t.string
        })
      ])
    ),
    sendNotifications: t.array(
      t.intersection([
        t.type({}),
        t.partial({
          abstract: t.string,
          acknowledged: t.boolean,
          attachments: t.array(
            t.union([
              t.literal("DOCUMENT"),
              t.literal("F24"),
              t.literal("PAGOPA")
            ])
          ),
          cancelled: t.boolean,
          iun: t.string,
          payments: t.array(SendPaymentConfig),
          senderDenomination: t.string,
          subject: t.string,
          timeline: t.array(SendTimelineConfig),
          userIsRecipient: t.boolean
        })
      ])
    ),
    sendOptInMessage: t.boolean,
    sendMandates: t.array(t.type({ iun: t.string })),
    isServiceUpsertRateLimited: t.boolean
  }),
  t.partial({
    aarQRCodeUrl: t.string,
    lollipopLambdaResponseCode: t.union([
      t.literal(200),
      t.literal(400),
      t.literal(401),
      t.literal(403),
      t.literal(500)
    ]),
    mandateTimeToLiveSeconds: t.number,
    paymentDocumentExpirationTimeSeconds: t.number,
    paymentDocumentGenerationTimeSeconds: t.number,
    paymentDocumentRetryAfterSeconds: t.number,
    prevalidatedUrlDurationSeconds: t.number,
    skipLollipopVerification: t.boolean,
    skipServerToServerAuthentication: t.boolean,
    validationCodeTimeToLiveSeconds: t.number
  })
]);
export type SendConfig = t.TypeOf<typeof SendConfig>;
