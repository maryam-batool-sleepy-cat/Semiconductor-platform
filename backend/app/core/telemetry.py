"""
OpenTelemetry Integration for Distributed Tracing
"""

import logging
from contextlib import contextmanager
from typing import Optional, Dict, Any

try:
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
    OTEL_AVAILABLE = True
except ImportError:
    OTEL_AVAILABLE = False
    logging.warning("OpenTelemetry libraries not installed. Install with: pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp opentelemetry-instrumentation-fastapi")

logger = logging.getLogger(__name__)

class TelemetryService:
    """OpenTelemetry service for distributed tracing"""
    
    def __init__(self, service_name: str = "semiconductor-platform"):
        self.service_name = service_name
        self.is_enabled = False
        self.tracer = None
        
    def setup(self, endpoint: Optional[str] = None):
        """Setup OpenTelemetry with OTLP exporter"""
        if not OTEL_AVAILABLE:
            logger.info("OpenTelemetry not available - running without tracing")
            self.is_enabled = False
            return
            
        try:
            # Create resource
            resource = Resource.create({
                "service.name": self.service_name,
                "service.version": "1.0.0"
            })
            
            # Create tracer provider
            provider = TracerProvider(resource=resource)
            
            # Add OTLP exporter if endpoint provided
            if endpoint:
                exporter = OTLPSpanExporter(endpoint=endpoint)
                processor = BatchSpanProcessor(exporter)
                provider.add_span_processor(processor)
            
            trace.set_tracer_provider(provider)
            self.tracer = trace.get_tracer(__name__)
            self.is_enabled = True
            logger.info(f"OpenTelemetry setup complete. Service: {self.service_name}")
            
        except Exception as e:
            logger.error(f"Failed to setup OpenTelemetry: {e}")
            self.is_enabled = False
    
    def instrument_fastapi(self, app):
        """Instrument FastAPI application"""
        if not self.is_enabled or not OTEL_AVAILABLE:
            return
            
        try:
            FastAPIInstrumentor.instrument_app(app)
            logger.info("FastAPI instrumented with OpenTelemetry")
        except Exception as e:
            logger.error(f"Failed to instrument FastAPI: {e}")
    
    def instrument_sqlalchemy(self, engine):
        """Instrument SQLAlchemy engine"""
        if not self.is_enabled or not OTEL_AVAILABLE:
            return
            
        try:
            SQLAlchemyInstrumentor().instrument(engine=engine)
            logger.info("SQLAlchemy instrumented with OpenTelemetry")
        except Exception as e:
            logger.error(f"Failed to instrument SQLAlchemy: {e}")
    
    def create_span(self, name: str, attributes: Optional[Dict[str, Any]] = None):
        """Create a span for tracing"""
        if not self.is_enabled or not self.tracer:
            return contextmanager(lambda: (yield))()
            
        try:
            return self.tracer.start_as_current_span(name, attributes=attributes)
        except Exception as e:
            logger.error(f"Failed to create span: {e}")
            return contextmanager(lambda: (yield))()
    
    def add_event(self, name: str, attributes: Optional[Dict[str, Any]] = None):
        """Add an event to the current span"""
        if not self.is_enabled:
            return
            
        try:
            current_span = trace.get_current_span()
            if current_span:
                current_span.add_event(name, attributes)
        except Exception as e:
            logger.error(f"Failed to add event: {e}")

# Create global instance
telemetry = TelemetryService()
