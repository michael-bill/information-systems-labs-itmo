create or replace function choise_more_cheaper_flat_by_ids(id1 bigint, id2 bigint)
    returns flat
as $$
select * from flat
where id in (id1, id2)
order by price
limit 1;
$$ language sql;
