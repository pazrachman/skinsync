// קליינט Supabase מזויף לבדיקות של מסלולי כישלון (רשת נפלה, שגיאת DB וכו')
// שקשה לייצר מול בסיס נתונים אמיתי. כל from(table) נרשם ב-calls, והתוצאה
// נקבעת לפי "table.op" — op הוא select, אלא אם נקראו insert/update/delete
// (גם כשאחריהם מגיע .select("id")).

type Op = "select" | "insert" | "update" | "delete";
export interface FakeResult {
  data?: unknown;
  error?: { message: string; code?: string } | null;
}

export function fakeSupabase(opts: {
  user?: { id: string } | null;
  results?: Partial<Record<`${string}.${Op}`, FakeResult>>;
}) {
  const calls: { table: string; op: Op }[] = [];

  function from(table: string) {
    const entry: { table: string; op: Op } = { table, op: "select" };
    calls.push(entry);

    const result = () => {
      const r = opts.results?.[`${table}.${entry.op}`] ?? {};
      return Promise.resolve({ data: r.data ?? null, error: r.error ?? null });
    };

    const builder: Record<string, unknown> = {
      then: (onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) =>
        result().then(onFulfilled, onRejected),
      maybeSingle: result,
      single: result,
    };
    for (const op of ["insert", "update", "delete"] as const) {
      builder[op] = () => {
        entry.op = op;
        return builder;
      };
    }
    for (const m of ["select", "eq", "neq", "in", "gte", "lte", "order", "limit"]) {
      builder[m] = () => builder;
    }
    return builder;
  }

  const client = {
    auth: {
      getUser: async () => ({
        data: { user: opts.user === undefined ? { id: "user-1" } : opts.user },
      }),
    },
    from,
  };

  return { client, calls };
}
