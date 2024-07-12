from django.urls import path
from .views import ChatAPIView, PromptListCreateAPIView, PromptDetailAPIView

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='chat'),
    path('prompts/', PromptListCreateAPIView.as_view(), name='prompt_list_create'),
    path('prompts/<int:id>/', PromptDetailAPIView.as_view(), name='prompt_detail'),
]
