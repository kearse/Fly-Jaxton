# JAXTON

Static real estate drone website for Colorado Springs. HTML, CSS and vanilla JavaScript, with local fonts and supplied logo artwork. No install or build step.

## Hosting

Serve this repository root. GitHub Pages should use main / (root). CNAME preserves flyjaxton.com. Upload index.html, css/, js/, and assets/ to any normal static host.

## Booking setup

Edit js/config.js and set calUrl to your shared Cal.com event URL. Until configured, the sample calendar does not create appointments. Create a required booking question with identifier service and options Images, Video, Bundle, First shoot matching calServiceValues. Configure availability, property address, timezone, same-day notice and service pricing in Cal.com. Verify real bookings before launch.

## Content

Regular prices: photos $125, video $200, bundle $299. First shoot free. introductoryPrice controls the displayed intro offer; it does not change Cal.com settings. Images and reviews are labeled placeholders. Replace sample photos with your footage and add genuine reviews in js/config.js. First-shoot eligibility is tracked manually. No checkout or HubSpot integration is included.
