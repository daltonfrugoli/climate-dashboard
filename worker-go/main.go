package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	amqp "github.com/rabbitmq/amqp091-go"
)

// WeatherData representa os dados climáticos recebidos
type WeatherData struct {
	Location        string                 `json:"location"`
	Temperature     float64                `json:"temperature"`
	Humidity        float64                `json:"humidity"`
	WindSpeed       float64                `json:"windSpeed"`
	Condition       string                 `json:"condition"`
	RainProbability *float64               `json:"rainProbability,omitempty"`
	Pressure        *float64               `json:"pressure,omitempty"`
	FeelsLike       *float64               `json:"feelsLike,omitempty"`
	UVIndex         *float64               `json:"uvIndex,omitempty"`
	Timestamp       string                 `json:"timestamp"`
	RawData         map[string]interface{} `json:"rawData,omitempty"`
}

// Config armazena as configurações do worker
type Config struct {
	RabbitMQURL    string
	RabbitMQQueue  string
	BackendAPIURL  string
	RetryAttempts  int
	RetryDelay     int
}

func main() {
	log.Println("🚀 Go Worker starting...")

	// Carregar configurações
	config := loadConfig()

	// Aguardar RabbitMQ inicializar
	log.Println("⏳ Waiting 15 seconds for RabbitMQ to be ready...")
	time.Sleep(15 * time.Second)

	// Conectar ao RabbitMQ
	conn, err := connectRabbitMQ(config.RabbitMQURL)
	if err != nil {
		log.Fatalf("❌ Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	// Criar canal
	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("❌ Failed to open channel: %v", err)
	}
	defer ch.Close()

	// Declarar fila
	q, err := ch.QueueDeclare(
		config.RabbitMQQueue, // name
		true,                 // durable
		false,                // delete when unused
		false,                // exclusive
		false,                // no-wait
		nil,                  // arguments
	)
	if err != nil {
		log.Fatalf("❌ Failed to declare queue: %v", err)
	}

	// Configurar QoS
	err = ch.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		log.Fatalf("❌ Failed to set QoS: %v", err)
	}

	// Consumir mensagens
	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack (false para ack manual)
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		log.Fatalf("❌ Failed to register consumer: %v", err)
	}

	log.Printf("✅ Connected to RabbitMQ")
	log.Printf("📬 Listening for messages on queue: %s", config.RabbitMQQueue)
	log.Printf("🔗 Backend API: %s", config.BackendAPIURL)

	// Canal para manter o programa rodando
	forever := make(chan bool)

	// Goroutine para processar mensagens
	go func() {
		for d := range msgs {
			log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
			log.Printf("📨 Received message: %s", string(d.Body))

			// Processar mensagem
			success := processMessage(d.Body, config)

			if success {
				// Confirmar mensagem (ack)
				d.Ack(false)
				log.Println("✅ Message processed successfully and acknowledged")
			} else {
				// Rejeitar mensagem (nack) e recolocar na fila
				d.Nack(false, true)
				log.Println("❌ Message processing failed, rejected and requeued")
			}
		}
	}()

	log.Println("⏳ Waiting for messages. To exit press CTRL+C")
	<-forever
}

// loadConfig carrega as configurações do ambiente
func loadConfig() Config {
	// Tentar carregar .env (opcional no Docker)
	godotenv.Load("../.env")

	retryAttempts, _ := strconv.Atoi(getEnv("RETRY_ATTEMPTS", "3"))
	retryDelay, _ := strconv.Atoi(getEnv("RETRY_DELAY", "5"))

	return Config{
		RabbitMQURL:    getEnv("RABBITMQ_URL", "amqp://admin:admin123@rabbitmq:5672"),
		RabbitMQQueue:  getEnv("RABBITMQ_QUEUE", "weather-data"),
		BackendAPIURL:  getEnv("BACKEND_API_URL", "http://backend:3000/api"),
		RetryAttempts:  retryAttempts,
		RetryDelay:     retryDelay,
	}
}

// connectRabbitMQ tenta conectar ao RabbitMQ com retry
func connectRabbitMQ(url string) (*amqp.Connection, error) {
	var conn *amqp.Connection
	var err error

	for i := 0; i < 5; i++ {
		conn, err = amqp.Dial(url)
		if err == nil {
			return conn, nil
		}

		log.Printf("⚠️  Failed to connect to RabbitMQ (attempt %d/5): %v", i+1, err)
		time.Sleep(5 * time.Second)
	}

	return nil, err
}

// processMessage processa uma mensagem da fila
func processMessage(body []byte, config Config) bool {
	// Parse JSON
	var data WeatherData
	err := json.Unmarshal(body, &data)
	if err != nil {
		log.Printf("❌ Failed to parse JSON: %v", err)
		return false
	}

	// Validar dados
	if !validateWeatherData(data) {
		log.Println("❌ Invalid weather data")
		return false
	}

	log.Printf("📊 Data validated: Temp=%.1f°C, Humidity=%.1f%%, Location=%s",
		data.Temperature, data.Humidity, data.Location)

	// Enviar para API com retry
	success := sendToAPI(data, config)

	return success
}

// validateWeatherData valida os dados climáticos
func validateWeatherData(data WeatherData) bool {
	if data.Location == "" {
		log.Println("⚠️  Validation error: location is required")
		return false
	}

	if data.Temperature < -100 || data.Temperature > 100 {
		log.Printf("⚠️  Validation error: invalid temperature %.1f", data.Temperature)
		return false
	}

	if data.Humidity < 0 || data.Humidity > 100 {
		log.Printf("⚠️  Validation error: invalid humidity %.1f", data.Humidity)
		return false
	}

	if data.WindSpeed < 0 {
		log.Printf("⚠️  Validation error: invalid wind speed %.1f", data.WindSpeed)
		return false
	}

	if data.Condition == "" {
		log.Println("⚠️  Validation error: condition is required")
		return false
	}

	return true
}

// sendToAPI envia dados para a API NestJS com retry
func sendToAPI(data WeatherData, config Config) bool {
	url := fmt.Sprintf("%s/weather/logs", config.BackendAPIURL)

	// Converter para JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("❌ Failed to marshal JSON: %v", err)
		return false
	}

	// Tentar enviar com retry
	for attempt := 1; attempt <= config.RetryAttempts; attempt++ {
		log.Printf("🔄 Sending to API (attempt %d/%d): %s", attempt, config.RetryAttempts, url)

		resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))

		if err != nil {
			log.Printf("⚠️  HTTP request failed: %v", err)
			if attempt < config.RetryAttempts {
				log.Printf("⏳ Retrying in %d seconds...", config.RetryDelay)
				time.Sleep(time.Duration(config.RetryDelay) * time.Second)
				continue
			}
			return false
		}

		defer resp.Body.Close()

		// Ler resposta
		bodyBytes, _ := io.ReadAll(resp.Body)

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			log.Printf("✅ Successfully sent to API (Status: %d)", resp.StatusCode)
			log.Printf("📥 Response: %s", string(bodyBytes))
			return true
		}

		log.Printf("⚠️  API returned error (Status: %d): %s", resp.StatusCode, string(bodyBytes))

		if attempt < config.RetryAttempts {
			log.Printf("⏳ Retrying in %d seconds...", config.RetryDelay)
			time.Sleep(time.Duration(config.RetryDelay) * time.Second)
		}
	}

	log.Printf("❌ Failed to send to API after %d attempts", config.RetryAttempts)
	return false
}

// getEnv retorna variável de ambiente ou valor padrão
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}