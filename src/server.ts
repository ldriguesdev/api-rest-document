import fastify from 'fastify'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import {
  fastifyZodOpenApiTransform,
  fastifyZodOpenApiTransformObject,
  fastifyZodOpenApiPlugin,
} from 'fastify-zod-openapi'
import type { ZodOpenApiVersion } from 'zod-openapi'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifyZodOpenApiPlugin)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Finance API',
      description: 'API for managing financial transactions',
      version: '1.0.0',
    },
    openapi: '3.0.3' satisfies ZodOpenApiVersion,
  },
  transform: fastifyZodOpenApiTransform,
  transformObject: fastifyZodOpenApiTransformObject,
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
})

app.register(transactionsRoutes)

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log(`HTTP Server Running on port ${env.PORT}`)
    console.log(`Documentation available at http://localhost:${env.PORT}/docs`)
  })
  .catch((err) => {
    console.error('Error starting server:', err)
    process.exit(1)
  })
