create or replace function get_flats_sorted_by_distance_from_subway(metro_x bigint, metro_y bigint)
    returns table(f flat, walk_time double precision)
as $$
select f,
       sqrt(pow(f.x - metro_x, 2) + pow(f.y - metro_y, 2)) * 0.012 as walk_time
from flat f
order by walk_time asc;
$$ language sql;
w