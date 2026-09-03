-- Grant EXECUTE privileges on RLS helper functions.
-- These functions are required by Row Level Security (RLS) policies on products,
-- product_images, product_details, buyer_enquiries, price_recommendations, and ai_generations.
-- Revoking execute on them causes error 42501 (permission denied for function owns_artisan).

GRANT EXECUTE ON FUNCTION public.owns_artisan(UUID) TO authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.owns_product(UUID) TO authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.is_published(UUID) TO authenticated, anon, public;
