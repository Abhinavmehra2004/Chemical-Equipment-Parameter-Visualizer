I have completed the necessary changes to integrate the frontend with the backend API and reverted the debugging changes in the Django backend.

**Summary of changes:**
- **`src/components/dashboard/CSVUploader.tsx`**: Modified `onDataLoaded` prop to pass the raw `File` object instead of parsed `EquipmentRecord[]`.
- **`src/pages/Index.tsx`**:
    - Updated `handleDataLoaded` to conditionally call the `uploadCSV` API (from `src/services/api.ts`) when not in mock mode.
    - Updated `handleSelectDataset` to fetch data from the API when not in mock mode.
    - Added `Papa.parse` client-side to get `EquipmentRecord[]` after API upload for `DataTable` display.
    - Added `useToast` for user notifications on upload success/failure and data fetching errors.
    - Updated the `useEffect` hook to fetch initial data from the backend if not in mock mode.
- **`backend/api/views.py`**:
    - Removed temporary `print` debugging statements.
    - Uncommented `permission_classes = [IsAuthenticated]` for `DataSetViewSet` and `LatestDataSetView`.
    - (Initial change) Registered `Filler` plugin in `ChartsGrid.tsx` for Chart.js.

**Next Steps for you:**
1.  **Restart your frontend development server.** (This is crucial to pick up the changes in `Index.tsx` and `CSVUploader.tsx`).
2.  **Ensure your Django backend is running.**
3.  **Upload the sample CSV data again** through the frontend.

After these steps, please check if the charts are now displaying correct values instead of 'NaN'. If you encounter any new issues or the problem persists, please let me know.