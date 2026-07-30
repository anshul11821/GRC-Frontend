"use client";

import { useState } from "react";
import { Select, TextInput } from "./forms";
import { catalog } from "@/lib/catalog";
import { useCachedQuery } from "@/lib/use-query";

const OTHER = "__other__";

/**
 * University dropdown, options maintained by admins (POST /admin/universities), with an
 * "Other" option that reveals a free-text box. The stored value is always the plain name.
 * A loaded value that isn't in the list (older free-text profile) shows as "Other" so
 * editing another field never silently wipes it.
 */
export function UniversitySelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
}) {
  const { data } = useCachedQuery("catalog:universities", catalog.universities);
  const names = (data ?? []).map((u) => u.name);
  const [other, setOther] = useState(false);
  const isOther = other || (data != null && value !== "" && !names.includes(value));
  // While the list is still loading, keep the current value selectable so it doesn't flash blank.
  const options = !isOther && value && !names.includes(value) ? [value, ...names] : names;

  const pick = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const picked = e.target.value === OTHER;
    setOther(picked);
    // "Other" starts from an empty box, never the previously picked university.
    if (picked) e.target.value = "";
    onChange(e);
  };

  return (
    <div className="space-y-2">
      <Select icon="book" required={required} value={isOther ? OTHER : value} onChange={pick}>
        <option value="" disabled>Select a university</option>
        {options.map((n) => <option key={n} value={n}>{n}</option>)}
        <option value={OTHER}>Other</option>
      </Select>
      {isOther && (
        <TextInput
          required={required}
          value={value}
          onChange={onChange}
          aria-label="University name"
          placeholder="Enter your university name"
        />
      )}
    </div>
  );
}
