# Tabs

Розділи контенту на одному місці з підкресленням, що ковзає (`color-primary`, `ease-emphasized`).

- `[data-tabs]` > `.tabs__list` > `button.tabs__tab[aria-controls]` + `.tabs__panel#id` (неактивні — `hidden`).
- ←→ Home End перемикають; ARIA tablist. Лічильник — `badge` у табі.
- 2–3 рівноцінні варіанти вигляду → `SegmentedControl`.
