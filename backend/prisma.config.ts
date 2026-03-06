import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

require('dotenv').config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrate: {
    adapter: async () => {
      const connectionString = process.env.DATABASE_URL!
      return new PrismaPg({ connectionString })
    },
  },
})
