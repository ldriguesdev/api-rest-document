import { knex } from '../database'
import { z } from 'zod'
import { FastifyTypedInstance } from '../types'

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

const getAllTransactionsSchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      amount: z.number(),
      createdAt: z.string().datetime(),
    }),
  ),
})

export async function transactionsRoutes(app: FastifyTypedInstance) {
  app.post(
    '/transactions',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Create a new transaction',
        description: 'Creates a new transaction with type credit or debit',
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

  app.get(
    '/transactions',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'List all transactions',
        description: 'Returns all transactions from the database',
        response: {
          200: getAllTransactionsSchema,
        },
      },
    },
    async (_, reply) => {
      const transactions = await knex('transactions').select('*')

      reply.status(200).send({
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          title: transaction.title,
          amount: transaction.amount,
          createdAt: new Date(transaction.created_at).toISOString(),
        })),
      })
    },
  )
}
