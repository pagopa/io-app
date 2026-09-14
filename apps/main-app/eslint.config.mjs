import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Consumers must use the public design-system API instead of its monorepo path or internals
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/libs/design-system/**', // Avoid monorepo path
                '@io-app/design-system/**' // Avoid internals
              ],
              message:
                'Import from "@io-app/design-system" to use the design system.'
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