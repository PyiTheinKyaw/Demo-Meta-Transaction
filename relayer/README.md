#Postgres install

docker run --name postgresql-container -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres
docker run --rm -p 5050:5050 thajeztah/pgadmin4

ref: https://dev.to/shree_j/how-to-install-and-run-psql-using-docker-41j2