"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { lockDocumentScroll, lockDocumentScrollAtTop } from "@/lib/scroll";
import { WEDDING } from "@/content/wedding";
import { getRelationshipLabel, rsvpSchema, type RSVPFormValues } from "@/lib/rsvp";
import { postRsvp } from "@/lib/rsvpClient";
import { blessingSchema, thailandLocalToIso } from "@/lib/blessing";
import { postBlessing } from "@/lib/blessingClient";
import AcceptedResult from "./rsvp/AcceptedResult";
import cardStyles from "./rsvp/InvitationCard.module.css";
import DeclinedResult from "./rsvp/DeclinedResult";

type ConfirmedRsvp = { submissionId: string; data: RSVPFormValues };

interface RSVPFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function motionProps<T extends object>(reduceMotion: boolean, props: T) {
  return reduceMotion ? {} : props;
}

export default function RSVPForm({ isOpen, onClose }: RSVPFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [website, setWebsite] = useState("");
  const [bringingGuests, setBringingGuests] = useState<"yes" | "no" | null>(null);
  const [closedOutcome, setClosedOutcome] = useState<{ kind: "saved" | "failed"; rsvp?: ConfirmedRsvp } | null>(null);
  const [confirmedRsvp, setConfirmedRsvp] = useState<ConfirmedRsvp | null>(null);
  const submittedData = confirmedRsvp?.data ?? null;
  const attemptRef = useRef<{ fingerprint: string; id: string } | null>(null);
  const blessingAttemptRef = useRef<{ fingerprint: string; id: string } | null>(null);
  const sessionRef = useRef(0);
  const pendingRef = useRef(false);
  const blessingPendingRef = useRef(false);
  const [blessingAmount, setBlessingAmount] = useState("");
  const [blessingDate, setBlessingDate] = useState("");
  const [blessingHour, setBlessingHour] = useState("");
  const [blessingMinute, setBlessingMinute] = useState("");
  const [blessingStatus, setBlessingStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [blessingError, setBlessingError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const submissionStatusRef = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useHydrationSafeReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    return window.matchMedia("(max-width: 767px)").matches
      ? lockDocumentScrollAtTop()
      : lockDocumentScroll();
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    clearErrors,
  } = useForm<RSVPFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      drinksAlcohol: false,
      relation: "",
    }
  });

  const side = watch("side");
  const attending = watch("attending");
  const awaitingGuestChoice = attending === "yes" && bringingGuests === null;
  const validationMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => typeof message === "string");

  const onSubmit = async (data: RSVPFormValues) => {
    if (pendingRef.current || awaitingGuestChoice) return;
    pendingRef.current = true;
    setSubmissionError("");
    const session = sessionRef.current;
    const fingerprint = JSON.stringify(data);
    if (attemptRef.current?.fingerprint !== fingerprint) {
      attemptRef.current = { fingerprint, id: crypto.randomUUID() };
    }
    const submissionId = attemptRef.current.id;
    try {
      await postRsvp(data, submissionId, fetch, website);
      if (session !== sessionRef.current) {
        setClosedOutcome({ kind: "saved", rsvp: { submissionId, data } });
        return;
      }
      setConfirmedRsvp({ submissionId, data });
      setIsSubmitted(true);
    } catch {
      if (session !== sessionRef.current) setClosedOutcome({ kind: "failed" });
      else setSubmissionError("We couldn't confirm your RSVP was saved. Please try again. If you already retried, contact the couple to check for a duplicate.");
    } finally {
      pendingRef.current = false;
    }
  };

  const submitBlessing = async () => {
    if (!confirmedRsvp || blessingPendingRef.current || blessingStatus === "saved") return;
    let transferredAt: string;
    try { transferredAt = thailandLocalToIso(`${blessingDate}T${blessingHour}:${blessingMinute}`, new Date()); }
    catch { setBlessingError("Choose a valid transfer date and time in Thailand time, no later than now."); return; }
    const fingerprint = `${confirmedRsvp.submissionId}|${blessingAmount}|${transferredAt}`;
    if (blessingAttemptRef.current?.fingerprint !== fingerprint) {
      blessingAttemptRef.current = { fingerprint, id: crypto.randomUUID() };
    }
    const payload = { blessingId: blessingAttemptRef.current.id,
      submissionId: confirmedRsvp.submissionId, name: confirmedRsvp.data.name,
      amount: blessingAmount, transferredAt, website: "" };
    if (!blessingSchema.safeParse(payload).success) {
      setBlessingError("Enter an amount from 0.01 to 999,999.99 THB without leading zeros or a minus sign.");
      return;
    }
    blessingPendingRef.current = true;
    setBlessingStatus("pending");
    setBlessingError("");
    try {
      await postBlessing(payload);
      setBlessingStatus("saved");
    } catch {
      setBlessingStatus("error");
      setBlessingError("We couldn't confirm that your blessing details were recorded. Please retry with the same reference, or contact the couple if you are unsure.");
    } finally { blessingPendingRef.current = false; }
  };

  const handleClose = useCallback(() => {
    sessionRef.current++;
    onClose();
    if (pendingRef.current || blessingPendingRef.current) {
      if (pendingRef.current) setSubmissionError("Your RSVP is still processing. Reopen this form to check the result before trying again.");
      return;
    }
    setIsSubmitted(false);
    setConfirmedRsvp(null);
    setSubmissionError("");
    setClosedOutcome(null);
    setWebsite("");
    setBringingGuests(null);
    setBlessingAmount("");
    setBlessingDate("");
    setBlessingHour("");
    setBlessingMinute("");
    setBlessingStatus("idle");
    setBlessingError("");
    blessingAttemptRef.current = null;
    attemptRef.current = null;
    reset();
  }, [onClose, reset]);

  useEffect(() => {
    if (!isOpen || !closedOutcome) return;
    if (closedOutcome.kind === "saved" && closedOutcome.rsvp) {
      setConfirmedRsvp(closedOutcome.rsvp);
      setIsSubmitted(true);
      setSubmissionError("");
    } else {
      setSubmissionError("We couldn't confirm your RSVP was saved. Please try again. A previous attempt may have reached the sheet.");
    }
    setClosedOutcome(null);
  }, [closedOutcome, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? dialogRef.current)?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const focusIsInside = document.activeElement instanceof Node
        && dialogRef.current.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || !focusIsInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !focusIsInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus({ preventScroll: true });
      openerRef.current = null;
    };
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (!isSubmitted) return;

    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("#rsvp-result-title")?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [isSubmitted]);

  const isAccepted = isSubmitted && submittedData?.attending === "yes";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wine/55 p-0 backdrop-blur-sm md:p-4">
          <motion.div
            {...motionProps(reduceMotion, {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
            })}
            className="absolute inset-0"
            onClick={handleClose}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={isSubmitted ? "rsvp-result-title" : "rsvp-dialog-title"}
            aria-describedby="rsvp-dialog-description"
            tabIndex={-1}
            {...motionProps(reduceMotion, {
              initial: { opacity: 0, scale: 0.95, y: 20 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 20 },
            })}
            className={isAccepted ? `${cardStyles.dialog} relative overflow-hidden bg-cream shadow-[0_28px_80px_rgba(46,32,36,.35)]` : "relative flex h-full max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-none border-0 bg-cream shadow-[0_28px_80px_rgba(46,32,36,.35)] backdrop-blur-md md:h-auto md:max-h-[90vh] md:rounded-sm md:border md:border-wine/20"}
          >
            {!isAccepted && <button type="button" onClick={handleClose}
              className="absolute right-4 top-4 z-30 rounded-full bg-cream/90 p-2 text-wine shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
              aria-label="Close RSVP dialog">
              <X className="h-6 w-6" />
            </button>}
            {!isSubmitted && (
              <div className="shrink-0 border-b border-wine/15 bg-cream px-6 pb-4 pt-8 sm:px-8 sm:pb-6 sm:pt-10 md:px-12">
                <h2 id="rsvp-dialog-title" className="mb-2 text-center font-serif text-4xl italic text-wine">The Invitation</h2>
                <p className="text-center font-light text-wine/80">{WEDDING.venue.name}</p>
                <p className="text-center font-light text-wine/80">{WEDDING.timeLabel} | {WEDDING.dateLabel}</p>
              </div>
            )}
            <p id="rsvp-dialog-description" className="sr-only">
              {isSubmitted ? "Your RSVP result and next steps." : "Complete this form to respond to M and M's wedding invitation."}
            </p>
            <p ref={submissionStatusRef} role="status" aria-live="polite" tabIndex={-1} className="sr-only">
              {isSubmitting ? "Submitting your RSVP." : isSubmitted && submittedData
                ? `Thank you, ${submittedData.name}. Your RSVP has been received.` : ""}
            </p>
            {isSubmitted && submittedData ? (
              <div className={isAccepted ? "h-full w-full" : "min-h-0 flex-1 overflow-y-auto bg-cream"}>
                {submittedData.attending === "yes" ? (
                  <AcceptedResult key={submittedData.name} data={submittedData} onClose={handleClose} />
                ) : (
                  <DeclinedResult
                    name={submittedData.name}
                    amount={blessingAmount}
                    onAmountChange={(value) => { setBlessingAmount(value); setBlessingError(""); }}
                    transferDate={blessingDate}
                    onTransferDateChange={(value) => { setBlessingDate(value); setBlessingError(""); }}
                    transferHour={blessingHour}
                    onTransferHourChange={(value) => { setBlessingHour(value); setBlessingError(""); }}
                    transferMinute={blessingMinute}
                    onTransferMinuteChange={(value) => { setBlessingMinute(value); setBlessingError(""); }}
                    onSubmit={() => void submitBlessing()}
                    status={blessingStatus}
                    error={blessingError}
                    reference={blessingAttemptRef.current?.id ?? ""}
                  />
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                aria-busy={isSubmitting}
                className="flex flex-col flex-1 overflow-hidden text-left"
              >
                <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="rsvp-website">Leave this field empty</label>
                  <input id="rsvp-website" name="website" type="text" tabIndex={-1} autoComplete="off"
                    value={website} onChange={(event) => setWebsite(event.target.value)} />
                </div>
                <p className="sr-only" role="alert">
                  {validationMessages.length > 0
                    ? `Please correct the RSVP form. ${validationMessages.join(". ")}.`
                    : ""}
                </p>
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto bg-cream p-6 sm:p-8 md:px-12 md:py-8 flex flex-col gap-4 md:gap-6">
                  {/* 1. Name */}
                  <div className="shrink-0">
                    <label htmlFor="rsvp-name" className="block text-sm font-medium text-foreground mb-1">Tell us your name</label>
                    <input
                      id="rsvp-name"
                      {...register("name")}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "rsvp-name-error" : undefined}
                      className="w-full sm:w-2/3 md:w-1/2 px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                      placeholder="John & Jane Doe"
                      maxLength={100}
                    />
                    {errors.name && <p id="rsvp-name-error" className="text-red-700 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  {/* 2. Side (Groom/Bride) */}
                  <fieldset
                    className="shrink-0"
                    aria-invalid={Boolean(errors.side)}
                    aria-describedby={errors.side ? "rsvp-side-error" : undefined}
                  >
                    <legend className="block text-sm font-medium text-foreground mb-2">Which side are you from?</legend>
                    <div className="flex gap-4">
                      <label htmlFor="rsvp-side-groom" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-side-groom"
                          type="radio"
                          value="groom"
                          {...register("side")}
                          aria-describedby={errors.side ? "rsvp-side-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Groom</span>
                      </label>
                      <label htmlFor="rsvp-side-bride" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-side-bride"
                          type="radio"
                          value="bride"
                          {...register("side")}
                          aria-describedby={errors.side ? "rsvp-side-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Bride</span>
                      </label>
                    </div>
                    {errors.side && <p id="rsvp-side-error" className="text-red-700 text-sm mt-1">{errors.side.message}</p>}
                  </fieldset>

                  {/* 3. Relationship */}
                  <AnimatePresence>
                    {side && (
                      <motion.div 
                        {...motionProps(reduceMotion, {
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 },
                        })}
                        className="overflow-hidden shrink-0"
                      >
                        <div>
                          <label htmlFor="rsvp-relation" className="block text-sm font-medium text-foreground mb-1">{getRelationshipLabel(side)}</label>
                          <input
                            id="rsvp-relation"
                            type="text"
                            {...register("relation")}
                            aria-invalid={Boolean(errors.relation)}
                            aria-describedby={errors.relation ? "rsvp-relation-error" : undefined}
                            className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                            maxLength={100}
                          />
                          {errors.relation && <p id="rsvp-relation-error" className="text-red-700 text-sm mt-1">{errors.relation.message}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 4. Attending */}
                  <fieldset
                    className="shrink-0"
                    aria-invalid={Boolean(errors.attending)}
                    aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}
                  >
                    <legend className="block text-sm font-medium text-foreground mb-2">Will you be attending?</legend>
                    <div className="flex gap-4">
                      <label htmlFor="rsvp-attending-yes" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-attending-yes"
                          type="radio"
                          value="yes"
                          {...register("attending", {
                            onChange: () => {
                              setBringingGuests(null);
                              setValue("guestCount", "0");
                              clearErrors("guestCount");
                            },
                          })}
                          aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Joyfully Accepts</span>
                      </label>
                      <label htmlFor="rsvp-attending-no" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="rsvp-attending-no"
                          type="radio"
                          value="no"
                          {...register("attending", {
                            onChange: () => {
                              setBringingGuests(null);
                              setValue("guestCount", "0");
                              clearErrors("guestCount");
                            },
                          })}
                          aria-describedby={errors.attending ? "rsvp-attending-error" : undefined}
                          className="accent-accent-secondary"
                        />
                        <span className="text-foreground/80">Regretfully Declines</span>
                      </label>
                    </div>
                    {errors.attending && <p id="rsvp-attending-error" className="text-red-700 text-sm mt-1">{errors.attending.message}</p>}
                  </fieldset>

                  {attending === "yes" && (
                    <fieldset className="shrink-0">
                      <legend className="block text-sm font-medium text-foreground mb-2">Will you be bringing any additional guests?</legend>
                      <div className="flex gap-4">
                        {(["yes", "no"] as const).map((choice) => (
                          <label key={choice} htmlFor={`rsvp-bringing-guests-${choice}`} className="flex items-center gap-2 cursor-pointer">
                            <input
                              id={`rsvp-bringing-guests-${choice}`}
                              type="radio"
                              name="bringingGuests"
                              value={choice}
                              checked={bringingGuests === choice}
                              required
                              onChange={() => {
                                setBringingGuests(choice);
                                setValue("guestCount", choice === "no" ? "0" : "1");
                                clearErrors("guestCount");
                              }}
                              className="accent-accent-secondary"
                            />
                            <span className="text-foreground/80">{choice === "yes" ? "Yes" : "No"}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Logic if Attending */}
                    {attending === "yes" && bringingGuests !== null && (
                      <motion.div 
                        key="attending"
                        {...motionProps(reduceMotion, {
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 },
                        })}
                        className="flex flex-col gap-2 md:gap-6 overflow-hidden shrink-0"
                      >
                        {/* Guest Count */}
                        {bringingGuests === "yes" && <div>
                          <label htmlFor="rsvp-guest-count" className="block text-sm font-medium text-foreground mb-1">How many additional guests?</label>
                          <input
                            id="rsvp-guest-count"
                            type="number"
                            min="1"
                            max="99"
                            step="1"
                            required
                            {...register("guestCount")}
                            aria-invalid={Boolean(errors.guestCount)}
                            aria-describedby={errors.guestCount ? "rsvp-guest-count-error" : undefined}
                            className="w-24 px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors bg-cream"
                            placeholder="1"
                          />
                          {errors.guestCount && <p id="rsvp-guest-count-error" className="text-red-700 text-sm mt-1">{errors.guestCount.message}</p>}
                        </div>}

                        {/* Alcohol Checkbox */}
                        <div>
                          <label htmlFor="rsvp-drinks-alcohol" className="flex items-center gap-2 cursor-pointer">
                            <input
                              id="rsvp-drinks-alcohol"
                              type="checkbox"
                              {...register("drinksAlcohol")}
                              aria-describedby="rsvp-drinks-alcohol-help"
                              className="accent-accent-secondary"
                            />
                            <span className="text-foreground font-medium">I will be drinking alcohol</span>
                          </label>
                          <p id="rsvp-drinks-alcohol-help" className="text-xs text-sage mt-1.5 italic">
                            * Our alcohol will be only beers
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Show the note once the attendance questions are answered. */}
                  <AnimatePresence>
                    {attending && !awaitingGuestChoice && (
                      <motion.div
                        {...motionProps(reduceMotion, {
                          initial: { opacity: 0, height: 0 },
                          animate: { opacity: 1, height: "auto" },
                          exit: { opacity: 0, height: 0 },
                        })}
                        className="overflow-hidden shrink-0"
                      >
                        <div>
                          <label htmlFor="rsvp-message" className="block text-sm font-medium text-foreground mb-1">A Note for the Couple</label>
                          <textarea
                            id="rsvp-message"
                            {...register("message")}
                            aria-invalid={Boolean(errors.message)}
                            aria-describedby={errors.message ? "rsvp-message-error" : undefined}
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:ring-accent-secondary focus:border-accent-secondary outline-none transition-colors resize-none bg-cream"
                            placeholder="Leave your wishes..."
                          />
                          {errors.message && <p id="rsvp-message-error" className="text-red-700 text-sm mt-1">{errors.message.message}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer - Static */}
                <div className="shrink-0 p-6 sm:px-8 md:px-12 md:py-8 border-t border-sage/20 bg-cream z-10">
                  {submissionError && (
                    <p role="alert" className="mb-3 text-sm text-red-700">
                      {submissionError}
                      {attemptRef.current && <span className="block mt-1">Reference: {attemptRef.current.id}</span>}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || awaitingGuestChoice}
                    className="w-full rounded-sm bg-wine py-3 font-medium text-cream transition-colors hover:bg-foreground disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
