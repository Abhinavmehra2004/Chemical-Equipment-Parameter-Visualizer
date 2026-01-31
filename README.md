# Chemical-Equipment-Parameter-Visualizer

This project is a Chemical-Equipment-Parameter-Visualizer application designed to process CSV data, display insightful summaries, and export professional PDF reports. It features a modern web interface built with React/TypeScript and a robust backend powered by Django/Python.

## Features

*   **CSV Data Upload:** Easily upload your CSV files for analysis.
*   **Dynamic Data Summaries:** View key statistics and insights from your datasets, including calculated averages like "Avg. Cost".
*   **Interactive History Panel:** Keep track of your uploaded datasets and their summaries.
*   **PDF Export:** Generate professional PDF reports containing raw data for your datasets.
*   **Responsive User Interface:** A user-friendly and adaptive interface for seamless interaction.
*   **Robust Backend:** Built with Django, providing secure and efficient data processing.

## Technologies Used

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend:** Django, Django REST Framework, Python
*   **Database:** SQLite (for development)
*   **PDF Generation:** ReportLab
*   **Data Processing:** Pandas, NumPy

## Setup Instructions

To get the project up and running, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/Abhinavmehra2004/Chemical-Equipment-Parameter-Visualizer.git # Replace with your actual repo URL
cd data-insight-hub
```

### 2. Backend Setup

Navigate to the `backend` directory, create and activate a virtual environment, and install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt # Assuming you have a requirements.txt, if not, install django, djangorestframework, djangorestframework-simplejwt, pandas, numpy, Pillow, reportlab, drf-spectacular, django-cors-headers, python-dateutil, jsonschema, referencing, rpds-py, sqlparse, inflection
python manage.py migrate
python manage.py runserver
```

The backend API will be running at `http://localhost:8000`.

### 3. Frontend Setup

In a new terminal, navigate to the project root and set up the frontend:

```bash
npm install # or `yarn install` or `bun install`
npm run dev # or `yarn dev` or `bun dev`
```

The frontend application will be available at `http://localhost:5173` (or another port as indicated by Vite).

## Usage

1.  **Upload CSV:** Use the CSV Uploader component on the dashboard to upload your equipment data.
2.  **View Summary:** Once uploaded, the dashboard will display a summary of your dataset, including calculated average cost.
3.  **Export PDF:** Click the "Export PDF" button to generate a PDF report containing the raw data.
4.  **History:** Review previously uploaded datasets and their summaries in the History Panel.

## Current Status

The application is fully functional, capable of:
*   Loading dataset summaries.
*   Displaying "Avg. Cost" in the dashboard.
*   Exporting PDFs with raw data.
*   The CSV Uploader and interactive history features are fully restored.
*   Authentication has been temporarily relaxed for certain API views to ensure full functionality during development.
*   All debugging `print()` statements have been removed from the backend.

## Contributing

Feel free to fork the repository, make changes, and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.