import { getUserBalance, getUserTransactions } from '@/actions/deposit';
import DepositForm from '@/components/deposit/DepositForm';
import { Transaction, TransactionType } from '@prisma/client';

export const metadata = {
  title: 'Deposits - DPIN Uptime',
  description: 'View your deposits and manage your transactions',
};

export default async function DepositsPage() {
  const deposits = await getUserTransactions(TransactionType.DEPOSIT);

  const balance = await getUserBalance();
  return (
    <DepositForm
      deposits={deposits.transactions as Transaction[]}
      balance={balance}
    />
  );
}
