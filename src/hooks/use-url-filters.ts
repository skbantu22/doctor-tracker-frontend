"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Filter state lives in the URL so views are shareable, survive refresh and keep
 * their filters when the admin navigates back. Changing any filter resets `page`.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const values = useMemo(
    () => Object.fromEntries(keys.map((key) => [key, searchParams.get(key) ?? ""])) as Record<K, string>,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keys is a static tuple per caller
    [searchParams],
  );
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const update = useCallback((changes: Partial<Record<K | "page", string | number>>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value === undefined || (key === "page" && Number(value) <= 1)) next.delete(key);
      else next.set(key, String(value));
    }
    if (!("page" in changes)) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);
  const activeCount = keys.filter((key) => key !== "search" && values[key]).length;

  return { values, page, update, setPage: (value: number) => update({ page: value } as Partial<Record<K | "page", number>>), clear, activeCount };
}
