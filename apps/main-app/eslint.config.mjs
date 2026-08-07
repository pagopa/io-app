import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: [
      '**/*.test.{ts,tsx}',
      '**/{__tests__,__mocks__}/**/*.{ts,tsx}'
    ],
    rules: {
      // Consumers must use the public design-system API instead of its monorepo path or private modules.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'libs/design-system/**',
                '**/libs/design-system/**',
                '@io-app/design-system/**',
                '@pagopa/io-app-design-system/**'
              ],
              message:
                'Import from "@io-app/design-system" to use the design system public API.'
            }
          ]
        }
      ]
    }
  },
  {
    ignores: [
    '**/*.js',
		'**/*.cjs',
		'**/*.mjs',
		'locales/locales.ts',
		'ts/utils/__tests__/xss.test.ts',
		'definitions/*',
		'**/*.typegen.ts'
    ]
  }
];