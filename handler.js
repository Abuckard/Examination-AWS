const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const { ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.DYNAMODB_TABLE;

const formatDate = (date) => {
    return date.toLocaleString('sv-SE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

module.exports.createMessage = async (event) => {
    try {
        const { username, text } = JSON.parse(event.body);
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();

        console.log("Parsed Request:", { username, text });
        console.log("Table Name:", tableName);

        const params = {
            TableName: tableName,
            Item: {
                id: id,
                username: username,
                text: text,
                createdAt: createdAt
            }
        };

        console.log("DynamoDB params:", params);

        await dynamoDB.send(new PutCommand(params));
        console.log("Message created successfully");

        return {
            statusCode: 201,
            body: JSON.stringify({ id, username, text, createdAt }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (error) {
        console.error("Error in createMessage:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not create message' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    }
};

module.exports.updateMessage = async (event) => {
    try {
        console.log("Event received:", event);

        const { id } = event.pathParameters;
        console.log("ID:", id);

        const { username, text } = JSON.parse(event.body);
        console.log("Parsed body:", { username, text });

        // Kontrollera att alla fält är definierade
        if (!id || !username || !text) {
            console.log("Missing parameters");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'ID, username, and text are required.' }),
                headers: { 'Access-Control-Allow-Origin': '*' },
            };
        }

        const updatedAt = formatDate(new Date());
        console.log("Updated At:", updatedAt);

        const params = {
            TableName: tableName,
            Key: { id: id }, 
            UpdateExpression: 'SET username = :username, #text = :text, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':username': username,
                ':text': text,
                ':updatedAt': updatedAt
            },
            ExpressionAttributeNames: {
                '#text': 'text'  
            },
            ReturnValues: 'ALL_NEW'
        };

        console.log("Update Params:", params);

        // Skicka uppdateringen till DynamoDB
        const result = await dynamoDB.send(new UpdateCommand(params));
        console.log("Update Result:", result);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Message updated successfully', result }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    } catch (error) {
        console.error("Error in updateMessage:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not update message', details: error.message }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    }
};
module.exports.getMessages = async () => {
    const params = {
        TableName: tableName,
    };

    try {
        const data = await dynamoDB.send(new ScanCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not retrieve messages' }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    }
};
