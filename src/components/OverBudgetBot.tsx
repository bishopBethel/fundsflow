export const OVER_BUDGET_MESSAGE = "Oh, we're over budget. We need extra funds."

// Paint is literal on every shape: html-to-image drops stylesheet-driven SVG
// fill/stroke, and the greys are picked to read on both canvas themes.
export function OverBudgetBot() {
  return (
    <>
      <div className="over-budget-bot" aria-hidden="true">
        <svg className="bot-figure" viewBox="0 0 40 40" width={40} height={40}>
          <rect x="8" y="33" width="24" height="10" rx="4" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
          <rect x="17" y="29" width="6" height="5" fill="#71717a" />
          <g className="bot-head">
            <line x1="20" y1="9" x2="20" y2="5" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
            <circle cx="20" cy="3.5" r="2.5" fill="#ef4444" />
            <rect x="3" y="16" width="3" height="6" rx="1" fill="#71717a" />
            <rect x="34" y="16" width="3" height="6" rx="1" fill="#71717a" />
            <rect x="6" y="8" width="28" height="22" rx="6" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
            <rect x="9.5" y="11.5" width="21" height="15" rx="4" fill="#f4f4f5" />
            <line className="bot-brow bot-brow-l" x1="12" y1="14" x2="17.5" y2="14" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
            <line className="bot-brow bot-brow-r" x1="22.5" y1="14" x2="28" y2="14" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
            <circle className="bot-pupil" cx="15" cy="18.5" r="2.2" fill="#18181b" />
            <circle className="bot-pupil" cx="25" cy="18.5" r="2.2" fill="#18181b" />
            <path className="bot-mouth" d="M16.5 24 Q20 20.5 23.5 24" fill="none" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
            <ellipse className="bot-tear" cx="27.5" cy="23" rx="1.1" ry="1.7" fill="#60a5fa" />
          </g>
        </svg>
      </div>
      <p className="over-budget-bubble">{OVER_BUDGET_MESSAGE}</p>
    </>
  )
}
