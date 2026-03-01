/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'ripple-next',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: input?.stage === 'production',
      home: 'aws',
      providers: {
        aws: { region: 'ap-southeast-2' } // Melbourne
      }
    }
  },
  async run() {
    // ─── Network ───────────────────────────────────────────
    const vpc = new sst.aws.Vpc('Vpc', {
      bastion: true,
      nat: 'ec2' // Cost-effective NAT (not NAT Gateway)
    })

    // ─── Data Layer ────────────────────────────────────────
    const db = new sst.aws.Postgres('Database', {
      vpc,
      scaling: {
        min: '0.5 ACU',
        max: '8 ACU'
      }
    })

    const redis = new sst.aws.Redis('Cache', { vpc })

    const dynamo = new sst.aws.Dynamo('DynamoTable', {
      fields: { pk: 'string', sk: 'string', gsi1pk: 'string', gsi1sk: 'string' },
      primaryIndex: { hashKey: 'pk', rangeKey: 'sk' },
      globalIndexes: {
        gsi1: { hashKey: 'gsi1pk', rangeKey: 'gsi1sk' }
      }
    })

    // ─── Storage ───────────────────────────────────────────
    const uploads = new sst.aws.Bucket('Uploads', {
      cors: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'PUT'],
        allowHeaders: ['*']
      }
    })

    // ─── Queues ────────────────────────────────────────────
    const emailQueue = new sst.aws.Queue('EmailQueue', {
      visibilityTimeout: '5 minutes'
    })

    const imageQueue = new sst.aws.Queue('ImageQueue', {
      visibilityTimeout: '15 minutes'
    })

    const longRunningQueue = new sst.aws.Queue('LongRunningQueue', {
      visibilityTimeout: '4 hours'
    })

    // ─── Event Bus ─────────────────────────────────────────
    const bus = new sst.aws.Bus('EventBus')

    bus.subscribe('services/events/user-created.handler', {
      pattern: { source: ['app.users'], 'detail-type': ['UserCreated'] }
    })

    // ─── Lambda Queue Consumers (short jobs) ──────────────
    emailQueue.subscribe('services/worker/handlers/email.handler', {
      link: [db],
      timeout: '5 minutes'
    })

    imageQueue.subscribe('services/worker/handlers/image.handler', {
      link: [uploads, db],
      timeout: '15 minutes',
      memory: '2 GB'
    })

    // ─── ECS Fargate (long-running jobs) ──────────────────
    const cluster = new sst.aws.Cluster('WorkerCluster', { vpc })

    cluster.addService('LongWorker', {
      cpu: '0.5 vCPU',
      memory: '1 GB',
      image: {
        dockerfile: 'services/worker/Dockerfile',
        context: '.'
      },
      link: [db, redis, longRunningQueue, uploads],
      scaling: {
        min: 1,
        max: 10,
        cpuUtilization: 70
      },
      dev: {
        command: 'pnpm --filter @ripple-next/worker dev'
      }
    })

    // WebSocket service (persistent connections)
    const wsService = cluster.addService('WebSocket', {
      cpu: '0.25 vCPU',
      memory: '0.5 GB',
      image: {
        dockerfile: 'services/websocket/Dockerfile',
        context: '.'
      },
      link: [redis, db],
      public: {
        ports: [{ listen: '443/https', forward: '3001/http' }]
      },
      scaling: { min: 2, max: 20 }
    })

    // ─── Cron Jobs ─────────────────────────────────────────
    new sst.aws.Cron('DailyCleanup', {
      schedule: 'rate(1 day)',
      function: {
        handler: 'services/cron/cleanup.handler',
        link: [db, uploads],
        timeout: '15 minutes'
      }
    })

    new sst.aws.Cron('HourlyReports', {
      schedule: 'rate(1 hour)',
      function: {
        handler: 'services/cron/reports.handler',
        link: [db, bus],
        timeout: '5 minutes'
      }
    })

    // ─── Nuxt App (Lambda) ─────────────────────────────────
    const web = new sst.aws.Nuxt('Web', {
      path: 'apps/web',
      link: [db, redis, dynamo, uploads, emailQueue, imageQueue, bus],
      environment: {
        NUXT_PUBLIC_WS_URL: wsService.url ?? 'ws://localhost:3001'
      },
      warm: 5
    })

    // ─── Outputs ───────────────────────────────────────────
    return {
      url: web.url,
      wsUrl: wsService.url,
      dbHost: db.host
    }
  }
})
