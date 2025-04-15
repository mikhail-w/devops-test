# bonsai-devops
DevOps Capstone Project implementing CI/CD pipeline for a Bonsai plant ecommerce application using Terraform, Docker and Kubernetes on AWS

## Prerequisites

### Backend Prerequisites:
- [Python 3.9+](https://www.python.org/downloads/)
- [PostgreSQL 13+](https://www.postgresql.org/download/)
- [Virtual Environment (`venv`)](https://docs.python.org/3/library/venv.html)
- [AWS CLI (for S3 integration)](https://aws.amazon.com/cli/)

### Frontend Prerequisites:
- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/mikhail-w/bonsai-devops.git
cd bonsai-devops
```

## Environment Variables

Ensure you configure your environment variables for both the **frontend** and **backend**.

### Frontend (`.env` in `apps/frontend/`)
```env
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_API_URL=http://127.0.0.1:8000/api

# External Services (Replace with your own API keys in production)
VITE_WEATHER_API_KEY=your_open-weather_api_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key

# AWS S3 Configuration (Optional - only needed if using S3 for storage)
VITE_S3_BUCKET=your_s3_bucket_name
VITE_S3_REGION=your_s3_region
VITE_S3_PATH=your_s3_bucket_path
```

### Backend (`.env` in `apps/backend/`)
```env
# Django Configuration
DJANGO_SECRET_KEY=django-insecure-your-secret-key-for-development
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (Default PostgreSQL settings)
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=bonsai_store
DB_HOST=localhost
DB_PORT=5432

# OpenAI Configuration (Optional - only needed for AI features)
OPENAI_API_KEY=your_openai_api_key

# AWS S3 Configuration (Optional - only needed if using S3 for storage)
AWS_ACCESS_KEY_ID=None
AWS_SECRET_ACCESS_KEY=None
AWS_STORAGE_BUCKET_NAME=None
AWS_S3_REGION_NAME=None
AWS_S3_CUSTOM_DOMAIN=None
```

> **Important Notes for Local Development:**
> 1. The above values are suitable for local development only. Use proper secure values in production.
> 2. For local development, you only need to set up the database configuration and Django secret key.
> 3. External service API keys (OpenAI, Google Maps, etc.) are optional and only needed if you want to use those specific features.
> 4. AWS S3 configuration is optional. The application will use local file storage by default.
> 5. Make sure to keep your `.env` files out of version control by adding them to `.gitignore`.

## Setup Instructions

### Frontend Setup
```bash
cd apps/frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd apps/backend
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
```

### Database Setup
```bash
sudo -u postgres psql
CREATE DATABASE bonsai_store;
CREATE USER postgres WITH PASSWORD 'password';
ALTER USER postgres WITH SUPERUSER CREATEROLE CREATEDB;
```

### Apply Migrations & Load Data
```bash
python manage.py makemigrations
python manage.py migrate
```

**Important Note on Data Loading Order:**
When loading fixtures, you must follow this specific order to maintain referential integrity:

```bash
# First load users (since other models depend on them)
python manage.py loaddata users.json

# Then load products
python manage.py loaddata products.json

# Then load posts
python manage.py loaddata posts.json

# Then load reviews (which depend on users and products)
python manage.py loaddata reviews.json

# Finally load comments (which depend on users and posts)
python manage.py loaddata comments.json
```

**Note:** If you encounter foreign key constraint errors, ensure that the user IDs in your fixture files match the actual user IDs in your database. The reviews.json file should only reference user IDs that exist in your users.json file.

### Create Django Superuser
To access the Django admin panel, you need to create a superuser account:

```bash
python manage.py createsuperuser
```

Follow the prompts to set up your admin account:
- Enter a username (e.g., 'admin')
- Provide an email address
- Create a strong password

Once created, you can access the Django admin panel at:
`http://127.0.0.1:8000/admin/`

The admin panel gives you access to manage:
- Users and User Profiles
- Products
- Reviews
- Orders and Order Items
- Shipping Addresses
- Blog Posts

### Run the Server
```bash
python manage.py runserver
```

## Accessing the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin


## Important Notes
1. Replace all `your_*` placeholders with your actual keys, secrets, and URLs.
2. Ensure `.env` files are **excluded from version control** by adding them to `.gitignore`.
3. Use different values for development and production environments as needed.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
