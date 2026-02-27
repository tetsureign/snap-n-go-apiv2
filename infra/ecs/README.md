# ECS task definition templates

These templates split the current combined task into:

- `taskdef-api.json`: API service task (public, ALB-backed)
- `taskdef-ml.json`: ML service task (private/internal)
- `taskdef-migrator.json`: one-shot migration task (run via `aws ecs run-task` before API deploy)

## Why this layout

- API and ML can scale independently.
- Migrations run as a one-off job, matching the Docker migrator target behavior.
- Secrets are pulled from Secrets Manager instead of plain env vars.

## Usage

1. Replace all placeholder values:
   - `<ACCOUNT_ID>`, `<REGION>`, `<ECR_OR_GHCR_IMAGE>`, `<SUBNET_ID_1>`, etc.
   - Secret ARNs and target group/service names.
2. Register task defs:

```bash
aws ecs register-task-definition --cli-input-json file://infra/ecs/taskdef-api.json
aws ecs register-task-definition --cli-input-json file://infra/ecs/taskdef-ml.json
aws ecs register-task-definition --cli-input-json file://infra/ecs/taskdef-migrator.json
```

3. Deployment order:

```bash
# 1) run migrations
aws ecs run-task --cluster <cluster> --launch-type FARGATE --task-definition snap-n-go-migrator \
  --network-configuration 'awsvpcConfiguration={subnets=[<SUBNET_ID_1>,<SUBNET_ID_2>],securityGroups=[<SG_ID>],assignPublicIp=DISABLED}'

# 2) update ml service (if changed)
aws ecs update-service --cluster <cluster> --service snap-n-go-ml --force-new-deployment

# 3) update api service
aws ecs update-service --cluster <cluster> --service snap-n-go-api --force-new-deployment
```

4. Wait for the migrator task to exit with code `0` before rolling API.
