import random
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


class ChatBot:
    def __init__(self):
        self.chatmodel = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature = 0,
            openai_api_key = "sk-student-group-1-key-TO4Cg5exvtuWKqfwRK2hT3BlbkFJ5rE7Cy1yjfTQYgN2hDbX"
        )

    def answer(self, question):
        content = self.chain(question)
        return content   
     
    def chain(self, question):
        prompt = ChatPromptTemplate.from_template("The user's request is {question}")
        message = prompt.format(question = question)
        llm = self.chatmodel
        response = llm.invoke(message)
        print(response.content)
        return response.content

class ChatAPIView(APIView):
    def post(self, request, *args, **kwargs):
        """处理 POST 请求，返回随机字符串"""
        print("request", request.data)
        question = request.data['question']
        print("question", question)
        bot = ChatBot()
        feedback = bot.answer(question)
        return Response({"answer": feedback}, status=status.HTTP_200_OK)

def generate_random_string(length=10):
    """生成一个指定长度的随机字符串"""
    letters = string.ascii_letters + string.digits
    return ''.join(random.choice(letters) for i in range(length))


class GetAllChatAPIView(APIView):
    def get(self, request, *args, **kwargs):
        """处理 GET 请求，返回固定字符串"""
        chat_contents = [{"id": i, "chatContent": chr(96 + i) * 10} for i in range(1, 27)]
        return Response(chat_contents, status=status.HTTP_200_OK)


class RandomStringAPIView(APIView):
    def post(self, request, *args, **kwargs):
        """处理 POST 请求，返回随机字符串"""
        random_string = generate_random_string()
        return Response({"random_string": random_string}, status=status.HTTP_200_OK)