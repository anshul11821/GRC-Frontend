/**
 * Course entitlement — whether this account may use GRC 101.
 *
 * The server owns it. `free_access` is a column stamped on the account at signup while free seats
 * remain (backend `FREE_ACCESS_LIMIT`: 0 on local and staging, 100 in production), so the client
 * only has to read what it is told. It replaced a localStorage flag that a fake checkout page set
 * — which meant anyone past the cap could grant themselves a seat by filling in a card form that
 * charged nothing.
 *
 * ponytail: still a UI gate — the API does not check entitlement per endpoint, so the content is
 * reachable with a token whatever this says. That only becomes a real hole when access is worth
 * money; wire it into `deps.require_active_access` before charging anyone.
 */
import type { User } from "./auth";

export function isEntitled(user: User | null | undefined): boolean {
  return !!user?.freeAccess;
}
