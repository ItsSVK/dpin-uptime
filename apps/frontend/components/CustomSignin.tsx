'use client';
import { Spin } from '@/components/spin';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { BaseUser } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
export default function CustomSignIn({
  appUser,
  signOut,
  isProcessing,
  doSignIn,
  className,
  avatarClassName,
}: {
  signIn: () => Promise<void>;
  appUser: BaseUser;
  signOut: () => void;
  isProcessing: boolean;
  doSignIn: () => void;
  className?: string;
  avatarClassName?: string;
}) {
  return (
    <>
      {appUser ? (
        <UserAvatar
          user={appUser}
          signOut={signOut}
          avatarClassName={avatarClassName}
        />
      ) : (
        <Button
          id="sign-in-button"
          className={cn(
            'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer w-20',
            className
          )}
          onClick={doSignIn}
          disabled={isProcessing}
        >
          {isProcessing ? <Spin className="ml-4" /> : 'Sign In'}
        </Button>
      )}
    </>
  );
}
