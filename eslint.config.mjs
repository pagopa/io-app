import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import i18Next from 'eslint-plugin-i18next';
import functional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import sonarjs from 'eslint-plugin-sonarjs';
import stylisticEslintPluginJs from '@stylistic/eslint-plugin-js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactNativeConfig from '@react-native/eslint-config/flat';
import tseslint from 'typescript-eslint';
import delegateEffectsRule from './scripts/eslint/delegate-effects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default defineConfig([
	globalIgnores([
		'**/*.js',
		'**/*.cjs',
		'**/*.mjs',
		'locales/locales.ts',
		'ts/utils/__tests__/xss.test.ts',
		'definitions/*',
		'**/*.typegen.ts'
	]),
	{
		files: ['**/*.ts', '**/*.tsx'],
		extends: [
			js.configs.recommended,
			// Only include rules from tseslint, not the plugin registration,
			// because @react-native/eslint-config/flat already registers @typescript-eslint
			...tseslint.configs.recommended.filter(c => !c.plugins),
			...reactNativeConfig,
			...fixupConfigRules(compat.extends('plugin:react-native-a11y/all')),
			prettierConfig
		],

		languageOptions: {
			parser: tseslint.parser,
			sourceType: 'module',

			parserOptions: {
				projectService: true,
        		tsconfigRootDir: __dirname,

				ecmaFeatures: {
					jsx: true
				}
			}
		},

		plugins: {
			import: importPlugin,
			functional,
			sonarjs,
			'@stylistic/js': stylisticEslintPluginJs,
			i18next: i18Next,
			'typed-redux-saga': { rules: { 'delegate-effects': delegateEffectsRule } }
		},

		rules: {
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-react': 'off',
			'comma-dangle': ['error', 'never'],
			'no-case-declarations': 'off',
			'no-inner-declarations': 'off',
			'prefer-const': 'error',
			curly: 'error',

			'spaced-comment': [
				'error',
				'always',
				{
					block: {
						balanced: true
					}
				}
			],

			radix: 'error',
			'one-var': ['error', 'never'],
			'object-shorthand': 'error',
			'no-var': 'error',
			'no-param-reassign': 'error',
			'no-underscore-dangle': 'error',
			'no-undef-init': 'error',
			'no-throw-literal': 'error',
			'no-new-wrappers': 'error',
			'no-eval': 'error',
			'no-console': 'error',
			'no-caller': 'error',
			'no-bitwise': 'error',
			'no-void': 'off',
			'no-duplicate-imports': 'error',
			quotes: 'off',
			eqeqeq: ['error', 'smart'],
			'max-classes-per-file': ['error', 1],
			'guard-for-in': 'error',
			complexity: 'error',
			'arrow-body-style': 'error',
			'import/order': 'error',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-require-imports': [
				'error',
				{
					allow: [
						'\\.png$',
						'\\.jpg$',
						'\\.jpeg$',
						'\\.gif$',
						'\\.svg',
						'\\.webp$'
					]
				}
			],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-explicit-any': 'off',

			'@typescript-eslint/array-type': [
				'error',
				{
					default: 'generic'
				}
			],

			'@typescript-eslint/await-thenable': 'error',
			'@typescript-eslint/consistent-type-assertions': 'error',
			'@typescript-eslint/dot-notation': 'error',

			'@typescript-eslint/no-floating-promises': 'error',
			'no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-expressions': ['error'],
			'@typescript-eslint/prefer-function-type': 'error',
			'@typescript-eslint/restrict-plus-operands': 'error',
			'@typescript-eslint/unified-signatures': 'error',
			'react/prop-types': 'off',
			'react/display-name': 'off',
			'react/jsx-key': 'error',

			'react/jsx-no-bind': [
				'error',
				{
					allowArrowFunctions: true
				}
			],

			'react/no-unstable-nested-components': [
				'off',
				{
					allowAsProps: true
				}
			],

			'react/no-direct-mutation-state': 'off',
			'react/require-render-return': 'off',
			'functional/no-let': 'error',
			'functional/immutable-data': [
				'error',
				{
					ignoreAccessorPattern: [
						'navigation.**',
						'navigate.**',
						'StackActions.**'
					]
				}
			],
			'sonarjs/no-small-switch': 'off',
			'sonarjs/no-duplicate-string': 'off',
			'sonarjs/no-nested-template-literals': 'warn',
			'react-native/no-unused-styles': 'error',
			'react-native/split-platform-components': 'off',
			'react-native/no-inline-styles': 'off',
			'react-native/no-color-literals': 'error',
			'react-native/no-raw-text': 'off',
			'react-native/no-single-element-style-arrays': 'warn',
			'react-native-a11y/has-accessibility-hint': 'off',

			'i18next/no-literal-string': [
				'error',
				{
					mode: 'jsx-only',

					'jsx-attributes': {
						include: [
							'accessibilityLabel',
							'accessibilityHint',
							'placeholder',
							'title',
							'alt'
						],
						exclude: []
					},

					'jsx-components': {
						include: [],
						exclude: ['Trans']
					},

					words: {
						exclude: ['\\s+', '[0-9!-/:-@\\[-`{-~]+', '[•·]+', '.']
					},

					'object-properties': {
						include: [],
						exclude: []
					}
				}
			],

			'typed-redux-saga/delegate-effects': 'error',

			'import/no-extraneous-dependencies': ['error', {
				devDependencies: true, 
				optionalDependencies: false,
				peerDependencies: false,
			}],
			
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'i18n-js',
							message:
								'Importing I18n from "i18n-js" is not allowed. Import it from "ts/i18n.ts" instead.'
						},
						{
							name: '@pagopa/ts-commons',
							importNames: ['pot'],
							message:
								'Importing { pot } from "@pagopa/ts-commons" is not allowed. Use \'import * as pot from "@pagopa/ts-commons/lib/pot"\' instead.'
						},
						{
							name: 'redux-saga/effects',
							message:
								'Importing from "redux-saga/effects" is not allowed. Use "typed-redux-saga/macro" instead for type-safe saga effects.'
						}
					]
				}
			]
		},

		settings: {
			react: {
				version: 'detect'
			}
		}
	},
	{
		files: ['**/*.test.ts', '**/*.test.tsx'],

		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-shadow': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'i18next/no-literal-string': 'off',
			'no-restricted-imports': 'off'
		}
	},
	{
		files: [
			'**/design-system/**/*.ts',
			'**/design-system/**/*.tsx',
			'**/playgrounds/**/*.ts',
			'**/playgrounds/**/*.tsx',
			'**/devMode/**/*.ts',
			'**/devMode/**/*.tsx',
			'**/debug/**/*.ts',
			'**/debug/**/*.tsx',
			'**/__mocks__/**/*.ts',
			'**/__mocks__/**/*.tsx'
		],

		rules: {
			'i18next/no-literal-string': 'off'
		}
	},
	{
		files: ['**/*.ts'],

		rules: {
			'i18next/no-literal-string': 'off'
		}
	},
	{
		files: ['**/*.tsx'],

		ignores: [],

		rules: {
			'i18next/no-literal-string': 'off'
		}
	}
]);
