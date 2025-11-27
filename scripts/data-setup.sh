cd ..
python api/mockdata.py

psql -d mirtech -f create_indexes.sql