drop function if exists get_flat_with_max_coordinates_func();

create or replace function get_flat_with_max_coordinates_func()
    returns flat
as $$
select * from flat
where (x * x + y * y) = (
    select max(x * x + y * y)
    from flat
    where x is not null and y is not null
)
limit 1;
$$ language sql;
