import { WebsiteStatus } from '@prisma/client';

interface StatusCircleProps {
  status: WebsiteStatus;
}

export function StatusCircle({ status }: StatusCircleProps) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${
        status === WebsiteStatus.GOOD
          ? 'bg-green-500'
          : status === WebsiteStatus.BAD
            ? 'bg-red-500'
            : 'bg-gray-500'
      }`}
    />
  );
}
