"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Data } from "@puckeditor/core";
import {
  parseHtmlFields,
  applyFieldToHtml,
  findCustomHtmlBlocks,
  type EditField,
} from "@/lib/html-block-editor";
import { DarkSelect } from "./DarkSelect";
import styles from "./PuckStudio.module.css";

function FieldRow({
  field,
  onApply,
}: {
  field: EditField;
  onApply: (field: EditField, value: string) => void;
}) {
  const [draft, setDraft] = useState(field.value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(field.value);
  }, [field.value]);

  const applyColor = useCallback(
    (val: string) => {
      setDraft(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onApply(field, val), 300);
    },
    [field, onApply]
  );

  const applyBlur = useCallback(() => {
    onApply(field, draft);
  }, [field, draft, onApply]);

  if (field.inputType === "color") {
    const safeHex = /^#[0-9a-fA-F]{3,6}$/.test(draft) ? draft : "#000000";
    return (
      <div className={styles.editRow}>
        <label className={styles.editLabel}>{field.subLabel}</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            className={styles.colorInput}
            value={safeHex}
            onChange={(e) => applyColor(e.target.value)}
          />
          <input
            className={styles.colorText}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={applyBlur}
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editRow}>
      <label className={styles.editLabel}>{field.subLabel}</label>
      <input
        className={styles.input}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={applyBlur}
        spellCheck={false}
      />
    </div>
  );
}

export function HtmlEditPanel({
  data,
  onApply,
}: {
  data: Data;
  onApply: (blockId: string, newHtml: string) => void;
}) {
  const blocks = findCustomHtmlBlocks(data);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [localHtml, setLocalHtml] = useState<string>(blocks[0]?.html ?? "");
  const localHtmlRef = useRef(localHtml);
  localHtmlRef.current = localHtml;
  const [fields, setFields] = useState<EditField[]>([]);

  // Auto-select first block when none is selected yet
  useEffect(() => {
    if (!selectedId && blocks.length > 0) {
      setSelectedId(blocks[0].id);
    }
  }, [blocks, selectedId]);

  // Reload html when the selected block changes
  useEffect(() => {
    if (!selectedId) { setFields([]); return; }
    const block = blocksRef.current.find((b) => b.id === selectedId);
    if (!block) { setFields([]); return; }
    setLocalHtml(block.html);
    localHtmlRef.current = block.html;
    setFields(parseHtmlFields(block.html));
  // blocks intentionally omitted — we don't want to reset on every data update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleApply = useCallback(
    (field: EditField, value: string) => {
      if (!selectedId) return;
      const newHtml = applyFieldToHtml(localHtmlRef.current, field, value);
      localHtmlRef.current = newHtml;
      setLocalHtml(newHtml);
      setFields(parseHtmlFields(newHtml));
      onApply(selectedId, newHtml);
    },
    [selectedId, onApply]
  );

  if (blocks.length === 0) {
    return (
      <div className={styles.panel}>
        <p className={styles.panelIntro}>
          Add a Custom HTML block to the page to edit its properties here.
        </p>
      </div>
    );
  }

  const selectOptions = blocks.map((b) => ({ value: b.id, label: b.label }));
  const colorFields = fields.filter((f) => f.category === "color");
  const textFields  = fields.filter((f) => f.category === "text");
  const imageFields = fields.filter((f) => f.category === "image");
  const linkFields  = fields.filter((f) => f.category === "link");

  return (
    <div className={`${styles.panel} ${styles.editPanel}`}>
      <label className={styles.fieldLab} htmlFor="edit-block-select">
        Block
      </label>
      <DarkSelect
        id="edit-block-select"
        aria-label="Select block to edit"
        value={selectedId ?? ""}
        onChange={setSelectedId}
        options={selectOptions}
      />

      {fields.length === 0 ? (
        <p className={styles.muted}>
          No editable properties found. Use inline styles or standard elements
          (headings, paragraphs, images, links) to see controls here.
        </p>
      ) : (
        <>
          {colorFields.length > 0 && (
            <div className={styles.editSection}>
              <div className={styles.editSectionTitle}>Colors</div>
              {colorFields.map((f, i) => (
                <FieldRow key={`c-${f.nodeIdx}-${i}`} field={f} onApply={handleApply} />
              ))}
            </div>
          )}
          {textFields.length > 0 && (
            <div className={styles.editSection}>
              <div className={styles.editSectionTitle}>Text</div>
              {textFields.map((f, i) => (
                <FieldRow key={`t-${f.nodeIdx}-${i}`} field={f} onApply={handleApply} />
              ))}
            </div>
          )}
          {imageFields.length > 0 && (
            <div className={styles.editSection}>
              <div className={styles.editSectionTitle}>Images</div>
              {imageFields.map((f, i) => (
                <FieldRow key={`i-${f.nodeIdx}-${i}`} field={f} onApply={handleApply} />
              ))}
            </div>
          )}
          {linkFields.length > 0 && (
            <div className={styles.editSection}>
              <div className={styles.editSectionTitle}>Links</div>
              {linkFields.map((f, i) => (
                <FieldRow key={`l-${f.nodeIdx}-${i}`} field={f} onApply={handleApply} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
