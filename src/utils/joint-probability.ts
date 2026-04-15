// src/utils/joint-probability.ts
//
// Joint probability calculation for logogram mneme drops.
// Given a logogram with N mneme types (equal probability 1/N each),
// compute the minimum number of opens to achieve >= 95% probability
// of simultaneously obtaining all required mnemes in required quantities.

const cache = new Map<string, number>();

/**
 * For a single logogram with `totalTypes` equally-likely mneme types,
 * and a list of required quantities for specific mneme types,
 * find the minimum opens N such that P(all requirements met) >= 0.95.
 *
 * @param requirements Array of required quantities (sorted descending for cache efficiency).
 * @param totalTypes Total number of mneme types in this logogram.
 * @returns Minimum number of opens for >= 95% joint success probability.
 */
export function jointLogogramsNeeded95(
  requirements: number[],
  totalTypes: number,
): number {
  // Filter out zero requirements and sort for consistent cache keys
  const reqs = requirements.filter((r) => r > 0).sort((a, b) => b - a);
  if (reqs.length === 0) return 0;
  if (totalTypes <= 0) return 0;

  const key = `${reqs.join(',')}_${totalTypes}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const confidence = 0.95;
  const neededTypes = reqs.length;

  // Single requirement: use fast binomial calculation
  if (neededTypes === 1) {
    const result = singleMnemeNeeded95(reqs[0]!, totalTypes);
    cache.set(key, result);
    return result;
  }

  const p = 1 / totalTypes;
  const unneededTypes = totalTypes - neededTypes;
  const pUnneeded = unneededTypes * p;

  // Build state dimensions: each dimension goes from 0 to req[i]
  const dims = reqs.map((r) => r + 1);
  const totalStates = dims.reduce((a, b) => a * b, 1);

  // Goal state index (all requirements met)
  let goalIndex = 0;
  for (let i = 0; i < neededTypes; i++) {
    goalIndex = goalIndex * dims[i]! + reqs[i]!;
  }

  // Precompute transitions for each state
  // For each state, compute the transitions when drawing each type
  const transitions: number[][] = new Array(totalStates);
  for (let si = 0; si < totalStates; si++) {
    // Decode state
    let remaining = si;
    const counts = new Array(neededTypes);
    for (let i = neededTypes - 1; i >= 0; i--) {
      counts[i] = remaining % dims[i]!;
      remaining = Math.floor(remaining / dims[i]!);
    }

    const targets: number[] = new Array(neededTypes);
    for (let t = 0; t < neededTypes; t++) {
      const newCount = Math.min(counts[t]! + 1, reqs[t]!);
      if (newCount === counts[t]) {
        targets[t] = si; // stays same
      } else {
        // Compute new index
        const oldVal = counts[t]!;
        counts[t] = newCount;
        let newIdx = 0;
        for (let j = 0; j < neededTypes; j++) {
          newIdx = newIdx * dims[j]! + counts[j]!;
        }
        targets[t] = newIdx;
        counts[t] = oldVal; // restore
      }
    }
    transitions[si] = targets;
  }

  // Iteratively add opens until goal probability >= 95%
  let current = new Float64Array(totalStates);
  current[0] = 1.0;
  const maxN = Math.max(...reqs) * totalTypes * 5;

  let result = maxN;
  for (let n = 1; n <= maxN; n++) {
    const next = new Float64Array(totalStates);

    for (let si = 0; si < totalStates; si++) {
      const prob = current[si]!;
      if (prob < 1e-15) continue;

      // Draw an unneeded type
      if (pUnneeded > 0) {
        next[si] = (next[si] ?? 0) + prob * pUnneeded;
      }

      // Draw each needed type
      const targets = transitions[si]!;
      for (let t = 0; t < neededTypes; t++) {
        const targetIdx = targets[t]!;
        next[targetIdx] = (next[targetIdx] ?? 0) + prob * p;
      }
    }

    current = next;

    if (current[goalIndex]! >= confidence) {
      result = n;
      break;
    }
  }

  cache.set(key, result);
  return result;
}

/** Clear the memoization cache (useful for testing). */
export function clearJointCache(): void {
  cache.clear();
}

/**
 * Single mneme type: find N such that P(Binomial(N, 1/totalTypes) >= needed) >= 0.95.
 */
function singleMnemeNeeded95(needed: number, totalTypes: number): number {
  if (totalTypes <= 1) return needed;
  const p = 1 / totalTypes;
  for (let n = needed; n <= needed * totalTypes * 5; n++) {
    if (1 - binomialCdfAtMost(needed - 1, n, p) >= 0.95) {
      return n;
    }
  }
  return needed;
}

function binomialCdfAtMost(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  let sum = 0;
  let term = Math.pow(1 - p, n);
  sum += term;
  for (let i = 1; i <= k; i++) {
    term *= (p / (1 - p)) * ((n - i + 1) / i);
    sum += term;
  }
  return Math.min(sum, 1);
}
