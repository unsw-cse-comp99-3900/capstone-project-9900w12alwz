from django.db import models
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.memory import ChatMessageHistory
import base64
import requests

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

    # def chain(self, question, image_path="logical_dataflow.png"):
    def chain(self, question, image=None):
        llm = self.chatmodel
        systemMsgs = []
        defaultPrompt = """
        you are a EA-Assist bot aims to help enterprise architects to perform
        modelling on enterprise elements. It may range from
        definitions to customized entity mappings based on generic industry standards and should also
        be capable of performing entity extraction from unstructured documents.
        """
        systemMsgDefault = {"type": "text", "text": f"{defaultPrompt}"}
        systemMsgs.append(systemMsgDefault)

        if image is None:
            # prompt from rules
            prompt_rules = f"""
                    Based on the user's input, here are some conversational rules to follow:
                        1. If the user's question involves creating a Capability Map and they have not provided the number of levels needed in the Capability Map and the number of capabilities required for each level, please ask the user for these details.            
                        2. If the user's question involves generating a Capability Map task, please return the corresponding JSON and CSV content in the following format: JSON: jsoncontent |||||| CSV: csvcontent. The response content will be used to build a frontend page, so please adhere strictly to this format.

                        The user's request is: {question}
                    """
            # system prompt
            systemMsgs.append({"type": "text", "text": f"{prompt_rules}"})

            # prompt from db
            url = "http://localhost:8000/api/prompts/default/"
            headers = {
                'accept': 'application/json',
                'X-CSRFToken': 'U8tJVz5Wl4s2Mtz3OjNd9cwhl2TqNYnKeZrdeAsvYWKicxfhaN8UGEJsxsELYorJ'
            }
            response = requests.get(url, headers=headers).json()
            prompt_content = response.get('text', '')
            prompt_ = f"""
            Based on the user's input, here are some conversational rules to follow:
                If the user's question involves {prompt_content} follow the corresponding instruction.            
            """
            systemMsgs.append({"type": "text", "text": f"{prompt_}"})

            systemMsg = SystemMessage(content=systemMsgs)

            huamanMsg = HumanMessage(
                content=[
                    {"type": "text", "text": f"{question}"},
                ],
            )

        else:
            # 将图像文件转换为 Base64 编码
            base64_image = base64.b64encode(image.read()).decode('utf-8')

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
                    {"type": "text",
                     "text": "You are a bot that is good at converting different type of diagrams to BPMN XML format"},
                    {"type": "text",
                     "text": "output the BPMN XML format"},
                    {"type": "text",
                     "text": """If the output content includes XML, 
                     format it using triple backticks and label it as XML like this:
                        ```xml
                        xml content
                        ```
                    """}
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
