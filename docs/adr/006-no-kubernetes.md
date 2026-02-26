# ADR-006: No Kubernetes (EKS)

## Status
Accepted

## Context
Whether to use Kubernetes (EKS) for container orchestration.

## Decision
Never use EKS/Kubernetes unless a dedicated platform engineering team
already runs it.

## Rationale
- Kubernetes has an enormous surface area (Deployments, Services, Ingresses,
  ConfigMaps, Secrets, HPA, RBAC, Helm charts)
- Error messages are obscure and hard for agents to debug
- Feedback loop is slow
- AI agents hallucinate field names and produce configs that validate but don't work
- Lambda + ECS Fargate covers all our compute needs with far less complexity
- Agent-first development requires minimal config surface area
