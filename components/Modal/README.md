# Modal

Модальне вікно й бокова панель. Вікно щільне (`surface-3`, `elevation-4`, `radius-xl`) — це контент, не скло; фон затемнюється й розмивається.

- `.modal#id` > `.modal__overlay` + `.modal__dialog` > `.modal__head` (`.modal__title` — h3 Ermilov, `.modal__close`) + `.modal__body` + `.modal__foot`.
- Відкрити: кнопка з `data-open="id"` або `DS.modal(id).open()`. Закрити: `[data-close]`, Esc, клік по фону.
- Фокус утримується у вікні й повертається на кнопку; сторінка не прокручується. Підтвердження — `data-role="alertdialog"`, `.modal__icon`, `autofocus` на безпечній дії.
- Бокова панель: `.modal--drawer` (праворуч) або `.from-left` (мобільне меню, можна `.glass-strong`). До 640px вікно виїжджає знизу шторкою на всю ширину.
