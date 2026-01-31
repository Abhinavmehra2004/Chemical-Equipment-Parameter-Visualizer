I have completed the task of integrating the backend.

**Summary of changes:**
- Created a `.env` file in the project root with `VITE_API_URL=http://localhost:8000/api`. This will configure the frontend to communicate with your Django backend instead of using mock data.
- Fixed a Chart.js warning by importing and registering the `Filler` plugin in `src/components/dashboard/ChartsGrid.tsx`.

Please ensure your Django backend is running at `http://localhost:8000/api` and restart your frontend development server to pick up the new environment variable. After restarting, the charts and data should reflect the actual data processed by your backend.