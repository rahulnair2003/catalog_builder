from rest_framework.views import APIView
from rest_framework.response import Response
from .models import NamingConvention, CatalogEntry
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import pandas as pd
from rapidfuzz import process
import json
from catalog_builder import settings
import os

@api_view(['GET'])
def get_naming_conventions(request):
    naming_conventions = NamingConvention.objects.all().values('id', 'name')
    return Response(list(naming_conventions))

@api_view(['POST'])
def add_to_catalog(request):
    name = request.data.get('name')
    if name:
        CatalogEntry.objects.create(name=name)
        return Response({"success": True, "message": f"{name} added to catalog"})
    return Response({"success": False, "message": "Name not provided"})

@api_view(['GET'])
def get_catalog(request):
    catalog = CatalogEntry.objects.all().values('id', 'name')
    return Response(list(catalog))

file_path = os.path.join(settings.BASE_DIR, 'static/assets/ecri_equipment_assets.xlsx')

try:
    ecri_data = pd.read_excel(file_path, sheet_name='UMDNS__Alpha_Pref_Concept_Lis')
    print("Excel data loaded successfully.")
except Exception as e:
    print("Error loading Excel file:", e)

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def smart_lookup(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            equipment_type = body.get('equipment_type', '')
            print("Received equipment type:", equipment_type)

            matches = process.extract(
                equipment_type,
                ecri_data['Device Name'],
                limit=10
            )

            results = []
            for match in matches:
                device_name, confidence = match[0], match[1]
                device_code = ecri_data[ecri_data['Device Name'] == device_name]['Device Code'].values[0]
                results.append({
                    "device_code": device_code,
                    "equipment_type": device_name,
                    "confidence": confidence
                })
            
            print("Search results:", results)
            return JsonResponse(results, safe=False)
        except Exception as e:
            print("Error processing request:", e)
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "GET method not allowed"}, status=405)
