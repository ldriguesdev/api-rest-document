type RawTransaction = {
  id: string
  title: string
  amount: number
  created_at: string | Date
}

type TransactionDTO = {
  id: string
  title: string
  amount: number
  createdAt: string
}

export function transactionMapper(transaction: RawTransaction): TransactionDTO {
  return {
    id: transaction.id,
    title: transaction.title,
    amount: transaction.amount,
    createdAt: new Date(transaction.created_at).toISOString(),
  }
}
