import globals from 'globals'
import js from '@eslint/js'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import pluginNode from 'eslint-plugin-n'
import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig } from 'eslint/config'

const compat = new FlatCompat({
  baseDirectory: import.meta.url
})

export default defineConfig([
  {
    files: ['**/*.{js,cjs,mjs}'],
    ignores: ['node_modules', 'uploads', 'dist', 'coverage'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
      ecmaVersion: 2022
    },
    plugins: {
      jsdoc: pluginJsdoc,
      n: pluginNode
    },
    rules: {

      'no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true }],
      'no-console': 'off',
      'prefer-const': 'warn',


      'n/no-missing-require': 'off',
      'n/no-unpublished-require': 'off',
    }
  },

  js.configs.recommended,

  js.configs.recommended,
  pluginNode.configs['flat/recommended'],
  pluginJsdoc.configs['flat/recommended']

])
