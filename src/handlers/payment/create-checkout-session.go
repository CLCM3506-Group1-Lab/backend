package main

import (
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/labstack/echo/v4"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

type RequestBody struct {
	Id string `json:"id"`
}

func createCheckoutSession(c echo.Context) error {

	stripe.Key = "sk_test_51Oz2CiJb66uy1r62AiE38Aga0q2ZdLCimXus8nkQyrBUGEffZYckUNtPCHpK27iJE2djXiuOg3ijFbLaVuuMLzoU009BoLHyTU"

	// Get the request body
	reqBody := new(RequestBody)
	if err := c.Bind(reqBody); err != nil {
		log.Printf("Failed to bind request body: %v", err)
		return err
	}

	// find the product by id
	input := &dynamodb.GetItemInput{
		TableName: aws.String(os.Getenv("CoursesTable")),
		Key: map[string]*dynamodb.AttributeValue{
			"id": {
				S: aws.String(reqBody.Id),
			},
		},
	}

	result, err := dynamoDBClient.GetItem(input)
	if err != nil {
		log.Printf("Failed to get item from DynamoDB: %v", err)
		return err
	}

	if result.Item == nil {
		log.Printf("Item not found in DynamoDB")
		return c.JSON(http.StatusNotFound, map[string]interface{}{"message": "Item not found"})
	}
	if result.Item["priceId"] == nil {
		log.Printf("Price ID not found in DynamoDB")
		return c.JSON(http.StatusNotFound, map[string]interface{}{"message": "Price ID not found"})
	}

	priceId := *result.Item["priceId"].S

	domain := "http://localhost:5173/courses/show/" + reqBody.Id
	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			&stripe.CheckoutSessionLineItemParams{
				Price:    stripe.String(priceId),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(domain),
		CancelURL:  stripe.String(domain),
	}

	s, err := session.New(params)

	if err != nil {
		log.Printf("session.New: %v", err)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"url": s.URL})
}
