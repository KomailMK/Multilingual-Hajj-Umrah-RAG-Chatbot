# Use Python 3.9
FROM python:3.9

# Set working directory to /code (Standard for HF Spaces)
WORKDIR /code

# Copy requirements file
COPY ./requirements.txt /code/requirements.txt

# Install dependencies
# We use the CPU version of PyTorch to keep it fast and light
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Create a user (Hugging Face requires running as non-root)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Copy the rest of the application files
COPY --chown=user . /code

# Start the application on port 7860 (Required by Hugging Face)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]