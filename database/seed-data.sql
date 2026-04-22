

-- Seed data for the catalog. image_url uses picsum.photos with a deterministic
-- seed per row so images render reliably without relying on external photo IDs.

insert into public.products (name, description, price, category, image_url, stock_quantity) values

    ('Noise Cancelling Over-Ear Headphones',
     'Wireless Bluetooth headphones with 30 hour battery life and active noise cancellation. Great for studying in a noisy dorm.',
     199.99, 'Electronics',
     'https://picsum.photos/seed/headphones/600/600',
     42),

    ('Mechanical Keyboard, Tactile Brown Switches',
     '87 key tenkeyless layout with hot-swappable switches and RGB backlighting. Ships with PBT keycaps.',
     129.00, 'Electronics',
     'https://picsum.photos/seed/keyboard/600/600',
     75),

    ('4K Webcam with Built-In Ring Light',
     'Clip-on webcam that does 4K at 30fps or 1080p at 60fps. USB-C, plug and play on macOS and Windows.',
     89.50, 'Electronics',
     'https://picsum.photos/seed/webcam/600/600',
     30),

    ('Portable SSD, 1TB USB-C',
     'Pocket sized external drive. Reads at around 1050 MB/s, handy for moving project builds between machines.',
     114.99, 'Electronics',
     'https://picsum.photos/seed/ssd/600/600',
     120),

    ('Ceramic Pour-Over Coffee Dripper',
     'Single-cup dripper with a matching glass carafe. Comes with 50 paper filters to get you started.',
     34.00, 'Home',
     'https://picsum.photos/seed/pourover/600/600',
     60),

    ('Linen Throw Blanket, Sand',
     'Stonewashed linen throw, 50 by 60 inches. Gets softer every wash.',
     72.00, 'Home',
     'https://picsum.photos/seed/linenthrow/600/600',
     25),

    ('Scented Soy Candle, Cedar and Vanilla',
     'Hand-poured soy wax candle in an amber glass jar. Roughly 45 hours of burn time.',
     24.50, 'Home',
     'https://picsum.photos/seed/candle/600/600',
     140),

    ('Matte Black Table Lamp',
     'Minimalist desk lamp with a warm 2700K bulb included. Inline dimmer on the cord.',
     59.99, 'Home',
     'https://picsum.photos/seed/lamp/600/600',
     18),

    ('Heavyweight Cotton Crewneck, Oatmeal',
     '14oz brushed cotton sweatshirt, pre-shrunk. Unisex sizing XS through 2XL.',
     68.00, 'Apparel',
     'https://picsum.photos/seed/crewneck/600/600',
     90),

    ('Everyday Canvas Tote Bag',
     'Natural 12oz canvas with interior pocket and reinforced straps. Holds a 15 inch laptop plus groceries.',
     22.00, 'Apparel',
     'https://picsum.photos/seed/tote/600/600',
     200),

    ('Insulated Stainless Water Bottle, 24oz',
     'Double-walled bottle that keeps drinks cold for 24 hours or hot for 12. Leakproof screw top.',
     32.00, 'Outdoors',
     'https://picsum.photos/seed/bottle/600/600',
     150),

    ('Ultralight Trail Backpack, 20L',
     'Water resistant daypack with padded laptop sleeve and hydration bladder compatibility.',
     89.00, 'Outdoors',
     'https://picsum.photos/seed/backpack/600/600',
     45);
