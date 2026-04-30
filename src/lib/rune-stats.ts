/**
 * Valeurs maximales des substats de runes.
 * Sources : community research + elliabot.neocities.org
 *
 * normal  = runes normales (non-immémorial)
 * ancient = runes immémorial (légèrement supérieures)
 */

export type RuneType = "normal" | "ancient";

export const SUBSTAT_MAX: Record<RuneType, Record<string, number>> = {
  normal: {
    HP_FLAT:  2425,
    HP_PCT:   50,
    ATK_FLAT: 130,
    ATK_PCT:  50,
    DEF_FLAT: 130,
    DEF_PCT:  50,
    SPD:      35,
    CR:       30,
    CD:       35,
    RES:      40,
    ACC:      40,
  },
  ancient: {
    HP_FLAT:  2625,
    HP_PCT:   53,
    ATK_FLAT: 145,
    ATK_PCT:  53,
    DEF_FLAT: 145,
    DEF_PCT:  53,
    SPD:      37,
    CR:       31,
    CD:       37,
    RES:      42,
    ACC:      42,
  },
};

export const SUBSTAT_MAX_NO_GRIND: Record<string, number> = {
  HP_FLAT:  1875,
  HP_PCT:   40,
  ATK_FLAT: 100,
  ATK_PCT:  40,
  DEF_FLAT: 100,
  DEF_PCT:  40,
  SPD:      30,
  CR:       30,
  CD:       35,
  RES:      40,
  ACC:      40,
};
