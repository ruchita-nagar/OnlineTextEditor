from django.contrib import admin
from word_editor import views
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('parse-docx-to-html', views.parse_docx_to_html, name='parse_docx_to_html'),
    path('parse-to-docx', views.generate_docx_from_html_content, name='parse_to_docx'),
    path('parse-to-pdf', views.generate_pdf_from_html_content, name='parse_to_pdf'),
]
