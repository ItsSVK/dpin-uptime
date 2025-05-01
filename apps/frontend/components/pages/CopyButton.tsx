import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon } from 'lucide-react';

export default function CopyButton({ text, id }: { text: string; id: string }) {
  return (
    <Button
      className="absolute right-2 top-2 p-3 rounded-md bg-zinc-800/50 opacity-100 hover:bg-zinc-800/70 transition-opacity cursor-pointer"
      onClick={() => {
        navigator.clipboard.writeText(text);

        const copyIcon = document.getElementById(`${id}-copy-icon`);
        const checkIcon = document.getElementById(`${id}-check-icon`);

        copyIcon?.classList.add('hidden');
        checkIcon?.classList.remove('hidden');

        setTimeout(() => {
          copyIcon?.classList.remove('hidden');
          checkIcon?.classList.add('hidden');
        }, 1000);
      }}
    >
      <CopyIcon id={`${id}-copy-icon`} className="w-4 h-4" />
      <CheckIcon id={`${id}-check-icon`} className="w-4 h-4 hidden" />
    </Button>
  );
}
