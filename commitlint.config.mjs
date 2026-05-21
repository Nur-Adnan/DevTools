export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'refactor',
        'test',
        'perf',
        'ci',
        'build',
        'revert'
      ]
    ],
    'subject-max-length': [2, 'always', 72],
    'subject-full-stop': [2, 'never', '.'],
    'scope-empty-for-feat-fix': [2, 'always']
  },
  plugins: [
    {
      rules: {
        'scope-empty-for-feat-fix': (parsed) => {
          const { type, scope } = parsed
          if ((type === 'feat' || type === 'fix') && !scope) {
            return [
              false,
              "Scope is required for commit types 'feat' and 'fix' (e.g., feat(auth): add google login)"
            ]
          }
          return [true]
        }
      }
    }
  ]
}
