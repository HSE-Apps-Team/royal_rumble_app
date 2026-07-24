const CORRECT_DOMAIN = "hsestudents.org";
// Anything further than this from CORRECT_DOMAIN is treated as a different,
// intentional domain (e.g. a personal gmail.com) rather than a typo of it.
const MAX_DOMAIN_EDIT_DISTANCE = 3;

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Repairs student/mentor emails so the domain is exactly "hsestudents.org",
// without altering the local (username) part of the address:
//  - "smithjoh000" (no @ at all) -> "smithjoh000@hsestudents.org"
//  - "smithjoh000@hsestudent.org" (typo'd domain) -> "smithjoh000@hsestudents.org"
//  - "smithjoh000@gmail.com" (unrelated domain) -> left unchanged
export function fixEmail(rawEmail: string | null | undefined): string | null | undefined {
  if (!rawEmail) return rawEmail;

  const trimmed = rawEmail.trim().toLowerCase();
  if (!trimmed) return rawEmail;

  const atIndex = trimmed.lastIndexOf("@");

  if (atIndex === -1) {
    return `${trimmed}@${CORRECT_DOMAIN}`;
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  if (domain.toLowerCase() === CORRECT_DOMAIN) {
    return `${localPart}@${CORRECT_DOMAIN}`;
  }

  const distance = levenshtein(domain.toLowerCase(), CORRECT_DOMAIN);
  if (distance <= MAX_DOMAIN_EDIT_DISTANCE) {
    return `${localPart}@${CORRECT_DOMAIN}`;
  }

  return trimmed;
}
