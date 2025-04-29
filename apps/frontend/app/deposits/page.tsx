import DepositForm from '@/components/deposit/DepositForm';

export default function DepositsPage() {
  return (
    <div className="container space-y-8 p-8 pt-6 mx-auto max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
        <p className="text-zinc-400">
          Manage your account balance to keep your websites monitored
        </p>
      </div>
      <DepositForm />
    </div>
  );
}
