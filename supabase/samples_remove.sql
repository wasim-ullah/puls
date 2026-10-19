-- Removes every Laud sample profile and all of its work, results and credits.
-- Real members are not touched: only accounts marked is_sample are deleted.
delete from auth.users where id in (select id from public.profiles where is_sample);
