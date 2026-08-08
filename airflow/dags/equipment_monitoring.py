"""
Apache Airflow DAG for Equipment Monitoring
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.dummy_operator import DummyOperator
import requests
import logging

default_args = {
    'owner': 'nanochip',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5)
}

def check_equipment_health():
    """Check equipment health via API"""
    try:
        response = requests.get('http://api:8000/api/v1/equipment/')
        if response.status_code == 200:
            equipment = response.json()
            for eq in equipment:
                health = requests.get(f'http://api:8000/api/v1/equipment/{eq["equipment_id"]}/health')
                if health.status_code == 200:
                    data = health.json()
                    if data.get('health_score', 100) < 70:
                        logging.warning(f"Equipment {eq['equipment_id']} needs attention: {data}")
        return "Health check complete"
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        return "Health check failed"

def generate_yield_report():
    """Generate daily yield report"""
    try:
        response = requests.get('http://api:8000/api/v1/yield/quality/report')
        if response.status_code == 200:
            data = response.json()
            logging.info(f"Yield report generated: {data}")
        return "Yield report complete"
    except Exception as e:
        logging.error(f"Yield report failed: {e}")
        return "Yield report failed"

def check_maintenance_alerts():
    """Check for maintenance alerts"""
    try:
        response = requests.get('http://api:8000/api/v1/maintenance/alerts')
        if response.status_code == 200:
            alerts = response.json()
            if alerts.get('count', 0) > 0:
                logging.warning(f"Found {alerts['count']} maintenance alerts")
        return "Maintenance check complete"
    except Exception as e:
        logging.error(f"Maintenance check failed: {e}")
        return "Maintenance check failed"

dag = DAG(
    'semiconductor_monitoring',
    default_args=default_args,
    description='Daily semiconductor equipment monitoring',
    schedule_interval='@daily',
    catchup=False
)

start = DummyOperator(task_id='start', dag=dag)
end = DummyOperator(task_id='end', dag=dag)

check_health = PythonOperator(
    task_id='check_equipment_health',
    python_callable=check_equipment_health,
    dag=dag
)

yield_report = PythonOperator(
    task_id='generate_yield_report',
    python_callable=generate_yield_report,
    dag=dag
)

maintenance_check = PythonOperator(
    task_id='check_maintenance_alerts',
    python_callable=check_maintenance_alerts,
    dag=dag
)

start >> [check_health, yield_report, maintenance_check] >> end
