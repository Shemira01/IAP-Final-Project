from django.shortcuts import render

def index(request):
    return render(request, 'habit_tracker/index.html')