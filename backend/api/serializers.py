from rest_framework import serializers
from .models import DataSet

class DataSetSerializer(serializers.ModelSerializer):
    filename = serializers.SerializerMethodField()

    class Meta:
        model = DataSet
        fields = ['id', 'filename', 'file', 'uploaded_at', 'summary']
        read_only_fields = ['uploaded_at', 'summary']

    def get_filename(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None
