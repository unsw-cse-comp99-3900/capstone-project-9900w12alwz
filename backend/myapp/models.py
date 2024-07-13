from django.db import models
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.memory import ChatMessageHistory
from langchain.output_parsers import XMLOutputParser

from PIL import Image
import io
import base64
from langchain import LLMChain
import os


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
            model="gpt-4-turbo",
            temperature=0,
            openai_api_key="sk-student-group-1-key-TO4Cg5exvtuWKqfwRK2hT3BlbkFJ5rE7Cy1yjfTQYgN2hDbX"
        )
        self.chat_history = ChatMessageHistory()

    def answer(self, question):
        content = self.chain(question)
        return content

    def encode_image(self, image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    def chain(self, question, image_path="logical_dataflow.png"):
        llm = self.chatmodel

        if not image_path:
            prompt_rules = """
                    Based on the user's input, here are some conversational rules to follow:
                        1. If the user's question involves creating a Capability Map and they have not provided the number of levels needed in the Capability Map and the number of capabilities required for each level, please ask the user for these details.            
                        2. If the user's question involves generating a Capability Map task, please return the corresponding JSON and CSV content in the following format: JSON: jsoncontent |||||| CSV: csvcontent. The response content will be used to build a frontend page, so please adhere strictly to this format.

                        The user's request is: {question}

                    """
            prompt = ChatPromptTemplate.from_template(prompt_rules)
            message = prompt.format(question=question)
            self.chat_history.add_user_message(message)

            response = llm.invoke(self.chat_history.messages)
            self.chat_history.add_ai_message(response)

            print(response.content)
            print(self.chat_history.messages)

            return response.content
        else:
            current_dir = os.path.dirname(__file__)
            print("current_dir is {}".format(current_dir))
            image_path = current_dir + "/" + image_path
            base64_image = self.encode_image(image_path)

            # message = [
            #     {"role": "system",
            #      "content": "You are a bot that is good at converting different type of diagrams to BPMN xml format"
            #      },
            #     {"role": "system",
            #      "content": "always output the bpmn xml format at the end"
            #      },
            #     {"role": "user",
            #      "content": [
            #          {"type": "text", "text": f"{question}"},
            #          {"type": "image_url", "image_url": {
            #              "url": f"data:image/png;base64,{base64_image}"}
            #          }
            #      ]}
            # ]
            systemMsg = SystemMessage(
                content=[
                    {"type": "text", "text": "You are a bot that is good at converting different type of diagrams to BPMN xml format"},
                    {"type": "text", "text": "always output the bpmn xml format at the end"}
                ]
            )
            huamanMsg = HumanMessage(
                content=[
                    {"type": "text", "text": f"{question}"},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}},
                ],
            )

            response = llm.invoke([systemMsg, huamanMsg])
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
