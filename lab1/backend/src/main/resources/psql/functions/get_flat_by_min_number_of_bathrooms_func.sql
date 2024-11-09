create or replace function get_flat_by_min_number_of_bathrooms_func()
    returns flat
as $$
select * from flat
where number_of_bathrooms = (
    select min(number_of_bathrooms)
    from flat
    where number_of_bathrooms is not null
)
limit 1;
$$ language sql;
