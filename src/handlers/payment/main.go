package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	echoadapter "github.com/awslabs/aws-lambda-go-api-proxy/echo"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var echoLambda *echoadapter.EchoLambda
var dynamoDBClient *dynamodb.DynamoDB

// init the Echo Server
func init() {
	e := echo.New()

	// Middleware
	e.Use(middleware.CORS())
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.GET("/hello", helloHandler)
	e.POST("/create-checkout-session", createCheckoutSession)

	echoLambda = echoadapter.New(e)

	initDynamoDB()
}

func initDynamoDB() {
	// Initialize AWS session
	log.Print("Initializing DynamoDB session")

	var endpoint string
	if os.Getenv("LOCAL") == "true" {
		endpoint = "http://dynamodb-local:8000"
	}
	sess := session.Must(session.NewSession(&aws.Config{
		Region:   aws.String(os.Getenv("AWS_REGION")), // Change to your AWS region
		Endpoint: aws.String(endpoint),
	}))

	// Create DynamoDB client
	dynamoDBClient = dynamodb.New(sess)
}

func helloHandler(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

// Handler will deal with Echo working with Lambda
func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) { // APIGW(REST)
	return echoLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(Handler)
}
