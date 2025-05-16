import ProfilePage from '@/components/pages/profile';
import { getUserTransactions } from '@/actions/deposit';
import { Transaction, TransactionType } from '@prisma/client';

export const metadata = {
  title: 'Profile - DPIN Uptime',
  description: 'View your profile and transactions',
};

export default async function ProfilePageWrapper() {
  const transactions = await getUserTransactions(TransactionType.TRANSFER);

  return (
    <ProfilePage transactions={transactions.transactions as Transaction[]} />
  );
}
