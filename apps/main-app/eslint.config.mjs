import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
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