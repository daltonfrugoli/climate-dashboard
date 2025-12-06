import os
import time
import json
import logging
import requests
import pika
from datetime import datetime
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv('../.env')

# Configurações
WEATHER_API = os.getenv('WEATHER_API', 'open-meteo')
WEATHER_LATITUDE = os.getenv('WEATHER_LATITUDE', '-22.9249')
WEATHER_LONGITUDE = os.getenv('WEATHER_LONGITUDE', '-45.4625')
COLLECTION_INTERVAL = int(os.getenv('WEATHER_COLLECTION_INTERVAL', '3600'))
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@rabbitmq:5672')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'weather-data')

# OpenWeather (opcional)
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', '')
WEATHER_CITY = os.getenv('WEATHER_CITY', 'Pindamonhangaba')
WEATHER_COUNTRY_CODE = os.getenv('WEATHER_COUNTRY_CODE', 'BR')


def fetch_open_meteo_data():
    """
    Busca dados climáticos da API Open-Meteo
    """
    try:
        url = 'https://api.open-meteo.com/v1/forecast'
        params = {
            'latitude': WEATHER_LATITUDE,
            'longitude': WEATHER_LONGITUDE,
            'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,pressure_msl,apparent_temperature',
            'hourly': 'precipitation_probability',
            'timezone': 'America/Sao_Paulo'
        }
        
        logger.info(f"Fetching weather data from Open-Meteo for coordinates: {WEATHER_LATITUDE}, {WEATHER_LONGITUDE}")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        logger.info("Successfully fetched data from Open-Meteo")
        
        return data
    except Exception as e:
        logger.error(f"Error fetching Open-Meteo data: {e}")
        return None


def fetch_openweather_data():
    """
    Busca dados climáticos da API OpenWeather (alternativa)
    """
    try:
        if not OPENWEATHER_API_KEY:
            logger.error("OpenWeather API key not configured")
            return None
        
        url = 'https://api.openweathermap.org/data/2.5/weather'
        params = {
            'q': f"{WEATHER_CITY},{WEATHER_COUNTRY_CODE}",
            'appid': OPENWEATHER_API_KEY,
            'units': 'metric'
        }
        
        logger.info(f"Fetching weather data from OpenWeather for {WEATHER_CITY}")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        logger.info("Successfully fetched data from OpenWeather")
        
        return data
    except Exception as e:
        logger.error(f"Error fetching OpenWeather data: {e}")
        return None


def normalize_open_meteo_data(data):
    """
    Normaliza dados do Open-Meteo para formato padrão
    """
    try:
        current = data.get('current', {})
        
        # Mapear códigos de clima para descrições
        weather_code = current.get('weather_code', 0)
        condition = map_weather_code(weather_code)
        
        # Probabilidade de chuva da próxima hora
        hourly = data.get('hourly', {})
        rain_prob = hourly.get('precipitation_probability', [0])[0] if hourly.get('precipitation_probability') else 0
        
        normalized = {
            'location': f"Lat: {WEATHER_LATITUDE}, Lon: {WEATHER_LONGITUDE}",
            'temperature': round(current.get('temperature_2m', 0), 2),
            'humidity': round(current.get('relative_humidity_2m', 0), 2),
            'windSpeed': round(current.get('wind_speed_10m', 0), 2),
            'condition': condition,
            'rainProbability': rain_prob,
            'pressure': round(current.get('pressure_msl', 0), 2),
            'feelsLike': round(current.get('apparent_temperature', 0), 2),
            'timestamp': current.get('time', datetime.now().isoformat()),
            'rawData': current
        }
        
        logger.info(f"Normalized data: Temp={normalized['temperature']}°C, Humidity={normalized['humidity']}%")
        return normalized
    except Exception as e:
        logger.error(f"Error normalizing Open-Meteo data: {e}")
        return None


def normalize_openweather_data(data):
    """
    Normaliza dados do OpenWeather para formato padrão
    """
    try:
        main = data.get('main', {})
        wind = data.get('wind', {})
        weather = data.get('weather', [{}])[0]
        
        normalized = {
            'location': f"{data.get('name', WEATHER_CITY)}, {WEATHER_COUNTRY_CODE}",
            'temperature': round(main.get('temp', 0), 2),
            'humidity': round(main.get('humidity', 0), 2),
            'windSpeed': round(wind.get('speed', 0) * 3.6, 2),  # m/s para km/h
            'condition': weather.get('description', 'Unknown').title(),
            'rainProbability': 0,  # OpenWeather free não fornece probabilidade
            'pressure': round(main.get('pressure', 0), 2),
            'feelsLike': round(main.get('feels_like', 0), 2),
            'timestamp': datetime.now().isoformat(),
            'rawData': data
        }
        
        logger.info(f"Normalized data: Temp={normalized['temperature']}°C, Humidity={normalized['humidity']}%")
        return normalized
    except Exception as e:
        logger.error(f"Error normalizing OpenWeather data: {e}")
        return None


def map_weather_code(code):
    """
    Mapeia códigos de clima do Open-Meteo para descrições
    """
    weather_codes = {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Slight Hail',
        99: 'Thunderstorm with Heavy Hail'
    }
    return weather_codes.get(code, 'Unknown')


def wait_for_rabbitmq(max_retries=30, retry_interval=2):
    """
    Aguarda RabbitMQ estar disponível com verificação ativa
    
    Args:
        max_retries: Número máximo de tentativas (padrão: 30)
        retry_interval: Intervalo entre tentativas em segundos (padrão: 2)
    
    Returns:
        bool: True se conectou, False se esgotou tentativas
    """
    logger.info("🔍 Checking RabbitMQ availability...")
    
    for attempt in range(1, max_retries + 1):
        try:
            # Tentar conectar ao RabbitMQ
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()
            
            # Declarar fila para garantir que está funcionando
            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
            
            # Fechar conexão de teste
            connection.close()
            
            logger.info(f"✅ RabbitMQ is ready! (attempt {attempt}/{max_retries})")
            return True
            
        except Exception as e:
            if attempt < max_retries:
                logger.warning(
                    f"⏳ RabbitMQ not ready yet (attempt {attempt}/{max_retries}). "
                    f"Retrying in {retry_interval}s... Error: {str(e)[:50]}"
                )
                time.sleep(retry_interval)
            else:
                logger.error(
                    f"❌ Failed to connect to RabbitMQ after {max_retries} attempts"
                )
                return False
    
    return False


def send_to_rabbitmq(data):
    """
    Envia dados normalizados para a fila RabbitMQ com retry
    """
    max_retries = 3
    
    for attempt in range(1, max_retries + 1):
        try:
            # Conectar ao RabbitMQ
            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()
            
            # Declarar fila
            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
            
            # Converter para JSON
            message = json.dumps(data)
            
            # Publicar mensagem
            channel.basic_publish(
                exchange='',
                routing_key=RABBITMQ_QUEUE,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Mensagem persistente
                    content_type='application/json'
                )
            )
            
            logger.info(f"✅ Message sent to queue '{RABBITMQ_QUEUE}'")
            
            # Fechar conexão
            connection.close()
            return True
            
        except Exception as e:
            logger.error(f"❌ Error sending to RabbitMQ (attempt {attempt}/{max_retries}): {e}")
            
            if attempt < max_retries:
                time.sleep(5)  # Aguardar antes de retry
            else:
                return False
    
    return False


def collect_and_send():
    """
    Coleta dados climáticos e envia para RabbitMQ
    """
    logger.info("=" * 60)
    logger.info("Starting weather data collection")
    
    # Buscar dados da API escolhida
    if WEATHER_API == 'openweather':
        raw_data = fetch_openweather_data()
        normalized_data = normalize_openweather_data(raw_data) if raw_data else None
    else:  # Default: open-meteo
        raw_data = fetch_open_meteo_data()
        normalized_data = normalize_open_meteo_data(raw_data) if raw_data else None
    
    if not normalized_data:
        logger.error("Failed to collect weather data")
        return False
    
    # Enviar para RabbitMQ
    success = send_to_rabbitmq(normalized_data)
    
    if success:
        logger.info(f"Weather data collected and sent successfully")
        logger.info(f"Next collection in {COLLECTION_INTERVAL} seconds")
    
    return success


def bootstrap_historical_data():
    """
    Coleta dados históricos reais das últimas 20 horas ao iniciar.
    Usa o past_hours da Open-Meteo e envia cada registro normalizado para o RabbitMQ.
    """
    logger.info("🔄 Bootstrapping REAL historical data using past_hours...")

    try:
        from datetime import datetime
        import time

        past_hours = 20  # conforme solicitado
        
        # Requisição única com passado real
        logger.info(f"🌎 Fetching {past_hours}h historical data from Open-Meteo...")
        
        url = 'https://api.open-meteo.com/v1/forecast'
        params = {
            'latitude': WEATHER_LATITUDE,
            'longitude': WEATHER_LONGITUDE,
            'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,pressure_msl,apparent_temperature',
            'hourly': 'temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m,pressure_msl,apparent_temperature,weather_code',
            'past_hours': past_hours,
            'timezone': 'America/Sao_Paulo'
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        full_data = response.json()
        hourly = full_data.get('hourly', {})

        # Garantir que há dados horários válidos
        if not hourly or 'time' not in hourly:
            logger.error("❌ Bootstrap failed: hourly data missing from Open-Meteo response")
            return False

        logger.info(f"📌 Found {len(hourly['time'])} historical hourly entries")

        # Iterar e enviar cada uma das 20 horas
        for i in range(len(hourly['time'])):
            try:
                # Construir um "fake current" baseado em cada hora
                fake_current = {
                    "time": hourly["time"][i],
                    "temperature_2m": hourly.get("temperature_2m", [None])[i],
                    "relative_humidity_2m": hourly.get("relative_humidity_2m", [None])[i],
                    "wind_speed_10m": hourly.get("wind_speed_10m", [None])[i],
                    "pressure_msl": hourly.get("pressure_msl", [None])[i],
                    "apparent_temperature": hourly.get("apparent_temperature", [None])[i],
                    "weather_code": hourly.get("weather_code", [None])[i]
                }

                # Criar estrutura semelhante à resposta original para reaproveitar normalize
                simulated_data = {
                    "current": fake_current,
                    "hourly": full_data.get("hourly", {})
                }

                normalized = normalize_open_meteo_data(simulated_data)

                if normalized:
                    if send_to_rabbitmq(normalized):
                        logger.info(f"📨 Historical sent: {fake_current['time']} | {normalized['temperature']}°C")
                    else:
                        logger.warning(f"⚠️ Failed sending historical data for {fake_current['time']}")

                # Delay suave para evitar congestionar a fila
                time.sleep(0.2)

            except Exception as ex:
                logger.error(f"⚠️ Error processing historical entry #{i}: {ex}")

        logger.info(f"✅ Bootstrap complete! Sent last {past_hours} hours successfully 🎉")
        return True

    except Exception as e:
        logger.error(f"❌ Bootstrap failed: {e}")
        return False



def main():
    """
    Loop principal do coletor
    """
    logger.info("🌦️  Weather Collector starting...")
    logger.info(f"API: {WEATHER_API}")
    logger.info(f"Collection interval: {COLLECTION_INTERVAL} seconds")
    logger.info(f"RabbitMQ Queue: {RABBITMQ_QUEUE}")
    
    # Aguardar RabbitMQ inicializar
    logger.info("Waiting 10 seconds for RabbitMQ to be ready...")
    time.sleep(10)
    
    # 🔄 BOOTSTRAP: Coletar dados históricos na primeira vez
    bootstrap_historical_data()
    
    # Loop infinito de coleta
    logger.info("📡 Starting regular collection cycle...")
    while True:
        try:
            collect_and_send()
            time.sleep(COLLECTION_INTERVAL)
        except KeyboardInterrupt:
            logger.info("Shutting down gracefully...")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            logger.info("Retrying in 60 seconds...")
            time.sleep(60)


if __name__ == '__main__':
    main()