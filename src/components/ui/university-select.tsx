"use client";

import { Select } from "./forms";
import { catalog } from "@/lib/catalog";
import { useCachedQuery } from "@/lib/use-query";

/**
 * University dropdown, options maintained by admins (POST /admin/universities).
 * A value that isn't in the list (older free-text profile) is kept as its own option so
 * editing another field never silently wipes it.
 */
export function UniversitySelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) {
  const { data } = useCachedQuery("catalog:universities", catalog.universities);
  const names = (data ?? []).map((u) => u.name);
  const options = value && !names.includes(value) ? [value, ...names] : names;

  return (
    <Select icon="book" required={required} value={value} onChange={onChange}>
      <option value="" disabled>Select a university</option>
      {options.map((n) => <option key={n} value={n}>{n}</option>)}
    </Select>
  );
}
