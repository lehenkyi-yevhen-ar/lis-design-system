# DatePicker

Власний календар замість `input type="date"`: одна дата або період, у поповері зі скла чи вбудований.

- `.dp[data-dp]` > `button.select.dd__trigger` + `.dp__pop.glass-strong` (порожній — DS.init наповнить). Вбудований: `.dp.dp--inline`.
- `data-mode="range"` — період (кількість ночей у футері); `data-min="today"` — блокує минулі дати.
- Тиждень з понеділка, місяці українською (`листопада`), вихідні — `color-accent-text`, сьогодні — кільце `color-secondary`, вибране — `color-primary`.
- Назва місяця — `h4` (Ermilov). Стрілки навігації круглі (`--btn-radius: radius-full`).
- Клавіатура: стрілки — день/тиждень, PageUp/PageDown — місяць, Home/End — тиждень, Enter — вибір, Esc — закрити. Подія `dp:change` {start, end}.
