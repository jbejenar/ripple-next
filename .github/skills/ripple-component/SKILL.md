# Ripple Component Skill

## When to use

When creating new UI components for the Ripple design system.

## Component structure

```
packages/ui/components/{level}/Rpl{Name}.vue
```

Where `{level}` is `atoms`, `molecules`, or `organisms`.

## Steps

1. Create the `.vue` file with `<script setup lang="ts">`
2. Define props interface with `Rpl{Name}Props`
3. Use `rpl-` BEM prefix for CSS classes
4. Use CSS custom properties from `packages/ui/tokens/global.css`
5. Export from `packages/ui/index.ts`
6. Write a component test in `packages/ui/tests/`
7. Create a Storybook story (optional)

## Conventions

- Props use TypeScript interfaces, not runtime validators
- Emit events with typed `defineEmits`
- Use scoped styles
- Ensure WCAG 2.1 AA accessibility
- Support keyboard navigation
- Include `aria-` attributes where needed
