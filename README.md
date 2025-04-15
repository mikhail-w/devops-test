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
VITE_API_URL=your_backend_api_url
VITE_WEATHER_API_KEY=your_open-weather_api_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_api_key
VITE_S3_BUCKET=your_s3_bucket_name
VITE_S3_REGION=your_s3_region
VITE_S3_PATH=your_s3_bucket_path
VITE_API_BASE_URL=your_api_base_url
```

### Backend (`.env` in `apps/backend/`)
```env
OPENAI_API_KEY=your_openai_api_key
DJANGO_SECRET_KEY=your_django_secret_key
DJANGO_ALLOWED_HOSTS=your_django_allowed_hosts
DJANGO_DEBUG=True
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=bonsai_store
DB_HOST=localhost
DB_PORT=5432
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_STORAGE_BUCKET_NAME=your_storage_bucket_name
AWS_S3_REGION_NAME=your_storage_bucket_region
AWS_S3_CUSTOM_DOMAIN=your_s3_custom_domain
```

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
