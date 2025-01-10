drop function if exists get_flats_sorted_by_distance_from_subway(bigint, bigint);

create or replace function get_flats_sorted_by_distance_from_subway(metro_x bigint, metro_y bigint)
    returns setof flat
as $$
select f
from flat f
order by sqrt(pow(f.x - metro_x, 2) + pow(f.y - metro_y, 2)) * 0.012 asc;
$$ language sql;
