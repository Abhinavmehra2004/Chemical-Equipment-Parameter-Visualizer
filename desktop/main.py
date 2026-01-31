import sys
import requests
import json
from datetime import datetime
from PyQt5 import QtWidgets, QtCore, QtGui
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QPushButton, QLineEdit, 
                             QMessageBox, QFileDialog, QFrame, QScrollArea,
                             QTabWidget, QTableWidget, QTableWidgetItem, QHeaderView)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib.pyplot as plt

# --- Configuration ---
API_BASE_URL = "http://localhost:8000/api"

class LoginWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Data Insight Hub - Login")
        self.setFixedSize(400, 500)
        self.setStyleSheet("""
            QWidget {
                background-color: #f5f5f5;
                font-family: 'Segoe UI', sans-serif;
                color: #000000;
            }
            QLabel { color: #000000; }
            QLineEdit {
                color: #000000;
                background-color: #ffffff;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
        """)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()
        layout.setSpacing(20)
        layout.setContentsMargins(40, 40, 40, 40)

        # Title
        title = QLabel("Welcome Back")
        title.setStyleSheet("font-size: 24px; font-weight: bold; color: #000000;")
        title.setAlignment(QtCore.Qt.AlignCenter)
        layout.addWidget(title)

        # Inputs
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)

        layout.addWidget(self.username_input)
        layout.addWidget(self.password_input)

        # Login Button
        login_btn = QPushButton("Login")
        login_btn.setCursor(QtCore.Qt.PointingHandCursor)
        login_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                padding: 12px;
                border-radius: 5px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover { background-color: #1976D2; }
        """)
        login_btn.clicked.connect(self.handle_login)
        layout.addWidget(login_btn)

        self.setLayout(layout)

    def handle_login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        try:
            response = requests.post(f"{API_BASE_URL}/token/", data={
                'username': username,
                'password': password
            })
            
            if response.status_code == 200:
                token = response.json().get('access')
                self.open_dashboard(token)
            else:
                self.show_alert("Login Failed", "Invalid credentials")
        except Exception as e:
            self.show_alert("Connection Error", f"Could not connect to server: {e}")

    def show_alert(self, title, message):
        msg = QMessageBox()
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setIcon(QMessageBox.Warning)
        msg.setStyleSheet("QLabel{color: #000000;} QPushButton{color: #000000;}")
        msg.exec_()

    def open_dashboard(self, token):
        self.dashboard = DashboardWindow(token)
        self.dashboard.show()
        self.close()


class DashboardWindow(QMainWindow):
    def __init__(self, token):
        super().__init__()
        self.token = token
        self.setWindowTitle("Data Insight Hub - Dashboard")
        self.resize(1000, 800)
        self.setStyleSheet("""
            QMainWindow { background-color: #f8f9fa; }
            QLabel { color: #000000; }
            QMessageBox { color: #000000; }
            QTabWidget::pane { border: 1px solid #e0e0e0; background: white; }
            QTabBar::tab {
                background: #e0e0e0;
                color: #000000;
                padding: 10px 20px;
                margin-right: 2px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            QTabBar::tab:selected {
                background: #ffffff;
                font-weight: bold;
                border-bottom: 2px solid #2196F3;
            }
        """)
        self.init_ui()
        self.load_data()

    def init_ui(self):
        # Create Tab Widget
        self.tabs = QTabWidget()
        self.setCentralWidget(self.tabs)

        # 1. Create Dashboard Tab
        self.dashboard_tab = QWidget()
        self.setup_dashboard_tab()
        self.tabs.addTab(self.dashboard_tab, "Dashboard")

        # 2. Create History Tab
        self.history_tab = QWidget()
        self.setup_history_tab()
        self.tabs.addTab(self.history_tab, "History")

    def setup_dashboard_tab(self):
        layout = QVBoxLayout(self.dashboard_tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)

        # --- Header ---
        header_layout = QHBoxLayout()
        title = QLabel("Equipment Analytics Dashboard")
        title.setStyleSheet("font-size: 22px; font-weight: bold; color: #000000;")
        
        self.upload_btn = QPushButton(" Upload CSV")
        self.upload_btn.setCursor(QtCore.Qt.PointingHandCursor)
        self.upload_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover { background-color: #45a049; }
        """)
        self.upload_btn.clicked.connect(self.upload_file)

        header_layout.addWidget(title)
        header_layout.addStretch()
        header_layout.addWidget(self.upload_btn)
        layout.addLayout(header_layout)

        # --- Stats Scroll Area ---
        stats_scroll = QScrollArea()
        stats_scroll.setWidgetResizable(True)
        stats_scroll.setFixedHeight(140)
        stats_scroll.setFrameShape(QFrame.NoFrame)
        stats_scroll.setStyleSheet("background: transparent;")
        
        stats_container = QWidget()
        self.stats_layout = QHBoxLayout(stats_container)
        self.stats_layout.setAlignment(QtCore.Qt.AlignLeft)
        self.stats_layout.setSpacing(15)
        
        stats_scroll.setWidget(stats_container)
        layout.addWidget(stats_scroll)

        # --- Charts ---
        chart_frame = QFrame()
        chart_frame.setStyleSheet("background-color: white; border-radius: 8px; border: 1px solid #e0e0e0;")
        chart_layout = QVBoxLayout(chart_frame)
        
        self.figure = Figure(figsize=(5, 4), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        chart_layout.addWidget(self.canvas)
        layout.addWidget(chart_frame)

        # --- Footer (PDF Export) ---
        footer_layout = QHBoxLayout()
        self.export_btn = QPushButton("Generate PDF Report")
        self.export_btn.setCursor(QtCore.Qt.PointingHandCursor)
        self.export_btn.setStyleSheet("""
            QPushButton {
                background-color: #607D8B; 
                color: white;
                border-radius: 5px;
                padding: 12px 24px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover { background-color: #546E7A; }
        """)
        self.export_btn.clicked.connect(self.export_pdf)
        
        footer_layout.addStretch()
        footer_layout.addWidget(self.export_btn)
        footer_layout.addStretch()
        layout.addLayout(footer_layout)

    def setup_history_tab(self):
        layout = QVBoxLayout(self.history_tab)
        layout.setContentsMargins(20, 20, 20, 20)

        # Title
        lbl = QLabel("Upload History")
        lbl.setStyleSheet("font-size: 18px; font-weight: bold; color: #000000; margin-bottom: 10px;")
        layout.addWidget(lbl)

        # Table
        self.history_table = QTableWidget()
        self.history_table.setColumnCount(3)
        self.history_table.setHorizontalHeaderLabels(["ID", "Date Uploaded", "Filename"])
        self.history_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.history_table.setStyleSheet("""
            QTableWidget {
                background-color: white;
                gridline-color: #e0e0e0;
                color: #000000;
            }
            QHeaderView::section {
                background-color: #f1f1f1;
                padding: 8px;
                border: 1px solid #d0d0d0;
                font-weight: bold;
                color: #000000;
            }
        """)
        layout.addWidget(self.history_table)

        # Refresh Button
        refresh_btn = QPushButton("Refresh History")
        refresh_btn.setCursor(QtCore.Qt.PointingHandCursor)
        refresh_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
            }
        """)
        refresh_btn.clicked.connect(self.load_history_data)
        layout.addWidget(refresh_btn, alignment=QtCore.Qt.AlignRight)

    def load_data(self):
        """Loads both Dashboard and History data."""
        self.load_latest_data()
        self.load_history_data()

    def load_latest_data(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        try:
            response = requests.get(f"{API_BASE_URL}/datasets/latest/", headers=headers)
            if response.status_code == 200:
                self.update_dashboard(response.json())
        except Exception as e:
            print(f"Error loading dashboard: {e}")

    def load_history_data(self):
        headers = {'Authorization': f'Bearer {self.token}'}
        try:
            # Requires the DataSetHistoryView in backend
            response = requests.get(f"{API_BASE_URL}/datasets/history/", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.history_table.setRowCount(len(data))
                
                for row_idx, item in enumerate(data):
                    # ID
                    self.history_table.setItem(row_idx, 0, QTableWidgetItem(str(item.get('id', ''))))
                    
                    # Date (Format nicely if possible)
                    raw_date = item.get('uploaded_at', '')
                    try:
                        dt = datetime.fromisoformat(raw_date.replace('Z', '+00:00'))
                        date_str = dt.strftime("%Y-%m-%d %H:%M")
                    except:
                        date_str = raw_date
                        
                    self.history_table.setItem(row_idx, 1, QTableWidgetItem(date_str))
                    
                    # Filename (Extract from file path)
                    file_path = item.get('file', '')
                    filename = file_path.split('/')[-1] if file_path else "Unknown"
                    self.history_table.setItem(row_idx, 2, QTableWidgetItem(filename))
                    
        except Exception as e:
            print(f"Error loading history: {e}")

    def update_dashboard(self, data):
        summary = data.get('summary', {})
        
        # 1. Clear Stats
        while self.stats_layout.count():
            child = self.stats_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        # 2. Total Records
        total_count = summary.get('total_count', 0)
        self.stats_layout.addWidget(
            self.create_stat_card("TOTAL RECORDS", str(total_count), "#2196F3")
        )

        # 3. Dynamic Averages
        averages = summary.get('averages', {})
        colors = ['#FF5722', '#FFC107', '#9C27B0', '#009688', '#E91E63']
        color_idx = 0
        
        seen_metrics = set()
        ignored_metrics = ['efficiency_rating', 'runtime_hours']

        for key, value in averages.items():
            key_clean = key.strip().lower()
            
            should_skip = False
            for ignored in ignored_metrics:
                if ignored in key_clean:
                    should_skip = True
                    break
            if should_skip: continue

            simple_key = key_clean.replace('avg', '').replace('_', '').strip()
            if simple_key in seen_metrics: continue
            seen_metrics.add(simple_key)

            display_name = key.replace('_', ' ').upper()
            formatted_value = f"{float(value):.2f}"
            color = colors[color_idx % len(colors)]
            color_idx += 1
            
            self.stats_layout.addWidget(
                self.create_stat_card(display_name, formatted_value, color)
            )

        # 4. Chart
        dist = summary.get('equipment_type_distribution', {})
        self.figure.clear()
        ax = self.figure.add_subplot(111)
        
        if dist:
            labels = list(dist.keys())
            values = list(dist.values())
            bars = ax.bar(labels, values, color='#4CAF50', alpha=0.7)
            ax.set_title('Equipment Type Distribution', fontsize=10, color='black')
            ax.set_ylabel('Count', color='black')
            ax.tick_params(axis='x', rotation=45, colors='black')
            ax.tick_params(axis='y', colors='black')
            
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height,
                        f'{int(height)}',
                        ha='center', va='bottom', color='black')
        else:
            ax.text(0.5, 0.5, 'No distribution data available', 
                    ha='center', va='center', transform=ax.transAxes, color='black')
        self.canvas.draw()

    def create_stat_card(self, title, value, color):
        card = QFrame()
        card.setFixedSize(200, 110)
        card.setStyleSheet(f"""
            QFrame {{
                background-color: white;
                border-left: 5px solid {color};
                border-radius: 6px;
                border: 1px solid #e0e0e0;
            }}
        """)
        layout = QVBoxLayout(card)
        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("color: #555555; font-size: 12px; font-weight: bold; border: none;")
        value_lbl = QLabel(value)
        value_lbl.setStyleSheet(f"color: {color}; font-size: 24px; font-weight: bold; border: none;")
        layout.addWidget(title_lbl)
        layout.addWidget(value_lbl)
        layout.addStretch()
        return card

    def upload_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open CSV", "", "CSV Files (*.csv)")
        if file_path:
            headers = {'Authorization': f'Bearer {self.token}'}
            files = {'file': open(file_path, 'rb')}
            
            try:
                response = requests.post(f"{API_BASE_URL}/datasets/", headers=headers, files=files)
                if response.status_code == 201:
                    self.show_alert("Success", "File uploaded successfully!", icon=QMessageBox.Information)
                    # Reload BOTH dashboard and history
                    self.load_data()
                else:
                    self.show_alert("Error", f"Upload failed: {response.text}")
            except Exception as e:
                self.show_alert("Error", str(e))

    def export_pdf(self):
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            url = f"{API_BASE_URL}/export/pdf/"
            response = requests.get(url, headers=headers, stream=True)

            if response.status_code == 200:
                options = QFileDialog.Options()
                file_path, _ = QFileDialog.getSaveFileName(
                    self, "Save Report", "Equipment_Summary.pdf", "PDF Files (*.pdf)", options=options
                )
                if file_path:
                    with open(file_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    self.show_alert("Success", f"Report saved to:\n{file_path}", icon=QMessageBox.Information)
            elif response.status_code == 404:
                self.show_alert("No Data", "No dataset available to export.")
            else:
                self.show_alert("Error", f"Failed to export. Status: {response.status_code}")
        except Exception as e:
            self.show_alert("Error", f"Export failed: {str(e)}")

    def show_alert(self, title, message, icon=QMessageBox.Warning):
        msg = QMessageBox(self)
        msg.setWindowTitle(title)
        msg.setText(message)
        msg.setIcon(icon)
        msg.setStyleSheet("QLabel{color: #000000;} QPushButton{color: #000000;}")
        msg.exec_()


if __name__ == '__main__':
    app = QApplication(sys.argv)
    font = QtGui.QFont("Segoe UI", 10)
    app.setFont(font)
    
    login = LoginWindow()
    login.show()
    
    sys.exit(app.exec_())
