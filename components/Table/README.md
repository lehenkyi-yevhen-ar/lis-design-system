# Table

Таблиця даних: пошук, сортування, вибір рядків із масовими діями. `.table-card[data-table]` > `.table-toolbar` + `.table-scroll > table.table` + `.table-foot` + `.bulkbar`.

- Сортування: `th > button.th-sort` (+ `data-type="num"`); значення для сортування — `data-v` на клітинці. `aria-sort` ставить DS.
- Вибір: перша колонка `.w-check` з `.check`; масові дії — скляна `.bulkbar` внизу екрана (`z-sticky`).
- Пошук: `input[data-filter]`; порожній результат — `[data-empty]`.
- Цифри праворуч (`.num`), `tabular-nums`; статуси — `badge--dot`; дії рядка — `Select` з `data-dd="menu"`.
- На вузьких екранах таблиця гортається вбік усередині `.table-scroll` (min-width 720px).
