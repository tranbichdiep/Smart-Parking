import asyncio
import websockets
import json
import signal
import sys
from datetime import datetime

running = True

def signal_handler(signum, frame):
    global running
    print("\nĐang dừng chương trình...")
    running = False
    sys.exit(0)

def print_card_info(card_data):
    print("\n" + "="*50)
    print(f"THÔNG TIN THẺ RFID")
    print("="*50)
    print(f"Thời gian quét: {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}")
    print(f"ID Thẻ: {card_data['cardId']}")
    print(f"Vị trí: {'Cổng vào' if card_data['type'] == 'entry' else 'Cổng ra'}")
    print("="*50 + "\n")

def print_parking_status(parking_data):
    print("\n" + "-"*40)
    print("CẬP NHẬT TRẠNG THÁI BÃI ĐỖ XE")
    print("-"*40)
    for slot, status in parking_data["changes"].items():
        status_text = "🚗 Có xe" if status else "⭕ Trống"
        print(f"Vị trí {slot}: {status_text}")
    print("-"*40 + "\n")

async def connect_to_esp32():
    uri = "ws://192.168.95.110:9999"
    
    print("🔄 Đang kết nối tới ESP32 RFID Reader...")
    
    while running:
        try:
            async with websockets.connect(uri) as websocket:
                print("✅ Đã kết nối thành công!")
                print("⌛ Đang đợi thẻ RFID...\n")
                
                while running:
                    try:
                        message = await websocket.recv()
                        data = json.loads(message)
                        
                        if "cardId" in data:
                            print_card_info(data)
                        elif data.get("type") == "parking":
                            print_parking_status(data)
                    
                    except websockets.exceptions.ConnectionClosed:
                        print("\n❌ Mất kết nối với ESP32")
                        break
                    except json.JSONDecodeError as e:
                        print(f"\n⚠️ Lỗi khi đọc dữ liệu: {e}")
                        print(f"Dữ liệu nhận được: {message}")
                    except Exception as e:
                        print(f"\n⚠️ Lỗi: {str(e)}")
                        
        except Exception as e:
            print(f"\n❌ Không thể kết nối tới ESP32: {str(e)}")
            print("🔄 Đang thử kết nối lại sau 5 giây...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    try:
        asyncio.get_event_loop().run_until_complete(connect_to_esp32())
    except KeyboardInterrupt:
        print("\n👋 Đã dừng chương trình")
    finally:
        running = False
