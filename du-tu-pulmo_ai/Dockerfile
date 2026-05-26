FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY lung_analyzer/requirements.txt .
# Install CPU Torch version first to prevent downloading the heavy GPU version
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY lung_analyzer/ .

# Expose port
EXPOSE 5000

# Run with gunicorn for production with 2 workers, 120s timeout and preloaded app to share memory and prevent OOM/timeouts
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "--preload", "app:app"]
