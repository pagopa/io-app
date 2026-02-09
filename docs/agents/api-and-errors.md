# API Integration & Error Handling

## API Integration

- API clients are auto-generated from OpenAPI specs in `definitions/`
- Run `yarn generate` after spec changes
- Generated types live alongside specs; clients in `ts/api/`

## Error Handling

- Use Sentry only for unexpected failures, not expected flows
- Reuse utilities from `ts/utils/errors.ts`: `getError`, `getNetworkError`, `convertUnknownToError`
- For complex UI, wrap in `Sentry.ErrorBoundary` with fallback
- For validation errors (e.g., io-ts decode failures), use `readablePrivacyReport` from `ts/utils/reporters.ts` to convert errors to readable messages for logging or error reporting.

## Analytics

- Mixpanel client centralized in `ts/mixpanel.ts`
- Each feature exposes tracking helpers under `analytics/`
- Call domain helpers (e.g., `trackLoginSpidError`) instead of `mixpanelTrack` directly
