Remove the title overlay (`<h3>{topic.t}</h3>`) from each card in `ContentSection` of `MindHackerLanding.tsx`. The topic name is already baked into the artwork, so the overlay duplicates it.

Keep:
- The Roman numeral tag (`I`–`VI`) in the corner — it's small, identifies the card, and isn't redundant with the image.
- `alt={topic.t}` on `<Picture>` for a11y/SEO.

Change: replace the bottom `flex justify-between` row with a tag-only corner, positioned with logical inset so it flips under RTL/LTR.

File: `src/components/landing/mindhacker/MindHackerLanding.tsx` only.
