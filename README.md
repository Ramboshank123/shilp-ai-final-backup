# Craft Connect AI

Build a complete, functional, mobile-first web application called "SHILP AI" for the Smart India Hackathon problem statement SIH26090:

"AI-Driven Market Linkage and Smart Cataloging Mobile Application for Marginalized Artisans."

The application should be designed as a production-quality college hackathon MVP, not merely a static UI mockup.

Use:

- React + TypeScript
- Tailwind CSS
- Modern component-based architecture
- Supabase for backend
- Supabase PostgreSQL database
- Supabase Authentication
- Supabase Storage
- Supabase Row Level Security
- Responsive mobile-first design
- Smooth modern animations using an appropriate animation library such as Framer Motion

====================================================

1. APPLICATION OBJECTIVE
   \====================================================

SHILP AI is a centralized digital platform that helps marginalized artisans convert handmade products into professional digital listings with minimal technical knowledge.

The artisan should be able to:

1. Select a preferred language.
2. Create an artisan profile.
3. Take or upload a product photograph.
4. Improve the product photograph through an AI image studio.
5. Describe the product using their voice.
6. Convert speech into text.
7. Generate structured product information using AI.
8. Generate a professional product description.
9. Translate the description into another supported language.
10. Receive an AI-assisted price recommendation.
11. Review and edit the generated catalogue.
12. Publish the product.
13. Make the product visible in a marketplace.
14. Receive buyer enquiries.
15. Manage products and enquiries from an artisan dashboard.

The buyer should be able to:

1. Browse artisan products.
2. Search products.
3. Filter products by category.
4. View complete product information.
5. View artisan information.
6. Contact the artisan.

The central workflow is:

PHOTO + VOICE
↓
AI IMAGE PROCESSING
↓
VOICE TO TEXT
↓
AI PRODUCT INFORMATION EXTRACTION
↓
MULTILINGUAL CATALOGUE
↓
AI PRICE RECOMMENDATION
↓
ARTISAN APPROVAL
↓
PUBLISH
↓
BUYER MARKETPLACE
↓
BUYER ENQUIRY
↓
ARTISAN

==================================================== 2. TARGET USERS
====================================================

There are two primary roles:

A. ARTISAN
B. BUYER

Artisan characteristics:

- May have limited digital literacy
- May prefer regional Indian languages
- May not be comfortable typing
- May have limited e-commerce knowledge
- May use a smartphone as the primary device
- Needs extremely simple workflows

Buyer characteristics:

- Wants to discover authentic handmade products
- Needs clear product information
- Needs transparent pricing
- Needs an easy way to contact artisans

==================================================== 3. DESIGN LANGUAGE
====================================================

Create a premium, modern Indian handicraft-inspired design.

Visual characteristics:

- Warm cream/off-white base
- Terracotta-inspired accent
- Muted green secondary accent
- Dark charcoal text
- Soft neutral cards
- Rounded corners
- Soft shadows
- Large touch-friendly buttons
- Modern typography
- Clean icons
- Spacious layouts
- Subtle craft-inspired patterns

The design must NOT look outdated or overly decorative.

It should look like a modern startup product suitable for a national-level hackathon.

Prioritize:

- simplicity
- accessibility
- readability
- trust
- visual storytelling
- ease of use

Use large buttons and icons because the target artisan may not have high digital literacy.

==================================================== 4. ANIMATIONS
====================================================

Use subtle professional animations throughout the application.

Implement:

- Splash screen fade-in
- Logo animation
- Page transition animations
- Button press animation
- Card entrance animation
- Bottom navigation transitions
- Microphone pulsing animation
- AI processing animation
- Image processing progress animation
- Catalogue generation animation
- Success check animation
- Toast notifications
- Modal transitions
- Marketplace product-card animations
- Skeleton loading states

Do not use excessive or distracting animations.

Animations should improve the feeling of quality and responsiveness.

==================================================== 5. SCREEN STRUCTURE
====================================================

Create the following screens.

---

SCREEN 1 — SPLASH SCREEN
----------------------------------------------------

Display:

SHILP AI

"From Craft to Customer"

"Your AI-powered digital business assistant"

Add subtle craft-inspired animated graphics.

Automatically move to language selection.

---

SCREEN 2 — LANGUAGE SELECTION
----------------------------------------------------

Title:

"Choose your language"

Options:

English
Hindi
Telugu
Tamil
Kannada
Marathi

Use large selectable cards.

For the MVP, English and Hindi must work completely.

The application architecture must allow additional Indian languages later.

Button:

"Continue"

Save the language preference in the database/profile.

---

SCREEN 3 — LOGIN / SIGN UP
----------------------------------------------------

Provide:

Login
Create Account

Fields:

Email
Password

Optional:

Continue as Demo User

Use Supabase Authentication.

Provide clear validation and error messages.

---

SCREEN 4 — ARTISAN PROFILE SETUP
----------------------------------------------------

Title:

"Tell us about your craft"

Fields:

Full name
Craft type
Location
Preferred language
Years of experience
Short biography

Craft categories:

Pottery
Textiles
Handloom
Bamboo
Woodwork
Jewellery
Embroidery
Painting
Metal craft
Other

Store this information in Supabase.

---

SCREEN 5 — ARTISAN DASHBOARD
----------------------------------------------------

Show:

"Good morning, [Artisan Name]"

Statistics:

Total Products
Published Products
Views
Buyer Enquiries

Primary CTA:

"+ Add New Product"

Secondary sections:

My Products
Marketplace
Messages
Profile

Add an AI Business Coach card.

Example:

"AI Business Tip"

"Adding a clear product photograph can help buyers understand your product better."

---

SCREEN 6 — ADD PRODUCT
----------------------------------------------------

Title:

"Create a new product"

Large action cards:

TAKE PHOTO
UPLOAD PHOTO
DESCRIBE WITH VOICE

Also:

"Enter details manually"

The voice option should be highly visible.

---

SCREEN 7 — CAMERA
----------------------------------------------------

Create a mobile camera-style interface.

Provide:

Camera preview
Capture button
Gallery button
Retake
Use Photo

Allow actual image upload.

Store uploaded images using Supabase Storage.

---

SCREEN 8 — AI IMAGE STUDIO
----------------------------------------------------

Title:

"AI Product Studio"

Show:

Before
After

AI processing animation:

"Analyzing product..."
"Removing distracting background..."
"Improving lighting..."
"Optimizing composition..."
"Preparing catalogue image..."

After processing, show the processed image.

Buttons:

Use This Image
Retake
Edit

If a real image-processing API is not configured, create a clearly separated demo fallback while maintaining an architecture that allows a real AI image-processing API to be connected later.

Never expose API keys in frontend code.

---

SCREEN 9 — VOICE DESCRIPTION
----------------------------------------------------

Title:

"Tell us about your product"

Subtitle:

"You don't need to type. Just speak."

Large animated microphone.

States:

Ready
Listening
Transcribing
Processing
Complete

Example speech:

"This is a handmade bamboo basket. It takes three days to make and is made from locally sourced bamboo."

Display the recognized text inside an editable text area.

Buttons:

Use This
Record Again
Edit

Use browser/mobile speech recognition where supported.

Provide manual text input as a fallback.

---

SCREEN 10 — AI CATALOGUE GENERATOR
----------------------------------------------------

Title:

"Creating your catalogue"

Show an animated AI processing sequence.

Extract and generate:

Product Name
Category
Material
Colour
Size
Craft Type
Production Time
Description
Key Features

Generate a professional product title.

Example:

"Handcrafted Bamboo Storage Basket"

Generate a professional description.

Provide language tabs:

English
Hindi

Every AI-generated field MUST remain editable.

Buttons:

Regenerate
Edit
Continue

---

SCREEN 11 — AI PRICE ASSISTANT
----------------------------------------------------

Title:

"Recommended Price"

Ask for:

Material Cost
Labour Cost
Packaging Cost
Other Costs
Production Time

Calculate:

Base Cost =
Material + Labour + Packaging + Other Costs

Then apply a configurable margin and market adjustment.

Example:

Material Cost: ₹250
Labour: ₹250
Packaging: ₹40
Other: ₹30

Base Cost: ₹570

Recommended Range:

₹699 - ₹799

Display WHY:

• Production cost
• Labour contribution
• Packaging
• Suggested margin
• Comparable market prices
• Product characteristics

Clearly state:

"AI-assisted recommendation. You can change the final price."

Allow manual price editing.

Store pricing recommendation history.

---

SCREEN 12 — PRODUCT PREVIEW
----------------------------------------------------

Display a complete professional catalogue.

Include:

Product image
Product name
Category
Description
Materials
Craft type
Production time
Price
Artisan name
Location

Buttons:

Edit
Save Draft
Publish

---

SCREEN 13 — PUBLISH SUCCESS
----------------------------------------------------

Show an animated success state.

Message:

"Your product is now visible to buyers."

Display the published product card.

Buttons:

View Product
Go to Marketplace
Back to Dashboard

---

SCREEN 14 — BUYER MARKETPLACE
----------------------------------------------------

Create a clean marketplace.

Search bar:

"Search handmade products..."

Categories:

All
Pottery
Textiles
Bamboo
Wood
Jewellery
Home Décor
Handloom

Product cards must show:

Image
Product Name
Price
Craft
Artisan
Location

Use smooth animations.

---

SCREEN 15 — PRODUCT DETAILS
----------------------------------------------------

Display:

Large product photograph
Product name
Price
Description
Materials
Craft information
Production time
Artisan information
Location

Buttons:

Contact Artisan
Share Product

Do not implement payment processing in this MVP.

The objective is market linkage.

---

SCREEN 16 — BUYER ENQUIRY
----------------------------------------------------

Fields:

Buyer Name
Contact Information
Message

Default message:

"Hi, I am interested in this product."

Button:

Send Enquiry

Store the enquiry in Supabase.

---

SCREEN 17 — ARTISAN MESSAGES
----------------------------------------------------

Display buyer enquiries.

Each card:

Buyer
Product
Message
Date
Status

Actions:

Reply
Mark as Contacted

---

SCREEN 18 — MY PRODUCTS
----------------------------------------------------

Tabs:

Drafts
Published
Archived

Each product displays:

Image
Name
Price
Status
Views
Enquiries

Actions:

Edit
View
Delete
Archive

---

SCREEN 19 — ARTISAN PROFILE
----------------------------------------------------

Display:

Profile picture
Name
Craft
Location
Languages
Experience
Biography

Allow editing.

---

SCREEN 20 — AI BUSINESS COACH
----------------------------------------------------

Provide contextual recommendations.

Examples:

"Your product photograph could benefit from better lighting."

"Similar products are commonly priced between ₹700 and ₹800."

"Adding product dimensions could make the listing more useful to buyers."

"Your bamboo products may appeal to eco-conscious home décor buyers."

Recommendations should be generated from product data where possible.

==================================================== 6. DATABASE — SUPABASE
====================================================

Use Supabase PostgreSQL.

Create the following tables.

---

TABLE: profiles
----------------------------------------------------

id UUID PRIMARY KEY
email TEXT
full_name TEXT
role TEXT
preferred_language TEXT
avatar_url TEXT
created_at TIMESTAMP
updated_at TIMESTAMP

role values:

artisan
buyer

---

TABLE: artisan_profiles
----------------------------------------------------

id UUID PRIMARY KEY
user_id UUID REFERENCES profiles(id)
craft_type TEXT
location TEXT
years_of_experience INTEGER
bio TEXT
languages TEXT[]
created_at TIMESTAMP
updated_at TIMESTAMP

---

TABLE: categories
----------------------------------------------------

id UUID PRIMARY KEY
name TEXT
description TEXT
icon TEXT
created_at TIMESTAMP

---

TABLE: products
----------------------------------------------------

id UUID PRIMARY KEY
artisan_id UUID REFERENCES artisan_profiles(id)
category_id UUID REFERENCES categories(id)

name TEXT
description TEXT
description_hindi TEXT

material TEXT
colour TEXT
size TEXT
craft_type TEXT
production_time TEXT

price NUMERIC
currency TEXT DEFAULT 'INR'

status TEXT

views INTEGER DEFAULT 0

created_at TIMESTAMP
updated_at TIMESTAMP

status values:

draft
published
archived
sold

---

TABLE: product_images
----------------------------------------------------

id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)

original_image_url TEXT
processed_image_url TEXT

is_primary BOOLEAN DEFAULT false

created_at TIMESTAMP

---

TABLE: product_details
----------------------------------------------------

id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)

key_features JSONB
ai_generated BOOLEAN DEFAULT false
source_language TEXT
confidence_score NUMERIC

created_at TIMESTAMP

---

TABLE: price_recommendations
----------------------------------------------------

id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)

material_cost NUMERIC
labour_cost NUMERIC
packaging_cost NUMERIC
other_cost NUMERIC

base_cost NUMERIC

recommended_min NUMERIC
recommended_max NUMERIC

market_adjustment NUMERIC
margin_percentage NUMERIC

reasoning TEXT

created_at TIMESTAMP

---

TABLE: buyer_enquiries
----------------------------------------------------

id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)
artisan_id UUID REFERENCES artisan_profiles(id)

buyer_id UUID REFERENCES profiles(id)

buyer_name TEXT
buyer_contact TEXT
message TEXT

status TEXT DEFAULT 'new'

created_at TIMESTAMP
updated_at TIMESTAMP

status values:

new
contacted
closed

---

TABLE: ai_generations
----------------------------------------------------

id UUID PRIMARY KEY
product_id UUID REFERENCES products(id)

generation_type TEXT
input_data JSONB
output_data JSONB

model_name TEXT
language TEXT

created_at TIMESTAMP

generation_type values:

image
speech
translation
description
catalogue
pricing
business_advice

==================================================== 7. SUPABASE STORAGE
====================================================

Create a storage bucket:

product-images

Organize files approximately as:

product-images/
{artisan_id}/
{product_id}/
original/
processed/

Use secure access policies.

Do not expose private files unnecessarily.

==================================================== 8. SUPABASE SECURITY
====================================================

Implement Row Level Security.

Artisans should only be able to:

- read their own profile
- update their own profile
- create their own products
- edit their own products
- delete their own products
- view enquiries associated with their products

Buyers should be able to:

- view published products
- create enquiries
- view their own enquiries

Do not expose service-role keys to the frontend.

Use environment variables for sensitive credentials.

==================================================== 9. AI SERVICE ARCHITECTURE
====================================================

Create a separate AI service layer.

Use functions/modules such as:

generateProductDescription()
extractProductDetails()
translateProduct()
generatePriceRecommendation()
generateBusinessAdvice()
transcribeVoice()
processProductImage()

The frontend must never contain secret API keys.

Use environment variables.

AI responses should be validated before being inserted into the database.

If an AI API is unavailable, use a clearly labelled demo/fallback mode so the application remains usable for the hackathon demonstration.

==================================================== 10. DATA TYPES
====================================================

Use TypeScript interfaces/types for:

User
Profile
ArtisanProfile
Product
ProductImage
ProductDetails
Category
PriceRecommendation
BuyerEnquiry
AIGeneration
Language

Use strict TypeScript typing.

Do not use unnecessary "any" types.

==================================================== 11. PRODUCT DATA CHARACTERISTICS
====================================================

Every product should support:

Product name
Category
Material
Colour
Size
Craft type
Production time
Description
Key features
Images
Price
Language
Artisan
Location
Status
Views
Buyer enquiries
Creation date

Product descriptions should be:

- clear
- professional
- culturally respectful
- concise
- buyer-friendly
- editable by the artisan

==================================================== 12. MULTILINGUAL DESIGN
====================================================

Create a localization system.

Do not hard-code all text directly inside components.

Use translation dictionaries.

Initial supported languages:

English
Hindi

Architecture should support:

Telugu
Tamil
Kannada
Marathi

The language selected by the user should control UI labels and catalogue language where possible.

==================================================== 13. RESPONSIVE DESIGN
====================================================

Primary target:

Mobile phone.

Also support:

Tablet
Desktop

On mobile:

Use bottom navigation for:

Home
Products
Marketplace
Messages
Profile

On desktop:

Use a sidebar/navigation layout.

==================================================== 14. NAVIGATION
====================================================

Artisan:

Splash
→ Language
→ Login
→ Profile Setup
→ Dashboard
→ Add Product
→ Camera/Upload
→ AI Image Studio
→ Voice
→ Catalogue
→ Pricing
→ Preview
→ Publish
→ Dashboard

Buyer:

Login
→ Marketplace
→ Product Details
→ Contact Artisan
→ Enquiry Sent

==================================================== 15. LOADING / ERROR STATES
====================================================

Every asynchronous operation needs:

Loading state
Success state
Error state
Retry option

Examples:

"Processing your image..."

"Generating your catalogue..."

"Unable to process the image. Try again."

"Voice recognition is unavailable. You can type instead."

Never allow an API failure to crash the application.

==================================================== 16. DEMO DATA
====================================================

Populate the database with realistic fictional demo data.

Create example products:

1. Handmade Bamboo Storage Basket
2. Terracotta Diya Set
3. Handwoven Cotton Scarf
4. Wooden Decorative Box
5. Handcrafted Pottery Vase

Create fictional artisan profiles.

Do not use real people's personal information.

==================================================== 17. DEMO MODE
====================================================

Provide a clearly labelled Demo Mode for hackathon presentation.

The demo must allow the complete journey without requiring complex configuration.

The ideal demo:

1. Login
2. Dashboard
3. Add Product
4. Upload Bamboo Basket image
5. AI Image Studio
6. Voice description
7. AI Catalogue
8. AI Pricing
9. Publish
10. Marketplace
11. Open product
12. Send buyer enquiry
13. Show enquiry in artisan dashboard

==================================================== 18. UX PRINCIPLES
====================================================

Follow these principles:

ONE PRIMARY ACTION PER SCREEN.

Use plain language.

Use icons together with text.

Use large buttons.

Avoid unnecessary forms.

Allow editing of AI-generated information.

Show progress during AI processing.

Always provide a way to go back.

Never trap the user inside a process.

==================================================== 19. HACKATHON QUALITY
====================================================

The final application should feel like a real startup MVP.

It should demonstrate:

AI +
Mobile UX +
Multilingual accessibility +
Database +
Authentication +
Cloud storage +
Marketplace +
Market linkage +
Transparent pricing

Do not make the application look like a collection of disconnected AI demos.

All features must connect into ONE coherent artisan workflow.

==================================================== 20. IMPORTANT IMPLEMENTATION REQUIREMENT
====================================================

Build actual functional components.

Do not create buttons that only look clickable.

Every important button must perform an action.

Forms must validate input.

Products must persist to Supabase.

Images must be uploaded to Supabase Storage.

Published products must appear in the marketplace.

Buyer enquiries must be stored in Supabase and appear for the artisan.

Authentication must work.

Navigation must work.

Use realistic loading and success states.

==================================================== 21. FINAL OUTPUT
====================================================

After building the application, provide:

1. Working application
2. Complete source code
3. Supabase database schema
4. Supabase storage configuration
5. Authentication configuration
6. RLS policies
7. Environment variables required
8. README
9. Setup instructions
10. Deployment instructions
11. AI integration instructions
12. Demo account instructions

Before considering the project complete:

- test all major routes
- test authentication
- test product creation
- test image upload
- test product publishing
- test marketplace
- test buyer enquiry
- test artisan enquiry view
- check mobile responsiveness
- check console errors
- fix broken buttons
- fix broken navigation
- fix database errors

Do not stop at a static prototype.

Build the complete functional MVP.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/57d94973-619b-41d1-8e38-22a2e222c421).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## SHILP AI on Replit

The app now runs as a single TanStack Start web application and keeps the
existing Lovable/Supabase architecture intact.

### Run locally or in Replit

Install the dependencies from the repository lockfile, then start the web
workflow:

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 5000
```

The Replit workflow is already configured with this command and serves the
preview on port `5000`.

### Environment variables

The Supabase client reads these public project settings:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Set the `VITE_` values for browser builds and the non-prefixed values for
server-side rendering. Do not commit credentials or service-role keys.

The optional server-side AI catalogue, translation, pricing and business coach
functions use `LOVABLE_API_KEY`. If it is not configured, the app uses clearly
labelled deterministic fallback content so the demo journey remains usable.
The on-device image studio and browser speech recognition do not require an AI
key.

### Data and storage

The migrations in `supabase/migrations/` create the profiles, artisan profiles,
categories, products, images, product details, price recommendations, buyer
enquiries and AI generation tables. They also configure row-level security,
demo catalogue records and the private `product-images` storage bucket.

Product images are stored under:

```text
product-images/{user_id}/{product_id}/{original|processed}/
```

The app stores paths rather than exposing private storage URLs directly and
resolves signed URLs when displaying an authenticated product.

### Demo mode

From the login screen, choose **Continue as Demo User**. Demo mode provides a
complete local journey:

1. Create a product from a photo, voice description or manual entry.
2. Enhance the photo in the on-device AI Product Studio.
3. Generate and edit a multilingual catalogue.
4. Review a transparent price recommendation.
5. Publish the listing.
6. Open it in the marketplace and send a buyer enquiry.
7. Review the enquiry in Messages.

When Supabase is connected, authentication, product creation, image uploads,
publishing and enquiries use the existing Supabase helpers in `src/lib/`.

### Production build

```sh
npm run build
npm run preview
```

Use the existing Replit deployment configuration to publish the built
TanStack Start application. No payment processing is included in this MVP;
the product goal is market linkage between buyers and artisans.
