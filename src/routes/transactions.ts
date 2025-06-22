import { knex } from '../database'
import { z } from 'zod'
import { FastifyTypedInstance } from '../types'
import { transactionMapper } from '../mappers/transaction'
import {
  createTransactionBodySchema,
  getTransactionByIdParamsSchema,
  getTransactionByIdSchema,
  getTransactionsBodySchema,
  successSchema,
  errorSchema,
} from '../schemas/transactions'

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
          201: successSchema,
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

      return reply
        .status(201)
        .send({ message: 'Transaction created successfully' })
    },
  )

  app.put(
    '/transactions/:id',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Update a transaction by ID',
        description: 'Updates an existing transaction by its ID',
        params: getTransactionByIdParamsSchema,
        body: createTransactionBodySchema,
        response: {
          200: successSchema,
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = getTransactionByIdParamsSchema.parse(request.params)
      const { amount, title, type } = createTransactionBodySchema.parse(
        request.body,
      )

      const transaction = await knex('transactions')
        .where('id', id)
        .update({
          title,
          amount: type === 'credit' ? amount : amount * -1,
        })

      if (!transaction) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Transaction not found',
        })
      }

      reply.status(200).send({
        message: 'Transaction updated successfully',
      })
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
        transactions: transactions.map(transactionMapper),
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
          404: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = getTransactionByIdParamsSchema.parse(request.params)

      const transaction = await knex('transactions').where('id', id).first()

      if (!transaction) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Transaction not found',
        })
      }

      reply.status(200).send({
        transaction: transactionMapper(transaction),
      })
    },
  )

  app.get(
    '/transactions/summary',
    {
      schema: {
        tags: ['Transactions'],
        summary: 'Get transaction summary',
        description: 'Returns the total amount of all transactions',
        response: {
          200: z.object({
            summary: z.object({
              amount: z.number(),
            }),
          }),
          404: errorSchema,
        },
      },
    },
    async (_, reply) => {
      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .first()

      if (!summary) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'No transactions found',
        })
      }

      reply.status(200).send({
        summary,
      })
    },
  )
}
