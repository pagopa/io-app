import baseConfig from '../../eslint.config.mjs';
import stylisticEslintPlugin from '@stylistic/eslint-plugin';
export default [
  ...baseConfig,
  {
    ignores: [
    '**/*.js',
		'**/*.cjs',
		'**/*.mjs',
    'lib/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      "@stylistic": stylisticEslintPlugin
    },
    rules: {
      // Unique design-system specific rules (all other rules inherited from root)
      "@stylistic/member-delimiter-style": [
        "error",
        {
          multiline: {
            delimiter: "semi",
            requireLast: true
          },
          singleline: {
            delimiter: "semi",
            requireLast: false
          }
        }
      ],
      semi: "off",
      "@stylistic/semi": ["error"]
    }
  }
];
