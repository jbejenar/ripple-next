# Fix Bug

Fix a reported bug following these steps:

1. **Reproduce**: Understand the bug from the issue description
2. **Locate**: Find the relevant code using search
3. **Test first**: Write a failing test that reproduces the bug
4. **Fix**: Make the minimal change to fix the bug
5. **Verify**: Ensure the new test passes and existing tests still pass
6. **Check**: Run `pnpm test && pnpm typecheck && pnpm lint`
