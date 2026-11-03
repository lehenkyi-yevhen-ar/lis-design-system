# Card

Контейнер товару, статті чи показника: `.card` (`surface`, `border`, `radius-lg`).

- Клікабельна картка — одне посилання `a.card.card--interactive`: піднімається на 3px з `elevation-2`, зображення збільшується. Кнопки всередині — `preventDefault`.
- Структура: `.card__media` (4:3; `.card__badges`, `.card__fav` — скляна кнопка поверх фото) + `.card__body` (`.card__eyebrow`, `.card__title`, `.card__text`, `.card__meta`, `.card__foot`).
- Ціна — `.price` (Ermilov 22px); зі знижкою — `.price--sale` + `<s>` стара ціна. Немає в наявності — ціна `color-text-muted`, кнопка «Повідомити».
- Показник — `.card.stat` (`.stat__label`, `.stat__value`, бейдж динаміки). Горизонтальна — `.card--h`.
- Завантаження — скелетон тієї ж форми (`.skel`), не спінер.
