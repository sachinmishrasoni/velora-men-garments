# VÉLORA MEN — Premium Men's Garments Catalogue

A production-style frontend demo for a premium Indian men's garment shop, built strictly with **HTML5, CSS3, Vanilla JavaScript and JSON**.

## Included

- Premium editorial fashion UI
- Responsive desktop / tablet / mobile layouts
- Announcement marquee
- Sticky transparent-to-solid navbar
- Mobile slide-in navigation
- Hero, category discovery, signature collection and promotional sections
- 24 dynamic products loaded from `products.json` (6 shirts, 6 t-shirts, 6 jeans, 6 trousers)
- New Arrivals and Best Sellers
- Catalogue filtering and sorting
- Search overlay with product search
- Quick View product modal with gallery
- Size, color and quantity selection
- Wishlist persistence with `localStorage`
- Enquiry Bag persistence with `localStorage`
- Single-product WhatsApp enquiry
- Multi-product WhatsApp enquiry
- Newsletter validation
- Toast notifications
- Skeleton loading and JSON load error state
- Back-to-top control
- IntersectionObserver reveal animations
- CSS-only carousel behavior with Vanilla JS controls
- Accessibility-friendly labels, focusable controls and reduced-motion support
- SEO metadata and semantic HTML

## Project Structure

```text
velora-men/
├── index.html
├── products.json
├── README.md
├── .gitignore
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
    ├── logo/
    ├── icons/
    └── images/
```

## Run Locally

Because products are loaded using `fetch('products.json')`, open the project through a local web server instead of directly using `file://`.

### Option 1 — VS Code Live Server

Open the `velora-men` folder in VS Code and start it with Live Server.

### Option 2 — Python

From the project folder:

```bash
python -m http.server 5500
```

Then visit:

```text
http://localhost:5500
```

### Option 3 — Node

If you have a static server available, serve the root folder and open the generated local URL.

## WhatsApp Configuration

The shop WhatsApp number is configured once at the top of:

```text
js/script.js
```

Change:

```js
const WHATSAPP_NUMBER = "919876543210";
```

to the real client's WhatsApp number in international format without `+` or spaces.

## Store Configuration

The demo currently uses:

- Brand: VÉLORA MEN
- Location: Rajouri Garden, New Delhi, India
- Phone / WhatsApp: +91 98765 43210
- Email: hello@veloramen.in
- Timing: Mon – Sun, 10:00 AM – 9:30 PM

Replace these values in `index.html` and the configuration in `js/script.js` before client delivery.

## Product Management

Products are **not hardcoded in HTML**. Edit `products.json` to add, remove or update catalogue items.

Each product supports:

- `id`
- `name`
- `category`
- `subcategory`
- `price`
- `discountPrice`
- `rating`
- `reviews`
- `badge`
- `description`
- `sizes`
- `colors`
- `images`
- `featured`
- `newArrival`

## Image Sources

The demo uses remote Unsplash image URLs for fashion photography. Internet access is therefore required for the full visual experience. Replace the URLs with licensed client imagery for production use.

A visual fallback is provided for product-card image failures.

## Notes

- This is a catalogue/enquiry website, not a payment checkout.
- WhatsApp is the primary enquiry/order channel.
- Wishlist and enquiry bag are frontend-only and stored in browser `localStorage`.
- Newsletter validation is frontend-only; no backend/email service is connected.
- Social links are placeholders and should be replaced with the client's real profiles.
- Footer company/customer-care links are demo anchors and should be connected to real pages when available.

## Browser Compatibility

Designed for current modern browsers supporting ES6+, CSS Grid, IntersectionObserver, Fetch API and localStorage.
