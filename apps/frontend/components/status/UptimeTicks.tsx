import { WebsiteStatus } from '@prisma/client';

interface UptimeTicksProps {
  ticks: WebsiteStatus[];
}

export function UptimeTicks({ ticks }: UptimeTicksProps) {
  return (
    <div className="flex gap-1 mt-2">
      {ticks.map((tick, index) => (
        <div
          key={index}
          className={`w-8 h-2 rounded ${
            tick === WebsiteStatus.GOOD
              ? 'bg-green-500'
              : tick === WebsiteStatus.BAD
                ? 'bg-red-500'
                : 'bg-gray-500'
          }`}
        />
      ))}
    </div>
  );
}
