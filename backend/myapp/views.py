from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ChatMessageHistory

from drf_yasg.utils import swagger_auto_schema
from .serializers import question_schema, response_schema

class ChatBot:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ChatBot, cls).__new__(cls)
            cls._instance.initialize_bot()
        return cls._instance

    def initialize_bot(self):
        self.chatmodel = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0,
            openai_api_key="sk-student-group-1-key-TO4Cg5exvtuWKqfwRK2hT3BlbkFJ5rE7Cy1yjfTQYgN2hDbX"
        )
        self.chat_history = ChatMessageHistory()

    def answer(self, question):
        content = self.chain(question)
        return content

    def chain(self, question):
        prompt = ChatPromptTemplate.from_template("The user's request is {question}")
        message = prompt.format(question=question)
        self.chat_history.add_user_message(message)

        llm = self.chatmodel
        response = llm.invoke(self.chat_history.messages)
        self.chat_history.add_ai_message(response)

        print(response.content)
        print(self.chat_history.messages)

        return response.content


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
        if not question:
            return Response({"error": "Question is required"}, status=status.HTTP_400_BAD_REQUEST)

        feedback = self.bot.answer(question)
        return Response({"answer": feedback}, status=status.HTTP_200_OK)