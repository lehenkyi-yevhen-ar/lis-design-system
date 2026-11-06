/** Ліс — runtime API. Components are HTML + classes from bundle.css; DS wires the interactive ones.
 *  React 18+ (loaded BEFORE bundle.js) adds thin wrappers over the same classes: DS.Button, DS.Field, DS.Badge, DS.useDS. */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: one per screen · accent: promo only · danger: irreversible, with a confirmation in Modal. Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  /** sm 36px (dense tables/toolbars) · md 44px · lg 52px (hero, checkout). Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Square icon button — aria-label is required. */
  icon?: boolean;
  /** Pill shape. */
  round?: boolean;
  /** Full width. */
  block?: boolean;
  /** Spinner; the label stays for layout, clicks are ignored. */
  loading?: boolean;
}
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Default 'neutral'. A status is always a word, never colour alone. */
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  /** Filled — one accent per product card. */
  solid?: boolean;
  /** Leading dot — tables and lists. */
  dot?: boolean;
  /** Counter pill (ignores tone). */
  count?: boolean;
}
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Hint under the field. */
  help?: React.ReactNode;
  /** Error text — replaces help, turns on the error state and aria-invalid. `true` = state only. */
  error?: string | boolean;
  /** Adds «· необов'язково» to the label. Required fields are not marked. */
  optional?: boolean;
  /** Leading icon node (inline svg). */
  icon?: React.ReactNode;
  /** Trailing unit text (₴, кг). */
  suffix?: string;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
}

declare namespace DS {
  /** Wire every [data-dd], [data-dp], .segmented, [data-tabs], [data-acc], .modal, [data-table], [data-open], [data-tip] inside scope. Safe to call again.
   *  On phones (≤640px) .dd and .dp open as bottom sheets with a .ds-scrim backdrop; inside an iframe an open popover gets room so the frame never clips it. */
  function init(scope?: ParentNode): void;
  /** Show a glass toast. duration 0 = stays until closed. */
  function toast(opts: { type?: 'success' | 'error' | 'warning' | 'info'; title: string; text?: string; action?: { label: string; onClick?: () => void }; duration?: number }): { close(): void };
  /** Controller of a .modal by id: open(opener?) / close(). */
  function modal(id: string): { open(opener?: HTMLElement): void; close(): void };
  /** React only. Runs DS.init(ref.current) after mount and whenever deps change — for markup with .dd / .dp / [data-tabs] / [data-acc] / .modal / [data-table] / [data-tip]. */
  function useDS(ref: React.RefObject<HTMLElement>, deps?: React.DependencyList): void;
  /** React only. Wrappers over the .btn / .badge / .field classes. */
  const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
  const Badge: React.FC<BadgeProps>;
  const Field: React.ForwardRefExoticComponent<FieldProps & React.RefAttributes<HTMLInputElement | HTMLTextAreaElement>>;
}
/* Events: dd:change {value,label} · dp:change {start,end} · seg:change {value} · modal:close */
