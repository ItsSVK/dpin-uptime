import { getUserBalance, getUserDeposits } from '@/actions/deposit';
import DepositForm from '@/components/deposit/DepositForm';
import { redirect } from 'next/navigation';
import { Transaction } from '@prisma/client';
export default async function DepositsPage() {
  const deposits = await getUserDeposits();
  const balance = await getUserBalance();
  if (!deposits.success) {
    return redirect('/');
  }

  return (
    <DepositForm
      deposits={deposits.deposits as Transaction[]}
      balance={balance.balance ?? 0}
    />
  );
}
