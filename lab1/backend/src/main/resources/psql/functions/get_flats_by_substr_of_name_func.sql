drop function if exists get_flats_by_substr_of_name_func(varchar);

create or replace function get_flats_by_substr_of_name_func(prefix varchar)
    returns setof flat
as $$
begin
    return query
    select *
    from flat
    where name like prefix || '%';
end;
$$ language plpgsql;
