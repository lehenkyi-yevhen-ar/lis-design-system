# Select

Власний випадний список і меню дій зі скляним меню (`glass-strong`). Замінює системний `<select>`.

## Розмітка
`.dd[data-dd]` > `button.select.dd__trigger` (з `.dd__value`) + `.dd__menu.glass-strong` > `.dd__opt[data-value]`.
Меню дій: `data-dd="menu"`, тригер — будь-яка `.btn`. Початкове значення — `data-value` на `.dd`.

## Варіанти
- Опис і іконка: `<svg class="lead-ic">` + `<small>` усередині пункту; `data-label` — що показати в тригері.
- Пошук: `.dd__search` першим у меню; групи — `.dd__group`; роздільник — `.dd__sep`; небезпечний пункт — `.dd__opt--danger`; гаряча клавіша — `<kbd>`.
- Недоступний варіант: `aria-disabled="true"` (видно, але не вибрати). Помилка: `.field.is-error`.
- Праворуч від тригера: `.dd--right`. Меню само відкривається вгору біля краю екрана.

## Поведінка (DS.init)
↑↓ Home End, Enter/Space — вибір, Esc — закрити, літери — пошук за початком. ARIA listbox/menu. Подія `dd:change` {value, label}.
Пункти мають `radius-md` (концентрично до меню `radius-lg` з відступом 6px).
