"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DarkSelect.module.css";

type Option = { value: string; label: string };

export function DarkSelect({
  value,
  onChange,
  options,
  id,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  id?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        id={id}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.triggerText}>{current}</span>
        <span className={styles.chev} aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map((o) => (
            <li key={o.value} role="none">
              <button
                type="button"
                className={
                  o.value === value ? styles.itemActive : styles.item
                }
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
