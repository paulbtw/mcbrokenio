import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import turboPlugin from 'eslint-plugin-turbo';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
	js.configs.recommended,
	eslintConfigPrettier,
	...tseslint.configs.recommended,
	{
		plugins: {
			import: importPlugin,
			react: reactPlugin,
			'simple-import-sort': simpleImportSort,
			turbo: turboPlugin,
			'unused-imports': unusedImports,
		},
		rules: {
			'turbo/no-undeclared-env-vars': 'warn',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'inline-type-imports' },
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/no-unused-expressions': 'off',
			'simple-import-sort/imports': [
				'error',
				{
					groups: [['^\u0000'], ['^react', '^@?\\w'], ['^../'], ['^./'], ['^.+\\.css$']],
				},
			],
			'simple-import-sort/exports': 'error',
			'import/no-default-export': 'error',
			'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
		},
	},
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
			onlyWarn,
		},
	},
	{
		files: ['**/app/**/*.tsx'],
		rules: {
			'import/no-default-export': 'off',
		},
	},
	{
		files: [
			'**/eslint.config.*',
			'**/.eslintrc.*',
			'**/next.config.*',
			'**/postcss.config.*',
			'**/tailwind.config.*',
			'**/turbo.config.*',
			'**/vitest.config.*',
			'**/babel.config.*',
		],
		rules: {
			'import/no-default-export': 'off',
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**', '.next/**', '.turbo/**'],
	},
];
