import io
import pandas as pd
from datetime import datetime
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DataSet
from .serializers import DataSetSerializer

# ReportLab imports for PDF generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

class DataSetViewSet(viewsets.ModelViewSet):
    queryset = DataSet.objects.all().order_by('-uploaded_at')
    serializer_class = DataSetSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance

        try:
            # Seek to the beginning of the file and read it with pandas
            instance.file.seek(0)
            df = pd.read_csv(instance.file, encoding_errors='replace')

            # Clean column names
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

            # Build Summary JSON
            summary = {
                'total_count': len(df),
                'averages': {},
                'equipment_type_distribution': {},
                'status_distribution': {}
            }

            # 1. Calculate Averages
            numeric_cols = df.select_dtypes(include='number').columns
            for col in numeric_cols:
                summary['averages'][col] = df[col].mean()

            # Ensure 'cost' average is always present
            cost_cols = [col for col in numeric_cols if 'cost' in col.lower()]
            if cost_cols:
                # Assuming the first matching 'cost' column is the one to average
                summary['averages']['cost'] = df[cost_cols[0]].mean()
            else:
                summary['averages']['cost'] = 0.0 # Default to 0.0 if no cost column found

            # 2. Calculate Distributions
            if 'equipment_type' in df.columns:
                summary['equipment_type_distribution'] = df['equipment_type'].value_counts().to_dict()
            
            if 'status' in df.columns:
                summary['status_distribution'] = df['status'].value_counts().to_dict()

            # Save summary to the instance
            instance.summary = summary
            instance.save()

        except Exception as e:
            print(f"Error processing CSV: {e}")

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=self.get_success_headers(serializer.data))


class LatestDataSetView(APIView):
    """
    Returns the most recently uploaded dataset including its summary.
    Used by the Desktop Dashboard to load stats and charts.
    """
    permission_classes = []

    def get(self, request):
        latest_dataset = DataSet.objects.order_by('-uploaded_at').first()
        if not latest_dataset:
            return Response({'detail': 'No datasets found.'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = DataSetSerializer(latest_dataset)
        return Response(serializer.data)


class DataSetHistoryView(APIView):
    """
    Returns a list of all uploaded datasets (ID and filename) for the history view.
    """
    permission_classes = []

    def get(self, request):
        datasets = DataSet.objects.all().order_by('-uploaded_at')
        serializer = DataSetSerializer(datasets, many=True)
        return Response(serializer.data)


class PDFExportView(APIView):
    """
    Generates a detailed PDF report matching the structure of the Web App report.
    Includes: Summary, Type Distribution, Status Distribution, and Raw Data.
    """
    permission_classes = []

    def get(self, request):
        latest_dataset = DataSet.objects.all().order_by('-uploaded_at').first()
        if not latest_dataset or not latest_dataset.file or not latest_dataset.summary:
            return Response({'error': 'No data available or incomplete dataset found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            latest_dataset.file.seek(0)
            df = pd.read_csv(latest_dataset.file, encoding_errors='replace')
            # Standardize columns
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

        except Exception as e:
            return Response({'error': f'Could not read file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Setup PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # --- Custom Styles ---
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#2c3e50")
        )
        
        h2_style = ParagraphStyle(
            'CustomH2',
            parent=styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor("#34495e")
        )

        # --- PAGE 1 CONTENT ---

        # Title & Date
        elements.append(Paragraph("Equipment Analytics Report", title_style))
        date_str = datetime.now().strftime("%A, %B %d, %Y")
        elements.append(Paragraph(f"Generated: {date_str}", styles["Normal"]))
        elements.append(Spacer(1, 20))

        # Section 1: Summary Statistics
        elements.append(Paragraph("Summary Statistics", h2_style))
        
        total_count = len(df)
        cost_col = next((c for c in df.columns if 'cost' in c), None)
        avg_cost = df[cost_col].mean() if cost_col else 0

        summary_data = [
            ["Metric", "Value"],
            ["Total Equipment", str(total_count)],
            ["Average Cost", f"${avg_cost:,.2f}"]
        ]
        
        t1 = Table(summary_data, colWidths=[200, 150])
        t1.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f8f9fa")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e0e0e0")),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(t1)
        elements.append(Spacer(1, 20))

        # Section 2: Equipment Type Distribution
        if 'equipment_type' in df.columns:
            elements.append(Paragraph("Equipment Type Distribution", h2_style))
            
            type_counts = df['equipment_type'].value_counts()
            type_data = [["Type", "Count", "Percentage"]]
            
            for name, count in type_counts.items():
                pct = (count / total_count) * 100
                type_data.append([name, str(count), f"{pct:.1f}%"])

            t2 = Table(type_data, colWidths=[200, 100, 100])
            t2.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e3f2fd")), # Light Blue
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e0e0e0")),
                ('PADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(t2)
            elements.append(Spacer(1, 20))

        # Section 3: Status Distribution
        if 'status' in df.columns:
            elements.append(Paragraph("Status Distribution", h2_style))
            
            status_counts = df['status'].value_counts()
            status_data = [["Status", "Count", "Percentage"]]
            
            for name, count in status_counts.items():
                pct = (count / total_count) * 100
                status_data.append([name, str(count), f"{pct:.1f}%"])

            t3 = Table(status_data, colWidths=[200, 100, 100])
            t3.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e8f5e9")), # Light Green
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e0e0e0")),
                ('PADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(t3)

        # --- PAGE 2 CONTENT ---
        elements.append(PageBreak())

        # Section 4: Raw Data Table
        elements.append(Paragraph("Equipment Data (First 50 Records)", h2_style))
        
        # Select key columns to display
        target_cols = ['equipment_id', 'equipment_type', 'status', 'maintenance_cost']
        existing_cols = [c for c in target_cols if c in df.columns]
        
        # Fallback if specific columns aren't found
        if not existing_cols:
            existing_cols = df.columns[:4].tolist()

        if existing_cols:
            # Header
            table_data = [[col.replace('_', ' ').title() for col in existing_cols]]
            
            # Rows (Limit 50)
            for _, row in df[existing_cols].head(50).iterrows():
                row_data = []
                for col in existing_cols:
                    val = row[col]
                    # Format cost
                    if 'cost' in col and isinstance(val, (int, float)):
                        row_data.append(f"${val:,.0f}")
                    else:
                        row_data.append(str(val))
                table_data.append(row_data)

            t4 = Table(table_data, colWidths=[doc.width / len(existing_cols)] * len(existing_cols)) # Use doc.width for available space
            
            # Simplified TableStyle
            t4.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(t4)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        filename = f"Equipment_Report_{datetime.now().strftime('%Y-%m-%d')}.pdf"
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class DataSetRecordsView(APIView):
    """
    Returns the raw equipment records for a specific dataset ID.
    """
    permission_classes = [] # No authentication required for this endpoint

    def get(self, request, pk):
        try:
            dataset = DataSet.objects.get(pk=pk)
        except DataSet.DoesNotExist:
            return Response({'detail': 'Dataset not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not dataset.file:
            return Response({'detail': 'Dataset file not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Read the CSV file using pandas
            dataset.file.seek(0)
            df = pd.read_csv(dataset.file, encoding_errors='replace')

            # Convert DataFrame to a list of dictionaries (records)
            records = df.to_dict(orient='records')
            
            return Response(records)

        except Exception as e:
            return Response({'detail': f'Error processing dataset file: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
