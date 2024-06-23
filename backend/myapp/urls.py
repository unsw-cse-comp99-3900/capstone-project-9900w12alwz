from django.urls import path
from .views import RandomStringAPIView, GetAllChatAPIView,ChatAPIView

urlpatterns = [
    path('chat/', RandomStringAPIView.as_view(), name='random-string'),
    path('get-all-chat/', GetAllChatAPIView.as_view(), name='get-all-chat'),
    path('ask/', ChatAPIView.as_view(), name='chat')
]
