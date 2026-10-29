/* Edit these settings in a text editor. No build step or API keys. */
window.JAXTON_CONFIG = {
  calUrl: "", // Your ONE shared event URL: https://cal.com/your-name/property-shoot
  // Create a required Cal.com booking question with identifier "service".
  // Use option values Images, Video, Bundle, First shoot to match the values below.
  calServiceField: "service",
  calServiceValues: { images: "Images", video: "Video", bundle: "Bundle", first: "First shoot" },
  introductoryPrice: 0, // Change to 49 later. Does not change your Cal.com settings.
  prices: { images: 125, video: 200, bundle: 299 },
  defaultTheme: "light",
  heroImage: "assets/images/hero.webp",
  heroIsSample: true,
  gallery: [
    { src: "assets/images/gallery-wide.webp", alt: "Illustrative aerial view of a home in the Colorado foothills", isSample: true },
    { src: "assets/images/gallery-overhead.webp", alt: "Illustrative overhead view of a home and its landscaped property", isSample: true }
  ],
  // Keep placeholders true during design review. For launch, set false to hide
  // this entire section until you have genuine reviews. Never invent a rating.
  showReviewPlaceholders: true,
  reviews: [], // Genuine reviews only: [{ quote: "...", name: "..." }]
  googleReviewsUrl: "" // Optional verified public Google reviews URL
};
