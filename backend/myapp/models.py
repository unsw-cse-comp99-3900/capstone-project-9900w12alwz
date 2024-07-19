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
            openai_api_key="sk-None-Rnt1giBFpZGhp33k0L26T3BlbkFJXef4Gt5tjU3qh5Oo28vy"
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
                        2. If the user's question involves generating a Capability Map, please generate the corresponding JSON and CSV content based on the user's request. A question involves a Capability Map if it includes phrases like "Capability Map," "capability map," "generate a capability map," "give a capability map," or any similar variations. And return the output in the following format: 
                        ```JSON
                        {
                            "Level 1": {
                                "Capability 1": "Description",
                                "Capability 2": "Description",
                                "Capability 3": "Description",
                                "Capability 4": "Description",
                                "Capability 5": "Description"
                            },
                            "Level 2": {
                                "Capability 1": "Description",
                                "Capability 2": "Description",
                                "Capability 3": "Description",
                                "Capability 4": "Description",
                                "Capability 5": "Description"
                            }
                        }
                        ```,
                        ```csv
                        Level,Capability,Description
                        Level 1,Capability 1,Description
                        Level 1,Capability 2,Description
                        Level 1,Capability 3,Description
                        Level 1,Capability 4,Description
                        Level 1,Capability 5,Description
                        Level 2,Capability 1,Description
                        Level 2,Capability 2,Description
                        Level 2,Capability 3,Description
                        Level 2,Capability 4,Description
                        Level 2,Capability 5,Description
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
            # 发送GET请求并获取响应
            response = requests.get(url, headers=headers)
            # 将响应转换为JSON格式
            prompt_content = response.json()
            # 提取text字段的内容
            user_prompt = prompt_content.get('text', '')
            # prompt_ = f"""
            # Based on the user's input, here are some conversational rules to follow:
            #     If the user's question involves {prompt_content} follow the corresponding instruction.
            # """
            print(user_prompt)
            systemMsgs.append({"type": "text", "text": f"{user_prompt}"})

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
                     you are a bot to convert different diagrams to a BPMN 2.0 XML format by following these instructions:

1. Create a BPMN 2.0 XML format that includes graphical information for all process elements. Ensure not to omit any parts.
2. Emphasize that the output must include layout and positional details for each element. The graphical information (positions and sizes of elements) must be included for completeness
3. Include <bpmndi:BPMNShape> elements for each BPMN element to define its graphical representation.
4. Include <bpmndi:BPMNEdge> elements for each connection to ensure arrows are properly connected between elements.
5. Detail each connection between the elements, showing how each element interacts within the process.
6. Ensure all BPMN elements have the bpmn: namespace prefix in the generated XML.
7. When presenting XML content, format it using triple backticks and label it as XML, like this
                      ```xml
                        xml content
                        ```
                        
 For example:
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="Definitions_1">
    <bpmn:process id="CarRentalProcess" isExecutable="true">
        <bpmn:startEvent id="StartEvent_1" name="Car rental customer starts request">
            <bpmn:outgoing>Flow_1</bpmn:outgoing>
        </bpmn:startEvent>
        <bpmn:task id="Task_1" name="Create order for vendor">
            <bpmn:incoming>Flow_1</bpmn:incoming>
            <bpmn:outgoing>Flow_2</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_2" name="Check car inventory">
            <bpmn:incoming>Flow_2</bpmn:incoming>
            <bpmn:outgoing>Flow_3</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_3" name="Notify customer of availability">
            <bpmn:incoming>Flow_3</bpmn:incoming>
            <bpmn:outgoing>Flow_4</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_4" name="Make reservation">
            <bpmn:incoming>Flow_4</bpmn:incoming>
            <bpmn:outgoing>Flow_5</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_4_1" name="Process customer reservation and payment information">
            <bpmn:incoming>Flow_5</bpmn:incoming>
            <bpmn:outgoing>Flow_6</bpmn:outgoing>
        </bpmn:task>
        <bpmn:task id="Task_4_2" name="Confirm rental and payment information">
            <bpmn:incoming>Flow_6</bpmn:incoming>
            <bpmn:outgoing>Flow_7</bpmn:outgoing>
        </bpmn:task>
        <bpmn:endEvent id="EndEvent_1" name="Reservation confirmed">
            <bpmn:incoming>Flow_7</bpmn:incoming>
        </bpmn:endEvent>
        <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
        <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2"/>
        <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3"/>
        <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="Task_4"/>
        <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_4" targetRef="Task_4_1"/>
        <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_4_1" targetRef="Task_4_2"/>
        <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_4_2" targetRef="EndEvent_1"/>
    </bpmn:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="CarRentalProcess">
            <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
                <dc:Bounds x="100" y="100" width="36" height="36"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
                <dc:Bounds x="200" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
                <dc:Bounds x="350" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3">
                <dc:Bounds x="500" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_4_di" bpmnElement="Task_4">
                <dc:Bounds x="650" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_4_1_di" bpmnElement="Task_4_1">
                <dc:Bounds x="800" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="Task_4_2_di" bpmnElement="Task_4_2">
                <dc:Bounds x="950" y="100" width="100" height="80"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
                <dc:Bounds x="1100" y="100" width="36" height="36"/>
            </bpmndi:BPMNShape>
            <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
                <di:waypoint x="136" y="118"/>
                <di:waypoint x="200" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
                <di:waypoint x="300" y="140"/>
                <di:waypoint x="350" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
                <di:waypoint x="450" y="140"/>
                <di:waypoint x="500" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
                <di:waypoint x="600" y="140"/>
                <di:waypoint x="650" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
                <di:waypoint x="750" y="140"/>
                <di:waypoint x="800" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
                <di:waypoint x="900" y="140"/>
                <di:waypoint x="950" y="140"/>
            </bpmndi:BPMNEdge>
            <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
                <di:waypoint x="1050" y="140"/>
                <di:waypoint x="1100" y="140"/>
            </bpmndi:BPMNEdge>
        </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
</bpmn:definitions>

This example includes both <bpmndi:BPMNShape> and <bpmndi:BPMNEdge> elements with precise coordinates and dimensions to ensure proper graphical representation.
                    """}
                ]
            )

            # systemMsg = SystemMessage(
            #     content=[
            #         {"type": "text",
            #          "text":
            #         """
            #          - **Request Type**: you are a bot to convert the different diagrams a detailed BPMN 2.0 XML by giving image.
            #          - **Content Details**:
            #         1. **Graphical Details**: The XML should include comprehensive graphical representations for each process element, capturing the visual aspects thoroughly.
            #         2. **Position and Dimensions**: Specify the exact positions and dimensions for each element to ensure precise layout representation.
            #         3. **Connections Detailing**: Each connection between the elements should be detailed, showing how each element interacts within the process.
            #         4. **Layout Accuracy**: The XML must accurately reflect the complete layout and structure as depicted in the provided diagram, ensuring that the spatial and relational integrity is maintained.
            #         5. **Namespace and Specific Elements**: All BPMN elements must include the 'bpmn:' namespace prefix. Additionally, mention any specific elements or attributes that are crucial for the XML configuration.
            #         6. When presenting XML content, format it using triple backticks and label it as XML like this
            #         ```xml
            #         xml content
            #         ```
            #         """
            #          }
            #     ]
            # )


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
