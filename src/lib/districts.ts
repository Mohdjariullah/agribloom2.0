import statesMandis from "@/data/indian-states-mandis.json";

type StatesData = {
  states: Record<string, { districts: Record<string, unknown> }>;
};

const data = statesMandis as unknown as StatesData;

// Map of state → sorted district names, derived from the mandi dataset.
export const DISTRICTS_BY_STATE: Record<string, string[]> = Object.fromEntries(
  Object.entries(data.states).map(([state, v]) => [
    state,
    Object.keys(v.districts ?? {}).sort(),
  ])
);

/** Returns the known districts for a state, or [] if we don't have them. */
export function districtsFor(state: string): string[] {
  return DISTRICTS_BY_STATE[state] ?? [];
}
