import { knex } from '../database'
import { z } from 'zod'
import { FastifyTypedInstance } from '../types'

const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

const getTransactionsBodySchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      amount: z.number(),
      createdAt: z.string().datetime(),
    }),
  ),
})

const getTransactionByIdSchema = z.object({
  transaction: z.object({
    id: z.string(),
    title: z.string(),
    amount: z.number(),
    createdAt: z.string().datetime(),
  }),
})

const getTransactionByIdParamsSchema = z.object({
  id: z.string().uuid(),
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
          200: getTransactionsBodySchema,
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

  app.get(
    '/transactions/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get a transaction by ID',
        description: 'Returns a specific transaction by its ID',
        params: getTransactionByIdParamsSchema,
        response: {
          200: getTransactionByIdSchema,
          404: z.object({
            statusCode: z.number(),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = getTransactionByIdParamsSchema.parse(request.params)

      const transaction = await knex('transactions').where('id', id).first()

      if (!transaction) {
        reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Transaction not found',
        })
      }

      reply.status(200).send({
        transaction,
      })
    },
  )
}
