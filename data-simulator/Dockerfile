FROM python:3.11-slim
WORKDIR /app
COPY data-simulator/ /app/data-simulator/
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r backend/requirements.txt requests
CMD ["python3", "-u", "/app/data-simulator/simulate.py"]
