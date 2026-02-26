# ADR-001: Nuxt 3 over Next.js

## Status
Accepted

## Context
Choosing between Nuxt 3 (Vue) and Next.js (React) for the frontend framework.

## Decision
Use Nuxt 3 with Vue 3 Composition API.

## Rationale
- File-based routing gives predictable file locations (agents find things faster)
- Auto-imports reduce boilerplate (agents write less, hallucinate less)
- Nitro server engine deploys to Lambda with zero config
- Nuxt layers provide clean separation without complex module federation
- Ripple design system is built on Vue — no framework translation needed
- `<script setup>` is more concise than React function components for simple cases
