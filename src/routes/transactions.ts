import { knex } from '../database'
import { z } from 'zod'
import { FastifyTypedInstance } from '../types'

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

export async function transactionsRoutes(app: FastifyTypedInstance) {
  app.post(
    '/transactions',
    {
      schema: {
        tags: ['Transactions'],
        description: 'Create a new transactions',
        body: createTransactionBodySchema,
        response: {
          201: z.object({ message: z.string().optional() }),
        },
      },
    },
    async (request, reply) => {
      const { title, amount, type } = createTransactionBodySchema.parse(
        request.body,
      )

      await knex('transactions').insert({
        id: crypto.randomUUID(),
        title,
        amount: type === 'credit' ? amount : amount * -1,
      })

      return reply.status(201).send()
    },
  )
}
