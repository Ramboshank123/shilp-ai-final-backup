
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'artisan' CHECK (role IN ('artisan','buyer')),
  preferred_language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.artisan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  craft_type TEXT,
  location TEXT,
  years_of_experience INTEGER DEFAULT 0,
  bio TEXT,
  languages TEXT[] DEFAULT ARRAY['en'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artisan_profiles TO authenticated;
GRANT SELECT ON public.artisan_profiles TO anon;
GRANT ALL ON public.artisan_profiles TO service_role;
ALTER TABLE public.artisan_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artisan public read" ON public.artisan_profiles FOR SELECT USING (true);
CREATE POLICY "artisan insert own" ON public.artisan_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "artisan update own" ON public.artisan_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER artisan_updated BEFORE UPDATE ON public.artisan_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.artisan_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  description_hindi TEXT,
  material TEXT,
  colour TEXT,
  size TEXT,
  craft_type TEXT,
  production_time TEXT,
  price NUMERIC DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived','sold')),
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_artisan(_artisan_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.artisan_profiles a WHERE a.id = _artisan_id AND a.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.owns_product(_product_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.products p JOIN public.artisan_profiles a ON a.id = p.artisan_id
    WHERE p.id = _product_id AND a.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_published(_product_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.products p WHERE p.id = _product_id AND p.status = 'published');
$$;

CREATE POLICY "products public read published" ON public.products FOR SELECT USING (status = 'published');
CREATE POLICY "products owner read" ON public.products FOR SELECT TO authenticated USING (public.owns_artisan(artisan_id));
CREATE POLICY "products owner insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.owns_artisan(artisan_id));
CREATE POLICY "products owner update" ON public.products FOR UPDATE TO authenticated USING (public.owns_artisan(artisan_id)) WITH CHECK (public.owns_artisan(artisan_id));
CREATE POLICY "products owner delete" ON public.products FOR DELETE TO authenticated USING (public.owns_artisan(artisan_id));

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  original_image_url TEXT,
  processed_image_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT ON public.product_images TO anon;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images public read" ON public.product_images FOR SELECT USING (public.is_published(product_id));
CREATE POLICY "images owner read" ON public.product_images FOR SELECT TO authenticated USING (public.owns_product(product_id));
CREATE POLICY "images owner write" ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.owns_product(product_id));
CREATE POLICY "images owner update" ON public.product_images FOR UPDATE TO authenticated USING (public.owns_product(product_id)) WITH CHECK (public.owns_product(product_id));
CREATE POLICY "images owner delete" ON public.product_images FOR DELETE TO authenticated USING (public.owns_product(product_id));

CREATE TABLE public.product_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key_features JSONB DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  source_language TEXT DEFAULT 'en',
  confidence_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_details TO authenticated;
GRANT SELECT ON public.product_details TO anon;
GRANT ALL ON public.product_details TO service_role;
ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "details public read" ON public.product_details FOR SELECT USING (public.is_published(product_id));
CREATE POLICY "details owner read" ON public.product_details FOR SELECT TO authenticated USING (public.owns_product(product_id));
CREATE POLICY "details owner write" ON public.product_details FOR INSERT TO authenticated WITH CHECK (public.owns_product(product_id));
CREATE POLICY "details owner update" ON public.product_details FOR UPDATE TO authenticated USING (public.owns_product(product_id)) WITH CHECK (public.owns_product(product_id));
CREATE POLICY "details owner delete" ON public.product_details FOR DELETE TO authenticated USING (public.owns_product(product_id));

CREATE TABLE public.price_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  material_cost NUMERIC DEFAULT 0,
  labour_cost NUMERIC DEFAULT 0,
  packaging_cost NUMERIC DEFAULT 0,
  other_cost NUMERIC DEFAULT 0,
  base_cost NUMERIC DEFAULT 0,
  recommended_min NUMERIC,
  recommended_max NUMERIC,
  market_adjustment NUMERIC,
  margin_percentage NUMERIC,
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_recommendations TO authenticated;
GRANT ALL ON public.price_recommendations TO service_role;
ALTER TABLE public.price_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price owner read" ON public.price_recommendations FOR SELECT TO authenticated USING (public.owns_product(product_id));
CREATE POLICY "price owner write" ON public.price_recommendations FOR INSERT TO authenticated WITH CHECK (public.owns_product(product_id));

CREATE TABLE public.buyer_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES public.artisan_profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_contact TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.buyer_enquiries TO authenticated;
GRANT INSERT ON public.buyer_enquiries TO anon;
GRANT ALL ON public.buyer_enquiries TO service_role;
ALTER TABLE public.buyer_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enquiry anyone create" ON public.buyer_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "enquiry artisan read" ON public.buyer_enquiries FOR SELECT TO authenticated USING (public.owns_artisan(artisan_id) OR buyer_id = auth.uid());
CREATE POLICY "enquiry artisan update" ON public.buyer_enquiries FOR UPDATE TO authenticated USING (public.owns_artisan(artisan_id)) WITH CHECK (public.owns_artisan(artisan_id));
CREATE TRIGGER enquiries_updated BEFORE UPDATE ON public.buyer_enquiries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  model_name TEXT,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_generations TO authenticated;
GRANT ALL ON public.ai_generations TO service_role;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai owner read" ON public.ai_generations FOR SELECT TO authenticated USING (product_id IS NOT NULL AND public.owns_product(product_id));
CREATE POLICY "ai insert" ON public.ai_generations FOR INSERT TO authenticated WITH CHECK (product_id IS NULL OR public.owns_product(product_id));

CREATE OR REPLACE FUNCTION public.increment_product_views(_product_id UUID) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.products SET views = views + 1 WHERE id = _product_id AND status = 'published';
$$;
GRANT EXECUTE ON FUNCTION public.increment_product_views(UUID) TO anon, authenticated;

CREATE POLICY "product images read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "product images owner upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "product images owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "product images owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.categories (name, description, icon) VALUES
 ('Pottery','Clay and terracotta crafts','Flame'),
 ('Textiles','Woven and dyed fabrics','Shirt'),
 ('Handloom','Traditional loom weaving','Layers'),
 ('Bamboo','Bamboo and cane craft','Trees'),
 ('Woodwork','Carved and turned wood','Hammer'),
 ('Jewellery','Handmade ornaments','Gem'),
 ('Embroidery','Hand embroidered work','Scissors'),
 ('Painting','Folk and tribal painting','Palette'),
 ('Metal craft','Brass, copper and bell metal','Wrench'),
 ('Home Décor','Decorative home objects','Home'),
 ('Other','Other handmade crafts','Package');

INSERT INTO public.profiles (id, email, full_name, role, preferred_language) VALUES
 ('11111111-1111-4111-8111-111111111111','meera.demo@shilp.ai','Meera Devi','artisan','hi'),
 ('22222222-2222-4222-8222-222222222222','rakesh.demo@shilp.ai','Rakesh Kumhar','artisan','hi'),
 ('33333333-3333-4333-8333-333333333333','lakshmi.demo@shilp.ai','Lakshmi Bai','artisan','en');

INSERT INTO public.artisan_profiles (id, user_id, craft_type, location, years_of_experience, bio, languages) VALUES
 ('aaaaaaa1-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','Bamboo','Barpeta, Assam',18,'Third generation bamboo weaver crafting baskets and storage for everyday village life.',ARRAY['hi','en']),
 ('aaaaaaa2-0000-4000-8000-000000000002','22222222-2222-4222-8222-222222222222','Pottery','Khurja, Uttar Pradesh',25,'Traditional potter working with local clay on a hand wheel since childhood.',ARRAY['hi']),
 ('aaaaaaa3-0000-4000-8000-000000000003','33333333-3333-4333-8333-333333333333','Handloom','Chanderi, Madhya Pradesh',12,'Handloom weaver specialising in soft cotton scarves and stoles.',ARRAY['en','hi']);

INSERT INTO public.products (id, artisan_id, category_id, name, description, description_hindi, material, colour, size, craft_type, production_time, price, status, views) VALUES
 ('bbbbbbb1-0000-4000-8000-000000000001','aaaaaaa1-0000-4000-8000-000000000001',(SELECT id FROM public.categories WHERE name='Bamboo'),'Handcrafted Bamboo Storage Basket','A sturdy handwoven basket made from locally sourced bamboo. Each basket is shaped by hand over three days, making it ideal for storing grains, linen or everyday household items.','स्थानीय बांस से हाथ से बुनी हुई मजबूत टोकरी। हर टोकरी तीन दिनों में हाथ से तैयार की जाती है।','Bamboo','Natural brown','30 x 30 x 25 cm','Bamboo weaving','3 days',749,'published',124),
 ('bbbbbbb2-0000-4000-8000-000000000002','aaaaaaa2-0000-4000-8000-000000000002',(SELECT id FROM public.categories WHERE name='Pottery'),'Terracotta Diya Set (Set of 12)','A set of twelve hand-thrown terracotta diyas finished with natural polish. Made from river clay and slow fired in a traditional kiln for a warm earthen glow.','बारह हस्तनिर्मित टेराकोटा दीयों का सेट, पारंपरिक भट्टी में धीमी आंच पर पकाया गया।','Terracotta clay','Earthen red','6 cm each','Wheel pottery','2 days',349,'published',210),
 ('bbbbbbb3-0000-4000-8000-000000000003','aaaaaaa3-0000-4000-8000-000000000003',(SELECT id FROM public.categories WHERE name='Handloom'),'Handwoven Cotton Scarf','A lightweight handloom cotton scarf woven on a pit loom with natural dyes. Breathable, soft and finished with hand-knotted tassels.','प्राकृतिक रंगों से हथकरघे पर बुना हल्का सूती दुपट्टा।','Handloom cotton','Indigo and ivory','180 x 60 cm','Handloom weaving','4 days',899,'published',96),
 ('bbbbbbb4-0000-4000-8000-000000000004','aaaaaaa1-0000-4000-8000-000000000001',(SELECT id FROM public.categories WHERE name='Woodwork'),'Wooden Decorative Box','A hand-carved sheesham wood box with traditional floral motifs, finished with natural beeswax polish. Useful for jewellery, keepsakes or spices.','पारंपरिक फूलों की नक्काशी वाला हस्तनिर्मित शीशम लकड़ी का बक्सा।','Sheesham wood','Deep walnut','20 x 14 x 8 cm','Wood carving','5 days',1249,'published',58),
 ('bbbbbbb5-0000-4000-8000-000000000005','aaaaaaa2-0000-4000-8000-000000000002',(SELECT id FROM public.categories WHERE name='Pottery'),'Handcrafted Pottery Vase','A tall studio pottery vase shaped on a hand wheel and glazed in a matte earth tone. Each piece carries subtle variations from the potter''s hand.','हाथ के चाक पर बना लंबा मिट्टी का फूलदान, मैट अर्थ टोन में।','Stoneware clay','Matte sand','32 cm height','Wheel pottery','4 days',1099,'published',143);

INSERT INTO public.product_images (product_id, original_image_url, processed_image_url, is_primary) VALUES
 ('bbbbbbb1-0000-4000-8000-000000000001','/demo/bamboo-basket.jpg','/demo/bamboo-basket.jpg',true),
 ('bbbbbbb2-0000-4000-8000-000000000002','/demo/terracotta-diya.jpg','/demo/terracotta-diya.jpg',true),
 ('bbbbbbb3-0000-4000-8000-000000000003','/demo/cotton-scarf.jpg','/demo/cotton-scarf.jpg',true),
 ('bbbbbbb4-0000-4000-8000-000000000004','/demo/wooden-box.jpg','/demo/wooden-box.jpg',true),
 ('bbbbbbb5-0000-4000-8000-000000000005','/demo/pottery-vase.jpg','/demo/pottery-vase.jpg',true);

INSERT INTO public.product_details (product_id, key_features, ai_generated, source_language) VALUES
 ('bbbbbbb1-0000-4000-8000-000000000001','["Locally sourced bamboo","Hand woven over 3 days","Naturally durable and light","Plastic free storage"]',true,'hi'),
 ('bbbbbbb2-0000-4000-8000-000000000002','["Set of 12 diyas","Natural river clay","Traditional kiln fired","Reusable every festival"]',true,'hi'),
 ('bbbbbbb3-0000-4000-8000-000000000003','["Pit loom woven","Natural dyes","Soft breathable cotton","Hand knotted tassels"]',true,'en'),
 ('bbbbbbb4-0000-4000-8000-000000000004','["Hand carved motifs","Solid sheesham wood","Beeswax finish","Velvet lined base"]',true,'en'),
 ('bbbbbbb5-0000-4000-8000-000000000005','["Hand thrown on wheel","Matte earth glaze","Food safe finish","Unique to each piece"]',true,'hi');
