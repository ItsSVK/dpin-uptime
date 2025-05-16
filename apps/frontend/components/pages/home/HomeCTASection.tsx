'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { BaseUser } from '@/hooks/useAuth';

interface HomeCTASectionProps {
  appUser: BaseUser | null;
  router: { push: (path: string) => void };
  hanldeGettingStarted: () => void;
}

const HomeCTASection: React.FC<HomeCTASectionProps> = ({
  appUser,
  router,
  hanldeGettingStarted,
}) => (
  <section className="py-20 md:py-32 bg-zinc-950">
    <div className="container mx-auto max-w-full px-4 md:px-6">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Ready to start monitoring?
        </h2>
        <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
          Join thousands of developers and businesses who trust dpin for their
          website monitoring.
        </p>
        <div className="mt-8 flex flex-col gap-2 min-[400px]:flex-row">
          {!appUser ? (
            <Button
              size="lg"
              className="group bg-emerald-600 hover:bg-emerald-700 font-semibold cursor-pointer"
              onClick={hanldeGettingStarted}
            >
              Get started now
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="group bg-zinc-800 hover:bg-zinc-700 font-semibold cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              Continue to Dashboard
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default HomeCTASection;
