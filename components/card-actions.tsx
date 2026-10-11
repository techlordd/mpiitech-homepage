'use client';
import { useId, useRef, useState, type ReactNode } from 'react';
import { EmailForm } from './forms';
import { ArrowIcon, MailIcon } from './illustrations';

/**
 * A card's button row: an optional leading button, "Explore the skills", and an
 * optional trailing button, all on one line. The skills panel opens below the row
 * and stays in the page while closed so search engines still read it.
 */
export function CardActions({ panel, leading, trailing, className = '', panelClassName = '' }: {
  panel?: ReactNode; leading?: ReactNode; trailing?: ReactNode; className?: string; panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <>
    <div className={`card-actions ${className}`}>
      {leading}
      {panel && <button type="button" className="path-button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span>Explore <span className="hide-narrow">the </span>skills</span><span className="pill-arrow"><ArrowIcon/></span>
      </button>}
      {trailing}
    </div>
    {panel && <div id={id} className={`skills-panel ${panelClassName}`} hidden={!open}>{panel}</div>}
  </>;
}

/** "Notify me" button that opens the sign-up form in a pop-up. */
export function NotifyButton({ programme }: { programme: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return <>
    <button type="button" className="notify-button" aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); dialog.current?.querySelector('input')?.focus(); }}>
      <span className="notify-button-icon"><MailIcon/></span>Notify me
    </button>
    <dialog ref={dialog} className="notify-dialog" aria-labelledby={titleId} onClick={e => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
      <div className="notify-dialog-body">
        <button type="button" className="dialog-close" aria-label="Close" onClick={() => dialog.current?.close()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
        </button>
        <span className="notify-dialog-icon"><MailIcon/></span>
        <h3 id={titleId} className="notify-title">Get notified when {programme} starts</h3>
        <p>We’ll email you when applications open. No spam, just the one update.</p>
        <EmailForm kind="programme" programme={programme} label="Your email address" hideLabel/>
      </div>
    </dialog>
  </>;
}
