create or replace function get_flats_by_substr_of_name_func(prefix varchar)
    returns flat[]
as $$
select array_agg(f)
from flat f
where f.name like prefix || '%';
$$ language sql;
