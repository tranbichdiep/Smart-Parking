#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// Định nghĩa chân kết nối RFID-RC522
#define RST_PIN 22 // Chân cảm biến RST
#define SS_PIN 21  // Chân cảm biến SS

// IR cho cổng vào
#define IR_PIN 25 // Chân cảm biến IR

// Servo cho cổng vào
#define SERVO_PIN 34 // Chân điều khiển servo

// Servo cho cổng ra
#define SERVO_OUT_PIN 35 // Chân điều khiển servo cổng ra

// IR cho cổng ra
#define IR_OUT_PIN 33 // Chân cảm biến IR cổng ra

// Định nghĩa chân cho 4 cảm biến IR và LED tương ứng
#define IR_SLOT1_PIN 13 // IR cảm biến chỗ 1
#define IR_SLOT2_PIN 12 // IR cảm biến chỗ 2
#define IR_SLOT3_PIN 14 // IR cảm biến chỗ 3
#define IR_SLOT4_PIN 27 // IR cảm biến chỗ 4
#define IR_SLOT5_PIN 26 // IR cảm biến chỗ 5
#define IR_SLOT6_PIN 5  // IR cảm biến chỗ 6

#define LED_SLOT1_PIN 17 // LED chỗ 1
#define LED_SLOT2_PIN 18 // LED chỗ 2
#define LED_SLOT3_PIN 19 // LED chỗ 3
#define LED_SLOT4_PIN 20 // LED chỗ 4

// Thông tin WiFi
const char *ssid = "OnePlus Ace 3V";
const char *password = "diepdiep";

// Khởi tạo đối tượng
MFRC522 rfid(SS_PIN, RST_PIN);
WebServer server(9999);
WebSocketsServer webSocket = WebSocketsServer(9999);
Servo gateServo;
bool isPersonPresent = false;
bool isGateOpen = false;
int currentAngle = 0; // Góc hiện tại của servo
const int STEP = 5;   // Số độ thay đổi mỗi bước
const int DELAY = 50; // Delay giữa các bước (ms)
Servo exitGateServo;
bool isPersonPresentAtExit = false;
bool isExitGateOpen = false;
int currentExitAngle = 0;

// Biến trạng thái chỗ đỗ xe
bool parkingSlots[6] = {false, false, false, false, false, false}; // false = trống, true = có xe

// Thêm hằng số cho các loại message
#define MSG_TYPE_CARD "card"
#define MSG_TYPE_GATE "gate"
#define GATE_CMD_OPEN "open"
#define GATE_CMD_CLOSE "close"

void setup()
{
  Serial.begin(115200);

  // Khởi tạo SPI
  SPI.begin();
  rfid.PCD_Init();

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi đã kết nối");
  Serial.println("Địa chỉ IP: ");
  Serial.println(WiFi.localIP());

  // Khởi tạo WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Khởi tạo server
  server.on("/", HTTP_GET, handleRoot);
  server.begin();

  // Thêm cài đặt cho IR và Servo
  pinMode(IR_PIN, INPUT);
  gateServo.attach(SERVO_PIN);
  gateServo.write(0); // Đóng cổng khi khởi động

  // Khởi tạo chân cho IR sensors
  pinMode(IR_SLOT1_PIN, INPUT);
  pinMode(IR_SLOT2_PIN, INPUT);
  pinMode(IR_SLOT3_PIN, INPUT);
  pinMode(IR_SLOT4_PIN, INPUT);
  pinMode(IR_SLOT5_PIN, INPUT);
  pinMode(IR_SLOT6_PIN, INPUT);

  // Thêm vào sau phần khởi tạo servo cổng vào
  pinMode(IR_OUT_PIN, INPUT);
  exitGateServo.attach(SERVO_OUT_PIN);
  exitGateServo.write(0); // Đóng cổng ra khi khởi động
}

void loop()
{
  server.handleClient();
  webSocket.loop();

  // Đọc trạng thái cảm biến IR cổng vào và ra
  bool irState = digitalRead(IR_PIN);
  bool irOutState = digitalRead(IR_OUT_PIN);

  // Xử lý cổng vào
  if (irState == LOW && !isPersonPresent)
  {
    isPersonPresent = true;
    Serial.println("Phát hiện người ở cổng vào, sẵn sàng quét thẻ");
  }

  // Xử lý cổng ra
  if (irOutState == LOW && !isPersonPresentAtExit)
  {
    isPersonPresentAtExit = true;
    Serial.println("Phát hiện người ở cổng ra, sẵn sàng quét thẻ");
  }

  // Quét thẻ cho cổng vào
  if (isPersonPresent && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial())
  {
    String cardID = "";
    for (byte i = 0; i < rfid.uid.size; i++)
    {
      cardID += String(rfid.uid.uidByte[i], HEX);
    }

    String jsonResponse = "{\"cardId\":\"" + cardID + "\",\"type\":\"entry\"}";
    webSocket.broadcastTXT(jsonResponse);
    Serial.println("Thẻ được quét tại cổng vào: " + cardID);
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // Quét thẻ cho cổng ra
  if (isPersonPresentAtExit && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial())
  {
    String cardID = "";
    for (byte i = 0; i < rfid.uid.size; i++)
    {
      cardID += String(rfid.uid.uidByte[i], HEX);
    }

    String jsonResponse = "{\"cardId\":\"" + cardID + "\",\"type\":\"exit\"}";
    webSocket.broadcastTXT(jsonResponse);
    Serial.println("Thẻ được quét tại cổng ra: " + cardID);
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // Kiểm tra người đã đi qua cổng vào chưa
  if (irState == HIGH && isPersonPresent)
  {
    isPersonPresent = false;
    if (isGateOpen)
    {
      delay(1000);
      closeGateSmooth();
      Serial.println("Đóng cổng vào");
    }
  }

  // Kiểm tra người đã đi qua cổng ra chưa
  if (irOutState == HIGH && isPersonPresentAtExit)
  {
    isPersonPresentAtExit = false;
    if (isExitGateOpen)
    {
      delay(1000);
      closeExitGateSmooth();
      Serial.println("Đóng cổng ra");
    }
  }

  checkParkingSlots();
  delay(100);
}

// Xử lý sự kiện WebSocket
void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.printf("[%u] Ngắt kết nối!\n", num);
    break;
  case WStype_CONNECTED:
    Serial.printf("[%u] Đã kết nối!\n", num);
    break;
  case WStype_TEXT:
  {
    String message = String((char *)payload);
    DynamicJsonDocument doc(200);
    deserializeJson(doc, message);

    String msgType = doc["type"];
    if (msgType == "gate")
    {
      String command = doc["command"];
      String gateType = doc["gateType"];

      if (command == "open")
      {
        if (gateType == "entry")
        {
          openGateSmooth();
        }
        else if (gateType == "exit")
        {
          openExitGateSmooth();
        }
      }
    }
    break;
  }
  }
}

// Trang web đơn giản để hiển thị dữ liệu
void handleRoot()
{
  String html = "<html><head>";
  html += "<script>";
  html += "var socket = new WebSocket('ws://' + window.location.hostname + ':9999');";
  html += "socket.onmessage = function(event) {";
  html += "  var data = JSON.parse(event.data);";
  html += "  document.getElementById('cardId').innerHTML = 'Thẻ mới: ' + data.cardId;";
  html += "  if(data.type === 'parking') {";
  html += "    var i;";
  html += "    for(i = 0; i < 6; i++) {";
  html += "      document.getElementById('slot' + i).style.backgroundColor = data.slots[i] ? 'red' : 'green';";
  html += "    }";
  html += "  }";
  html += "};";
  html += "</script>";
  html += "</head><body>";
  html += "<h1>ESP32 RFID Reader</h1>";
  html += "<div id='cardId'>Đang đợi thẻ...</div>";
  html += "<div style='margin: 20px;'>";
  html += "<h2>Trạng thái bãi đỗ xe</h2>";
  for (int i = 0; i < 6; i++)
  {
    html += "<div id='slot" + String(i) + "' style='width:100px;height:100px;margin:10px;display:inline-block;background-color:" + (parkingSlots[i] ? "red" : "green") + "'>";
    html += "Chỗ " + String(i + 1);
    html += "</div>";
  }
  html += "</div>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void openGateSmooth()
{
  for (int angle = currentAngle; angle <= 90; angle += STEP)
  {
    gateServo.write(angle);
    currentAngle = angle;
    delay(DELAY);
  }
  isGateOpen = true;
}

void closeGateSmooth()
{
  for (int angle = currentAngle; angle >= 0; angle -= STEP)
  {
    gateServo.write(angle);
    currentAngle = angle;
    delay(DELAY);
  }
  isGateOpen = false;
}

void checkParkingSlots()
{
  bool changed = false;
  bool slots[6];
  String changedSlots = "";

  // Đọc trạng thái các cảm biến
  slots[0] = digitalRead(IR_SLOT1_PIN) == LOW;
  slots[1] = digitalRead(IR_SLOT2_PIN) == LOW;
  slots[2] = digitalRead(IR_SLOT3_PIN) == LOW;
  slots[3] = digitalRead(IR_SLOT4_PIN) == LOW;
  slots[4] = digitalRead(IR_SLOT5_PIN) == LOW;
  slots[5] = digitalRead(IR_SLOT6_PIN) == LOW;

  // Kiểm tra thay đổi
  for (int i = 0; i < 6; i++)
  {
    if (slots[i] != parkingSlots[i])
    {
      changed = true;
      parkingSlots[i] = slots[i];

      // Thêm slot thay đổi vào chuỗi JSON
      if (changedSlots.length() > 0)
      {
        changedSlots += ",";
      }
      changedSlots += "\"" + String(i + 1) + "\":" + (slots[i] ? "true" : "false");
    }
  }

  // Chỉ gửi thông tin khi có slot thay đổi
  if (changed)
  {
    String jsonResponse = "{\"type\":\"parking\",\"changes\":{" + changedSlots + "}}";
    webSocket.broadcastTXT(jsonResponse);
  }
}

void openExitGateSmooth()
{
  for (int angle = currentExitAngle; angle <= 90; angle += STEP)
  {
    exitGateServo.write(angle);
    currentExitAngle = angle;
    delay(DELAY);
  }
  isExitGateOpen = true;
}

void closeExitGateSmooth()
{
  for (int angle = currentExitAngle; angle >= 0; angle -= STEP)
  {
    exitGateServo.write(angle);
    currentExitAngle = angle;
    delay(DELAY);
  }
  isExitGateOpen = false;
}
