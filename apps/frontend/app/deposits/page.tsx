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
    <div className="container space-y-8 p-8 pt-6 mx-auto max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
        <p className="text-zinc-400">
          Manage your account balance to keep your websites monitored
        </p>
      </div>
      <DepositForm
        deposits={deposits.deposits as Transaction[]}
        balance={balance.balance ?? 0}
      />
    </div>
  );
}
