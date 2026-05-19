-- Fix 1: Set search_path on handle_new_user (Function Search Path Mutable)
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Fix 2: Revoke public EXECUTE on handle_new_user (trigger function, not a public API)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Fix 3: Revoke public EXECUTE on rls_auto_enable
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;

-- Fix 4: Set search_path on rls_auto_enable too (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public';
  END IF;
END;
$$;
