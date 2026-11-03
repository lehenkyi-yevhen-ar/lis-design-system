# SegmentedControl

Скляний перемикач 2–4 рівноцінних варіантів зі скляною «краплею» (`glass-thumb`), що перетікає між ними.

- `.segmented.glass[role=group][aria-label]` > `button.segmented__btn[aria-pressed]` (+ `data-value`).
- Для перемикання вигляду, теми, періоду. Для розділів контенту — `Tabs`.
- Стрілки ←→ перемикають. Подія `seg:change` {value}; програмно — `el._c.set(value)`.
