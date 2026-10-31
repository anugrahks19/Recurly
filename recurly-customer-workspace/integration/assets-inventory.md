# Assets and theme

No bitmap assets are bundled. The two overlapping mint and ochre circles in the brand mark are CSS. Google Fonts supplies Playfair Display, Montserrat, and Material Symbols Outlined at runtime; self-host them if external font requests are unsuitable.

`src/shared/styles/tokens.css` matches the staff workspace's palette, including `--surface: #f7faf8`, `--primary: #36675b`, `--mint: #a2d5c6`, and `--ochre: #feda54`. `global.css` carries the common layout and component language; `customer.css` adds only customer-specific page layouts.
