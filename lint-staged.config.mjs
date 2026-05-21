export default {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yaml,yml}': ['prettier --write'],
  '*.css': ['prettier --write'],
  'prisma/schema.prisma': ['prisma format']
}
