"use client";

import { DollarSign, PieChart, Receipt } from "lucide-react";
import FormattedResponse from "@/components/mvp/FormattedResponse";

interface FinanceData {
  direct_response?: string;
  pricing_options?: Array<{
    plan: string;
    price: string;
    target_user?: string;
    metrics?: { arpu?: number };
  }>;
  unit_economics?: Record<string, unknown>;
  initial_costs?: Array<{ item?: string; amount?: string | number }>;
}

interface Props {
  data: FinanceData | null;
}

export default function FinanceCard({ data }: Props) {
  if (!data) {
    return (
      <p className="text-white/50 text-sm">Run KroniQ to generate financial snapshot.</p>
    );
  }

  const hasPlanInResponse = !!(data.pricing_options?.length || (data.unit_economics && Object.keys(data.unit_economics).length > 0) || data.initial_costs?.length);
  const isQuestionOnly = !!data.direct_response && !hasPlanInResponse;

  return (
    <div className="space-y-8">
      {data.direct_response && (
        <section>
          <FormattedResponse content={data.direct_response} />
        </section>
      )}
      {!isQuestionOnly && (
      <>
      {/* Pricing Options */}
      {data.pricing_options && data.pricing_options.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <DollarSign size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Pricing Options
            </h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.pricing_options.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/[0.04]"
              >
                <p className="font-medium text-white/95">{p.plan}</p>
                <p className="text-xl font-semibold text-white mt-1">{p.price}</p>
                {p.target_user && (
                  <p className="text-white/50 text-xs mt-1">{p.target_user}</p>
                )}
                {p.metrics?.arpu != null && (
                  <p className="text-white/40 text-xs mt-2">ARPU: ${p.metrics.arpu}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Initial Costs */}
      {data.initial_costs && data.initial_costs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Receipt size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Initial Costs (First Month)
            </h4>
          </div>
          <div className="rounded-xl border border-white/[0.12] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.04]">
                  <th className="text-left p-3 font-medium text-white/80">Item</th>
                  <th className="text-right p-3 font-medium text-white/80">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.initial_costs.map((c, i) => (
                  <tr key={i} className="border-b border-white/[0.08]">
                    <td className="p-3 text-white/90">{c.item ?? "—"}</td>
                    <td className="p-3 text-right text-white/80">
                      {typeof c.amount === "number"
                        ? `$${c.amount}`
                        : c.amount ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Unit Economics */}
      {data.unit_economics &&
        Object.keys(data.unit_economics).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="icon-container">
                <PieChart size={18} className="text-white/70" />
              </span>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                Unit Economics
              </h4>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.04]">
              <pre className="text-sm text-white/80 whitespace-pre-wrap">
                {JSON.stringify(data.unit_economics, null, 2)}
              </pre>
            </div>
          </section>
        )}
      </>
      )}
    </div>
  );
}
