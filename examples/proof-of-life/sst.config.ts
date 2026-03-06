/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'ripple-next-proof-of-life',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: input?.stage === 'production',
      home: 'aws',
      providers: {
        aws: { region: 'ap-southeast-2' },
      },
    }
  },
  async run() {
    // Downstream Nuxt app deployed as Lambda via SST
    const site = new sst.aws.Nuxt('ProofOfLife', {
      path: '.',
    })

    return {
      url: site.url,
    }
  },
})
