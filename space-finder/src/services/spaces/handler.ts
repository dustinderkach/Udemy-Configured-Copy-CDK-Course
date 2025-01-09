import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	APIGatewayProxyEvent,
	APIGatewayProxyResult,
	Context,
} from "aws-lambda";
import { postSpaces } from "./PostSpaces";
import { getSpaces } from "./GetSpaces";
import { updateSpace } from "./UpdateSpace";
import { deleteSpace } from "./DeleteSpace";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/Utils";
import { captureAWSv3Client, getSegment } from "aws-xray-sdk-core";

//const ddbClient = captureAWSv3Client(new DynamoDBClient({}));
const ddbClient = captureAWSv3Client
	? captureAWSv3Client(new DynamoDBClient({}))
	: new DynamoDBClient({});
	
async function handler(
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> {
	let response: APIGatewayProxyResult;

	try {
		switch (event.httpMethod) {
			case "GET":
				const subSegGET = getSegment().addNewSubsegment("GET-Space");
				const getResponse = await getSpaces(event, ddbClient);
				subSegGET.close();
				response = getResponse;
				break;
			case "POST":
				const subSegPOST = getSegment().addNewSubsegment("POST-Space");
				const postResponse = await postSpaces(event, ddbClient);
				subSegPOST.close();
				response = postResponse;
				break;
			case "PUT":
				const subSegPUT = getSegment().addNewSubsegment("PUT-Space");
				const putResponse = await updateSpace(event, ddbClient);
				subSegPUT.close();
				response = putResponse;
				break;
			case "DELETE":
				const subSegDELETE =
					getSegment().addNewSubsegment("DELETE-Space");
				const deleteResponse = await deleteSpace(event, ddbClient);
				subSegDELETE.close();
				response = deleteResponse;
				break;
			default:
				break;
		}
	} catch (error) {
		if (error instanceof MissingFieldError) {
			return {
				statusCode: 400,
				body: error.message,
			};
		}
		if (error instanceof JsonError) {
			return {
				statusCode: 400,
				body: error.message,
			};
		}
		return {
			statusCode: 500,
			body: error.message,
		};
	}
	addCorsHeader(response);
	return response;
}

export { handler };
