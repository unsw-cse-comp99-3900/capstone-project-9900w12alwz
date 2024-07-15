import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from .models import ChatBot, Prompt
from .serializers import PromptSerializer, question_schema, response_schema

class ChatAPIView(APIView):
    bot = ChatBot()  # Singleton instance

    @swagger_auto_schema(
        operation_id="chat_with_bot",
        operation_summary="Chat with the bot",
        operation_description="Send a question to the bot and receive an answer",
        request_body=question_schema,
        responses={200: response_schema}
    )
    def post(self, request, *args, **kwargs):
        """处理 POST 请求，返回聊天机器人的回答"""
        question = request.data.get('question')
        upload_image = request.FILES.get('image')
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        print(question)
        feedback = self.bot.answer(question,upload_image)
        type = "capabilityMap" if "||||||" in feedback else "image" if "```xml" in feedback else "text"

        response_data = {
            "answer": feedback,
            "type": type
        }
        print(response_data)

        return Response({"answer": response_data}, status=status.HTTP_200_OK)

class PromptListCreateAPIView(APIView):
    @swagger_auto_schema(
        operation_id="list_prompts",
        operation_summary="List prompts",
        operation_description="Retrieve a list of all prompts.",
        responses={200: PromptSerializer(many=True), 500: "Internal Server Error"}
    )
    def get(self, request, *args, **kwargs):
        try:
            prompts = Prompt.objects.all()
            serializer = PromptSerializer(prompts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="create_prompt",
        operation_summary="Create a new prompt",
        operation_description="Create a new prompt with the provided text.",
        request_body=PromptSerializer,
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def post(self, request, *args, **kwargs):
        serializer = PromptSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PromptDetailAPIView(APIView):
    @swagger_auto_schema(
        operation_id="retrieve_prompt",
        operation_summary="Retrieve a prompt",
        operation_description="Retrieve a prompt by its ID.",
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def get(self, request, id, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(pk=id)
            serializer = PromptSerializer(prompt)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Prompt.DoesNotExist:
            return Response({"error": "Prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="update_prompt",
        operation_summary="Update a prompt",
        operation_description="Update the text of a prompt by its ID.",
        request_body=PromptSerializer,
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def put(self, request, id, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(pk=id)
            serializer = PromptSerializer(prompt, data=request.data)
            if serializer.is_valid():
                try:
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Prompt.DoesNotExist:
            return Response({"error": "Prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_id="delete_prompt",
        operation_summary="Delete a prompt",
        operation_description="Delete a prompt by its ID.",
        responses={200: "No Content", 500: "Internal Server Error"}
    )
    def delete(self, request, id, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(pk=id)
            prompt.delete()
            return Response(status=status.HTTP_200_OK)
        except Prompt.DoesNotExist:
            return Response({"error": "Prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DefaultPromptAPIView(APIView):
    @swagger_auto_schema(
        operation_id="get_default_prompt",
        operation_summary="Retrieve the default prompt",
        operation_description="Retrieve the prompt marked as is_default=1.",
        responses={200: PromptSerializer, 500: "Internal Server Error"}
    )
    def get(self, request, *args, **kwargs):
        try:
            prompt = Prompt.objects.get(is_default=True)
            serializer = PromptSerializer(prompt)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Prompt.DoesNotExist:
            return Response({"error": "Default prompt not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
