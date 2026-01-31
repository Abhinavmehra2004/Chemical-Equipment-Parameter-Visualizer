from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DataSetViewSet, LatestDataSetView, DataSetHistoryView, PDFExportView, DataSetRecordsView

router = DefaultRouter()
router.register(r'datasets', DataSetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('datasets/latest/', LatestDataSetView.as_view(), name='latest-dataset'),
    path('datasets/history/', DataSetHistoryView.as_view(), name='dataset-history'),
    path('datasets/<int:pk>/records/', DataSetRecordsView.as_view(), name='dataset-records'),
    path('export/pdf/', PDFExportView.as_view(), name='export-pdf'),
]
