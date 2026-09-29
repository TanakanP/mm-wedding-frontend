"use client";

import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle, RefreshCw, X } from "lucide-react";
import InvitationCard from "./InvitationCard";
import styles from "./InvitationCard.module.css";
import { renderInvitationPng } from "@/lib/invitationExport";
import { getInvitationFilename } from "@/lib/invitationFilename";
import { WEDDING } from "@/content/wedding";
import type { RSVPFormValues } from "@/lib/rsvp";

type PreparedPicture = { blob: Blob; url: string };

export default function AcceptedResult({ data, onClose }: { data: RSVPFormValues; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [prepared, setPrepared] = useState<PreparedPicture | null>(null);
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let url = "";
    const prepare = async () => {
      setPrepared(null);
      setError("");
      setPreparing(true);
      try {
        if (!cardRef.current) throw new Error("Card is unavailable");
        const blob = await renderInvitationPng(cardRef.current);
        if (!active) return;
        url = URL.createObjectURL(blob);
        setPrepared({ blob, url });
      } catch {
        if (active) setError("We couldn't prepare your picture. Please try again.");
      } finally {
        if (active) setPreparing(false);
      }
    };
    void prepare();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [data.name, retry]);

  const download = () => {
    if (!prepared) {
      if (!preparing) setRetry((count) => count + 1);
      return;
    }
    setError("");
    const filename = getInvitationFilename(data.name);
    const link = document.createElement("a");
    link.href = prepared.url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadLabel = preparing ? "Preparing invitation" : prepared ? "Download invitation" : "Retry preparing invitation";
  return (
    <div className={styles.result}>
      <h2 id="rsvp-result-title" tabIndex={-1} className="sr-only">Your invitation card</h2>
      <p role="status" aria-live="polite" className="sr-only">
        {preparing ? "Preparing your invitation." : prepared ? "Your invitation is ready to download." : ""}
      </p>
      <div className={styles.source} aria-hidden={Boolean(prepared)}>
        <InvitationCard ref={cardRef} guestName={data.name} />
      </div>
      {prepared && (
        // The personalized image is available to touch and hold as soon as export completes.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={prepared.url}
          alt={`Invitation card for ${data.name}. ${WEDDING.invitation.brideName} and ${WEDDING.invitation.groomName}, ${WEDDING.dateLabel}. With love, for you. We can’t wait to celebrate with you.`}
          className={styles.preview} />
      )}
      <div className={styles.toolbar}>
        <button type="button" onClick={download} disabled={preparing}
          className={styles.iconButton} aria-label={downloadLabel} title={downloadLabel}>
          {preparing ? <LoaderCircle aria-hidden="true" className={styles.spinner} size={23} /> :
            prepared ? <Download aria-hidden="true" size={23} /> : <RefreshCw aria-hidden="true" size={22} />}
        </button>
        <button type="button" onClick={onClose} className={styles.iconButton} aria-label="Close RSVP dialog" title="Close">
          <X aria-hidden="true" size={24} />
        </button>
      </div>
      {prepared && !error && <p className={styles.mobileHint}>Touch and hold the card to save it</p>}
      {error && <p role="alert" className={styles.message}>{error}</p>}
    </div>
  );
}
