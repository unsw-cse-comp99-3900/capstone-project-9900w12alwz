from django.urls import path
from .views import RandomStringAPIView, GetAllChatAPIView

urlpatterns = [
    path('chat/', RandomStringAPIView.as_view(), name='random-string'),
    path('get-all-chat/', GetAllChatAPIView.as_view(), name='get-all-chat'),

]
