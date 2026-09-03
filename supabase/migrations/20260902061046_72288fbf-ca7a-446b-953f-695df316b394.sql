
GRANT EXECUTE ON FUNCTION public.owns_artisan(UUID) TO authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.owns_product(UUID) TO authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.is_published(UUID) TO authenticated, anon, public;
