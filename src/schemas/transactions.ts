import { z } from 'zod'

export const createTransactionBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
})

export const getTransactionsBodySchema = z.object({
  transactions: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      amount: z.number(),
      createdAt: z.string().datetime(),
    }),
  ),
})

export const getTransactionByIdSchema = z.object({
  transaction: z.object({
    id: z.string(),
    title: z.string(),
    amount: z.number(),
    createdAt: z.string().datetime(),
  }),
})

export const getTransactionByIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const errorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
})

export const successSchema = z.object({
  message: z.string().optional(),
})
