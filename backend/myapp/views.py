from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from drf_yasg.utils import swagger_auto_schema
from .serializers import question_schema, response_schema


class ChatBot:
    def __init__(self):
        self.chatmodel = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0,
            openai_api_key="sk-student-group-1-key-TO4Cg5exvtuWKqfwRK2hT3BlbkFJ5rE7Cy1yjfTQYgN2hDbX"
        )

    def answer(self, question):
        content = self.chain(question)
        return content

    def chain(self, question):
        prompt = ChatPromptTemplate.from_template("The user's request is {question}")
        message = prompt.format(question=question)
        llm = self.chatmodel
        response = llm.invoke(message)
        print(response.content)
        return response.content


class ChatAPIView(APIView):
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
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        bot = ChatBot()
        feedback = bot.answer(question)
        return Response({"answer": feedback}, status=status.HTTP_200_OK)
