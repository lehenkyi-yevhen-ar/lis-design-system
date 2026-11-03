/** Ліс — runtime API (vanilla JS, no framework). Components are HTML + classes from bundle.css; DS wires the interactive ones. */
declare namespace DS {
  /** Wire every [data-dd], [data-dp], .segmented, [data-tabs], [data-acc], .modal, [data-table], [data-open], [data-tip] inside scope. Safe to call again.
   *  On phones (≤640px) .dd and .dp open as bottom sheets with a .ds-scrim backdrop; inside an iframe an open popover gets room so the frame never clips it. */
  function init(scope?: ParentNode): void;
  /** Show a glass toast. duration 0 = stays until closed. */
  function toast(opts: { type?: 'success' | 'error' | 'warning' | 'info'; title: string; text?: string; action?: { label: string; onClick?: () => void }; duration?: number }): { close(): void };
  /** Controller of a .modal by id: open(opener?) / close(). */
  function modal(id: string): { open(opener?: HTMLElement): void; close(): void };
}
/* Events: dd:change {value,label} · dp:change {start,end} · seg:change {value} · modal:close */
