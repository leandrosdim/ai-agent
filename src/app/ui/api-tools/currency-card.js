export function CurrencyCard({ data }) {
  if (!data) return null;

  const { query, convertedAmount, unitRate, date, source } = data || {};
  const from = query?.from;
  const to = query?.to;
  const amount = query?.amount;

  return (
    <div className="border border-zinc-700 rounded p-3 text-sm">
      <div className="font-medium mb-1">
        {amount} {from} → {to}
      </div>
      <div className="mb-1">
        <span className="opacity-70">Converted:</span>{" "}
        <span className="font-semibold">{convertedAmount} {to}</span>
      </div>
      {typeof unitRate === "number" && (
        <div className="mb-1 opacity-90">
          1 {from} = {unitRate} {to}
        </div>
      )}
      <div className="opacity-60 text-xs">
        Date: {date || "—"} · Source: {source}
      </div>
    </div>
  );
}
