################################################################################
# Stage 1: Builder
################################################################################
# Initialize build phase
FROM python:3.11 AS builder
# Metadata labels
LABEL authors="kale schuetzeberg"
# Set working directory
WORKDIR /app
# Copy only requirements first (why? look up "Docker layer caching")
COPY ./requirements.txt .
# Install dependencies to a specific location (hint: --user flag or --target)
RUN pip install --user -r requirements.txt

################################################################################
# Stage 2: Runtime
################################################################################
# Initialize run phase
FROM python:3.11-slim
ARG USERNAME=app
# Create a non-root user (hint: useradd command)
RUN useradd -ms /bin/bash $USERNAME
# Set working directory
WORKDIR /home/$USERNAME
# Copy dependencies from builder stage
COPY --from=builder /root/.local /home/app/.local
ENV PATH=/home/app/.local/bin:$PATH
# Copy your application code
COPY --chown=$USERNAME:$USERNAME ./app ./app
# Switch to non-root user
USER $USERNAME
# Expose FastApi port 8000
EXPOSE 8000
# Set the command to run uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]