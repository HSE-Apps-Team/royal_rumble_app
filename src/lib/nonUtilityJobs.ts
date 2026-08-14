// Config for "non-utility" mentor jobs: roles whose homepage is just
// welcome + job + event details + additional info, with no extra
// functionality. Add a new job here and its dynamic route,
// login redirect, and content editor entry will need to be added too.

export type NonUtilityJobSlug = "hallway_host" | "utility_squad" | "cca_convos";

export interface NonUtilityJobConfig {
  slug: NonUtilityJobSlug;
  dbJob: string;
  label: string;
  contentKey: string;
}

export const NON_UTILITY_JOBS: Record<NonUtilityJobSlug, NonUtilityJobConfig> = {
  hallway_host: {
    slug: "hallway_host",
    dbJob: "HALLWAY HOST",
    label: "Hallway Host",
    contentKey: "hallway_host_more_details",
  },
  utility_squad: {
    slug: "utility_squad",
    dbJob: "UTILITY SQUAD",
    label: "Utility Squad",
    contentKey: "utility_squad_more_details",
  },
  cca_convos: {
    slug: "cca_convos",
    dbJob: "CCA CONVOS",
    label: "CCA Convos",
    contentKey: "cca_convos_more_details",
  },
};

export function getNonUtilityJobConfig(
  slug: string,
): NonUtilityJobConfig | undefined {
  return NON_UTILITY_JOBS[slug as NonUtilityJobSlug];
}
