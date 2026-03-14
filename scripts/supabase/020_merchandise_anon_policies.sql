-- Merchandise orders: allow anon read/write so app works with anon key (like other tables).
-- Run after 016_merchandise_orders.sql. If you use Supabase Auth and want only authenticated
-- access, skip this migration or drop these policies.

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.merchandise_orders;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.merchandise_order_items;

CREATE POLICY "Allow anon read write merchandise_orders" ON public.merchandise_orders
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read write merchandise_order_items" ON public.merchandise_order_items
  FOR ALL USING (true) WITH CHECK (true);
