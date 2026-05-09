export interface PetData {
  id: string;
  species: string;
  breed: string;
  age: number;
  size: string;
  temperament: string[];
  activity_level: number;
  kids_friendly: boolean;
  housing: string;
}

export function calculateCompatibility(pet1: PetData, pet2: PetData): number {
  let score = 0;
  let totalWeights = 0;

  // 1. Species compatibility (crucial)
  totalWeights += 40;
  if (pet1.species === pet2.species) {
    score += 40;
  } else {
    // Interspecies compatibility (e.g. dog/cat)
    // For now, let's say it's lower
    score += 10;
  }

  // 2. Activity Level Proximity
  totalWeights += 20;
  const activityDiff = Math.abs(pet1.activity_level - pet2.activity_level);
  if (activityDiff === 0) score += 20;
  else if (activityDiff === 1) score += 15;
  else if (activityDiff === 2) score += 10;
  else if (activityDiff === 3) score += 5;

  // 3. Temperament Overlap
  totalWeights += 20;
  if (pet1.temperament && pet2.temperament) {
    const commonTags = pet1.temperament.filter(tag => pet2.temperament.includes(tag));
    const overlapRatio = commonTags.length / Math.max(pet1.temperament.length, pet2.temperament.length, 1);
    score += overlapRatio * 20;
  }

  // 4. Size compatibility (for dogs mostly)
  if (pet1.species === 'dog' && pet2.species === 'dog') {
    totalWeights += 10;
    if (pet1.size === pet2.size) score += 10;
    else score += 5; // Differing sizes is okay but maybe not ideal for play
  }

  // 5. Housing/Kids
  totalWeights += 10;
  if (pet1.kids_friendly === pet2.kids_friendly) score += 5;
  if (pet1.housing === pet2.housing || pet1.housing === 'both' || pet2.housing === 'both') score += 5;

  // Final Percentage
  return Math.round((score / totalWeights) * 100);
}

export function getCompatibilityLabel(percentage: number): { label: string, color: string } {
  if (percentage >= 90) return { label: 'Pareja Perfecta', color: 'text-green-400' };
  if (percentage >= 70) return { label: 'Muy Compatible', color: 'text-blue-400' };
  if (percentage >= 50) return { label: 'Buen Match', color: 'text-yellow-400' };
  return { label: 'Compatible', color: 'text-white/60' };
}
