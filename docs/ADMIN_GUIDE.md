# Administrator Guide

## Admin Access
Login: admin / admin123

## Health Checks
curl http://localhost:8000/health
sudo docker exec -it semiconductor-postgres pg_isready -U postgres
sudo docker-compose ps

## Logs
sudo docker-compose logs api -f
sudo docker-compose logs postgres -f

## Backup
sudo docker exec -t semiconductor-postgres pg_dump -U postgres semiconductor > backup.sql

## Restore
cat backup.sql | sudo docker exec -i semiconductor-postgres psql -U postgres semiconductor

## Troubleshooting
- API not responding: sudo docker-compose restart api
- Database error: sudo docker-compose restart postgres
- Frontend issues: cd frontend && npm install && npm run dev

## Security
1. Change default passwords
2. Set SECRET_KEY in .env
3. Enable HTTPS in production
