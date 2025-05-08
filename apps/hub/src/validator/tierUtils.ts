export function getValidatorTier(
  trustScore: number
): 'New' | 'Trusted' | 'Expert' {
  if (trustScore >= 500) return 'Expert';
  if (trustScore >= 100) return 'Trusted';
  return 'New';
}

export function getTierBonus(tier: 'New' | 'Trusted' | 'Expert'): number {
  if (tier === 'Expert') return 0.5;
  if (tier === 'Trusted') return 0.2;
  return 0;
}
