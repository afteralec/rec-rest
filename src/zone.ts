export const ZONE_AMERICA_LOS_ANGELES = "America/Los_Angeles" as const;
export const ZONE_AMERICA_NEW_YORK = "America/New_York" as const;
export const DEFAULT_ZONE: Zone = ZONE_AMERICA_LOS_ANGELES;

export type Zone =
  | typeof ZONE_AMERICA_LOS_ANGELES
  | typeof ZONE_AMERICA_NEW_YORK;
export const VALID_ZONES: { [key in Zone]: boolean } = {
  [ZONE_AMERICA_LOS_ANGELES]: true,
  [ZONE_AMERICA_NEW_YORK]: true,
};

export function isZoneValid(zone: any): zone is Zone {
  if (typeof zone != "string") return false;
  if (!VALID_ZONES[zone as Zone]) return false;

  return true;
}
