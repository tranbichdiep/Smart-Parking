#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ESP32Servo.h>

// Định nghĩa chân kết nối RFID-RC522
#define RST_PIN 22   // Chân cảm biến RST
#define SS_PIN 21    // Chân cảm biến SS
#define IR_PIN 5     // Chân cảm biến IR
#define SERVO_PIN 25 // Chân điều khiển servo

// Định nghĩa chân cho 4 cảm biến IR và LED tương ứng
#define IR_SLOT1_PIN 13 // IR cảm biến chỗ 1
#define IR_SLOT2_PIN 14 // IR cảm biến chỗ 2
#define IR_SLOT3_PIN 15 // IR cảm biến chỗ 3
#define IR_SLOT4_PIN 16 // IR cảm biến chỗ 4

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

// Biến trạng thái chỗ đỗ xe
bool parkingSlots[4] = {false, false, false, false}; // false = trống, true = có xe

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

  // Khởi tạo chân cho LEDs
  pinMode(LED_SLOT1_PIN, OUTPUT);
  pinMode(LED_SLOT2_PIN, OUTPUT);
  pinMode(LED_SLOT3_PIN, OUTPUT);
  pinMode(LED_SLOT4_PIN, OUTPUT);
}

void loop()
{
  server.handleClient();
  webSocket.loop();

  // Đọc trạng thái cảm biến IR
  bool irState = digitalRead(IR_PIN);

  // Kiểm tra có người không
  if (irState == LOW && !isPersonPresent)
  { // Điều chỉnh LOW/HIGH tùy theo cảm biến của bạn
    isPersonPresent = true;
    Serial.println("Phát hiện người, sẵn sàng quét thẻ");
  }

  // Chỉ quét thẻ khi có người
  if (isPersonPresent && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial())
  {
    String cardID = "";

    // Đọc ID của thẻ
    for (byte i = 0; i < rfid.uid.size; i++)
    {
      cardID += String(rfid.uid.uidByte[i], HEX);
    }

    // Gửi ID thẻ qua WebSocket
    String jsonResponse = "{\"cardId\"😕"
                          " + cardID + "\"}";
    webSocket.broadcastTXT(jsonResponse);

    Serial.println("Thẻ được quét: " + cardID);

    // Mở cổng
    openGateSmooth();

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // Kiểm tra người đã đi qua chưa
  if (irState == HIGH && isPersonPresent)
  { // Không còn phát hiện người
    isPersonPresent = false;
    if (isGateOpen)
    {
      delay(1000); // Đợi 1 giây
      closeGateSmooth();
      Serial.println("Đóng cổng");
    }
  }

  checkParkingSlots();
  delay(100); // Delay để tránh đọc quá nhanh
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
  html += "    for(var i = 0; i < 4; i++) {";
  html += "      document.getElementById('slot" + String(i) + "').style.backgroundColor = data.slots[i] ? 'red' : 'green';";
  html += "    }";
  html += "  }";
  html += "};";
  html += "</script>";
  html += "</head><body>";
  html += "<h1>ESP32 RFID Reader</h1>";
  html += "<div id='cardId'>Đang đợi thẻ...</div>";
  html += "<div style='margin: 20px;'>";
  html += "<h2>Trạng thái bãi đỗ xe</h2>";
  for (int i = 0; i < 4; i++)
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
  bool slots[4];
  String changedSlots = "";

  // Đọc trạng thái các cảm biến
  slots[0] = digitalRead(IR_SLOT1_PIN) == LOW;
  slots[1] = digitalRead(IR_SLOT2_PIN) == LOW;
  slots[2] = digitalRead(IR_SLOT3_PIN) == LOW;
  slots[3] = digitalRead(IR_SLOT4_PIN) == LOW;

  // Kiểm tra thay đổi và cập nhật LED
  for (int i = 0; i < 4; i++)
  {
    if (slots[i] != parkingSlots[i])
    {
      changed = true;
      parkingSlots[i] = slots[i];
      // Bật/tắt LED tương ứng
      digitalWrite(LED_SLOT1_PIN + i, slots[i] ? HIGH : LOW);

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
