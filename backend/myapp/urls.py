from django.urls import path
from .views import ChatAPIView, PromptListCreateAPIView, DefaultPromptAPIView, PromptDetailAPIView

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='chat'),
    path('prompts/', PromptListCreateAPIView.as_view(), name='prompt_list_create'),
    path('prompts/<int:id>/', PromptDetailAPIView.as_view(), name='prompt_detail'),
    path('prompts/default/', DefaultPromptAPIView.as_view(), name='get_default_prompt'),
]
