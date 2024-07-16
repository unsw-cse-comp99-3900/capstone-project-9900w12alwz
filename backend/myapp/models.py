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

    def answer(self, question, image=None):
        content = self.chain(question, image)
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
                        1. If the user's question involves creating a Capability Map but does not provide details on the number of levels needed or the number of capabilities required for each level, politely inquire about these specifics to ensure comprehensive support. Always prioritize the user's immediate questions and needs. Use follow-up questions judiciously to enhance clarity and avoid overwhelming the user with requests for information.
                        2. If the user's question involves generating a Capability Map task, please return only the corresponding JSON and CSV content in the following format: 
                            ```JSON
                                jsoncontent
                            ```, 
                            ```CSV 
                                csvcontent
                            ```.
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
            base64_image = base64.b64encode(image.read()).decode('utf-8')
            systemMsg = SystemMessage(
                content=[
                    {"type": "text",
                     "text": """
                     you are a bot to convert the different diagrams to bpmn 2.0 xml format 
                     by giving users image by following instructions
                     
                     1. Create a BPMN 2.0 XML format that includes graphical information for all process elements, 
                     2. emphasizing that the output must include layout and positional details for each element.
                     3. Ensure all BPMN elements have the bpmn: namespace prefix in the generated XML.
                     4. When presenting XML content, format it using triple backticks and label it as XML like this
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

        self.chat_history.messages.extend([huamanMsg, systemMsg])

        response = llm.invoke(self.chat_history.messages)
        self.chat_history.add_ai_message(response)
        print(response.content)
        return response.content


class Prompt(models.Model):
    text = models.TextField()
    name = models.TextField(default="test")
    is_default = models.IntegerField(default=0)  # 添加默认值

    def __str__(self):
        return self.name
