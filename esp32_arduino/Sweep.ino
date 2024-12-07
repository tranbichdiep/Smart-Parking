#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ESP32Servo.h>

// Định nghĩa chân kết nối RFID-RC522
#define RST_PIN     22 // Chân cảm biến RST
#define SS_PIN      21 // Chân cảm biến SS 
#define IR_PIN      5  // Chân cảm biến IR
#define SERVO_PIN   25  // Chân điều khiển servo

// Thông tin WiFi
const char* ssid = "OnePlus Ace 3V";
const char* password = "diepdiep";

// Khởi tạo đối tượng
MFRC522 rfid(SS_PIN, RST_PIN);
WebServer server(9999);
WebSocketsServer webSocket = WebSocketsServer(9999);
Servo gateServo;
bool isPersonPresent = false;
bool isGateOpen = false;

void setup() {
  Serial.begin(115200);
  
  // Khởi tạo SPI
  SPI.begin();
  rfid.PCD_Init();

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
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
}

void loop() {
  server.handleClient();
  webSocket.loop();

  // Đọc trạng thái cảm biến IR
  bool irState = digitalRead(IR_PIN);
  
  // Kiểm tra có người không
  if (irState == LOW && !isPersonPresent) { // Điều chỉnh LOW/HIGH tùy theo cảm biến của bạn
    isPersonPresent = true;
    Serial.println("Phát hiện người, sẵn sàng quét thẻ");
  }

  // Chỉ quét thẻ khi có người
  if (isPersonPresent && rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String cardID = "";
    
    // Đọc ID của thẻ
    for (byte i = 0; i < rfid.uid.size; i++) {
      cardID += String(rfid.uid.uidByte[i], HEX);
    }
    
    // Gửi ID thẻ qua WebSocket
    String jsonResponse = "{\"cardId\"😕"" + cardID + "\"}";
    webSocket.broadcastTXT(jsonResponse);
    
    Serial.println("Thẻ được quét: " + cardID);
    
    // Mở cổng
    gateServo.write(90); // Góc mở 90 độ
    isGateOpen = true;
    
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }

  // Kiểm tra người đã đi qua chưa
  if (irState == HIGH && isPersonPresent) { // Không còn phát hiện người
    isPersonPresent = false;
    if (isGateOpen) {
      delay(1000); // Đợi 1 giây
      gateServo.write(0); // Đóng cổng
      isGateOpen = false;
      Serial.println("Đóng cổng");
    }
  }
}

// Xử lý sự kiện WebSocket
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Ngắt kết nối!\n", num);
      break;
    case WStype_CONNECTED:
      Serial.printf("[%u] Đã kết nối!\n", num);
      break;
  }
}

// Trang web đơn giản để hiển thị dữ liệu
void handleRoot() {
  String html = "<html><head>";
  html += "<script>";
  html += "var socket = new WebSocket('ws://' + window.location.hostname + ':9999');";
  html += "socket.onmessage = function(event) {";
  html += "  var data = JSON.parse(event.data);";
  html += "  document.getElementById('cardId').innerHTML = 'Thẻ mới: ' + data.cardId;";
  html += "};";
  html += "</script>";
  html += "</head><body>";
  html += "<h1>ESP32 RFID Reader</h1>";
  html += "<div id='cardId'>Đang đợi thẻ...</div>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}
