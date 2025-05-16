import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, Check, LogOut, LayoutDashboard, User2 } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@civic/auth-web3/react';
import { useRouter } from 'next/navigation';
import { Spin } from '@/components/spin';
import { cn } from '@/lib/utils';

type BaseUser = {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  updated_at?: Date;
};

export function UserAvatar({
  user,
  signOut,
  avatarClassName,
}: {
  user: BaseUser;
  signOut: () => Promise<void> | void;
  avatarClassName?: string;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { address } = useWallet({ type: 'solana' });
  const router = useRouter();
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      setDropdownOpen(false);
    }
  };

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={open => {
        if (!isLoggingOut) setDropdownOpen(open);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn('relative h-8 w-8 rounded-full', avatarClassName)}
        >
          <Avatar className="h-9 w-9 bg-emerald-600 cursor-pointer">
            <AvatarImage src={user.picture} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-zinc-900 border-none shadow-none z-100"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-md font-medium leading-none">{user.name}</p>
            <p className="text-sm leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm leading-none text-muted-foreground">
                {address
                  ? `${address.slice(0, 7)}......${address.slice(-7)}`
                  : ''}
              </p>
              {address && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-zinc-800 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(address);

                    const copyButton = document.getElementById(
                      'copy-button'
                    ) as HTMLButtonElement;
                    const checkButton = document.getElementById(
                      'check-button'
                    ) as HTMLButtonElement;
                    copyButton.classList.add('hidden');
                    checkButton.classList.remove('hidden');

                    setTimeout(() => {
                      if (copyButton) {
                        copyButton.classList.remove('hidden');
                      }
                      if (checkButton) {
                        checkButton.classList.add('hidden');
                      }
                    }, 500);
                  }}
                >
                  <div className="copy-button-content">
                    <Copy id="copy-button" className="h-3 w-3" />
                    <Check id="check-button" className="h-3 w-3 hidden" />
                  </div>
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/profile')}
            >
              <User2 className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              variant="ghost"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Please wait...' : 'Log out'}
            {isLoggingOut && <Spin className="ml-2" />}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
