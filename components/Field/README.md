# Field

Поле вводу з міткою й підказкою: `.field` > `.field__label` + `.input | .textarea` + `.field__help`.

- Мітка завжди над полем; placeholder — лише приклад. Необов'язкові позначаємо `<span class="opt">· необов'язково</span>`, обов'язкові — ні.
- Помилка: `.field.is-error`; текст `.field__help` пояснює, як виправити («Введіть 9 цифр номера»), а не «Помилка».
- Іконка ліворуч: `.input-wrap` > svg + `.input`; суфікс (₴, кг) — `.input-suffix`.
- Шрифт 16px (`body-m`), висота 44px, `radius-md`, рамка `border-input` кольору `color-border-strong`, фон `input-bg`.
- Для вибору зі списку — `Select`, для дат — `DatePicker`; системні `<select>` і `type="date"` не використовуємо.
