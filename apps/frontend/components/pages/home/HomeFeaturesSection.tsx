'use client';
import React from 'react';
import { Check } from 'lucide-react';

interface HomeFeaturesSectionProps {
  features: string[];
}

const HomeFeaturesSection: React.FC<HomeFeaturesSectionProps> = ({
  features,
}) => (
  <section id="features" className="py-20 md:py-32">
    <div className="container mx-auto max-w-full px-4 md:px-6">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Next-level website monitoring
        </h2>
        <p className="max-w-[85%] text-zinc-400 md:text-xl/relaxed">
          dpin provides comprehensive uptime monitoring to keep your websites
          and services running smoothly.
        </p>
      </div>
      <div className="mx-auto mt-16 grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-2"
          >
            <div className="flex h-full flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-zinc-200">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {feature}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeFeaturesSection;
