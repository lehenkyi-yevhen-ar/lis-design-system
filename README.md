# Ліс — дизайн-система

Земляна дизайн-система для сайтів і застосунків: теплий беж, лісовий зелений, кавовий коричневий і теракота. Заголовки — Ermilov, текст — KyivType Sans. Дві теми (темна основна, світла), скляні плаваючі шари в дусі iOS 26, 25 компонентів і шаблонів без фреймворку. Mobile-first: нижня навігація `TabBar`, шторки, зони натиску 44px, safe area.

**Перегляд:** відкрийте GitHub Pages цього репозиторію (Settings → Pages) — сайт `index.html` у корені.

## Підключення

```html
<html lang="uk" data-theme="dark">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="components/bundle.css">
</head>
<body>
  <button class="btn btn--primary">Оформити замовлення</button>
  <script src="components/bundle.js"></script>
  <script>DS.init();</script>
</body>
</html>
```

## Структура

| Шлях | Що |
| --- | --- |
| `index.html` | Документація: бренд-бук, токени, компоненти з живими прикладами |
| `tokens.json` | Джерело всіх значень (кольори двох тем, типографіка, відступи, радіуси, тіні, рух) |
| `tokens.css` | CSS-змінні та `@font-face`, згенеровані з `tokens.json` |
| `mobile.md` | Розділ «Мобільна версія»: брейкпоінти, зони натиску, safe area, навігація, шторки, форми |
| `components/bundle.css` · `bundle.js` | Стилі компонентів і шаблонів · поведінка (`window.DS`) |
| `components/<Name>/` | `preview.html` (живий приклад) і `README.md` (правила) |
| `fonts/` | Ermilov, KyivType Sans |
| `demo/` | Повні сторінки: мобільний прототип (`mobile.html`), магазин, компоненти, основи, типографіка, кольори |

## Шрифти й ліцензії

- **Ermilov** — Кирило Ткачов (Innerspace), шрифт бренду Ukraine Now, вільний для комерційного й приватного використання ([The Village, 2018](https://www.village.com.ua/village/culture/culture-news/274281-shrift-brendu-ukraine-now-viklali-u-vilniy-dostup)).
- **KyivType Sans** — Dmitry Rastvortsev, CC BY-ND 4.0. Файли не змінювати й не конвертувати; вказувати автора.

Ліцензія на сам код дизайн-системи ще не обрана.
