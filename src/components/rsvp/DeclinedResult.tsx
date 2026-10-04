"use client";

import { useEffect, useState } from "react";
import { isBlessingAmountInput, thailandNowLocal } from "@/lib/blessing";

type BlessingStatus = "idle" | "pending" | "saved" | "error";

export default function DeclinedResult({ name, amount, onAmountChange, transferDate, onTransferDateChange,
  transferHour, onTransferHourChange, transferMinute, onTransferMinuteChange,
  onSubmit, status, error, reference }: {
  name: string;
  amount: string;
  onAmountChange: (value: string) => void;
  transferDate: string;
  onTransferDateChange: (value: string) => void;
  transferHour: string;
  onTransferHourChange: (value: string) => void;
  transferMinute: string;
  onTransferMinuteChange: (value: string) => void;
  onSubmit: () => void;
  status: BlessingStatus;
  error: string;
  reference: string;
}) {
  const [maxLocal, setMaxLocal] = useState("");
  useEffect(() => {
    const update = () => setMaxLocal(thailandNowLocal());
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);
  const today = maxLocal.slice(0, 10);
  const currentHour = maxLocal.slice(11, 13);
  const currentMinute = maxLocal.slice(14, 16);
  const isToday = transferDate === today;
  const frozen = status === "pending" || status === "error";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-12 pt-16 text-center sm:px-8">
      <h2 id="rsvp-result-title" tabIndex={-1} className="font-serif text-3xl text-wine">Thank you, {name}</h2>
      <p className="mt-3 text-foreground/80">We appreciate your kind wishes from afar.</p>
      <p className="mt-6 text-sm leading-relaxed text-foreground/80">If you would like to send a blessing, you can use this QR code. This is entirely optional.</p>
      <div className="mt-7 rounded-sm bg-white p-4 shadow-[0_8px_28px_rgba(81,49,58,0.12)]">
        {/* Keep the supplied payment QR's exact pixels and white border. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/blessings/payment-qr.jpg" alt="Payment QR code for an optional blessing" width="240" height="240" className="h-60 w-60 object-contain" />
      </div>
      <a href="/blessings/payment-qr.jpg" download="Mimeen-Blessing-QR.jpg" className="mt-3 text-sm text-wine underline focus-visible:outline-2 focus-visible:outline-wine">Save QR image</a>
      <p className="mt-2 text-xs text-foreground/70">You can also touch and hold the QR image to save it on your phone.</p>

      <p role="status" aria-live="polite" className={status === "pending" || status === "error" ? "mt-6 text-sm text-foreground/80" : "sr-only"}>
        {status === "pending" ? "Saving your blessing details…" : status === "error"
          ? "Your blessing details are not confirmed. Retry the same details or contact the couple." : ""}
      </p>

      {status === "saved" ? (
        <p role="status" className="mt-8 rounded-sm border border-sage/30 bg-white px-5 py-4 text-sm text-foreground">Thank you. Your blessing details were recorded.</p>
      ) : (
        <form className="mt-8 w-full space-y-5 text-left" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
          <p className="text-center text-sm text-foreground/75">If you made a transfer, please tell us when and how much so we can recognize your gift.</p>
          <div>
            <label htmlFor="blessing-amount" className="block text-sm font-medium text-foreground">Amount (THB)</label>
            <input id="blessing-amount" type="text" inputMode="decimal" autoComplete="off" value={amount} maxLength={9}
              onChange={(event) => { if (isBlessingAmountInput(event.target.value)) onAmountChange(event.target.value); }}
              placeholder="1000.00" disabled={frozen}
              className="mt-1 w-full rounded-sm border border-sage/50 bg-white px-4 py-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-wine" />
          </div>
          <div>
            <label htmlFor="blessing-date" className="block text-sm font-medium text-foreground">Transfer date · Thailand time (UTC+7)</label>
            {/* iOS date controls can add padding outside their declared width. */}
            <div className="mt-1 w-full min-w-0 rounded-sm border border-sage/50 bg-white px-4 py-3 focus-within:outline-2 focus-within:outline-wine">
              <input id="blessing-date" type="date" value={transferDate} max={today || thailandNowLocal().slice(0, 10)}
                onChange={(event) => {
                  const value = event.target.value;
                  onTransferDateChange(value);
                  if (value === today && transferHour > currentHour) { onTransferHourChange(""); onTransferMinuteChange(""); }
                  else if (value === today && transferHour === currentHour && transferMinute > currentMinute) onTransferMinuteChange("");
                }} disabled={frozen}
                className="block h-6 w-full min-w-0 max-w-full appearance-none border-0 bg-transparent p-0 text-left text-base leading-6 text-foreground focus:outline-none [&::-webkit-date-and-time-value]:text-left" />
            </div>
          </div>
          <div>
            <p className="block text-sm font-medium text-foreground">Transfer time · 24-hour format (Thailand)</p>
            <div className="mt-1 flex gap-3">
              <div className="flex-1">
                <label htmlFor="blessing-hour" className="sr-only">Hour (00–23)</label>
                <select id="blessing-hour" value={transferHour} disabled={frozen || !transferDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    onTransferHourChange(value);
                    if (isToday && value === currentHour && transferMinute > currentMinute) onTransferMinuteChange("");
                  }}
                  className="w-full rounded-sm border border-sage/50 bg-white px-4 py-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-wine">
                  <option value="">Hour</option>
                  {Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")).map((hour) => (
                    <option key={hour} value={hour} disabled={isToday && hour > currentHour}>{hour}</option>
                  ))}
                </select>
              </div>
              <span aria-hidden="true" className="self-center text-2xl text-foreground">:</span>
              <div className="flex-1">
                <label htmlFor="blessing-minute" className="sr-only">Minute (00–59)</label>
                <select id="blessing-minute" value={transferMinute} disabled={frozen || !transferDate || !transferHour}
                  onChange={(event) => onTransferMinuteChange(event.target.value)}
                  className="w-full rounded-sm border border-sage/50 bg-white px-4 py-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-wine">
                  <option value="">Minute</option>
                  {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0")).map((minute) => (
                    <option key={minute} value={minute} disabled={isToday && transferHour === currentHour && minute > currentMinute}>{minute}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-800">{error}{reference && <span className="block">Reference: {reference}</span>}</p>}
          <button type="submit" disabled={status === "pending"}
            className="w-full rounded-sm bg-wine px-5 py-3 text-cream disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine">
            {status === "pending" ? "Saving details…" : "Send blessing details"}
          </button>
        </form>
      )}
    </div>
  );
}
