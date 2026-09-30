import { forwardRef } from "react";
import styles from "./InvitationCard.module.css";
import { WEDDING } from "@/content/wedding";

const InvitationCard = forwardRef<HTMLDivElement, { guestName: string }>(function InvitationCard({ guestName }, ref) {
  const nameLength = Array.from(guestName).length;
  const nameSize = nameLength > 70 ? "2.3cqw" : nameLength > 35 ? "3.2cqw" : "6cqw";
  const isThai = /[\u0E00-\u0E7F]/.test(guestName);

  return (
    <div ref={ref} className={styles.card} style={{ aspectRatio: "1056 / 1489", containerType: "inline-size" }}>
      {/* Use the original same-origin artwork for consistent full-resolution PNG exports. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.artwork} src="/invitations/romantic-keepsake-v2.png"
        alt={`${WEDDING.invitation.brideName} & ${WEDDING.invitation.groomName} · ${WEDDING.dateLabel}. With love, for you. We can’t wait to celebrate with you. A romantic invitation with a blush bow, sweet peas, and a scalloped border.`}
        width={1056} height={1489} />
      <div className={styles.personalization}>
        <p className={styles.guest} lang={isThai ? "th" : "en"} style={{ fontSize: nameSize }}>{guestName}</p>
      </div>
    </div>
  );
});

export default InvitationCard;
