import { PipelineTicket } from "../types/ticket";
import { DecisionBadge, ActionBadge, DeliveryBadge, ConfidenceBadge } from "./Badge";

interface TicketDetailProps {
  ticket: PipelineTicket;
  onBack: () => void;
}

export default function TicketDetail({ ticket, onBack }: TicketDetailProps) {
  const { ticket: t, decision, order, precedents, ai } = ticket;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-purple-700">{t.ticket_id}</span>
            <DecisionBadge status={decision.status} />
            <ActionBadge action={decision.action} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-5">

        {/* Top info grid */}
        <div className="grid grid-cols-2 gap-4">

          {/* Ticket + Decision */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ticket Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Issue</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5">{t.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Ticket ID</div>
                  <div className="font-mono text-sm font-bold text-purple-700 mt-0.5">{t.ticket_id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Order ID</div>
                  <div className="font-mono text-sm font-medium text-gray-700 mt-0.5">{t.order_id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Details</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Order Value", value: `₹${order.value_inr}` },
                { label: "Items", value: `${order.items} item${order.items > 1 ? "s" : ""}` },
                { label: "Delivery Time", value: `${order.delivery_time_min} min` },
                { label: "Delivery Status", value: <DeliveryBadge status={order.delivery_status} /> },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Decision</h2>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <DecisionBadge status={decision.status} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Confidence</div>
              <ConfidenceBadge value={decision.confidence} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Recommended Action</div>
              <ActionBadge action={decision.action} />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Reason</div>
              <div className="text-xs font-semibold text-gray-700">{decision.reason_code.split(":")[0]}</div>
            </div>
          </div>

          {/* AUTO_RESOLVE — show evidence summary */}
          {decision.status === "AUTO_RESOLVE" && decision.reason_code.includes(":") && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                <span className="text-xs font-semibold text-green-700">Auto-resolve evidence</span>
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                {decision.reason_code.split(": ").slice(1).join(": ")}
              </p>
            </div>
          )}

          {/* HUMAN_REVIEW — show policy constraint */}
          {decision.status === "HUMAN_REVIEW" && decision.reason_code.startsWith("POLICY_VIOLATION") && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-amber-600 text-xs">⚠</span>
                <span className="text-xs font-semibold text-amber-700">Policy Constraint</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                {decision.reason_code.split(": ").slice(1).join(": ")}
              </p>
            </div>
          )}

          {/* Other HUMAN_REVIEW reasons */}
          {decision.status === "HUMAN_REVIEW" && !decision.reason_code.startsWith("POLICY_VIOLATION") && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-orange-700 mb-0.5">Review Required</div>
              <div className="text-xs text-orange-600">{decision.reason_code}</div>
            </div>
          )}
        </div>

        {/* AI Response */}
        {ai && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Internal Explanation
                <span className="ml-2 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">FOR AGENT</span>
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{ai.explanation}</p>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Customer Reply
                <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-medium">SEND TO CUSTOMER</span>
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{ai.customer_reply}</p>
              <button className="mt-3 w-full text-sm py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                Copy Reply
              </button>
            </div>
          </div>
        )}

        {/* Precedents */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Historical Precedents ({precedents.length} similar cases)
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {precedents.map((p, i) => (
              <div key={p.ticket_id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-purple-600">{p.ticket_id}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {Math.round(p.similarity * 100)}% match
                  </span>
                </div>
                <ActionBadge action={p.action} />
                <p className="text-xs text-gray-500 mt-1.5">{p.resolution_note}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] text-gray-400">CSAT</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <div key={star} className={`w-2 h-2 rounded-sm ${star <= p.csat ? "bg-yellow-400" : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600">{p.csat}/5</span>
                </div>
                <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.similarity * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
