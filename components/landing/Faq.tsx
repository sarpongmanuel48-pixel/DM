"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    q: "Do I need to connect a platform to use DM?",
    a: "No — plain links work on their own, connecting is optional.",
  },
  {
    q: "Does DM ever touch my payments?",
    a: "No — checkout always happens on the platform you connected.",
  },
];

export function Faq() {
  const [open, setOpen] = useState([false, false]);

  return (
    <section className="mx-auto max-w-[720px] px-8 py-24">
      <h2
        className="m-0 mb-8 font-bold"
        style={{ fontFamily: "var(--l-font-display)", fontSize: 36, letterSpacing: "-0.6px", color: "var(--l-ink)" }}
      >
        Questions
      </h2>
      <div className="flex flex-col">
        {QUESTIONS.map((item, i) => {
          const isOpen = open[i];
          const isLast = i === QUESTIONS.length - 1;
          return (
            <div
              key={item.q}
              style={{
                borderTop: "1px solid var(--l-hairline)",
                borderBottom: isLast ? "1px solid var(--l-hairline)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setOpen((s) => s.map((v, idx) => (idx === i ? !v : v)))}
                className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent py-6 text-left text-base font-semibold"
                style={{ fontFamily: "var(--l-font-display)", color: "var(--l-ink)" }}
              >
                <span>{item.q}</span>
                <span
                  className="flex-none text-[13px] transition-transform duration-[180ms] ease-in-out"
                  style={{ color: "var(--l-ink)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  ▾
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-[180ms] ease-in-out"
                style={{ maxHeight: isOpen ? 120 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <p className="m-0 pb-6 text-[15px] leading-normal" style={{ color: "var(--l-body)" }}>
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
