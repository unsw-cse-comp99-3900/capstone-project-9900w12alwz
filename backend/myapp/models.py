from django.db import models
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ChatMessageHistory

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name


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


class Prompt(models.Model):
    text = models.TextField()
    name = models.TextField(default="test")
    is_default = models.IntegerField(default=0)  # 添加默认值

    def __str__(self):
        return self.name

