# Navbar

Скляна капсула головної навігації: логотип, посилання, дії. `nav.navbar.glass` > `.navbar__logo` + `.navbar__links` + `.navbar__actions`.

- Активний пункт — `aria-current="page"` (скляна «крапля» `glass-thumb`). Кути концентричні: кнопки всередині — капсули.
- До 860px посилання й `.navbar__hide-sm` ховаються, з'являється `.navbar__burger`, що відкриває `Modal` `.modal--drawer.from-left` зі списком `.nav-list` (Ermilov 22px, великими).
- На сторінці — у `.site-header` (sticky, `z-sticky`, ховається при прокрутці вниз). Логотип — слово «Ліс» в Ermilov, поки немає знака.
